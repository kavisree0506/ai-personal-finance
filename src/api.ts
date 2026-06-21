/**
 * API Service Layer
 * Centralized API calls with proper error handling, logging, and type safety
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';;

// ============ ERROR HANDLING ============

class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ============ REQUEST/RESPONSE UTILITIES ============

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch (error) {
    console.error('Failed to parse response:', error);
    throw new APIError(response.status, 'Invalid response format');
  }

  if (!response.ok) {
    // Convert error details to readable string
    let errorMessage: string = 'An error occurred';
    
    if (isJson) {
      // Handle Pydantic validation errors (array of error objects)
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail
          .map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg) return err.msg;
            return JSON.stringify(err);
          })
          .join('; ');
      }
      // Handle error objects with a message property
      else if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      }
      // Fallback: check for other common error fields
      else if (data.message && typeof data.message === 'string') {
        errorMessage = data.message;
      }
      // Last resort: stringify the entire error object
      else if (typeof data.detail === 'object') {
        errorMessage = JSON.stringify(data.detail);
      }
    } else if (typeof data === 'string') {
      errorMessage = data;
    }
    
    console.error(`API Error ${response.status}:`, errorMessage);
    throw new APIError(response.status, errorMessage, data);
  }

  return data;
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`API Request: ${options.method || 'GET'} ${endpoint}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    console.error('Network error:', error);
    throw new APIError(
      0,
      'Failed to connect to server. Please check your connection.',
      error
    );
  }
}

// ============ AUTH API ============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  monthly_salary?: number;
}

export interface UserResponse {
  id: number;
  email: string;
  full_name?: string;
  monthly_salary?: number;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetchAPI<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('Login successful');
    // Store token
    localStorage.setItem('auth_token', response.access_token);
    localStorage.setItem('user_id', response.user_id.toString());
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function register(data: RegisterRequest): Promise<UserResponse> {
  try {
    const response = await fetchAPI<UserResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('Registration successful');
    return response;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

export function logout(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  console.log('Logged out');
}

// ============ EXPENSE API ============

export interface ExpenseCreate {
  amount: number;
  category?: string;
  note?: string;
}

export interface ExpenseResponse {
  id: number;
  user_id: number;
  amount: number;
  category?: string;
  note?: string;
  date: string;
}

export interface ExpenseListResponse {
  total_count: number;
  expenses: ExpenseResponse[];
  total_amount: number;
  category_breakdown: Record<string, number>;
}

export async function getExpenses(userId: number): Promise<ExpenseListResponse> {
  try {
    console.log(`Fetching expenses for user ${userId}`);
    const response = await fetchAPI<ExpenseListResponse>(
      `/expenses?user_id=${userId}`
    );
    console.log(`Retrieved ${response.total_count} expenses`);
    return response;
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    throw error;
  }
}

export async function addExpense(
  userId: number,
  data: ExpenseCreate
): Promise<ExpenseResponse> {
  try {
    console.log(`Adding expense for user ${userId}:`, data);
    const response = await fetchAPI<ExpenseResponse>(
      `/expenses?user_id=${userId}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    console.log('Expense added successfully:', response.id);
    return response;
  } catch (error) {
    console.error('Failed to add expense:', error);
    throw error;
  }
}

// ============ GOAL API ============

export interface GoalCreate {
  title: string;
  target_amount: number;
  due_date?: string;
}

export interface GoalUpdate {
  current_amount: number;
}

export interface GoalResponse {
  id: number;
  user_id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  due_date?: string;
  created_at: string;
  progress_percentage: number;
}

export async function getGoals(userId: number): Promise<GoalResponse[]> {
  try {
    console.log(`Fetching goals for user ${userId}`);
    const response = await fetchAPI<GoalResponse[]>(
      `/goals?user_id=${userId}`
    );
    console.log(`Retrieved ${response.length} goals`);
    return response;
  } catch (error) {
    console.error('Failed to fetch goals:', error);
    throw error;
  }
}

export async function addGoal(
  userId: number,
  data: GoalCreate
): Promise<GoalResponse> {
  try {
    console.log(`Adding goal for user ${userId}:`, data);
    const response = await fetchAPI<GoalResponse>(
      `/goals?user_id=${userId}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    console.log('Goal added successfully:', response.id);
    return response;
  } catch (error) {
    console.error('Failed to add goal:', error);
    throw error;
  }
}

export async function updateGoalProgress(
  goalId: number,
  data: GoalUpdate
): Promise<GoalResponse> {
  try {
    console.log(`Updating goal ${goalId}:`, data);
    const response = await fetchAPI<GoalResponse>(
      `/goals/${goalId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    console.log('Goal updated successfully');
    return response;
  } catch (error) {
    console.error('Failed to update goal:', error);
    throw error;
  }
}

// ============ AI ADVISOR API ============

export interface AIAdviceRequest {
  question: string;
}

export interface AIAdviceResponse {
  advice: string;
  confidence: number;
  sources?: string[];
  next_steps?: string[];
}

export interface AIConfigResponse {
  configured: boolean;
}

export async function getAIConfig(): Promise<AIConfigResponse> {
  try {
    console.log('Requesting AI config');
    const response = await fetchAPI<AIConfigResponse>('/ai/config');
    console.log('AI config received', response.configured);
    return response;
  } catch (error) {
    console.error('Failed to get AI config:', error);
    throw error;
  }
}

export async function getAIAdvice(
  userId: number,
  question: string
): Promise<AIAdviceResponse> {
  try {
    console.log(`Requesting AI advice for user ${userId}`);
    const response = await fetchAPI<AIAdviceResponse>(
      `/ai/advice?user_id=${userId}`,
      {
        method: 'POST',
        body: JSON.stringify({ question }),
      }
    );
    console.log('AI advice received');
    return response;
  } catch (error) {
    console.error('Failed to get AI advice:', error);
    throw error;
  }
}

// ============ USER PROFILE API ============

export interface UserUpdate {
  full_name?: string;
  monthly_salary?: number;
}

export async function getUserProfile(userId: number): Promise<UserResponse> {
  try {
    console.log(`Fetching user profile for user ${userId}`);
    const response = await fetchAPI<UserResponse>(`/user/${userId}`);
    console.log('User profile retrieved', response);
    return response;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: number,
  data: UserUpdate
): Promise<UserResponse> {
  try {
    console.log(`Updating user profile for user ${userId}:`, data);
    const response = await fetchAPI<UserResponse>(
      `/user/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    console.log('User profile updated successfully');
    return response;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
}

// ============ DASHBOARD SUMMARY API ============

export interface DashboardSummary {
  monthly_salary: number;
  total_expenses: number;
  total_savings: number;
  remaining_balance: number;
  savings_percentage: number;
  expense_percentage: number;
  health_score: number;
  top_expense_category: string;
  top_expense_amount: number;
}

export async function getDashboardSummary(userId: number): Promise<DashboardSummary> {
  try {
    console.log(`Fetching dashboard summary for user ${userId}`);
    const [userProfile, expenses] = await Promise.all([
      getUserProfile(userId),
      getExpenses(userId),
    ]);

    const monthlySalary = userProfile.monthly_salary || 0;
    const totalExpenses = expenses.total_amount || 0;
    const totalSavings = Math.max(monthlySalary - totalExpenses, 0);
    const remainingBalance = monthlySalary - totalExpenses;

    const savingsPercentage = monthlySalary > 0 
      ? parseFloat(((totalSavings / monthlySalary) * 100).toFixed(1))
      : 0;
    
    const expensePercentage = monthlySalary > 0
      ? parseFloat(((totalExpenses / monthlySalary) * 100).toFixed(1))
      : 0;

    // Calculate health score (0-100)
    // Based on expense percentage and savings percentage
    let healthScore = 50; // Base score
    
    if (expensePercentage < 50) healthScore += 20; // Less than 50% expenses = good
    else if (expensePercentage < 70) healthScore += 10;
    
    if (savingsPercentage > 20) healthScore += 20; // Saving more than 20% = excellent
    else if (savingsPercentage > 10) healthScore += 10;

    // Find top expense category
    let topExpenseCategory = 'N/A';
    let topExpenseAmount = 0;
    if (expenses.category_breakdown && Object.keys(expenses.category_breakdown).length > 0) {
      topExpenseCategory = Object.entries(expenses.category_breakdown).reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0];
      topExpenseAmount = Math.max(
        ...Object.values(expenses.category_breakdown).map((v: any) => parseFloat(v))
      );
    }

    const summary: DashboardSummary = {
      monthly_salary: monthlySalary,
      total_expenses: totalExpenses,
      total_savings: totalSavings,
      remaining_balance: remainingBalance,
      savings_percentage: savingsPercentage,
      expense_percentage: expensePercentage,
      health_score: Math.min(100, Math.max(0, healthScore)),
      top_expense_category: topExpenseCategory,
      top_expense_amount: topExpenseAmount,
    };

    console.log('Dashboard summary calculated:', summary);
    return summary;
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    throw error;
  }
}

// ============ HEALTH CHECK ============

export async function healthCheck(): Promise<{ status: string }> {
  try {
    const response = await fetchAPI<{ status: string }>('/health');
    console.log('Health check passed');
    return response;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

export { APIError };
