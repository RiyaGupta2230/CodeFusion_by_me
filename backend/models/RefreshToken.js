const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 0 // TTL index - documents auto-delete when expiresAt is reached
  },
  // Track client info for security auditing
  userAgent: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  }
});

// Compound index for efficient cleanup and queries
refreshTokenSchema.index({ userId: 1, expiresAt: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
