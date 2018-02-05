/**
* @module User Controller
* @description The controller that is responsible of handling user's requests
*/

var User         = require('../models/User').User;
var Song         = require('../models/Song').Song;
var userSongRate = require('../models/UserSongRate').UserSongRate;
var format       = require('../Utilities').errorFormat;
var validator  = require('validator');


/**
* This function add rattings for a list of songs and thier pace.
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.rate = function(req, res, next) {
  /*check the songs array*/
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
        req.err = 'UserController.js, Line: 75\nSome validation errors occured.\n' + JSON.stringify(errors);

        next();

        return ;
    }

    module.exports.handleRates(req, function (response, serverErrors) {
        res.status(200).json(response);
        
        req.err = JSON.stringify(serverErrors);
        
        next();
    });

}

/**
* This function rates songs from the songs array one by one.
* @param  {HTTP}   req  The request object
* @param  {Function} callback Callback function that is called once done with ratting songs.
*/
module.exports.handleRates = function(req, callback) {
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

        /* Validating and sanitizing the pace */
        if (!song.pace || validator.isEmpty(song.pace + '') || !validator.isNumeric(song.pace + '') || (song.pace + '').length > 1) {
            errors.push({
                param: 'songs[' + i + '].pace',
                value: song.pace,
                type: (!song.pace)? 'required' : 'validity'
            });
        }
        else {
            song.pace = validator.trim(song.pace + '');
            song.pace = validator.toInt(song.pace + '');
        }

        /* Validating and sanitizing the rate */
        if (!song.rate || validator.isEmpty(song.rate + '') || !validator.isFloat(song.rate + '')) {
            errors.push({
                param: 'songs[' + i + '].rate',
                value: song.rate,
                type: (!song.rate)? 'required' : 'validity'
            });
        }
        else {
            song.rate = validator.trim(song.rate + '');
            song.rate = validator.toFloat(song.rate+ '')
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
        }).then(function(s) {
            if (!s){
                response.push({
                    status:'failed',
                    message: 'song Id dose not exists'
                });
                loop(i + 1);
            }
            else {
                userSongRate.findOne({
                    where: {
                        song_id: s.id,
                        user_id: req.user.id,
                        pace:song.pace
                    }
                }).then(function(pre) {
                  var newCounter = pre?pre.counter + 1:1;

                  var RateInstance = {
                    user_id: req.user.id,
                    song_id: s.id,
                    pace: song.pace,
                    rating: song.rate,
                    counter: newCounter
                };
                userSongRate.upsert(RateInstance).then(function(created){
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
                    serverErrors.push('UserController.js, Line: 473\nfailed to save rate to the database.\n' + JSON.stringify(err));
                    
                    loop(i + 1);
                });

                }).catch(function(err){
                    response.push({
                        status:'failed',
                        message: 'Internal server error'
                    });
                    serverErrors.push('UserController.js, Line: 473\nfailed to get userSongRate instance from the database.\n' + JSON.stringify(err));
                    
                    loop(i + 1);
                })
                
            }
        }).catch(function(err){

            response.push({
                       status:'failed',
                       message: 'Internal server error'
                   });
                   
                   serverErrors.push('UserController.js, Line: 244\nfailed to get song from the database.\n' + JSON.stringify(err));
                   
                   loop(i + 1);
       
           });



    };

    /* statrting the loop */
    loop(0);
}

/**
* This function stores the provided user in the database
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once done with handling the request
*/
module.exports.store = function(req, res, next) {
    
    /*Validate and sanitizing email Input*/
    req.checkBody('email', 'required').notEmpty();
    req.checkBody('email', 'validity').isEmail();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('email').trim();
    req.sanitizeBody('email').normalizeEmail({ lowercase: true });
    
    /*Validate and sanitizing Password  Input*/
    req.checkBody('password', 'required').notEmpty();
    req.assert('password', 'validity').len(6, 20);
    
    /*Validate and sanitizing first name Input*/
    req.checkBody('first_name', 'required').notEmpty();
    req.checkBody('first_name', 'validity').isString();
    req.sanitizeBody('first_name').escape();
    req.sanitizeBody('first_name').trim();
    
    /*Validate and sanitizing last name Input*/
    req.checkBody('last_name', 'required').notEmpty();
    req.checkBody('last_name', 'validity').isString();
    req.sanitizeBody('last_name').escape();
    req.sanitizeBody('last_name').trim();
    
    /*Validate and sanitizing birthdate Input*/
    req.checkBody('birthdate', 'required').notEmpty();
    req.checkBody('birthdate', 'validity').isString().isBirthdate();
    req.sanitizeBody('birthdate').escape();
    req.sanitizeBody('birthdate').trim();
    
    /*Validate and sanitizing gender Input*/
    req.checkBody('gender', 'required').notEmpty();
    req.checkBody('gender', 'validity').isIn(['Male', 'Female']);
    req.sanitizeBody('gender').escape();
    req.sanitizeBody('gender').trim();
    
    /*Validate and sanitizing spotify id Input*/
    if (req.body.spotify_id) {
        req.checkBody('spotify_id', 'validity').isString();
        req.sanitizeBody('spotify_id').trim();
    }
    else {
        req.body.spotify_id = null;
    }
    
    var errors = req.validationErrors();
    errors = format(errors);
    if (errors) {
        /* input validation failed */
        res.status(400).json({
            status: 'failed',
            errors: errors
        });
        
        req.err = 'UserController.js, Line: 70\nSome validation errors occured.\n' + JSON.stringify(errors);
        
        next();
        
        return;
    }
    
    var obj = {
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        birthdate : req.body.birthdate,
        gender : req.body.gender,
        email : req.body.email,
        password : req.body.password,
        spotify_id : req.body.spotify_id
    };
    
    User.create(obj).then(function(user) {
        
        res.status(200).json({
            status: 'succeeded',
            message: 'user successfully added'
        });
        
        next();
    }).catch(function(err) {
        if (err.message === 'Validation error') {
            /* The user violated database constraints */
            var errors = [];
            for (var i = 0; i < err.errors.length; i++) {
                var curError = err.errors[i];
                
                errors.push({
                    param: curError.path,
                    value: curError.value,
                    type: curError.type
                });
            }
            
            res.status(400).json({
                status:'failed',
                error: errors
            });
            
            req.err = 'UserController.js, Line: 114\nThe user violated some database constraints.\n' + JSON.stringify(errors);
        }
        else {
            /* failed to save the user in the database */
            res.status(500).json({
                status:'failed',
                message: 'Internal server error'
            });
            
            req.err = 'UserController.js, Line: 123\nCouldn\'t save the user in the database.\n' + String(err);
        }
        
        next();
    });
};
