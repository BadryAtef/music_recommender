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
    * @example the route expects the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route returns as a response an object in the following format
    * {
    *  status: succeeded/failed,
    *  message: String showing a descriptive text,
    *  songs:
    *   [
    *     {
    *       id: Integer,
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
    
    /**
    * A POST route responsible for adding songs to the database.
    * @var /api/song POST
    * @name /api/song POST
    * @example The route expects a body Object in the following format
    * {
    *       songs:
    *           [
    *               {
    *                   name: String, [required]
    *                   tempo: Float, [required]
    *                   loudness: Float, [required]
    *                   popularity: Integer, [required]
    *                   album_genre: String, [required]
    *                   spotify_album_id: String, [required]
    *                   spotify_artist_id: String, [required]
    *                   spotify_song_id: String [required]
    *               }, {...}, ...
    *           ]
    * }
    * @example The route returns as a response an object in the following format
    * [
    *   {
    *       status: succeeded/failed,
    *       message: String showing a descriptive text,
    *       error:
    *       [
    *           {
    *               param: the field that caused the error,
    *               value: the value that was provided for that field,
    *               type: the type of error that was caused ['required', 'validity']
    *           }, {...}, ...
    *       ]
    *   }
    * ]
    */
    app.post('/api/song', auth, SongController.store);

    /**
    * A Post route responsible for adding some existing songs to the favorite list of  the logged in user.
    * @var /api/song/like POST
    * @name /api/song/like POST
    * @example the route expects the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *       songs:
    *           [
    *               {
    *                   name: String, [required]
    *                   tempo: Float, [required]
    *                   loudness: Float, [required]
    *                   popularity: Integer, [required]
    *                   album_genre: String, [required]
    *                   spotify_album_id: String, [required]
    *                   spotify_artist_id: String, [required]
    *                   spotify_song_id: String [required]
    *               }, {...}, ...
    *           ]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *  status: succeeded/failed,
    *  message: String showing a descriptive text
    * }
    */
     app.post('/api/song/like', auth, SongController.like);

/**
    * A Post route responsible for removing some existing songs from the favorite list of the logged in user.
    * @var /api/song/dislike POST
    * @name /api/song/dislike POST
    * @example the route expects the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *    songs:
    *       [
    *           {
    *               spotify_song_id: String [required]
    *           }, {...}, ...
    *       ]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *  status: succeeded/failed,
    *  message: String showing a descriptive text
    * }
    */
     app.post('/api/song/dislike', auth, SongController.dislike);
     
     /**
     * A GET route responsible for gitting songs recommendation for the logged in user.
     * @var /api/song/recommend GET
     * @name /api/song/recommend GET
     * @example the route expects the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
     * @example The route returns as a response an object in the following format
    * {
    *  status: succeeded/failed,
    *  message: String showing a descriptive text,
    *  songs:
    *   [
    *     [
    *       {
    *           id: Integer,
    *           name: String,
    *           tempo: Float,
    *           loudness: Float,
    *           popularity: Integer,
    *           album_genre: String,
    *           spotify_album_id: String,
    *           spotify_artist_id: String,
    *           spotify_song_id: String
    *       }, {...}, ...
    *     ], [{...}], ... // array of songs for each pace level
    *   ]
    * }
    */
    app.get('/api/song/recommend', auth, SongController.indexRecommendation);
};


