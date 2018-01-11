/**
* This function configures the user routes of the application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {
    var UserController = require('../../controllers/UserController');

    /**
    * A POST route responsible for storing a given user in the database.
    * @var /api/user POST
    * @name /api/user POST
    * @example The route expects a body Object in the following format
    * {
    *    first_name: String, [required]
    *    last_name: String, [required]
    *    birthdate: String (YYYY-MM-DD), [required]
    *    gender: String ['Male', 'Female'], [required]
    *    email: String, [required]
    * 	 password: String, containing the new password [required (length between 6-20 characters)]
    *    spotify_id: String [required]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *  status: succeeded/failed,
    *  message: String showing a descriptive text,
    *  error:
    *  [
    *    {
    *       param: the field that caused the error,
    *       value: the value that was provided for that field,
    *       type: the type of error that was caused ['required', 'validity', 'unique violation']
    *    }, {...}, ...
    *  ]
    * }
    */
    app.post('/api/user', UserController.store);
};
