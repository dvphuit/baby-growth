import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { indexedDbStorage } from '@/services/localDb';
import type { ExpenseRecord } from '@/types/expense';

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `expense-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface ExpenseStoreState {
  expenses: ExpenseRecord[];
  addExpense: (input: Pick<ExpenseRecord, 'amount' | 'category' | 'occurredAt' | 'note'>) => ExpenseRecord;
  updateExpense: (id: string, patch: Partial<Pick<ExpenseRecord, 'amount' | 'category' | 'occurredAt' | 'note'>>) => void;
  deleteExpense: (id: string) => void;
  addExpenseItem: (categoryName: string, amount: number) => void;
}

export const useExpenseStore = create<ExpenseStoreState>()(
  persist(
    (set, get) => ({
      expenses: [],
      addExpense: (input) => {
        const now = new Date().toISOString();
        const record: ExpenseRecord = {
          id: createId(),
          amount: input.amount,
          category: input.category,
          occurredAt: input.occurredAt,
          note: input.note,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ expenses: [record, ...state.expenses] }));
        return record;
      },
      updateExpense: (id, patch) => set((state) => ({
        expenses: state.expenses.map((record) => record.id === id
          ? { ...record, ...patch, id: record.id, createdAt: record.createdAt, updatedAt: new Date().toISOString() }
          : record),
      })),
      deleteExpense: (id) => set((state) => ({ expenses: state.expenses.filter((record) => record.id !== id) })),
      addExpenseItem: (categoryName, amount) => {
        get().addExpense({ amount, category: categoryName, occurredAt: new Date().toISOString() });
      },
    }),
    {
      name: 'babygrowth_v3_expenses',
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: (state) => ({ expenses: state.expenses }),
    },
  ),
);
