import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTransactions } from '../context/TransactionContext';
import Sidebar from '../components/Sidebar';
import {
  MdSearch, MdFilterList, MdDelete, MdTrendingUp, MdTrendingDown,
  MdCalendarToday, MdOutlinePayments, MdClear, MdRefresh,
} from 'react-icons/md';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

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

const Transactions = () => {
  const {
    filteredTransactions,
    filters,
    setFilters,
    loading,
    refreshAll,
    deleteTransaction
  } = useTransactions();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date-desc',
  });

  // Ensure data is refreshed on page mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleContextFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocalFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setFilters({ type: '', category: '', search: '' });
    setLocalFilters({
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date-desc',
    });
  };

  // Filter & sort operations
  const processedTransactions = useMemo(() => {
    let result = [...filteredTransactions];

    // 1. Date Range
    if (localFilters.startDate) {
      const start = new Date(localFilters.startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((t) => new Date(t.date) >= start);
    }
    if (localFilters.endDate) {
      const end = new Date(localFilters.endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.date) <= end);
    }

    // 2. Amount Range
    if (localFilters.minAmount) {
      const min = parseFloat(localFilters.minAmount);
      result = result.filter((t) => t.amount >= min);
    }
    if (localFilters.maxAmount) {
      const max = parseFloat(localFilters.maxAmount);
      result = result.filter((t) => t.amount <= max);
    }

    // 3. Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      switch (localFilters.sortBy) {
        case 'date-asc':
          return dateA - dateB;
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'date-desc':
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [filteredTransactions, localFilters]);

  // Compute page-level summary stats based on current visible list
  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    processedTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return {
      income,
      expense,
      net: income - expense,
      count: processedTransactions.length,
    };
  }, [processedTransactions]);

  // Group transactions by date for the timeline UI
  const groupedTransactions = useMemo(() => {
    const groups = {};
    processedTransactions.forEach((t) => {
      const dateObj = new Date(t.date);
      let dateHeader = '';

      if (isToday(dateObj)) {
        dateHeader = 'Today 📅';
      } else if (isYesterday(dateObj)) {
        dateHeader = 'Yesterday 🕒';
      } else {
        dateHeader = format(dateObj, 'eeee, dd MMMM yyyy');
      }

      if (!groups[dateHeader]) groups[dateHeader] = [];
      groups[dateHeader].push(t);
    });
    return groups;
  }, [processedTransactions]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <span /><span /><span />
            </button>
            <div className="topbar-title">
              <h1>Transactions Manager</h1>
              <p>Manage, audit, and filter your transaction history</p>
            </div>
          </div>

          <div className="topbar-actions">
            {(filters.type || filters.category || filters.search || localFilters.startDate || localFilters.endDate || localFilters.minAmount || localFilters.maxAmount) && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleClearAll}
                id="clear-filters-all"
              >
                <MdClear /> Reset Filters
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={refreshAll}
              disabled={loading}
              title="Refresh data"
            >
              <MdRefresh />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-container">
          {/* Quick Stats Grid */}
          <div className="tx-stats-row">
            <div className="glass-card tx-stat-mini-card income">
              <div className="icon"><MdTrendingUp /></div>
              <div>
                <h4>Total Inflow</h4>
                <p>{formatCurrency(metrics.income)}</p>
              </div>
            </div>
            <div className="glass-card tx-stat-mini-card expense">
              <div className="icon"><MdTrendingDown /></div>
              <div>
                <h4>Total Outflow</h4>
                <p>{formatCurrency(metrics.expense)}</p>
              </div>
            </div>
            <div className="glass-card tx-stat-mini-card net">
              <div className="icon"><MdOutlinePayments /></div>
              <div>
                <h4>Net Flow</h4>
                <p style={{ color: metrics.net >= 0 ? 'var(--color-income-light)' : 'var(--color-expense-light)' }}>
                  {metrics.net >= 0 ? '+' : ''}{formatCurrency(metrics.net)}
                </p>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="tx-manager-layout">
            {/* Left Filter Sidebar */}
            <aside className="glass-card tx-filter-card">
              <h4><MdFilterList /> Filter Controls</h4>

              {/* Keyword search */}
              <div className="form-group">
                <label className="form-label">Search</label>
                <div style={{ position: 'relative' }}>
                  <MdSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    value={filters.search}
                    onChange={(e) => handleContextFilter('search', e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '32px' }}
                  />
                </div>
              </div>

              {/* Type selector */}
              <div className="form-group">
                <label className="form-label">Transaction Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleContextFilter('type', e.target.value)}
                  className="form-control"
                >
                  <option value="">All Types</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expense Only</option>
                </select>
              </div>

              {/* Category selector */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleContextFilter('category', e.target.value)}
                  className="form-control"
                >
                  <option value="">All Categories</option>
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Min & Max Amount */}
              <div className="form-group">
                <label className="form-label">Amount Range (₹)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minAmount}
                    onChange={(e) => handleLocalFilterChange('minAmount', e.target.value)}
                    className="form-control"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxAmount}
                    onChange={(e) => handleLocalFilterChange('maxAmount', e.target.value)}
                    className="form-control"
                    min="0"
                  />
                </div>
              </div>

              {/* Date Filters */}
              <div className="form-group">
                <label className="form-label">Time Period</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="date"
                    value={localFilters.startDate}
                    onChange={(e) => handleLocalFilterChange('startDate', e.target.value)}
                    className="form-control"
                  />
                  <input
                    type="date"
                    value={localFilters.endDate}
                    onChange={(e) => handleLocalFilterChange('endDate', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Sorting */}
              <div className="form-group">
                <label className="form-label">Sort By</label>
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => handleLocalFilterChange('sortBy', e.target.value)}
                  className="form-control"
                >
                  <option value="date-desc">Newest Date First</option>
                  <option value="date-asc">Oldest Date First</option>
                  <option value="amount-desc">Highest Amount First</option>
                  <option value="amount-asc">Lowest Amount First</option>
                </select>
              </div>
            </aside>

            {/* Right List Panel */}
            <section style={{ minWidth: 0 }}>
              {loading ? (
                <div className="loading-overlay">
                  <div className="spinner spinner-lg" />
                  <p>Loading transactions...</p>
                </div>
              ) : processedTransactions.length === 0 ? (
                <div className="glass-card empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3>No transactions found</h3>
                  <p>Try refining or clearing your filters above.</p>
                  <button className="btn btn-primary" onClick={handleClearAll}>
                    Reset All Filters
                  </button>
                </div>
              ) : (
                Object.keys(groupedTransactions).map((dateHeader) => (
                  <div key={dateHeader} className="tx-date-group">
                    <div className="tx-date-header">
                      {dateHeader}
                    </div>
                    <div className="tx-cards-container">
                      {groupedTransactions[dateHeader].map((tx) => {
                        const emoji = CATEGORY_EMOJIS[tx.category] || '📌';
                        const isIncome = tx.type === 'income';

                        return (
                          <div key={tx._id} className="glass-card tx-item-card">
                            <div className="tx-item-left">
                              <div className={`tx-item-icon ${tx.type}`}>
                                {emoji}
                              </div>
                              <div className="tx-item-info">
                                <div className="tx-item-desc">
                                  {tx.description || tx.category}
                                </div>
                                <div className="tx-item-meta">
                                  <span className="tx-item-category">{tx.category}</span>
                                  <span className={`badge badge-${tx.type}`}>{tx.type}</span>
                                </div>
                              </div>
                            </div>
                            <div className="tx-item-right">
                              <span className={`tx-item-amount ${tx.type}`}>
                                {isIncome ? '+' : '−'} {formatCurrency(tx.amount)}
                              </span>
                              <button
                                className="btn btn-danger btn-icon"
                                onClick={() => handleDelete(tx._id)}
                                title="Delete transaction"
                              >
                                <MdDelete />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Transactions;
