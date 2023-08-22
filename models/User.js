// Import Mongoose
const mongoose = require('mongoose');

// Define the Admin schema
const UserSchema = new mongoose.Schema(
  {
    business: {
      type: String,
      required: true,
      unique: false,
    },
    domain: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['person', 'business', 'admin', 'superadmin'],
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    passphrase: {
      type: String,
      required: false,
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
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);


// Create the model from the schema and export it
module.exports = mongoose.model('User', UserSchema)