const Sequelize = require('sequelize');
require('dotenv').config();

const db = new Sequelize(process.env.DB, process.env.DBUSER, process.env.DBPASS, {
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    dialect: 'mysql',
    logging: false,
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci'
    },
});

module.exports = db