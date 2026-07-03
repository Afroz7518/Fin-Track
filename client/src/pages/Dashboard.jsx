import { useEffect, useState, useCallback } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import SummaryCard from '../components/SummaryCard';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ExpenseDonutChart from '../components/ExpenseDonutChart';
import MonthlyBarChart from '../components/MonthlyBarChart';
import { MdTrendingUp, MdTrendingDown, MdAccountBalance, MdSavings, MdRefresh } from 'react-icons/md';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const { summary, refreshAll, loading } = useTransactions();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // stable reference: refreshAll comes from useCallback inside context
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  const savingsRate = parseFloat(summary.savingsRate || 0);

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
              id="sidebar-toggle"
              aria-label="Open sidebar"
            >
              <span /><span /><span />
            </button>
            <div className="topbar-title">
              <h1>Dashboard</h1>
              <p>Hello, {user?.name?.split(' ')[0]} 👋 — Your financial overview</p>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              id="refresh-btn"
              title="Refresh data"
            >
              <MdRefresh style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
              <span className="btn-label">Refresh</span>
            </button>
            <span className="topbar-date">
              📅 {format(new Date(), 'EEE, d MMM yyyy')}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-container">
          {/* Summary Cards */}
          <div className="summary-grid">
            <SummaryCard
              type="balance"
              icon={<MdAccountBalance />}
              label="Net Balance"
              value={summary.balance}
              subLabel={`${summary.incomeCount + summary.expenseCount} transactions total`}
            />
            <SummaryCard
              type="income"
              icon={<MdTrendingUp />}
              label="Total Income"
              value={summary.income}
              subLabel={`${summary.incomeCount} income entries`}
            />
            <SummaryCard
              type="expense"
              icon={<MdTrendingDown />}
              label="Total Expenses"
              value={summary.expenses}
              subLabel={`${summary.expenseCount} expense entries`}
            />
            <SummaryCard
              type="savings"
              icon={<MdSavings />}
              label="Savings Rate"
              value={summary.savingsRate}
              subLabel={
                savingsRate >= 20
                  ? '🎯 Great savings!'
                  : savingsRate >= 0
                  ? '💡 Keep it up'
                  : '⚠ Overspending'
              }
            />
          </div>

          {/* Dashboard Grid: Charts + Form */}
          <div className="dashboard-grid">
            {/* Left: Charts */}
            <div className="charts-section">
              <MonthlyBarChart monthly={summary.monthly} />
              <ExpenseDonutChart data={summary.byCategory} />
            </div>

            {/* Right: Add Transaction Form */}
            <div>
              <TransactionForm />

              {/* Quick Stats */}
              {summary.byCategory?.length > 0 && (
                <div className="glass-card" style={{ padding: '20px', marginTop: '20px' }}>
                  <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔥 Top Spending Categories
                  </h4>
                  {summary.byCategory.slice(0, 3).map((cat, i) => {
                    const total = summary.expenses || 1;
                    const pct = ((cat.total / total) * 100).toFixed(0);
                    return (
                      <div key={cat._id} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                            {i + 1}. {cat._id}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-expense-light)' }}>
                            {pct}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${pct}%`,
                              background:
                                i === 0
                                  ? 'var(--color-expense)'
                                  : i === 1
                                  ? '#f59e0b'
                                  : 'var(--color-primary)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Transaction List (full width) */}
          <TransactionList />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
