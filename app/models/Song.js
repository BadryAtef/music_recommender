/**
*  @mixin Song
*  @property {String} name The song's name
*  @property {Float} tempo The song's tempo
*  @property {Float} loudness The song's loudness
*  @property {Integer} popularity The song's popularity
*  @property {String} album_genre The song's album_genre
*  @property {String} spotify_album_id The song's spotify_album_id
*  @property {String} spotify_artist_id The song's spotify_artist_id
*  @property {String} spotify_song_id The song's spotify_song_id
*/

/**
* This Function define the model of the song Object
* @param  {sequelize} connection the instance of the sequelize Object
* @ignore
*/
module.exports.defineSong = function(sequelize) {
    var Sequelize = require("sequelize");
    
    module.exports.Song = sequelize.define('song', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        img: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        tempo: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        loudness: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        duration: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        popularity: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        album_genre: {
            type: Sequelize.STRING,
            allowNull: true
        },
        spotify_album_id: {
            type: Sequelize.STRING,
            allowNull: false
        },
        spotify_artist_id: {
            type: Sequelize.STRING,
            allowNull: false
        },
        spotify_song_id: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        }
    },
    {
        underscored: true,
        underscoredAll: true
    });
};
