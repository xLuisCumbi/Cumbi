// Import Mongoose
const mongoose = require('mongoose');

// Define the Admin schema
const BusinessSchema = new mongoose.Schema(
  {
    id_tax: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    web: {
      type: String,
      required: false,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    payment_fee: {
      type: Number,
      default: 0,
      required: true,
    },
    token: {
      type: String,
      required: false,
    },
    stats: {
      type: String,
    },
    last_stats_update: {
      type: Date,
    },
    kyc: {
      type: String,
      enum: ['initial', 'pending', 'accepted', 'denied'],
      default: 'pending',
    },
    document: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

// Create the model from the schema and export it
module.exports = mongoose.model('Business', BusinessSchema);
