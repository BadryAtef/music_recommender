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
        img: song.img,
        tempo: song.tempo,
        loudness: song.loudness,
        duration: song.duration,
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
    /* failed to retrieve the favorite songs from the database */
    res.status(500).json({
      status:'failed',
      message: 'Internal server error'
    });

    req.err = 'SongController.js, Line: 51\nCouldn\'t retreive the favorite songs from the database.\n' + String(err);

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

    req.err = 'SongController.js, Line: 76\nSome validation errors occured.\n' + JSON.stringify(errors);

    next();

    return;
  }

  module.exports.addSongs (req.body.songs, function (resp) {
    module.exports.handleFavorite(req, true, function (response, serverErrors) {
      res.status(200).json({
        status:'succeeded',
        songs: response
      });

      req.err = JSON.stringify(serverErrors);

      next();
    });
  });
};

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

    req.err = 'SongController.js, Line: 112\nSome validation errors occured.\n' + JSON.stringify(errors);

    next();

    return;
  }

  module.exports.handleFavorite(req, false, function (response, serverErrors) {
    console.log(response);
    res.status(200).json({
      status:'succeeded',
      songs: response
    });

    req.err = JSON.stringify(serverErrors);

    next();
  });

};

/**
* This function add or remove the songs from the favorite list of the logged in user.
* @param  {HTTP}   req  The request object
* @param  {bool}  state A boolean flag where true means add and false means remove.
* @param  {Function} callback Callback function that is called once done with adding songs.
*/
module.exports.handleFavorite = function(req,state, callback) {
  var songs=req.body.songs;
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
    if (!song.spotify_song_id || validator.isEmpty(song.spotify_song_id + '')) {
      errors.push({
        param: 'songs[' + i + '].spotify_song_id',
        value: song.spotify_song_id,
        type: (!song.spotify_song_id)? 'required' : 'validity'
      });
    }
    else {
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

    /* the song passed the format validation and ready for insertion */

    /* check that the song exists */
    Song.findOne({
      where: {
        spotify_song_id: song.spotify_song_id
      }
    }).then(function(song) {
      if (!song){
        response.push({
          status:'failed',
          message: 'Failed to find the song.'
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

            serverErrors.push('SongController.js, Line: 210\nfailed to save song to the database.\n' + JSON.stringify(err));

            loop(i + 1);
          });
        } else {
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

            serverErrors.push('SongController.js, Line: 229\nfailed to save song to the database.\n' + JSON.stringify(err));

            loop(i + 1);
          });
        }


      }

    }).catch(function(err){

      response.push({
        status:'failed',
        message: 'Internal server error'
      });

      serverErrors.push('SongController.js, Line: 245\nfailed to save song to the database.\n' + JSON.stringify(err));

      loop(i + 1);

    });


  };

  /* statrting the loop */
  loop(0);


};

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

    req.err = 'SongController.js, Line: 283\nSome validation errors occured.\n' + JSON.stringify(errors);

    next();

    return;
  }

  module.exports.addSongs(req.body.songs, function (response, serverErrors) {
    res.status(200).json({
      status:'succeeded',
      songs: response
    });

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
      song.name = validator.trim(song.name + '');
    }

    /* Validating and sanitizing the song img */
    if (song.img && (validator.isEmpty(song.img + '') || !validator.isURL(song.img + ''))) {
      errors.push({
        param: 'songs[' + i + '].img',
        value: song.img,
        type: 'required'
      });
    }
    else if (song.img) {
      song.img = validator.trim(song.img + '');
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

    /* Validating and sanitizing the song duration */
    if (!song.duration || validator.isEmpty(song.duration + '') || !validator.isInt(song.duration + '')) {
      errors.push({
        param: 'songs[' + i + '].duration',
        value: song.duration,
        type: (!song.duration)? 'required' : 'validity'
      });
    }
    else {
      song.duration = validator.trim(song.duration + '');
      song.duration = validator.toInt(song.duration + '');
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
    var img = song.img;
    var tempo = song.tempo;
    var loudness = song.loudness;
    var duration = song.duration;
    var popularity = song.popularity;
    var album_genre = song.album_genre;
    var spotify_album_id = song.spotify_album_id;
    var spotify_artist_id = song.spotify_artist_id;
    var spotify_song_id = song.spotify_song_id;

    /* building song instance to be inserted */
    var songInstance = {
      name: name,
      img: img,
      tempo: tempo,
      loudness: loudness,
      duration: duration,
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

      serverErrors.push('SongController.js, Line: 474\nfailed to save song to the database.\n' + JSON.stringify(err));

      loop(i + 1);
    });
  };

  /* statrting the loop */
  loop(0);
};

/**
* This function returns songs recommendation for the logged in user.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.indexRecommendation = function(req, res, next) {
  var exec = require('child_process').exec;
  exec('java -jar ./config/TensorFactorization/Recommend.jar ./config/data/models/' + process.env.MODEL_NAME + ' ' + req.user.id + ' ' + process.env.RECOMMENDATION_LIMIT, function (err, stdout, stderr) {
    if (err) {
      /* error while recommending songs */
      res.status(500).json({
        status:'failed',
        message: 'Internal server error'
      });

      req.err = 'SongController.js, Line: 500\nError while recommending songs.\n' + String(err);

      next();

      return;
    }

    var ids = stdout.split(/\n/);
    ids.pop();
    for (var i = 0; i < ids.length; i++) {
      ids[i] = ids[i].split(/\s/);
      for (var j = 0; j < ids[i].length; j++) {
        ids[i][j] = parseInt(ids[i][j]);
      }
    }

    var flat = Array.prototype.concat.apply([], ids);

    Song.findAll({ where: { id : flat } }).then(function(songs) {

      var result = [];
      for (var i = 0; i < process.env.PACE_LEVELS; i++) {
        result.push([]);
        for (var j = 0; j < ids[i].length; j++) {
          result[i].push(0);
        }
      }

      for(var i = 0; i < songs.length; i++) {
        var song = songs[i];

        for (var j = 0; j < process.env.PACE_LEVELS; j++) {
          var idx = ids[j].indexOf(song.id);
          if(idx < 0) continue;

          result[j][idx] = {
            id: song.id,
            name: song.name,
            img: song.img,
            tempo: song.tempo,
            loudness: song.loudness,
            duration: song.duration,
            popularity: song.popularity,
            album_genre: song.album_genre,
            spotify_album_id: song.spotify_album_id,
            spotify_artist_id: song.spotify_artist_id,
            spotify_song_id: song.spotify_song_id
          };
        }
      }

      res.status(200).json({
        status:'succeeded',
        songs: result
      });

      next();

    }).catch(function(err){
      /* failed to retrieve the recommended songs from the database */
      res.status(500).json({
        status:'failed',
        message: 'Internal server error'
      });

      req.err = 'SongController.js, Line: 563\nCouldn\'t retreive the recommended songs from the database.\n' + String(err);

      next();
    });
  });

};
