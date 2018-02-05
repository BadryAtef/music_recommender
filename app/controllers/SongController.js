/**
* @module Song Controller
* @description The controller that is responsible of handling songs's requests
*/

var validator  = require('validator');
var Song       = require('../models/Song').Song;
var format     = require('../Utilities').errorFormat;

/**
* This function returns the favorite songs of the logged in user.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.indexFavorite = function(req, res, next) {
    req.user.getFavoriteSongs().then(function(songs) {
        
        var result = [];
        
        for(var i = 0; i < songs.length; i++){
            var song = songs[i];
            
            result.push({
                id: song.id,
                name: song.name,
                tempo: song.tempo,
                loudness: song.loudness,
                popularity: song.popularity,
                album_genre: song.album_genre,
                spotify_album_id: song.spotify_album_id,
                spotify_artist_id: song.spotify_artist_id,
                spotify_song_id: song.spotify_song_id
            });
        }
        
        res.status(200).json({
            status:'succeeded',
            songs: result
        });
        
        next();
        
    }).catch(function(err){
        /* failed to retrieve the committes from the database */
        res.status(500).json({
            status:'failed',
            message: 'Internal server error'
        });
        
        req.err = 'SongController.js, Line: 50\nCouldn\'t retreive the favorite songs from the database.\n' + String(err);
        
        next();
    });
};

/**
* This function adding an existing song to the favorite list of  the logged in user.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.like = function (req, res, next){
  /* Check the songID */
  req.checkBody('songs', 'Songs array is required').notEmpty();
  req.checkBody('songs', 'Enter a valid songs array').isArray();
  var errors = req.validationErrors();
    errors = format(errors);
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            errors: errors
        });
        
        req.err = 'SongController.js, Line: 75\nSome validation errors occured.\n' + JSON.stringify(errors);
        
        next();
        
        return;
    }

   module.exports.handleFavorite(req,true, function (response, serverErrors) {
        res.status(200).json(response);
        
        req.err = JSON.stringify(serverErrors);
        
        next();
    });
   
}

/**
* This function remove some existing songs from the favorite list of  the logged in user.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.dislike = function (req, res, next){
  /* Check the songID */
  req.checkBody('songs', 'Songs array is required').notEmpty();
  req.checkBody('songs', 'Enter a valid songs array').isArray();
  var errors = req.validationErrors();
    errors = format(errors);
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            errors: errors
        });
        
        req.err = 'SongController.js, Line: 111\nSome validation errors occured.\n' + JSON.stringify(errors);
        
        next();
        
        return;
    }

   module.exports.handleFavorite(req,false, function (response, serverErrors) {
        res.status(200).json(response);
        
        req.err = JSON.stringify(serverErrors);
        
        next();
    });
   
}

/**
* This function add or remove the songs from the favorite list of the logged in user.
* @param  {HTTP}   req  The request object
* @param  {bool}  state A boolean flag where true means add and false means remove.
* @param  {Function} callback Callback function that is called once done with adding songs.
*/
module.exports.handleFavorite = function(req,state, callback) {
    var songs=req.body.songs
    var response = [];
    var serverErrors = [];


    var loop = function (i) {
        var song = songs[i];
        var errors = [];
        
        if(i === songs.length){
            /* handling songs completed */
            callback(response, serverErrors);
            
            return;
        }
        
        /* validations over input */
        /* Validating and sanitizing the song id */
        if (!song.song_id || validator.isEmpty(song.song_id + '') || !validator.isNumeric(song.song_id + '') || (song.song_id + '').length > 10) {
            errors.push({
                param: 'songs[' + i + '].song_id',
                value: song.song_id,
                type: (!song.song_id)? 'required' : 'validity'
            });
        }
        else {
            song.song_id = validator.trim(song.song_id + '');
            song.song_id = validator.toInt(song.song_id + '');
        }
        
        
        if (errors.length > 0) {
            /* input validation failed */
            response.push({
                status: 'failed',
                errors: errors
            });
            
            loop(i + 1);
            
            return;
        }
        
        /* the song passed the format validation and ready for insertion */

        /* check that the song exists */
        Song.findOne({
        where: {
            id: song.song_id
        }
    }).then(function(song) {
        if (!song){
            response.push({
                status:'failed',
                message: 'song Id dose not exists'
            });
            loop(i + 1);
        }
        else{
            if (state){
          req.user.addFavoriteSongs(song).then(function(created){
            /* the song is added successfully to the favorait list */
            response.push({
                status:'succeeded'
            });
            
            loop(i + 1);
        }).catch(function(err){
            /* failed to save the song in the database */
            response.push({
                status:'failed',
                message: 'Internal server error'
            });
            
            serverErrors.push('SongController.js, Line: 209\nfailed to save song to the database.\n' + JSON.stringify(err));
            
            loop(i + 1);
        });
    }else {
        req.user.removeFavoriteSongs(song).then(function(){
            /* the song is added successfully to the favorait list */
            response.push({
                status:'succeeded'
            });
            
            loop(i + 1);
        }).catch(function(err){
            /* failed to save the song in the database */
            response.push({
                status:'failed',
                message: 'Internal server error'
            });
            
            serverErrors.push('SongController.js, Line: 228\nfailed to save song to the database.\n' + JSON.stringify(err));
            
            loop(i + 1);
        });
    }


        }

    }).catch(function(err){

     response.push({
                status:'failed',
                message: 'Internal server error'
            });
            
            serverErrors.push('SongController.js, Line: 244\nfailed to save song to the database.\n' + JSON.stringify(err));
            
            loop(i + 1);

    });
        
        
    };
    
    /* statrting the loop */
    loop(0);


}




/**
* This function adds the songs to the database.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.store = function (req, res, next) {
    /* Validate the songs array */
    req.checkBody('songs', 'Songs array is required').notEmpty();
    req.checkBody('songs', 'Enter a valid songs array').isArray();
    
    var errors = req.validationErrors();
    errors = format(errors);
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            errors: errors
        });
        
        req.err = 'SongController.js, Line: 282\nSome validation errors occured.\n' + JSON.stringify(errors);
        
        next();
        
        return;
    }
    
    module.exports.addSongs(req.body.songs, function (response, serverErrors) {
        res.status(200).json(response);
        
        req.err = JSON.stringify(serverErrors);
        
        next();
    });
};

/**
* This function adds the songs to the database.
* @param  {Array} songs  The songs that needs to be inserted in the database.
* @param  {Function} callback Callback function that is called once done with adding songs.
*/
module.exports.addSongs = function(songs, callback) {
    var response = [];
    var serverErrors = [];
    
    var loop = function (i) {
        var song = songs[i];
        var errors = [];
        
        if(i === songs.length){
            /* adding songs completed */
            callback(response, serverErrors);
            
            return;
        }
        
        /* validations over input */
        /* Validating and sanitizing the song name */
        if (validator.isEmpty(song.name + '')) {
            errors.push({
                param: 'songs[' + i + '].name',
                value: song.name,
                type: 'required'
            });
        }
        else {
            song.name = validator.escape(song.name + '');
            song.name = validator.trim(song.name + '');
        }
        
        /* Validating and sanitizing the song tempo */
        if (!song.tempo || validator.isEmpty(song.tempo + '') || !validator.isFloat(song.tempo + '')) {
            errors.push({
                param: 'songs[' + i + '].tempo',
                value: song.tempo,
                type: (!song.tempo)? 'required' : 'validity'
            });
        }
        else {
            song.tempo = validator.trim(song.tempo + '');
            song.tempo = validator.toFloat(song.tempo + '');
        }
        
        /* Validating and sanitizing the song loudness */
        if (!song.loudness || validator.isEmpty(song.loudness + '') || !validator.isFloat(song.loudness + '')) {
            errors.push({
                param: 'songs[' + i + '].loudness',
                value: song.loudness,
                type: (!song.loudness)? 'required' : 'validity'
            });
        }
        else {
            song.loudness = validator.trim(song.loudness + '');
            song.loudness = validator.toFloat(song.loudness + '');
        }
        
        /* Validating and sanitizing the song popularity */
        if (!song.popularity || validator.isEmpty(song.popularity + '') || !validator.isInt(song.popularity + '')) {
            errors.push({
                param: 'songs[' + i + '].popularity',
                value: song.popularity,
                type: (!song.popularity)? 'required' : 'validity'
            });
        }
        else {
            song.popularity = validator.trim(song.popularity + '');
            song.popularity = validator.toInt(song.popularity + '');
        }
        
        /* Validating and sanitizing the song album genre */
        if (validator.isEmpty(song.album_genre + '')) {
            errors.push({
                param: 'songs[' + i + '].album_genre',
                value: song.album_genre,
                type: 'required'
            });
        }
        else {
            song.album_genre = validator.escape(song.album_genre + '');
            song.album_genre = validator.trim(song.album_genre + '');
        }
        
        /* Validating and sanitizing the song spotify album id */
        if (validator.isEmpty(song.spotify_album_id + '')) {
            errors.push({
                param: 'songs[' + i + '].spotify_album_id',
                value: song.spotify_album_id,
                type: 'required'
            });
        }
        else {
            song.spotify_album_id = validator.escape(song.spotify_album_id + '');
            song.spotify_album_id = validator.trim(song.spotify_album_id + '');
        }
        
        /* Validating and sanitizing the song spotify artist id */
        if (validator.isEmpty(song.spotify_artist_id + '')) {
            errors.push({
                param: 'songs[' + i + '].spotify_artist_id',
                value: song.spotify_artist_id,
                type: 'required'
            });
        }
        else {
            song.spotify_artist_id = validator.escape(song.spotify_artist_id + '');
            song.spotify_artist_id = validator.trim(song.spotify_artist_id + '');
        }
        
        /* Validating and sanitizing the song spotify song id */
        if (validator.isEmpty(song.spotify_song_id + '')) {
            errors.push({
                param: 'songs[' + i + '].spotify_song_id',
                value: song.spotify_song_id,
                type: 'required'
            });
        }
        else {
            song.spotify_song_id = validator.escape(song.spotify_song_id + '');
            song.spotify_song_id = validator.trim(song.spotify_song_id + '');
        }

        if (errors.length > 0) {
            /* input validation failed */
            response.push({
                status: 'failed',
                errors: errors
            });
            
            loop(i + 1);
            
            return;
        }
        
        /* the song passed the validation and ready for insertion */
        
        /* extracting song data */
        var name = song.name;
        var tempo = song.tempo;
        var loudness = song.loudness;
        var popularity = song.popularity;
        var album_genre = song.album_genre;
        var spotify_album_id = song.spotify_album_id;
        var spotify_artist_id = song.spotify_artist_id;
        var spotify_song_id = song.spotify_song_id;
        
        /* building song instance to be inserted */
        var songInstance = {
            name: name,
            tempo: tempo,
            loudness: loudness,
            popularity: popularity,
            album_genre: album_genre,
            spotify_album_id: spotify_album_id,
            spotify_artist_id: spotify_artist_id,
            spotify_song_id: spotify_song_id
        };
        
        Song.upsert(songInstance /*{ where: { spotify_song_id: songInstance.spotify_song_id}, defaults: songInstance }*/).then(function(created){
            /* the song is saved successfully in the database */
            response.push({
                status:'succeeded'
            });
            
            loop(i + 1);
        }).catch(function(err){
            /* failed to save the song in the database */
            response.push({
                status:'failed',
                message: 'Internal server error'
            });
            
            serverErrors.push('SongController.js, Line: 473\nfailed to save song to the database.\n' + JSON.stringify(err));
            
            loop(i + 1);
        });
    };
    
    /* statrting the loop */
    loop(0);
};


