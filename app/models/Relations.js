var User         = require('../../app/models/User').User;
var Identity     = require('../../app/models/Identity').Identity;
var Log          = require('../../app/models/Log').Log;
var Song         = require('../../app/models/Song').Song;

/* Identity_User relation */
User.hasMany(Identity, { as: 'Identities', foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Identity.belongsTo(User, { as: 'User', foreignKey: { allowNull: false }, onDelete: 'NO ACTION' });

/* Log_User relation */
User.hasMany(Log, { as: 'Logs', foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
Log.belongsTo(User, { as: 'User', foreignKey: { allowNull: true }, onDelete: 'NO ACTION' });

/* Identity_Log relation */
Identity.hasMany(Log, { as: 'Logs', foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
Log.belongsTo(Identity, { as: 'Identity', foreignKey: { allowNull: true }, onDelete: 'NO ACTION' });

/* User_Song relation */
User.belongsToMany(Song, { as: 'Songs', through: 'user_song', onDelete: 'NO ACTION' });
Song.belongsToMany(User, { as: 'Users', through: 'user_song', onDelete: 'CASCADE' });