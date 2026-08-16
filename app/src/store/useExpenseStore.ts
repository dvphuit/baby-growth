import { create } from 'zustand';
import { useBabyStore } from './useBabyStore';
import { formatVND } from '@/utils/format';

interface ExpenseStoreState {
  addExpenseItem: (categoryName: string, amount: number) => void;
}

export const useExpenseStore = create<ExpenseStoreState>(() => ({
  addExpenseItem: (categoryName, amount) => {
    const babyStore = useBabyStore.getState();
    const currentStage = babyStore.currentStage;
    const stages = babyStore.stages;
    const stage = stages[currentStage];

    if (!stage || !stage.expenses) return;

    const exp = { ...stage.expenses };
    const cats = [...exp.categories];
    const found = cats.find((category) => category.name.toLowerCase().includes(categoryName.toLowerCase()));
    const formattedAmount = formatVND(amount);

    if (found) {
      found.amount = formattedAmount;
    } else {
      cats.push({
        name: categoryName,
        amount: formattedAmount,
        percent: 10,
        color: '#8DA06F',
      });
    }

    exp.categories = cats;

    useBabyStore.setState((prev) => ({
      stages: {
        ...prev.stages,
        [currentStage]: {
          ...prev.stages[currentStage],
          expenses: exp,
        },
      },
    }));
  },
}));
