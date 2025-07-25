import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import ExpenseChart from '../components/ExpenseChart';
import TransactionRow from '../components/TransactionRow';
import AddTransactionModal from '../components/AddTransactionModal';
// Placeholder imports for future components
// import AddTransactionModal from '../components/AddTransactionModal';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem('token');

  // Refactored data fetching for reuse
  const fetchDashboardData = async () => {
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Fetch user info
      const userRes = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);
      // Fetch summary
      const summaryRes = await axios.get('/api/transactions/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(summaryRes.data);
      // Fetch transactions
      const txRes = await axios.get('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(txRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, [token]);

  if (loading) return <div className="flex justify-center items-center min-h-[40vh]"><div className="text-primary animate-pulse text-lg font-semibold">Loading dashboard...</div></div>;
  if (error) return <div className="text-expense text-center mt-8">{error}</div>;

  return (
    <div className="space-y-8">
      {/* Header: Welcome & Add Transaction */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-on-surface">
          {user ? `Welcome back, ${user.name}!` : 'Welcome!'}
        </h1>
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-primary-dark transition"
          onClick={() => setShowModal(true)}
        >
          + Add Transaction
        </button>
      </div>
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Balance"
          amount={summary?.totalBalance ?? 0}
          colorClass={summary?.totalBalance >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="Total Income"
          amount={summary?.totalIncome ?? 0}
          colorClass="text-green-400"
        />
        <StatCard
          label="Total Expense"
          amount={summary?.totalExpense ?? 0}
          colorClass="text-red-400"
        />
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel 1: Expense Breakdown */}
        <div>
          <h3 className="text-xl font-bold text-on-surface mb-4">Expense Breakdown</h3>
          <ExpenseChart data={summary?.categoryBreakdown || []} total={summary?.totalExpense || 0} />
        </div>
        {/* Panel 2: Recent Transactions */}
        <div>
          <h3 className="text-xl font-bold text-on-surface mb-4">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <div className="text-on-surface-secondary text-center">No transactions yet. Add your first one!</div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 6).map(tx => (
                <TransactionRow key={tx._id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Add Transaction Modal */}
      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onAdd={fetchDashboardData}
        />
      )}
    </div>
  );
}

export default Dashboard;

