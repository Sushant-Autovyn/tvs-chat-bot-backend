const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: String,
    trim: true,
    default: null,
  },
  issue: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    default: 'pending',
    trim: true,
  },
  tempPassword: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  messages: [
    {
      text:      { type: String, required: true },
      sender:    { type: String, enum: ['user', 'admin'], required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
