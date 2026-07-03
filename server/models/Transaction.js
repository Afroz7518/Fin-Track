const mongoose = require('mongoose');

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];
const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Housing & Rent',
  'Healthcare',
  'Shopping',
  'Entertainment',
  'Education',
  'Utilities',
  'Other',
];

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for efficient user + date queries
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, type: 1 });

TransactionSchema.statics.INCOME_CATEGORIES = INCOME_CATEGORIES;
TransactionSchema.statics.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;

module.exports = mongoose.model('Transaction', TransactionSchema);
