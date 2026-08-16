export interface ExpenseRecord {
  id: string;
  amount: number;
  category: string;
  occurredAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
