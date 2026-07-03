import { useEffect, useRef } from 'react';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const SummaryCard = ({ type, icon, label, value, subLabel, prefix = '₹', animated = true }) => {
  const amountRef = useRef(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (!amountRef.current || !animated) return;
    amountRef.current.classList.remove('count-animate');
    void amountRef.current.offsetWidth; // reflow
    amountRef.current.classList.add('count-animate');
    prevValueRef.current = value;
  }, [value, animated]);

  const displayValue = type === 'savings'
    ? `${parseFloat(value || 0).toFixed(1)}%`
    : formatCurrency(value || 0);

  return (
    <div className={`glass-card summary-card ${type}`}>
      <div className="summary-card-header">
        <div>
          <p className="summary-card-label">{label}</p>
        </div>
        <div className="summary-card-icon">{icon}</div>
      </div>
      <div ref={amountRef} className="summary-card-amount">
        {displayValue}
      </div>
      {subLabel && <p className="summary-card-sub">{subLabel}</p>}
    </div>
  );
};

export default SummaryCard;
