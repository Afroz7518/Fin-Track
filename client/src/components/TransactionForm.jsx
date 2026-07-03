import { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { MdAdd, MdTrendingUp, MdTrendingDown } from 'react-icons/md';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];
const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transport', 'Housing & Rent', 'Healthcare',
  'Shopping', 'Entertainment', 'Education', 'Utilities', 'Other',
];

const initialForm = {
  type: 'expense',
  category: '',
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
};

const TransactionForm = () => {
  const { addTransaction } = useTransactions();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = 'Category is required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'type' ? { category: '' } : {}),
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await addTransaction({
      ...form,
      amount: parseFloat(form.amount),
    });

    if (result.success) {
      setForm(initialForm);
      setErrors({});
    }
    setSubmitting(false);
  };

  return (
    <div className="glass-card form-card">
      <h3>
        {form.type === 'income'
          ? <><MdTrendingUp color="var(--color-income)" /> Add Income</>
          : <><MdTrendingDown color="var(--color-expense)" /> Add Expense</>
        }
      </h3>

      {/* Type Toggle */}
      <div className="type-toggle">
        <button
          type="button"
          className={`type-toggle-btn ${form.type === 'income' ? 'active-income' : ''}`}
          onClick={() => setForm((prev) => ({ ...prev, type: 'income', category: '' }))}
        >
          <MdTrendingUp /> Income
        </button>
        <button
          type="button"
          className={`type-toggle-btn ${form.type === 'expense' ? 'active-expense' : ''}`}
          onClick={() => setForm((prev) => ({ ...prev, type: 'expense', category: '' }))}
        >
          <MdTrendingDown /> Expense
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-fields">
        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <span className="form-error">⚠ {errors.category}</span>}
        </div>

        {/* Amount & Date */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="form-control"
            />
            {errors.amount && <span className="form-error">⚠ {errors.amount}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="form-control"
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.date && <span className="form-error">⚠ {errors.date}</span>}
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description (optional)</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What was this for?"
            className="form-control"
            maxLength={200}
          />
        </div>

        <button
          type="submit"
          className={`btn btn-full btn-lg ${form.type === 'income' ? 'btn-income' : 'btn-expense'}`}
          disabled={submitting}
          id="add-transaction-btn"
        >
          {submitting ? (
            <><div className="spinner" /> Processing...</>
          ) : (
            <><MdAdd style={{ fontSize: '1.2rem' }} /> Add {form.type === 'income' ? 'Income' : 'Expense'}</>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
