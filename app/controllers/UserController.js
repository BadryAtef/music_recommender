/**
* @module User Controller
* @description The controller that is responsible of handling user's requests
*/

var User       = require('../models/User').User;
var format     = require('../Utilities').errorFormat;

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
