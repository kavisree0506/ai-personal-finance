import { motion } from 'motion/react';
import { AlertTriangle, Calendar, TrendingDown, Heart, Home, Plane, Clock, DollarSign, Target } from 'lucide-react';
import { Navigation } from './Navigation';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LineChart, Line, Tooltip } from 'recharts';

interface RealityImpactProps {
  onNavigate: (page: string) => void;
}

const currentPathData = [
  { month: 'Jul', amount: 3500, status: 'danger' },
  { month: 'Aug', amount: 2800, status: 'danger' },
  { month: 'Sep', amount: 1200, status: 'danger' },
  { month: 'Oct', amount: 0, status: 'critical' },
  { month: 'Nov', amount: -1500, status: 'critical' },
  { month: 'Dec', amount: -3200, status: 'critical' },
];

const improvedPathData = [
  { month: 'Jul', amount: 4500, status: 'good' },
  { month: 'Aug', amount: 5200, status: 'good' },
  { month: 'Sep', amount: 6100, status: 'good' },
  { month: 'Oct', amount: 7000, status: 'good' },
  { month: 'Nov', amount: 8200, status: 'good' },
  { month: 'Dec', amount: 9500, status: 'good' },
];

const impactAreas = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Emotional Well-being',
    current: 'Stress & anxiety about money increase as savings disappear',
    improved: 'Peace of mind knowing you have a financial cushion',
    gradient: 'from-red-500 to-pink-500',
    currentScore: 40,
    improvedScore: 85,
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: 'Life Goals',
    current: 'Vacation delayed by 4 months, new laptop purchase impossible',
    improved: 'All goals on track, dream vacation in 6 months',
    gradient: 'from-purple-500 to-indigo-500',
    currentScore: 30,
    improvedScore: 90,
  },
  {
    icon: <Home className="w-8 h-8" />,
    title: 'Emergency Readiness',
    current: 'Fund runs out in 3 months, vulnerable to unexpected costs',
    improved: '6-month emergency fund fully stocked',
    gradient: 'from-blue-500 to-cyan-500',
    currentScore: 35,
    improvedScore: 95,
  },
];

export function RealityImpact({ onNavigate }: RealityImpactProps) {
  return (
    <div className="min-h-screen pb-20">
      <Navigation currentPage="impact" onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-semibold">Reality Check</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Your Financial Future
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            See the real impact of your spending choices—and how small changes create big results
          </p>
        </motion.div>

        {/* Two Paths Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center">
            Two Paths, One Choice
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Current Path */}
            <div className="relative">
              <div className="absolute top-0 left-0 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold -translate-y-4">
                ⚠️ Current Path
              </div>
              <div className="p-6 pt-8 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    If you continue current spending...
                  </h3>
                  <div className="space-y-3">
                    <TimelineItem
                      icon={<Clock className="w-5 h-5" />}
                      time="3 months"
                      text="Emergency fund depleted"
                      color="text-red-600 dark:text-red-400"
                    />
                    <TimelineItem
                      icon={<Plane className="w-5 h-5" />}
                      time="4 months"
                      text="Vacation goal delayed"
                      color="text-orange-600 dark:text-orange-400"
                    />
                    <TimelineItem
                      icon={<TrendingDown className="w-5 h-5" />}
                      time="6 months"
                      text="Credit card debt likely"
                      color="text-red-600 dark:text-red-400"
                    />
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentPathData}>
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                        {currentPathData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.status === 'critical' ? '#EF4444' : '#F97316'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Improved Path */}
            <div className="relative">
              <div className="absolute top-0 left-0 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold -translate-y-4">
                ✨ Better Path
              </div>
              <div className="p-6 pt-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    By reducing food spending 20%...
                  </h3>
                  <div className="space-y-3">
                    <TimelineItem
                      icon={<Target className="w-5 h-5" />}
                      time="3 months"
                      text="Emergency fund growing"
                      color="text-green-600 dark:text-green-400"
                    />
                    <TimelineItem
                      icon={<Plane className="w-5 h-5" />}
                      time="6 months"
                      text="Vacation fully funded!"
                      color="text-emerald-600 dark:text-emerald-400"
                    />
                    <TimelineItem
                      icon={<TrendingDown className="w-5 h-5" />}
                      time="1 year"
                      text="₹26,000 extra saved"
                      color="text-green-600 dark:text-green-400"
                    />
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={improvedPathData}>
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="amount" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Life Impact Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
            Real Life Impact
          </h2>
          <div className="space-y-8">
            {impactAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl"
              >
                <div className="flex items-start gap-6 mb-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${area.gradient} text-white`}>
                    {area.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                      {area.title}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Current: {area.currentScore}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{area.current}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Improved: {area.improvedScore}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{area.improved}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Progress Bars */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${area.currentScore}%` }}
                        transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${area.improvedScore}%` }}
                        transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-8 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-2xl text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Change Your Future?</h2>
          <p className="text-lg mb-6 opacity-90">
            Small changes today = big results tomorrow. Let's create your personalized action plan.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('goals')}
              className="px-8 py-4 rounded-full bg-white text-purple-600 font-semibold hover:shadow-xl transition-all"
            >
              Set My Goals
            </button>
            <button
              onClick={() => onNavigate('advisor')}
              className="px-8 py-4 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-all"
            >
              Talk to AI Advisor
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  icon: React.ReactNode;
  time: string;
  text: string;
  color: string;
}

function TimelineItem({ icon, time, text, color }: TimelineItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className={`${color} mt-0.5`}>{icon}</div>
      <div>
        <p className={`font-semibold ${color}`}>{time}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );
}
