import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    income: 0, expenses: 0, balance: 0, savingsRate: 0,
    incomeCount: 0, expenseCount: 0,
    byCategory: [], incomeByCategory: [], monthly: [],
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: '', search: '' });

  const fetchTransactions = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const res = await api.get('/transactions', { params });
      setTransactions(res.data);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get('/transactions/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchTransactions(), fetchSummary()]);
  }, [fetchTransactions, fetchSummary]);

  const addTransaction = async (data) => {
    try {
      const res = await api.post('/transactions', data);
      setTransactions((prev) => [res.data, ...prev]);
      await fetchSummary();
      toast.success(
        `${data.type === 'income' ? '💰 Income' : '💸 Expense'} added successfully!`
      );
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add transaction';
      toast.error(msg);
      return { success: false };
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      await fetchSummary();
      toast.success('Transaction deleted');
      return { success: true };
    } catch (err) {
      toast.error('Failed to delete transaction');
      return { success: false };
    }
  };

  const updateTransaction = async (id, data) => {
    try {
      const res = await api.put(`/transactions/${id}`, data);
      setTransactions((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      await fetchSummary();
      toast.success('Transaction updated');
      return { success: true, data: res.data };
    } catch (err) {
      toast.error('Failed to update transaction');
      return { success: false };
    }
  };

  // Filtered transactions (client-side search)
  const filteredTransactions = transactions.filter((t) => {
    if (filters.type && t.type !== filters.type) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!t.description?.toLowerCase().includes(q) && !t.category?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        filteredTransactions,
        summary,
        loading,
        filters,
        setFilters,
        fetchTransactions,
        fetchSummary,
        refreshAll,
        addTransaction,
        deleteTransaction,
        updateTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) throw new Error('useTransactions must be used within TransactionProvider');
  return context;
};
