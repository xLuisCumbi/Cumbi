// Import Mongoose
const mongoose = require('mongoose');

// Define the Admin schema
const CountrySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        // abbreviation
        abbr: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    }
);


// Create the model from the schema and export it
module.exports = mongoose.model('Country', CountrySchema)