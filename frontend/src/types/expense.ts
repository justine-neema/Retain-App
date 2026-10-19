export type PaymentMethod = "cash" | "card" | "transfer" | "other";

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  categoryIcon: string | null;
  date: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  paymentMethod: string;
  notes?: string;
}

// UPDATED: Now includes pagination metadata
export interface ExpenseListResponse {
  expenses: Expense[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExpenseResponse {
  expense: Expense;
}

export interface ExpenseSummary {
  month: string;
  totalSpent: number;
  monthlyBudget: number;
  remainingBudget: number;
  highestExpense: {
    id: string;
    title: string;
    amount: number;
    date: string;
  } | null;
  byCategory: {
    category: string;
    total: number;
    color: string | null;
    icon: string | null;
  }[];
  recentExpenses: Expense[];
}

export interface DashboardResponse {
  month: string;
  totalSpentThisMonth: number;
  totalSpentAllTime: number;
  highestExpense: number;
  monthlyBudget: number;
  recentExpenses: Expense[];
  spendingByCategory: {
    category: string;
    total: number;
    color: string | null;
    icon: string | null;
  }[];
}