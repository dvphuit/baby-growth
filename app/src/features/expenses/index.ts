export { AddExpenseModal } from './AddExpenseModal';
export { ExpensesView } from './ExpensesView';
export * from './domain/expenseCategories';
export * from './domain/expenseMath';
export { useExpenseStore } from './store/useExpenseStore';
export type { ExpenseRecord } from '@/types/expense';
export type { ExpenseCategoryItem, ExpenseMonthlyHistory, StageExpenseData } from './domain/types';

export async function loadExpensesStyles(): Promise<void> {
  await import('./expenses.css');
}
