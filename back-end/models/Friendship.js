const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  // User who initiated the request
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // User who received the request
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Status of the friendship
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'], // Possible statuses
    default: 'pending',
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt, updatedAt
});

// Ensure a unique friendship between two users (regardless of order)
// This requires a bit more complex index or pre-save logic if strict uniqueness is needed.
// For simplicity now, we'll rely on controller logic to prevent duplicates.
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });
friendshipSchema.index({ recipient: 1, requester: 1 }); // Index for querying in reverse

const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = Friendship; 