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
        allowNull: true
    },
    address_index: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    privateKey: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    coin: {
        type: DataTypes.STRING,
        allowNull: true
    },
    network: {
        type: DataTypes.STRING,
        allowNull: true
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
    consolidation_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    balance: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    wp_order_received_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
    
}, 
{
    freezeTableName: true
});