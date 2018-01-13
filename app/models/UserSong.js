/**
 *  @mixin UserSong
 *  @property {Float} pace the user's pace while listening to this song
 *  @property {Float} rating the given song rating by the user
 *  @property {Integer} counter the number of times the user listened to the song
 *  @property {Boolean} favorite boolean if this song is one of the favorite songs of the user
 */

/**
 * This function defines the model UserSong
 *
 * @param  {Sequelize} sequelize this is the instance of Sequelize
 * @ignore
 */
module.exports.defineUserSong = function(sequelize)
{
   var Sequelize = require("sequelize");

   module.exports.UserSong = sequelize.define('user_song',
      {
         pace:
         {
            type: Sequelize.FLOAT,
            allowNull: false
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
         },
         favorite:
         {
            type: Sequelize.BOOLEAN,
            allowNull: false
         }
      },
      {
          underscored: true,
          underscoredALL: true
      }
   );
};
