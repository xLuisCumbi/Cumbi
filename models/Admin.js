const { DataTypes }  = require('sequelize');
const db = require('../config/db');

module.exports = db.define('admin', {
    id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true, 
        autoIncrement: true
    },
    admin_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    passphrase: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
},
{
    freezeTableName: true,
    timestamps: false
}
);