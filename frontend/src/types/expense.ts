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
  date: string;             // "YYYY-MM-DD" from API
  paymentMethod: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  categoryId: string;
  date: string;             // "YYYY-MM-DD"
  paymentMethod: string;
  notes?: string;
}

export interface ExpenseListResponse {
  expenses: Expense[];
}

export interface ExpenseResponse {
  expense: Expense;
}

export interface ExpenseSummary {
  month: string;            // "YYYY-MM"
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