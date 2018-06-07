/**
* This function configures the routes of the entire application.
* @param  {express} app An instance of the express app to be configured.
* @ignore
*/

var log = require('../middlewares/LogMiddleware');

module.exports = function(app) {


    /* Allowing Access with multiple proceeding slashs */
    app.use(function(req, res, next) {
        req.url = req.url.replace(new RegExp("^[/]+"), "/");

        next();
    });

    /* allowing cross origin requests */
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', "http://servicefactory.kl.dfki.de/musicrecommender/");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, User_Agent, Authorization');

        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.send(200);
        }

        next();
    });

    /* initializing the log record */
    app.use(log.init);

    /************************
    *                       *
    * Authentication routes *
    *                       *
    ************************/
    require('./resources/AuthResource')(app);

    /**************
    *             *
    * User routes *
    *             *
    ***************/
    require('./resources/UserResource')(app);

    /**************
    *             *
    * Song routes *
    *             *
    ***************/
    require('./resources/SongResource')(app);
    /*====================================================================================================================================*/

    /* any other request will be treated as not found (404) */
    app.use(function(req, res, next) {
        if(!res.headersSent){
            res.status(404).json({
                status:'failed',
                message: 'The requested route was not found.'
            });
        }

        next();
    });

    /* saving the log record */
    app.use(log.save);
};
