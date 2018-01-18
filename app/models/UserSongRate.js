/**
 *  @mixin UserSongRate
 *  @property {Integer} pace the user's pace while listening to this song
 *  @property {Float} rating the given song rating by the user
 *  @property {Integer} counter the number of times the user listened to the song
 */

/**
 * This function defines the model UserSongRate
 *
 * @param  {Sequelize} sequelize this is the instance of Sequelize
 * @ignore
 */
module.exports.defineUserSongRate = function(sequelize)
{
   var Sequelize = require("sequelize");

   module.exports.UserSongRate = sequelize.define('user_song_rate',
      {
         user_id:
         {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
         },
         song_id:
         {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
         },
         pace:
         {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
         },
         rating:
         {
            type: Sequelize.FLOAT,
            allowNull: false
         },
         counter:
         {
            type: Sequelize.INTEGER,
            allowNull: false
         }
      },
      {
          underscored: true,
          underscoredALL: true
      }
   );
};
