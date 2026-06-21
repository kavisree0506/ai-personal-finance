import { Home, CreditCard, MessageSquare, AlertTriangle, Target, Moon, Sun, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeProvider';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  aiEnabled?: boolean;
}

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'expenses', icon: CreditCard, label: 'Expenses' },
  { id: 'advisor', icon: MessageSquare, label: 'AI Advisor' },
  { id: 'impact', icon: AlertTriangle, label: 'Reality Check' },
  { id: 'goals', icon: Target, label: 'Goals' },
];

export function Navigation({ currentPage, onNavigate, onLogout, aiEnabled }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                AI
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">FinAdvisor</span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {navItems
                .filter((item) => item.id !== 'advisor' || aiEnabled !== false)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center justify-around px-4 py-3">
          {navItems
            .filter((item) => item.id !== 'advisor' || aiEnabled !== false)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  currentPage === item.id
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-500'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
        </div>
      </motion.nav>
    </>
  );
}
