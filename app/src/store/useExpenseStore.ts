import { useBabyStore } from './useBabyStore';
import type { ExpenseRecord } from '@/types/expense';

interface ExpenseStoreState {
  expenses: ExpenseRecord[];
  addExpense: (input: Pick<ExpenseRecord, 'amount' | 'category' | 'occurredAt' | 'note'>) => ExpenseRecord;
  updateExpense: (id: string, patch: Partial<Pick<ExpenseRecord, 'amount' | 'category' | 'occurredAt' | 'note'>>) => void;
  deleteExpense: (id: string) => void;
  addExpenseItem: (categoryName: string, amount: number) => void;
}

/** Expense records live in the existing baby store so Google Drive schema-1
 * snapshots keep backing them up through `babygrowth_v2_baby`. */
export function useExpenseStore<T>(selector: (state: ExpenseStoreState) => T): T {
  return useBabyStore((state) => selector({
    expenses: state.expenseRecords ?? [],
    addExpense: state.addExpenseRecord,
    updateExpense: state.updateExpenseRecord,
    deleteExpense: state.deleteExpenseRecord,
    addExpenseItem: (categoryName, amount) => state.addExpenseRecord({
      amount,
      category: categoryName,
      occurredAt: new Date().toISOString(),
    }),
  }));
}
