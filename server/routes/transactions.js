const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// @route   GET /api/transactions
// @desc    Get all transactions for current user (with filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, category, startDate, endDate, sortBy = 'date', order = 'desc', limit } = req.query;

    const filter = { user: req.user.id };
    if (type && ['income', 'expense'].includes(type)) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    let query = Transaction.find(filter).sort({ [sortBy]: sortOrder });
    if (limit) query = query.limit(parseInt(limit));

    const transactions = await query;
    res.json(transactions);
  } catch (err) {
    console.error('Get transactions error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/summary
// @desc    Get financial summary stats + chart data
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Total income and expenses
    const totals = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const income = totals.find((t) => t._id === 'income')?.total || 0;
    const expenses = totals.find((t) => t._id === 'expense')?.total || 0;
    const incomeCount = totals.find((t) => t._id === 'income')?.count || 0;
    const expenseCount = totals.find((t) => t._id === 'expense')?.count || 0;

    // Expense breakdown by category
    const byCategory = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Income breakdown by category
    const incomeByCategory = await Transaction.aggregate([
      { $match: { user: userId, type: 'income' } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Monthly data: last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthly = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      income,
      expenses,
      balance: income - expenses,
      savingsRate: income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : 0,
      incomeCount,
      expenseCount,
      byCategory,
      incomeByCategory,
      monthly,
    });
  } catch (err) {
    console.error('Summary error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions
// @desc    Add a new transaction
// @access  Private
router.post(
  '/',
  auth,
  [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number'),
    body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Invalid date format'),
    body('description').optional().isLength({ max: 200 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    try {
      const transaction = new Transaction({
        user: req.user.id,
        type: req.body.type,
        category: req.body.category,
        amount: parseFloat(req.body.amount),
        description: req.body.description || '',
        date: new Date(req.body.date),
      });

      await transaction.save();
      res.status(201).json(transaction);
    } catch (err) {
      console.error('Add transaction error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const updates = {};
    const allowed = ['type', 'category', 'amount', 'description', 'date'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (err) {
    console.error('Update transaction error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('Delete transaction error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
