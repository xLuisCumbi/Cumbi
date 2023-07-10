const { DataTypes }  = require('sequelize');
const db = require('../config/db');

module.exports = db.define('deposit', {
    id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address_index: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    privateKey: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    coin: {
        type: DataTypes.STRING,
        allowNull: false
    },
    network: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    amount_usd: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    deposit_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    balance: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: DataTypes.DATE
    
}, 
{
    freezeTableName: true
});