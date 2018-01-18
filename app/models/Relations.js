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

/* user_song relation */
User.belongsToMany(Song, { as: 'RatedSongs', through: {model: 'user_song_rate', unique: false}, onDelete: 'NO ACTION' });
Song.belongsToMany(User, { as: 'UsersRate', through: {model: 'user_song_rate', unique: false}, onDelete: 'CASCADE' });

/* User_Song relation */
User.belongsToMany(Song, { as: 'FavoriteSongs', through: 'user_song_favorite', onDelete: 'CASCADE' });
Song.belongsToMany(User, { as: 'UsersFavorite', through: 'user_song_favorite', onDelete: 'CASCADE' });
