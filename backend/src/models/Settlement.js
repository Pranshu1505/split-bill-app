const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    // Who paid
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    paidByGuest: { type: String, default: '' },
    // Who received
    paidTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    paidToGuest: { type: String, default: '' },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
    settledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settlement', settlementSchema);