const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    paidByGuest: { type: String, default: '' }, // guest member name
    splitType: {
      type: String,
      enum: ['equal', 'custom', 'percentage'],
      default: 'equal',
    },
    splits: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        guestName: { type: String, default: '' }, // for guest members
        amount: { type: Number, required: true },
        percentage: { type: Number },
      },
    ],
    category: {
      type: String,
      enum: ['food', 'travel', 'shopping', 'entertainment', 'utilities', 'other'],
      default: 'other',
    },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);