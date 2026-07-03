import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MdDonutLarge } from 'react-icons/md';

const COLORS = [
  '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316',
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--color-border)',
        borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem',
        backdropFilter: 'blur(10px)',
      }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{payload[0].name}</p>
        <p style={{ fontWeight: 700, color: payload[0].payload.color }}>
          {formatCurrency(payload[0].value)}
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
          {payload[0].payload.percent}
        </p>
      </div>
    );
  }
  return null;
};

const ExpenseDonutChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card chart-card">
        <h3><MdDonutLarge /> Expense Breakdown</h3>
        <div className="empty-chart">
          <div className="empty-chart-icon">🍩</div>
          <p>No expense data yet</p>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);
  const chartData = data.map((item, i) => ({
    name: item._id,
    value: item.total,
    color: COLORS[i % COLORS.length],
    percent: `${((item.total / total) * 100).toFixed(1)}%`,
  }));

  return (
    <div className="glass-card chart-card">
      <h3><MdDonutLarge /> Expense Breakdown</h3>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div style={{
          textAlign: 'center', marginTop: '-12px', marginBottom: '8px',
          fontSize: '0.72rem', color: 'var(--color-text-muted)',
        }}>
          Total: <strong style={{ color: 'var(--color-expense-light)' }}>{formatCurrency(total)}</strong>
        </div>

        {/* Legend */}
        <div className="donut-legend">
          {chartData.map((item, i) => (
            <div key={i} className="donut-legend-item">
              <div className="donut-legend-dot" style={{ background: item.color }} />
              <span className="donut-legend-label">{item.name}</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className="donut-legend-value">{formatCurrency(item.value)}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{item.percent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDonutChart;
