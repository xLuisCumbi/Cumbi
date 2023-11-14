// Import Mongoose
const mongoose = require('mongoose');

// Define the Deposit schema
const DepositSchema = new mongoose.Schema({
  address: {
    type: String,
    default: null,
  },
  address_index: {
    type: Number,
    default: null,
  },
  privateKey: {
    type: String,
    default: null,
  },
  coin: {
    type: String,
    default: null,
  },
  network: {
    type: String,
    default: null,
  },
  amount: {
    type: Number,
    required: true,
  },
  amount_usd: {
    type: Number,
    required: true,
  },
  deposit_id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  consolidation_status: {
    type: String,
    default: null,
  },
  balance: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  // wp_order_received_url: {
  //     type: String,
  //     default: null
  // },
  order_received_url: {
    type: String,
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
  },
  trm: {
    type: Number,
  },
  trm_house: {
    type: Number,
  },
  amount_fiat: {
    type: Number,
  },
  coin_fiat: {
    type: String,
  },
  payment_fee: {
    type: Number,
  },
  type_payment_fee: {
    type: String,
    enum: ['person', 'business', 'cumbi'],
  },
  gmf: {
    type: Number,
    default: 0,
  },
  iva: {
    type: Number,
    default: 0,
  },
  commission_cumbi: {
    type: Number,
    default: 0,
  },
  amount_to_receive_in_bank: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false },
});

// Create the model from the schema and export it
module.exports = mongoose.model('Deposit', DepositSchema);
