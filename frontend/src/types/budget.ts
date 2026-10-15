export interface Budget {
  id: string;
  user_id: string;
  month: string;            // "YYYY-MM"
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetInput {
  month: string;            // "YYYY-MM"
  amount: number;
}

export interface BudgetResponse {
  budget: Budget | null;
}

export interface BudgetListResponse {
  budgets: Budget[];
}