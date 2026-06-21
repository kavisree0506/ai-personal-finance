import { useState, useEffect } from 'react';
// Add Google Fonts to the page head (only once)
if (typeof window !== 'undefined' && !document.getElementById('google-font-poppins')) {
  const link = document.createElement('link');
  link.id = 'google-font-poppins';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
  document.head.appendChild(link);
}
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Wallet,
  Coins,
  Bot,
  Zap,
  Shield,
  Star
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, fullName: string) => Promise<void>;
  onNavigate: (page: string) => void;
  mode?: 'login' | 'register';
}

const motivationalQuotes = [
  "Every rupee saved today builds your future tomorrow.",
  "Small savings + Smart AI decisions = Financial Freedom.",
  "Track expenses today, enjoy freedom tomorrow.",
  "Your financial future starts with one smart decision.",
  "AI-powered insights for human dreams."
];

const floatingIcons = [
  { icon: Coins, color: 'text-yellow-400', delay: 0 },
  { icon: TrendingUp, color: 'text-green-400', delay: 1 },
  { icon: Wallet, color: 'text-blue-400', delay: 2 },
  { icon: Zap, color: 'text-purple-400', delay: 0.5 },
  { icon: Shield, color: 'text-cyan-400', delay: 1.5 },
  { icon: Star, color: 'text-pink-400', delay: 2.5 },
];

export function LoginPage({ onLogin, onRegister, onNavigate, mode = 'login' }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fullName, setFullName] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(mode === 'register');
  const [salaryError, setSalaryError] = useState('');

  useEffect(() => {
    setIsRegisterMode(mode === 'register');
  }, [mode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalaryError('');
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Validate monthly salary
        if (!monthlySalary || isNaN(Number(monthlySalary)) || Number(monthlySalary) <= 0) {
          setSalaryError('Please enter a valid monthly salary (must be a positive number).');
          setIsLoading(false);
          return;
        }
        await onRegister(email, password, fullName, Number(monthlySalary));
      } else {
        await onLogin(email, password);
      }
    } catch (error) {
      console.error('LoginPage submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-black/50" />

      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-cyan-600/5" />

        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center max-w-md">
          {/* AI Finance Illustration */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative">
              <div className="w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-400/30 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-r from-cyan-400/40 to-purple-400/40 backdrop-blur-xl flex items-center justify-center">
                  <Bot className="w-24 h-24 text-cyan-300" />
                </div>
              </div>
              {/* Glowing rings */}
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="absolute inset-4 rounded-full border border-purple-400/30 animate-pulse" />
            </div>
          </motion.div>

          {/* Welcome Message */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent"
          >
            Welcome to AI Finance
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-gray-200 mb-8"
          >
            Your intelligent companion for smart financial decisions
          </motion.p>

          {/* Animated Motivational Quote */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 max-w-lg"
            >
              <p className="text-lg text-white font-medium italic">
                "{motivationalQuotes[currentQuote]}"
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Mini Dashboard Preview */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-8 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Portfolio Overview</h3>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Savings</span>
                <span className="text-green-400 font-bold">₹2,45,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Monthly Growth</span>
                <span className="text-cyan-400 font-bold">+12.5%</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 2, delay: 1.5 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-20" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Login Card */}

          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl relative">
            {/* Top Motivational Quotes Banner */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full flex flex-col items-center z-20">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full shadow-lg font-semibold text-center text-base border-2 border-white/30 animate-pulse">
                {motivationalQuotes[currentQuote]}
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center mb-8 mt-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg border-4 border-white/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Welcome Back!</h2>
              <p className="text-lg md:text-xl text-gray-200 font-medium">Sign in to unlock your financial superpowers</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <label className="block text-base font-semibold text-gray-200 mb-2 tracking-wide" style={{letterSpacing: '0.01em'}}>
                  Email Address
                </label>
                <div className="relative h-14 flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                      className="w-full h-14 pl-4 pr-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 text-base cursor-text"
                    required
                    style={{ fontFamily: 'Poppins, Arial, sans-serif', fontSize: '1.08rem' }}
                  />
                </div>
              </motion.div>


              {isRegisterMode && (
                <>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.65 }}
                  >
                    <label className="block text-base font-semibold text-gray-200 mb-2 tracking-wide" style={{letterSpacing: '0.01em'}}>
                      Full Name
                    </label>
                    <div className="relative h-14 flex items-center">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                          className="w-full h-14 pl-4 pr-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 text-base cursor-text"
                        required={isRegisterMode}
                        style={{ fontFamily: 'Poppins, Arial, sans-serif', fontSize: '1.08rem' }}
                      />
                    </div>
                  </motion.div>
                  {/* Monthly Salary Field */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.68 }}
                  >
                    <label className="block text-base font-semibold text-gray-200 mb-2 tracking-wide" style={{letterSpacing: '0.01em'}}>
                      Monthly Salary (₹)
                    </label>
                    <div className="relative h-14 flex items-center">
                      <input
                        type="number"
                        min="0"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(e.target.value)}
                        placeholder="e.g. 50000"
                          className="w-full h-14 pl-4 pr-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 text-base appearance-none cursor-text"
                        required={isRegisterMode}
                        style={{ fontFamily: 'Poppins, Arial, sans-serif', fontSize: '1.08rem' }}
                        inputMode="numeric"
                      />
                      {salaryError && (
                        <span className="absolute left-0 -bottom-7 text-xs text-red-500 font-semibold">
                          {salaryError}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </>
              )}

              {/* Password Field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <label className="block text-base font-semibold text-gray-200 mb-2 tracking-wide" style={{letterSpacing: '0.01em'}}>
                  Password
                </label>
                <div className="relative h-14 flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-14 pl-4 pr-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 shadow-sm text-base cursor-text"
                    required
                    style={{ fontFamily: 'Poppins, Arial, sans-serif', fontSize: '1.08rem' }}
                  />
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-400 text-cyan-400 focus:ring-cyan-400 focus:ring-2 cursor-pointer"
                  />
                  <span className="ml-3 text-sm text-gray-300">Remember Me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors duration-300 font-medium"
                  onClick={() => onNavigate('forgot-password')}
                >
                  Forgot Password?
                </button>
              </motion.div>

              {/* Login Button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-pink-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-lg tracking-wide"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {isRegisterMode ? 'Creating account...' : 'Accessing...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {isRegisterMode ? 'Create Account' : 'Start Smart Saving'}
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </form>

            {/* Social Login */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gradient-to-br from-white/15 to-white/5 text-gray-300">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSocialLogin('Apple')}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="mt-8 text-center"
            >
              {isRegisterMode ? (
                <p className="text-gray-300">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      onNavigate('login');
                    }}
                    className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors duration-300"
                  >
                    Log in
                  </button>
                </p>
              ) : (
                <p className="text-gray-300">
                  New to AI Finance?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      onNavigate('register');
                    }}
                    className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors duration-300"
                  >
                    Create Account
                  </button>
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* AI Assistant Chatbot Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="fixed bottom-6 right-6 z-30"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('chatbot')}
            className="w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-cyan-400/50 transition-all duration-300"
          >
            <Bot className="w-7 h-7 text-white" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
