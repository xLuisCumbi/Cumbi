// Import Mongoose
const mongoose = require('mongoose');

// Define the ApiToken schema
const ApiTokenSchema = new mongoose.Schema({
    token_name: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Create the model from the schema and export it
module.exports = mongoose.model('ApiToken', ApiTokenSchema);
