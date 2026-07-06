import { useState, useEffect, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import Sidebar from '../components/Sidebar';
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  MdBarChart, MdTrendingUp, MdTrendingDown, MdSavings,
  MdPieChart, MdTimeline, MdRefresh, MdInfo,
} from 'react-icons/md';
import { format } from 'date-fns';

const COLORS = [
  '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316',
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

const formatCurrencyCompact = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, notation: 'compact' }).format(v);

// Convert raw monthly query data to list of last 6 months for chart rendering
const buildMonthlyData = (rawMonthly) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: format(d, 'MMM yy'),
      income: 0,
      expense: 0,
      savings: 0,
    });
  }

  rawMonthly.forEach(({ _id, total }) => {
    const slot = months.find((m) => m.year === _id.year && m.month === _id.month);
    if (slot) {
      slot[_id.type] = total;
      if (_id.type === 'income') {
        slot.savings += total;
      } else {
        slot.savings -= total;
      }
    }
  });

  return months;
};

const Reports = () => {
  const { summary, refreshAll, loading } = useTransactions();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Calculations
  const savingsRate = parseFloat(summary.savingsRate || 0);
  const totalIncome = summary.income || 0;
  const totalExpense = summary.expenses || 0;

  // 1. Efficiency: Outflow per 100 ₹ of Inflow
  const efficiencyValue = totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(0) : 0;

  // 2. Financial health rating
  const healthRating = useMemo(() => {
    if (totalIncome === 0 && totalExpense === 0) return { label: 'No Data Yet', color: 'var(--color-text-muted)', desc: 'Start logging transactions to see your financial health.' };
    if (savingsRate >= 30) return { label: 'A+ Excellent', color: 'var(--color-income-light)', desc: 'You are saving a significant chunk of your income. Superb budget discipline!' };
    if (savingsRate >= 20) return { label: 'A Healthy', color: 'var(--color-income-light)', desc: 'Healthy savings buffers. You are on track for your financial targets.' };
    if (savingsRate >= 10) return { label: 'B Stable', color: 'var(--color-primary-light)', desc: 'Balanced lifestyle. Try trimming non-essential subscriptions to save more.' };
    if (savingsRate >= 0) return { label: 'C Tight Margins', color: 'var(--color-warning)', desc: 'Narrow margins. Keep a closer watch on shopping or entertainment categories.' };
    return { label: 'D Overspending', color: 'var(--color-expense-light)', desc: 'Spending exceeds income. Focus on reducing variable costs and auditing subscriptions.' };
  }, [savingsRate, totalIncome, totalExpense]);

  // 3. Highest spending category details
  const highestExpenseCategory = useMemo(() => {
    if (!summary.byCategory || summary.byCategory.length === 0) return null;
    return summary.byCategory[0]; // Already sorted descending by backend
  }, [summary.byCategory]);

  // 4. Area Chart Data
  const areaChartData = useMemo(() => {
    return buildMonthlyData(summary.monthly || []);
  }, [summary.monthly]);

  // 5. Income distribution chart data
  const incomePieData = useMemo(() => {
    if (!summary.incomeByCategory || summary.incomeByCategory.length === 0) return [];
    return summary.incomeByCategory.map((item, i) => ({
      name: item._id,
      value: item.total,
      color: COLORS[i % COLORS.length],
    }));
  }, [summary.incomeByCategory]);

  const CustomAreaTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--color-border)',
          borderRadius: '12px', padding: '12px 16px', fontSize: '0.82rem',
          backdropFilter: 'blur(10px)', boxShadow: 'var(--shadow-card)'
        }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color || p.fill, fontWeight: 700, marginBottom: '2px' }}>
              {p.name}: {formatCurrency(p.value)}
            </p>
          ))}
          {payload.length === 2 && (
            <p style={{
              color: 'var(--color-text-primary)', fontWeight: 600,
              marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--color-border)'
            }}>
              Net Savings: {formatCurrency(payload[0].value - payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--color-border)',
          borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem',
          backdropFilter: 'blur(10px)', boxShadow: 'var(--shadow-card)'
        }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{payload[0].name}</p>
          <p style={{ fontWeight: 700, color: payload[0].payload.color }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
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
              <h1>Reports & Analytics</h1>
              <p>Visual trends and spending distribution diagnostics</p>
            </div>
          </div>

          <div className="topbar-actions">
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
          {/* Insights Overview Grid */}
          <div className="reports-insights-grid">
            {/* Savings Rate Card */}
            <div className="glass-card report-insight-card savings">
              <div className="card-header-icon">
                <h4>Savings Rate</h4>
                <span className="report-insight-icon-badge">🎯</span>
              </div>
              <div className="report-insight-val primary">{savingsRate.toFixed(1)}%</div>
              <div className="report-insight-sub">
                <div className="progress-bar w-full" style={{ height: '6px' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.max(0, Math.min(100, savingsRate))}%`,
                      background: savingsRate >= 20 ? 'var(--color-income-light)' : savingsRate >= 0 ? 'var(--color-primary-light)' : 'var(--color-expense-light)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Highest Spending Card */}
            <div className="glass-card report-insight-card highest">
              <div className="card-header-icon">
                <h4>Top Spending</h4>
                <span className="report-insight-icon-badge">💸</span>
              </div>
              <div className="report-insight-val expense">
                {highestExpenseCategory ? formatCurrency(highestExpenseCategory.total) : '₹0'}
              </div>
              <div className="report-insight-sub">
                <span>{highestExpenseCategory ? `${CATEGORY_EMOJIS[highestExpenseCategory._id] || '📌'} ${highestExpenseCategory._id}` : 'No data logged'}</span>
              </div>
            </div>

            {/* Efficiency Rating Card */}
            <div className="glass-card report-insight-card efficiency">
              <div className="card-header-icon">
                <h4>Burn Rate</h4>
                <span className="report-insight-icon-badge">🔥</span>
              </div>
              <div className="report-insight-val warning">{efficiencyValue}%</div>
              <div className="report-insight-sub">
                <span>Spent per 100 ₹ of Inflow</span>
              </div>
            </div>

            {/* Financial Health Score Card */}
            <div className="glass-card report-insight-card health">
              <div className="card-header-icon">
                <h4>Health Grade</h4>
                <span className="report-insight-icon-badge">❤️</span>
              </div>
              <div className="report-insight-val" style={{ color: healthRating.color }}>
                {healthRating.label}
              </div>
              <div className="report-insight-sub">
                <span style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <MdInfo style={{ flexShrink: 0 }} /> {healthRating.desc}
                </span>
              </div>
            </div>
          </div>

          {/* Main Visualizations Grid */}
          <div className="reports-charts-grid">
            {/* Left: Cash Flow Over Time */}
            <div className="glass-card chart-card">
              <h3><MdTimeline /> Cash Flow Trends</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrencyCompact} width={50} />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '12px' }} />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Income Sources Donut */}
            <div className="glass-card chart-card">
              <h3><MdPieChart /> Income Sources</h3>
              {incomePieData.length === 0 ? (
                <div className="empty-chart" style={{ height: '320px' }}>
                  <div className="empty-chart-icon">🍩</div>
                  <p>No income logs recorded</p>
                </div>
              ) : (
                <div className="chart-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '320px', justifyContent: 'space-between' }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={incomePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {incomePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend listing */}
                  <div className="donut-legend" style={{ maxHeight: '130px', overflowY: 'auto', margin: 0 }}>
                    {incomePieData.map((item, i) => (
                      <div key={i} className="donut-legend-item">
                        <div className="donut-legend-dot" style={{ background: item.color }} />
                        <span className="donut-legend-label">{item.name}</span>
                        <span className="donut-legend-value">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lower Section: Category Details list */}
          <div className="reports-categories-grid">
            {/* Left: Expenses Categories breakdown */}
            <div className="glass-card chart-card">
              <h3><MdBarChart /> Spending by Category</h3>
              {(!summary.byCategory || summary.byCategory.length === 0) ? (
                <div className="empty-chart" style={{ height: '200px' }}>
                  <p>No expenses logged</p>
                </div>
              ) : (
                <div className="report-categories-list">
                  {summary.byCategory.map((cat, idx) => {
                    const pct = ((cat.total / (totalExpense || 1)) * 100).toFixed(0);
                    const color = COLORS[idx % COLORS.length];
                    const emoji = CATEGORY_EMOJIS[cat._id] || '📌';
                    return (
                      <div key={cat._id} className="report-category-row">
                        <div className="report-category-info">
                          <span>{emoji} {cat._id} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>({cat.count} items)</span></span>
                          <strong style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(cat.total)} <span style={{ color: 'var(--color-expense-light)', fontSize: '0.75rem', fontWeight: 500 }}>({pct}%)</span></strong>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Income Categories breakdown */}
            <div className="glass-card chart-card">
              <h3><MdBarChart /> Income by Category</h3>
              {(!summary.incomeByCategory || summary.incomeByCategory.length === 0) ? (
                <div className="empty-chart" style={{ height: '200px' }}>
                  <p>No income logs logged</p>
                </div>
              ) : (
                <div className="report-categories-list">
                  {summary.incomeByCategory.map((cat, idx) => {
                    const pct = ((cat.total / (totalIncome || 1)) * 100).toFixed(0);
                    const color = COLORS[idx % COLORS.length];
                    const emoji = CATEGORY_EMOJIS[cat._id] || '📌';
                    return (
                      <div key={cat._id} className="report-category-row">
                        <div className="report-category-info">
                          <span>{emoji} {cat._id} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>({cat.count} items)</span></span>
                          <strong style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(cat.total)} <span style={{ color: 'var(--color-income-light)', fontSize: '0.75rem', fontWeight: 500 }}>({pct}%)</span></strong>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
