import { motion } from 'motion/react';
import { Target, Plane, Home, GraduationCap, Car, Plus, TrendingUp, Calendar, DollarSign, Award, Sparkles, AlertCircle } from 'lucide-react';
import { Navigation } from './Navigation';
import { useState, useEffect } from 'react';
import { addGoal, getGoals, GoalResponse, APIError } from '../api';

interface GoalPlanningProps {
  onNavigate: (page: string) => void;
}

const goalIcons = [
  <Plane className="w-6 h-6" />,
  <Home className="w-6 h-6" />,
  <GraduationCap className="w-6 h-6" />,
  <Car className="w-6 h-6" />,
  <Target className="w-6 h-6" />,
];

const goalGradients = [
  'from-purple-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-green-500 to-emerald-500',
  'from-yellow-500 to-orange-500',
];

export function GoalPlanning({ onNavigate }: GoalPlanningProps) {
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const userId = parseInt(localStorage.getItem('user_id') || '1', 10);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedGoals = await getGoals(userId);
      setGoals(fetchedGoals);
    } catch (err) {
      const message = err instanceof APIError
        ? err.message
        : 'Unable to load goals. Please try again.';
      setError(message);
      console.error('[GoalPlanning] Failed to fetch goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForIndex = (index: number) => goalIcons[index % goalIcons.length] || <Target className="w-6 h-6" />;
  const getGradientForIndex = (index: number) => goalGradients[index % goalGradients.length];

  const getGoalPriority = (goal: GoalResponse) => {
    const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
    if (progress < 40) return 'high';
    if (progress < 75) return 'medium';
    return 'low';
  };

  const getMonthlyContribution = (goal: GoalResponse) => {
    if (!goal.due_date) return 0;
    const deadline = new Date(goal.due_date);
    const remainingMonths = Math.max(1, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
    const remainingAmount = Math.max(0, goal.target_amount - goal.current_amount);
    return Math.round(remainingAmount / remainingMonths);
  };

  const formatGoalDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCreateGoal = async () => {
    setError(null);
    setSuccess(null);

    if (!title.trim() || !targetAmount) {
      setError('Please enter both a goal title and a target amount.');
      return;
    }

    const parsedAmount = Number(targetAmount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Target amount must be a positive number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await addGoal(userId, {
        title: title.trim(),
        target_amount: parsedAmount,
        due_date: dueDate ? `${dueDate}T00:00:00` : undefined,
      });

      setGoals((prev) => [created, ...prev]);
      setTitle('');
      setTargetAmount('');
      setDueDate('');
      setShowAddGoal(false);
      setSuccess('Goal added successfully.');
    } catch (err) {
      const message = err instanceof APIError
        ? err.message
        : 'Failed to create goal. Please try again.';
      setError(message);
      console.error('[GoalPlanning] Error creating goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMonthlyRequired = goals.reduce((sum, goal) => sum + getMonthlyContribution(goal), 0);
  const totalGoalsValue = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentSavings = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const overallProgress = totalGoalsValue > 0 ? Math.round((totalCurrentSavings / totalGoalsValue) * 100) : 0;

  return (
    <div className="min-h-screen pb-20">
      <Navigation currentPage="goals" onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Your Financial Goals 🎯
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your dreams and watch them become reality
          </p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-8 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-6 h-6" />
                <span className="text-lg font-semibold opacity-90">Overall Progress</span>
              </div>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-5xl font-bold">{overallProgress}%</span>
                <span className="text-xl opacity-90">
                  ₹{totalCurrentSavings.toLocaleString()} / ₹{totalGoalsValue.toLocaleString()}
                </span>
              </div>
              <p className="opacity-90 mb-4">
                You're making great progress! Keep going to achieve all your dreams.
              </p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm inline-flex">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Monthly Contribution: ₹{totalMonthlyRequired.toLocaleString()}</span>
              </div>
            </div>
            <CircularProgress value={overallProgress} size={160} />
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-3xl bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>{error}</div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-3xl bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
          >
            {success}
          </motion.div>
        )}

        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-8 rounded-3xl bg-white/90 dark:bg-gray-800/90 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create a New Goal</h2>
                <p className="text-gray-600 dark:text-gray-400">Add your target amount and deadline to start tracking progress.</p>
              </div>
              <button
                onClick={() => setShowAddGoal(false)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                type="button"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <label className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                Goal Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 bg-white/90 px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Emergency fund, vacation, laptop"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                Target Amount
                <input
                  type="number"
                  min="1"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 bg-white/90 px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="₹50,000"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                Target Date
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 bg-white/90 px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </label>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
              <button
                onClick={() => setShowAddGoal(false)}
                className="rounded-2xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                disabled={isSubmitting}
                className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                {isSubmitting ? 'Saving...' : 'Save Goal'}
              </button>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="rounded-3xl bg-white/90 dark:bg-gray-800/90 p-12 text-center text-gray-600 dark:text-gray-300">
            Loading goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-3xl bg-white/90 dark:bg-gray-800/90 p-12 text-center text-gray-600 dark:text-gray-300">
            <p className="text-xl font-semibold mb-2">No goals yet</p>
            <p className="mb-6">Create your first financial goal to get started.</p>
            <button
              onClick={() => setShowAddGoal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700"
              type="button"
            >
              <Plus className="w-4 h-4" /> Add your first goal
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {goals.map((goal, index) => {
              const progress = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
              const remaining = Math.max(0, goal.target_amount - goal.current_amount);
              const monthsRemaining = goal.due_date
                ? Math.max(1, Math.ceil((new Date(goal.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))
                : 1;
              const monthlyContribution = getMonthlyContribution(goal);
              const isOnTrack = monthlyContribution * monthsRemaining >= remaining;
              const priority = getGoalPriority(goal);
              const goalIcon = getIconForIndex(index);
              const gradientClass = getGradientForIndex(index);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${gradientClass} text-white`}>
                        {goalIcon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{goal.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              priority === 'high'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : priority === 'medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            }`}
                          >
                            {priority} priority
                          </span>
                          {isOnTrack ? (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                              ✓ On track
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                              ⚠ Needs boost
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-3xl font-bold text-gray-800 dark:text-white">{progress}%</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                        className={`h-full bg-gradient-to-r ${gradientClass} rounded-full`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Monthly Goal</p>
                      <p className="font-bold text-gray-800 dark:text-white">₹{monthlyContribution.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Target Date</p>
                      <p className="font-bold text-gray-800 dark:text-white">{formatGoalDate(goal.due_date)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add Goal Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowAddGoal(true)}
          className="w-full p-8 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
        >
          <Plus className="w-6 h-6" />
          <span className="text-lg font-semibold">Add New Goal</span>
        </motion.button>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-8 rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-300 dark:border-purple-700"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                AI Recommendations
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60">
                  <p className="font-semibold text-gray-800 dark:text-white mb-1">
                    💡 Optimize Your Contributions
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    By reducing food expenses by ₹560/month, you can boost your Japan vacation fund and reach your goal 2 months earlier!
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60">
                  <p className="font-semibold text-gray-800 dark:text-white mb-1">
                    🎯 Priority Suggestion
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Consider focusing on your Emergency Fund first. Having 6 months of expenses saved provides peace of mind for all other goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Your Achievements 🏆
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AchievementBadge
              icon="🎯"
              title="Goal Setter"
              description="Created 4 goals"
              unlocked={true}
            />
            <AchievementBadge
              icon="💪"
              title="Consistent Saver"
              description="5 months streak"
              unlocked={true}
            />
            <AchievementBadge
              icon="🚀"
              title="Progress Master"
              description="50% overall progress"
              unlocked={true}
            />
            <AchievementBadge
              icon="👑"
              title="Goal Achiever"
              description="Complete 1 goal"
              unlocked={false}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CircularProgress({ value, size }: { value: number; size: number }) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="12"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
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

interface AchievementBadgeProps {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

function AchievementBadge({ icon, title, description, unlocked }: AchievementBadgeProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`p-6 rounded-2xl text-center transition-all ${
        unlocked
          ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-2 border-yellow-400 dark:border-yellow-700'
          : 'bg-gray-100 dark:bg-gray-800 opacity-50'
      }`}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <h4 className="font-bold text-gray-800 dark:text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      {!unlocked && (
        <p className="text-xs text-gray-500 mt-2">🔒 Locked</p>
      )}
    </motion.div>
  );
}
