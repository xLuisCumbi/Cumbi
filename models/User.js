// Import Mongoose
const mongoose = require('mongoose');

// Define the Admin schema
const UserSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: function () {
        return this.role !== 'person'; // El campo es requerido si el rol no es "person".
      },
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
      lowercase: true,
    },
    password: {
      type: String,
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
    payment_fee: {
      type: Number,
      required: function () {
        return this.role === 'person'; // El campo es requerido si el rol es "person".
      },
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    kyc: {
      type: String,
      enum: ['pending', 'accepted', 'denied'],
      default: 'pending',
    },
    document: {
      type: String
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);


// Create the model from the schema and export it
module.exports = mongoose.model('User', UserSchema)