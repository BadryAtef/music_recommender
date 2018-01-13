/**
* @module Song Controller
* @description The controller that is responsible of handling song's requests
*/

var Song       = require('../models/Song').Song;
var format     = require('../Utilities').errorFormat;

/**
* This function returns the favorite songs of the logged in user.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.indexFavorite = function(req, res, next) {
    req.user.getSongs().then(function(songs){ // TODO filter with pivot table
        
        var result = [];

        for(var i = 0; i < songs.length; i++){
            var song = songs[i];
            
            if (!song.user_song.favorite) continue;
            
            result.push({
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
        
        req.err = 'SongController.js, Line: 49\nCouldn\'t retreive the favorite songs from the database.\n' + String(err);
        
        next();
    });
};
