// Import Mongoose
const mongoose = require('mongoose');

// Define the Admin schema
const BankAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bank: {
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
    name: {
      type: String,
      required: true,
    },
    docReferenciaBancaria: {
      type: String,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

// Create the model from the schema and export it
module.exports = mongoose.model('BankAccount', BankAccountSchema);
