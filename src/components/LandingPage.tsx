import { motion } from 'motion/react';
import { Brain, TrendingUp, Shield, Sparkles, Moon, Sun, ArrowRight, Zap, Target, Heart } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Theme Toggle */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
      >
        {theme === 'light' ? (
          <Moon className="w-6 h-6 text-purple-600" />
        ) : (
          <Sun className="w-6 h-6 text-yellow-400" />
        )}
      </motion.button>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-20"
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Logo Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI-Powered Finance Advisor</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight"
          >
            Your Money,
            <br />
            But Smarter
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Meet your friendly AI advisor that understands your spending,
            predicts your future, and helps you achieve your dreams—without the boring spreadsheets.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="group px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 mx-auto"
          >
            Check Your Financial Health
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid md:grid-cols-3 gap-8 mt-24"
        >
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="AI That Understands You"
            description="No judgments, just smart insights about your spending patterns and habits."
            gradient="from-purple-500 to-pink-500"
            delay={1.0}
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Real-Time Warnings"
            description="Get instant alerts when your spending threatens your goals—before it's too late."
            gradient="from-pink-500 to-orange-500"
            delay={1.2}
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Visual Goal Tracking"
            description="See your progress with beautiful charts and know exactly when you'll reach your dreams."
            gradient="from-blue-500 to-cyan-500"
            delay={1.4}
          />
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="flex flex-wrap justify-center items-center gap-8 mt-24"
        >
          <TrustBadge icon={<Shield className="w-6 h-6" />} text="Bank-Level Security" />
          <TrustBadge icon={<Heart className="w-6 h-6" />} text="Privacy Focused" />
          <TrustBadge icon={<TrendingUp className="w-6 h-6" />} text="Proven Results" />
        </motion.div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}

function FeatureCard({ icon, title, description, gradient, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all"
    >
      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${gradient} text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}

interface TrustBadgeProps {
  icon: React.ReactNode;
  text: string;
}

function TrustBadge({ icon, text }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-700 dark:text-gray-300">
      <span className="text-purple-600 dark:text-purple-400">{icon}</span>
      <span className="font-medium">{text}</span>
    </div>
  );
}
