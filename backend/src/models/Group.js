const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    currency: { type: String, default: '₹' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        guestName: { type: String, default: '' }, // for non-registered members
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);