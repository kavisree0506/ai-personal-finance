import { motion } from 'motion/react';
import { Send, Bot, User, TrendingUp, AlertCircle, Lightbulb, DollarSign, Loader } from 'lucide-react';
import { Navigation } from './Navigation';
import { useState, useEffect } from 'react';
import { getAIAdvice, getAIConfig, APIError } from '../api';

interface AIAdvisorProps {
  onNavigate: (page: string) => void;
  aiEnabled?: boolean;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'ai',
    content: "Hi there! 👋 I'm your AI Financial Advisor. I've been analyzing your spending patterns, and I'm here to help you make smarter money decisions. What would you like to know?",
    timestamp: new Date(Date.now() - 300000),
  },
];

// Helper function to safely convert message content to string
function getMessageContent(content: any): string {
  if (typeof content === 'string') {
    return content;
  }
  if (content === null || content === undefined) {
    return '';
  }
  // If it's an object (which shouldn't happen), convert to string
  return JSON.stringify(content);
}

export function AIAdvisor({ onNavigate, aiEnabled: aiEnabledProp }: AIAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(aiEnabledProp ?? null);

  const userId = parseInt(localStorage.getItem('user_id') || '1', 10);

  const quickQuestions = [
    "How can I save more?",
    "Am I spending too much?",
    "What are my biggest expenses?",
    "When can I buy a car?",
  ];

  useEffect(() => {
    if (aiEnabledProp !== undefined) {
      setAiEnabled(aiEnabledProp);
      return;
    }

    const loadConfig = async () => {
      try {
        const config = await getAIConfig();
        setAiEnabled(config.configured);
      } catch (err) {
        console.error('[AIAdvisor] Could not load AI config:', err);
        setAiEnabled(false);
      }
    };

    loadConfig();
  }, [aiEnabledProp]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || aiEnabled === false) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setIsLoading(true);

    const loadingMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: loadingMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    }]);

    try {
      console.log('[AIAdvisor] Sending question to AI:', inputValue);
      const response = await getAIAdvice(userId, inputValue);
      
      // Ensure the advice is a string
      const advice = typeof response.advice === 'string' 
        ? response.advice 
        : 'Sorry, I received an unexpected response format. Please try again.';
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessageId
            ? {
                id: loadingMessageId,
                type: 'ai',
                content: advice,
                timestamp: new Date(),
                isLoading: false,
              }
            : msg
        )
      );
      console.log('[AIAdvisor] AI response received');
    } catch (err) {
      // Ensure error message is always a string
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (err instanceof APIError) {
        // APIError.message is always a string
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      console.error('[AIAdvisor] Error:', err, 'Formatted message:', errorMessage);
      setError(errorMessage);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessageId
            ? {
                id: loadingMessageId,
                type: 'ai',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
                isLoading: false,
                error: errorMessage,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  if (aiEnabled === null) {
    return (
      <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
        <Navigation currentPage="advisor" onNavigate={onNavigate} aiEnabled={false} />
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-gray-900 shadow-lg">
            <Loader className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-gray-700 dark:text-gray-200">Checking AI availability...</span>
          </div>
        </div>
      </div>
    );
  }

  if (aiEnabled === false) {
    return (
      <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
        <Navigation currentPage="advisor" onNavigate={onNavigate} aiEnabled={false} />
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-32">
          <div className="rounded-3xl border border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-800 p-10 text-center shadow-lg">
            <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-600 dark:text-red-400" />
            <h1 className="text-3xl font-semibold text-red-900 dark:text-white mb-3">AI Advisor unavailable</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              The AI functionality is disabled because neither Gemini nor fallback responses are available on the backend.
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-white hover:bg-purple-700 transition-colors"
            >
              Return to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Navigation currentPage="advisor" onNavigate={onNavigate} aiEnabled={true} />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
            <Bot className="w-6 h-6" />
            <span className="font-semibold">AI Financial Advisor</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Let's Talk Money
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your friendly AI advisor is here to help—no judgment, just smart advice
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
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

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6"
        >
          {/* Messages */}
          <div className="space-y-6 mb-6 max-h-[500px] overflow-y-auto">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    message.type === 'ai'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  } text-white`}
                >
                  {message.type === 'ai' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>

                {/* Message Content */}
                <div className={`flex-1 ${message.type === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`p-4 rounded-2xl max-w-[80%] ${
                      message.type === 'ai'
                        ? 'bg-gray-100 dark:bg-gray-700 rounded-tl-none'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-none'
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        <p className="text-gray-600 dark:text-gray-300">Thinking...</p>
                      </div>
                    ) : (
                      <p className={`whitespace-pre-line ${message.type === 'ai' ? 'text-gray-800 dark:text-white' : 'text-white'}`}>
                        {getMessageContent(message.content)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
            >
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick questions you might ask:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <motion.button
                    key={question}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left px-4 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your finances..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-500 text-white flex-shrink-0">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">How I Can Help</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                I analyze your spending patterns and financial goals to provide personalized advice. Ask me about budgeting, savings strategies, expense optimization, or your financial goals!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
