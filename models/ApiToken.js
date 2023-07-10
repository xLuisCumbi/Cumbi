const { DataTypes } = require('sequelize');
const db = require('../config/db');

module.exports = db.define('api_token', {

    id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },

    token_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
    }

},
    {
        freezeTableName: true,
        timestamps: false
    }
);