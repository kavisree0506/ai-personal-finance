import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Sparkles, Home, CreditCard, MessageSquare, Target, AlertTriangle, Loader } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Navigation } from './Navigation';
import { useState, useEffect } from 'react';
import { getDashboardSummary, getExpenses, DashboardSummary, ExpenseListResponse, APIError } from '../api';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

const monthlyData = [
  { month: 'Jan', income: 50000, expenses: 38000, savings: 12000 },
  { month: 'Feb', income: 50000, expenses: 42000, savings: 8000 },
  { month: 'Mar', income: 55000, expenses: 45000, savings: 10000 },
  { month: 'Apr', income: 50000, expenses: 40000, savings: 10000 },
  { month: 'May', income: 50000, expenses: 43000, savings: 7000 },
  { month: 'Jun', income: 52000, expenses: 48000, savings: 4000 },
];

export function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseListResponse | null>(null);

  const userId = parseInt(localStorage.getItem('user_id') || '1', 10);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [summaryData, expensesData] = await Promise.all([
          getDashboardSummary(userId),
          getExpenses(userId),
        ]);
        setSummary(summaryData);
        setExpenses(expensesData);
      } catch (err) {
        const message = err instanceof APIError
          ? err.message
          : 'Failed to load dashboard data';
        console.error('[Dashboard] Error loading data:', err);
        setError(message);
        // Fallback values for demo purposes
        setSummary({
          monthly_salary: 0,
          total_expenses: 0,
          total_savings: 0,
          remaining_balance: 0,
          savings_percentage: 0,
          expense_percentage: 0,
          health_score: 50,
          top_expense_category: 'N/A',
          top_expense_amount: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
        <Navigation currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 flex items-center justify-center" style={{ minHeight: '500px' }}>
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <Loader className="w-6 h-6 animate-spin text-purple-600" />
              <span className="text-gray-700 dark:text-gray-200">Loading your dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
        <Navigation currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
          <div className="rounded-3xl border border-orange-200 bg-orange-50 dark:bg-orange-950/50 dark:border-orange-800 p-10 text-center">
            <AlertTriangle className="mx-auto mb-4 w-12 h-12 text-orange-600 dark:text-orange-400" />
            <h1 className="text-3xl font-semibold text-orange-900 dark:text-white mb-3">Dashboard Unavailable</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error || 'Failed to load dashboard data'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Generate spending data from category breakdown
  const spendingData = expenses?.category_breakdown 
    ? Object.entries(expenses.category_breakdown).map(([name, value], index) => ({
        name,
        value: parseFloat(value as any),
        color: ['#FF6B9D', '#4ECDC4', '#FFE66D', '#A78BFA', '#60A5FA', '#F9A8D4'][index % 6],
        percentage: summary.total_expenses > 0 ? Math.round((parseFloat(value as any) / summary.total_expenses) * 100) : 0,
      }))
    : [];

  const getHealthStatus = (score: number) => {
    if (score >= 75) return { text: 'Excellent', color: 'from-green-500 to-emerald-500', icon: CheckCircle };
    if (score >= 50) return { text: 'Good', color: 'from-yellow-500 to-orange-500', icon: AlertCircle };
    return { text: 'Needs Attention', color: 'from-red-500 to-pink-500', icon: AlertTriangle };
  };

  const healthStatus = getHealthStatus(summary.health_score);

  return (
    <div className="min-h-screen pb-20">
      <Navigation currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your financial summary with salary-based insights
          </p>
        </motion.div>

        {/* Financial Health Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-8 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6" />
                <span className="text-lg font-semibold opacity-90">AI Financial Health Score</span>
              </div>
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-6xl font-bold"
                >
                  {Math.round(summary.health_score)}
                </motion.div>
                <div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm`}>
                    <healthStatus.icon className="w-5 h-5" />
                    <span className="font-semibold">{healthStatus.text}</span>
                  </div>
                  <p className="mt-2 text-sm opacity-90">
                    {summary.expense_percentage > 70 
                      ? 'Your expenses are high. Consider reducing spending in ' + summary.top_expense_category.toLowerCase()
                      : 'You\'re doing well! Keep up the great financial habits!'}
                  </p>
                </div>
              </div>
            </div>
            <CircularProgress value={summary.health_score} />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Monthly Salary"
            value={`₹${summary.monthly_salary.toLocaleString()}`}
            change={summary.monthly_salary > 0 ? "Income" : "Not set"}
            isPositive={true}
            icon={<CreditCard className="w-6 h-6" />}
            gradient="from-cyan-500 to-blue-500"
            delay={0.2}
          />
          <StatCard
            title="Total Expenses"
            value={`₹${summary.total_expenses.toLocaleString()}`}
            change={`${summary.expense_percentage.toFixed(1)}% of salary`}
            isPositive={summary.expense_percentage < 70}
            icon={<TrendingDown className="w-6 h-6" />}
            gradient="from-orange-500 to-red-500"
            delay={0.25}
          />
          <StatCard
            title="Total Savings"
            value={`₹${summary.total_savings.toLocaleString()}`}
            change={`${summary.savings_percentage.toFixed(1)}% saved`}
            isPositive={true}
            icon={<TrendingUp className="w-6 h-6" />}
            gradient="from-green-500 to-emerald-500"
            delay={0.3}
          />
          <StatCard
            title="Remaining Balance"
            value={`₹${summary.remaining_balance.toLocaleString()}`}
            change={summary.remaining_balance >= 0 ? "Surplus" : "Deficit"}
            isPositive={summary.remaining_balance >= 0}
            icon={<Target className="w-6 h-6" />}
            gradient="from-purple-500 to-pink-500"
            delay={0.35}
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Spending by Category */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Spending by Category
            </h3>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {spendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {spendingData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      ₹{item.value.toLocaleString()} ({item.percentage}%)
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Income vs Expenses Trend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Income vs Expenses
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B9D" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FF6B9D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#4ECDC4"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#FF6B9D"
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#4ECDC4]" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FF6B9D]" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-8 rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-300 dark:border-purple-700"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                AI Financial Insight
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {summary.expense_percentage > 70 
                  ? `<strong>⚠️ Alert:</strong> Your expenses are at ${summary.expense_percentage.toFixed(1)}% of your salary. The top category is "${summary.top_expense_category}" at ₹${summary.top_expense_amount.toLocaleString()}. Consider budgeting to reduce spending in this category.`
                  : summary.savings_percentage > 30
                  ? `<strong>✅ Excellent:</strong> You're saving ${summary.savings_percentage.toFixed(1)}% of your income! At this rate, you'll build a strong emergency fund soon.`
                  : `<strong>💡 Tip:</strong> With ${summary.savings_percentage.toFixed(1)}% savings rate and expenses at ${summary.expense_percentage.toFixed(1)}% of salary, try increasing your savings by reviewing "${summary.top_expense_category}" spending.`
                }
              </p>
              <button
                onClick={() => onNavigate('advisor')}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all"
              >
                Get AI Advice
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  gradient: string;
  delay: number;
}

function StatCard({ title, value, change, isPositive, icon, gradient, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="p-6 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-gradient-to-r ${gradient} text-white`}>
          {icon}
        </div>
        <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
    </motion.div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="12"
          fill="none"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke="white"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
