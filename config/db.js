const Sequelize  = require('sequelize');
const db = new Sequelize(process.env.DB, process.env.DBUSER, process.env.DBPASS, {
    host: process.env.DBHOST,
    dialect: 'mariadb',
    logging: false,
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci'
    },
});

module.exports = db