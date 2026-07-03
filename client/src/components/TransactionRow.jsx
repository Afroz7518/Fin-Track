import { format } from 'date-fns';
import { MdDelete, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { useTransactions } from '../context/TransactionContext';

const CATEGORY_EMOJIS = {
  'Salary': '💼', 'Freelance': '💻', 'Investment': '📈', 'Business': '🏢',
  'Gift': '🎁', 'Food & Dining': '🍽️', 'Transport': '🚗',
  'Housing & Rent': '🏠', 'Healthcare': '💊', 'Shopping': '🛍️',
  'Entertainment': '🎮', 'Education': '📚', 'Utilities': '⚡',
  'Other': '📌',
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const TransactionRow = ({ transaction }) => {
  const { deleteTransaction } = useTransactions();
  const { _id, type, category, amount, description, date } = transaction;

  const handleDelete = async () => {
    if (window.confirm('Delete this transaction?')) {
      await deleteTransaction(_id);
    }
  };

  const emoji = CATEGORY_EMOJIS[category] || '📌';
  const isIncome = type === 'income';

  return (
    <tr className="transaction-row">
      {/* Icon + Info */}
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={`transaction-type-icon ${type}`}>
            {emoji}
          </div>
          <div>
            <div className="transaction-desc">
              {description || category}
            </div>
            <div className="transaction-meta">{category}</div>
          </div>
        </div>
      </td>

      {/* Type Badge */}
      <td>
        <span className={`badge badge-${type}`}>
          {isIncome ? <MdTrendingUp /> : <MdTrendingDown />}
          {type}
        </span>
      </td>

      {/* Date */}
      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
        {format(new Date(date), 'dd MMM yyyy')}
      </td>

      {/* Amount */}
      <td>
        <span className={`transaction-amount ${type}`}>
          {isIncome ? '+' : '−'} {formatCurrency(amount)}
        </span>
      </td>

      {/* Actions */}
      <td>
        <button
          className="btn btn-danger btn-icon"
          onClick={handleDelete}
          title="Delete transaction"
          id={`delete-transaction-${_id}`}
        >
          <MdDelete />
        </button>
      </td>
    </tr>
  );
};

export default TransactionRow;
