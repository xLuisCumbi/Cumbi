// Import Mongoose
const mongoose = require('mongoose');

// Define the Admin schema
const CoinSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        // abbreviation
        abbr: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
        }
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    }
);


// Create the model from the schema and export it
module.exports = mongoose.model('Coin', CoinSchema)