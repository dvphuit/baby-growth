export interface ExpenseCategoryItem {
  name: string;
  amount: string;
  percent: number;
  color: string;
}

export interface ExpenseMonthlyHistory {
  month: string;
  amount: number;
}

export interface StageExpenseData {
  totalMonth: string;
  budgetMonth: string;
  budgetPercent: number;
  categories: ExpenseCategoryItem[];
  monthlyHistory?: ExpenseMonthlyHistory[];
}
