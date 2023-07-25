// Import Mongoose
const mongoose = require('mongoose');

// Define the Admin schema
const AdminSchema = new mongoose.Schema({
    admin_id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    passphrase: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    stats: {
        type: String,
    },
    last_stats_update: {
        type: Date,
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Create the model from the schema and export it
module.exports = mongoose.model('Admin', AdminSchema);
