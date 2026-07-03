import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { MdBarChart } from 'react-icons/md';
import { format, setMonth, setYear, startOfMonth } from 'date-fns';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, notation: 'compact' }).format(v);

const buildMonthlyData = (rawMonthly) => {
  // Build last 6 months labels
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: format(d, 'MMM yy'), income: 0, expense: 0 });
  }

  rawMonthly.forEach(({ _id, total }) => {
    const slot = months.find((m) => m.year === _id.year && m.month === _id.month);
    if (slot) slot[_id.type] = total;
  });

  return months;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--color-border)',
        borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem',
        backdropFilter: 'blur(10px)',
      }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '6px', fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill, fontWeight: 700, marginBottom: '2px' }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlyBarChart = ({ monthly }) => {
  const data = buildMonthlyData(monthly || []);
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <div className="glass-card chart-card">
        <h3><MdBarChart /> Monthly Overview</h3>
        <div className="empty-chart">
          <div className="empty-chart-icon">📊</div>
          <p>No monthly data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card chart-card">
      <h3><MdBarChart /> Monthly Overview <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>Last 6 months</span></h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrency}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend
              wrapperStyle={{ fontSize: '0.8rem', paddingTop: '12px' }}
              formatter={(value) => (
                <span style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{value}</span>
              )}
            />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBarChart;
