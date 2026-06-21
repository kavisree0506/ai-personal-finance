import { motion } from 'motion/react';
import { Plus, TrendingDown, Calendar, DollarSign, Coffee, ShoppingBag, Car, Home as HomeIcon, Zap, MoreHorizontal, AlertCircle } from 'lucide-react';
import { Navigation } from './Navigation';
import { useState, useEffect } from 'react';
import { addExpense, getExpenses, ExpenseListResponse, APIError } from '../api';

interface ExpenseTrackingProps {
  onNavigate: (page: string) => void;
}

const categories = [
  { name: 'Food & Dining', icon: <Coffee className="w-5 h-5" />, color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  { name: 'Shopping', icon: <ShoppingBag className="w-5 h-5" />, color: 'from-purple-500 to-indigo-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  { name: 'Transportation', icon: <Car className="w-5 h-5" />, color: 'from-cyan-500 to-blue-500', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
  { name: 'Bills', icon: <HomeIcon className="w-5 h-5" />, color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  { name: 'Entertainment', icon: <Zap className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { name: 'Others', icon: <MoreHorizontal className="w-5 h-5" />, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
];

export function ExpenseTracking({ onNavigate }: ExpenseTrackingProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseListResponse | null>(null);

  const userId = parseInt(localStorage.getItem('user_id') || '1', 10);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[ExpenseTracking] Fetching expenses...');
      const data = await getExpenses(userId);
      setExpenseData(data);
      console.log('[ExpenseTracking] Expenses loaded:', data.total_count);
    } catch (err) {
      const message = err instanceof APIError
        ? err.message
        : 'Failed to load expenses. Please check your connection.';
      setError(message);
      console.error('[ExpenseTracking] Error loading expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!amount || !description || !selectedCategory) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('[ExpenseTracking] Adding expense:', { category: selectedCategory, amount, description });
      
      await addExpense(userId, {
        amount: parseFloat(amount),
        category: selectedCategory,
        note: description,
      });

      console.log('[ExpenseTracking] Expense added successfully');
      
      setAmount('');
      setDescription('');
      setSelectedCategory('');
      setShowAddForm(false);

      await fetchExpenses();
    } catch (err) {
      const message = err instanceof APIError
        ? err.message
        : 'Failed to add expense. Please try again.';
      setError(message);
      console.error('[ExpenseTracking] Error adding expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayTotal = expenseData?.total_amount || 0;
  const weekTotal = expenseData?.total_amount || 0;

  return (
    <div className="min-h-screen pb-20">
      <Navigation currentPage="expenses" onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Expense Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track every rupee and stay in control
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Expenses</p>
                <p className="text-4xl font-bold">₹{todayTotal.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <TrendingDown className="w-8 h-8" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Entries</p>
                <p className="text-4xl font-bold">{expenseData?.total_count || 0}</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Quick Add */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Add by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setShowAddForm(true);
                  setError(null);
                }}
                className={`p-6 rounded-2xl ${category.bgColor} hover:shadow-lg transition-all`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-white`}>
                  {category.icon}
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {category.name}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Add Expense Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl"
          >
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Add New Expense</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="What did you spend on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={handleAddExpense}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Expense'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setError(null);
                }}
                className="px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Recent Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Recent Expenses</h3>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading expenses...</p>
            </div>
          ) : expenseData && expenseData.expenses.length > 0 ? (
            <div className="space-y-3">
              {expenseData.expenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {expense.category || 'Other'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {expense.note || 'No description'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(expense.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-pink-600 dark:text-pink-400">
                        ₹{expense.amount.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No expenses yet. Start tracking by adding your first expense!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
