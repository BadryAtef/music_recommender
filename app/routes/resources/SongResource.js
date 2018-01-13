/**
* This function configures the song routes of the application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {
    var SongController = require('../../controllers/SongController');
    var auth           = require('../../middlewares/AuthMiddleware');
    
    /**
    * A GET route responsible for gitting the favorite songs of the logged in user.
    * @var /api/song/favorite GET
    * @name /api/song/favorite GET
    * @example The route returns as a response an object in the following format
    * {
    *  status: succeeded/failed,
    *  message: String showing a descriptive text,
    *  songs:
    *   [
    *     {
    *       name: String,
    *       tempo: Float,
    *       loudness: Float,
    *       popularity: Integer,
    *       album_genre: String,
    *       spotify_album_id: String,
    *       spotify_artist_id: String,
    *       spotify_song_id: String
    *     }, {...}, ...
    *   ]
    * }
    */
    app.get('/api/song/favorite', auth, SongController.indexFavorite);
};
