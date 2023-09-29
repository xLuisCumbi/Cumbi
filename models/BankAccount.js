// Import Mongoose
const mongoose = require('mongoose');

// Define the Admin schema
const BankAccountSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        bank_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bank',
        },
        type: {
            type: String,
            required: true,
            enum: ['ahorros', 'corriente'],
        },
        number: {
            type: String,
            required: true,
        },
        nickname: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    }
);


// Create the model from the schema and export it
module.exports = mongoose.model('BankAccount', BankAccountSchema)