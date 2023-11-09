const mongoose = require('mongoose');

const { Schema } = mongoose;

const ApiTokenSchema = new Schema({
  token_name: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

module.exports = mongoose.model('ApiToken', ApiTokenSchema);
