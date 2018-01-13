/**
*  @mixin User
*  @property {String} first_name The user's first name
*  @property {String} last_name The user's last name
*  @property {Date} birthdate The user's birthdate
*  @property {String} gender The user's gender ('Male', 'Female')
*  @property {String} email The user's email
*  @property {String} password The user's password
*  @property {String} spotify_id The user's spotify_id
*  @property {String} reset_token The reset token of the user that could be used to reset the password
*/

/**
* This Function define the model of the user Object
* @param  {sequelize} connection the instance of the sequelize Object
* @ignore
*/
module.exports.defineUser = function(sequelize) {
    var Sequelize = require("sequelize");
    var bcrypt = require('bcrypt-nodejs');
    
    module.exports.User = sequelize.define('user', {
        first_name: {
            type: Sequelize.STRING(45),
            allowNull: false
        },
        last_name: {
            type: Sequelize.STRING(45),
            allowNull: false
        },
        birthdate: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        gender: {
            type: Sequelize.ENUM('Male', 'Female'),
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            set: function(value){
                this.setDataValue('password', bcrypt.hashSync(value));
            },
            allowNull: false
        },
        spotify_id: {
            type: Sequelize.STRING,
            allowNull: true
        },
        reset_token: {
            type: Sequelize.STRING(700),
            allowNull: true
        }
    },
    {
        underscored: true,
        underscoredAll: true,
        instanceMethods:
        /** @lends User.prototype */
        {
            /**
            * This function validates the password of the user.
            * @param  {String} password the claimed password.
            * @return {Boolean} true if the claimed password matches the real one.
            */
            validPassword: function(password) {
                return bcrypt.compareSync(password, this.password);
            },
            
            /**
            * this function returns the user object.
            * @param {boolean} detailed true if the returned attributes should be detailed.
            * @param {boolean} mine true if the returned attributes are requested by thier owner.
            * @return {Object} The user object.
            */
            toJSON: function() {
                var res = {};
                
                res.id = this.id;
                res.first_name = this.first_name;
                res.last_name = this.last_name;
                res.birthdate = this.birthdate;
                res.gender = this.gender;
                res.email = this.email;
                res.spotify_id = this.spotify_id;
                res.created_at = this.created_at;
                
                return res;
            }
        }
    });
};
