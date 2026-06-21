import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { ExpenseTracking } from './components/ExpenseTracking';
import { AIAdvisor } from './components/AIAdvisor';
import { RealityImpact } from './components/RealityImpact';
import { GoalPlanning } from './components/GoalPlanning';
import { ThemeProvider } from './components/ThemeProvider';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getAIConfig, APIError } from './api';

type Page = 'landing' | 'login' | 'dashboard' | 'expenses' | 'advisor' | 'impact' | 'goals' | 'register' | 'forgot-password' | 'chatbot';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
      console.log('[App] User already logged in');
    }

    const loadAIConfig = async () => {
      try {
        const config = await getAIConfig();
        setAiEnabled(config.configured);
      } catch (err) {
        console.error('[App] Failed to load AI config:', err);
        setAiEnabled(false);
      }
    };

    loadAIConfig();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    console.log('[App] Login attempt for:', email);
    try {
      await apiLogin({ email, password });
      console.log('[App] Login successful');
      setIsLoggedIn(true);
      setError(null);
      setCurrentPage('dashboard');
    } catch (err) {
      const message = err instanceof APIError
        ? err.message
        : 'Login failed. Please try again.';
      console.error('[App] Login error:', err);
      setError(message);
    }
  };

  const handleRegister = async (email: string, password: string, fullName?: string, monthlySalary?: number) => {
    console.log('[App] Registration attempt for:', email);
    try {
      await apiRegister({ email, password, full_name: fullName, monthly_salary: monthlySalary || 0 });
      console.log('[App] Registration successful');
      // After successful registration, log them in
      await handleLogin(email, password);
    } catch (err) {
      const message = err instanceof APIError
        ? err.message
        : 'Registration failed. Please try again.';
      console.error('[App] Registration error:', err);
      setError(message);
    }
  };

  const handleLogout = () => {
    console.log('[App] Logging out');
    apiLogout();
    setIsLoggedIn(false);
    setError(null);
    setCurrentPage('landing');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={() => setCurrentPage('login')} />;
      case 'login':
        return (
          <LoginPage 
            onLogin={handleLogin}
            onRegister={handleRegister}
            onNavigate={(page) => {
              setError(null);
              setCurrentPage(page as Page);
            }}
          />
        );
      case 'dashboard':
        return isLoggedIn ? <Dashboard onNavigate={(page) => {
          setError(null);
          setCurrentPage(page as Page);
        }} onLogout={handleLogout} /> : <LandingPage onGetStarted={() => setCurrentPage('login')} />;
      case 'expenses':
        return isLoggedIn ? <ExpenseTracking onNavigate={(page) => {
          setError(null);
          setCurrentPage(page as Page);
        }} /> : <LandingPage onGetStarted={() => setCurrentPage('login')} />;
      case 'advisor':
        return isLoggedIn ? <AIAdvisor onNavigate={(page) => {
          setError(null);
          setCurrentPage(page as Page);
        }} aiEnabled={aiEnabled} /> : <LandingPage onGetStarted={() => setCurrentPage('login')} />;
      case 'impact':
        return isLoggedIn ? <RealityImpact onNavigate={(page) => {
          setError(null);
          setCurrentPage(page as Page);
        }} /> : <LandingPage onGetStarted={() => setCurrentPage('login')} />;
      case 'goals':
        return isLoggedIn ? <GoalPlanning onNavigate={(page) => {
          setError(null);
          setCurrentPage(page as Page);
        }} /> : <LandingPage onGetStarted={() => setCurrentPage('login')} />;
      case 'register':
        return (
          <LoginPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            onNavigate={(page) => {
              setError(null);
              setCurrentPage(page as Page);
            }}
            mode="register"
          />
        );
      case 'forgot-password':
        // For now, just go to login
        return (
          <LoginPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            onNavigate={(page) => {
              setError(null);
              setCurrentPage(page as Page);
            }}
          />
        );
      case 'chatbot':
        // For now, go to advisor
        return isLoggedIn ? <AIAdvisor onNavigate={(page) => {
          setError(null);
          setCurrentPage(page as Page);
        }} /> : <LandingPage onGetStarted={() => setCurrentPage('login')} />;
      default:
        return <LandingPage onGetStarted={() => setCurrentPage('login')} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 transition-colors duration-500">
        {error && (
          <div className="fixed top-4 right-4 max-w-sm z-50">
            <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-200 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        {renderPage()}
      </div>
    </ThemeProvider>
  );
}
