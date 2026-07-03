import { useTransactions } from '../context/TransactionContext';
import TransactionRow from './TransactionRow';
import { MdReceiptLong, MdSearch } from 'react-icons/md';
import { format } from 'date-fns';

const ALL_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Business', 'Gift',
  'Food & Dining', 'Transport', 'Housing & Rent', 'Healthcare',
  'Shopping', 'Entertainment', 'Education', 'Utilities', 'Other',
];

const CATEGORY_EMOJIS = {
  'Salary': '💼', 'Freelance': '💻', 'Investment': '📈', 'Business': '🏢',
  'Gift': '🎁', 'Food & Dining': '🍽️', 'Transport': '🚗',
  'Housing & Rent': '🏠', 'Healthcare': '💊', 'Shopping': '🛍️',
  'Entertainment': '🎮', 'Education': '📚', 'Utilities': '⚡',
  'Other': '📌',
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const TransactionList = () => {
  const { filteredTransactions, loading, filters, setFilters, deleteTransaction } = useTransactions();

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="glass-card transactions-card">
      <div className="transactions-header">
        <h3>
          <MdReceiptLong />
          Recent Transactions
          {filteredTransactions.length > 0 && (
            <span style={{
              marginLeft: '8px', fontSize: '0.75rem', fontWeight: 600,
              background: 'var(--color-primary-glow)', color: 'var(--color-primary-light)',
              padding: '2px 8px', borderRadius: '999px',
            }}>
              {filteredTransactions.length}
            </span>
          )}
        </h3>

        {/* Filters */}
        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: '140px' }}>
            <MdSearch style={{
              position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleFilter('search', e.target.value)}
              className="search-input"
              style={{ paddingLeft: '28px', width: '100%' }}
              id="transaction-search"
            />
          </div>

          <select
            className="filter-select"
            value={filters.type}
            onChange={(e) => handleFilter('type', e.target.value)}
            id="filter-type"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilter('category', e.target.value)}
            id="filter-category"
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {(filters.type || filters.category || filters.search) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setFilters({ type: '', category: '', search: '' })}
              id="clear-filters-btn"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner spinner-lg" />
          <p>Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💸</div>
          <h3>No transactions yet</h3>
          <p>
            {filters.type || filters.category || filters.search
              ? 'No transactions match your filters.'
              : 'Add your first income or expense to get started!'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="transaction-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <TransactionRow key={transaction._id} transaction={transaction} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="transaction-cards">
            {filteredTransactions.map((t) => {
              const emoji = CATEGORY_EMOJIS[t.category] || '📌';
              const isIncome = t.type === 'income';
              return (
                <div key={t._id} className="transaction-card-item">
                  <div className={`transaction-type-icon ${t.type}`}>
                    {emoji}
                  </div>
                  <div className="transaction-card-info">
                    <div className="transaction-desc">{t.description || t.category}</div>
                    <div className="transaction-card-meta">
                      <span className={`badge badge-${t.type}`}>{t.type}</span>
                      <span className="transaction-card-date">
                        {format(new Date(t.date), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-card-right">
                    <span className={`transaction-amount ${t.type}`}>
                      {isIncome ? '+' : '−'} {formatCurrency(t.amount)}
                    </span>
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDelete(t._id)}
                      title="Delete transaction"
                      id={`delete-transaction-${t._id}`}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionList;
