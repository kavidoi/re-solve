const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model (ensure you have one)
    },
  ],
  avatar: {
    type: String, // Could be an emoji, URL, etc.
    default: '👥', // Default avatar
  },
  // Add other fields as needed, e.g., createdBy, expenses, etc.
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true, // Uncomment once auth is implemented
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group; 