// Import Mongoose
const mongoose = require('mongoose');

// Define the Admin schema
const BankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
    },
    docReferenciaBancaria: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

// Create the model from the schema and export it
module.exports = mongoose.model('Bank', BankSchema);
