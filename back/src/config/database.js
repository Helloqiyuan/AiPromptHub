const { Sequelize } = require('sequelize');

const env = require('./env');

const sequelize = new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
  host: env.dbHost,
  port: env.dbPort,
  dialect: 'mysql',
  timezone: '+08:00',
  logging: false,
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createTime',
    updatedAt: 'updateTime',
  },
  dialectOptions: {
    charset: env.dbCharset,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;

