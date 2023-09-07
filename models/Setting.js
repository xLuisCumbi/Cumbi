// Import Mongoose
const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    name: String,
    value_from: Number,
    value_to: Number,
    perc_commission: Number
});

// Define the Admin schema
const SettingSchema = new mongoose.Schema(
    {
        trm: {
            type: Number,
            required: true,
        },
        date_trm: {
            type: String,
        },
        perc_buy_house: {
            type: Number,
            required: true,
        },
        perc_cumbi: {
            type: Number,
            required: true,
        },
        fees: {
            type: [feeSchema],
            required: false,
        },
        passphrase: {
            type: String,
            required: false,
            unique: false,
        }
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    }
);


// Create the model from the schema and export it
module.exports = mongoose.model('Setting', SettingSchema)