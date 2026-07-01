import {RootState} from '../store';
import dayjs from 'dayjs';

export const selectIncomes = (state: RootState) => state.income.incomes;
export const selectExpenses = (state: RootState) => state.expense.expenses;
export const selectBudget = (state: RootState) => state.budget.budget;
export const selectCategoryBudgets = (state: RootState) =>
  state.budget.categoryBudgets;
export const selectSettings = (state: RootState) => state.settings;


export const selectCurrentMonthIncomes = (state: RootState) => {
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  return state.income.incomes.filter(income => {
    const d = dayjs(income.date);
    return d.month() + 1 === currentMonth && d.year() === currentYear;
  });
};

export const selectCurrentMonthExpenses = (state: RootState) => {
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  return state.expense.expenses.filter(expense => {
    const d = dayjs(expense.date);
    return d.month() + 1 === currentMonth && d.year() === currentYear;
  });
};

export const selectTotalIncome = (state: RootState): number => {
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  return state.income.incomes
    .filter(income => {
      const d = dayjs(income.date);
      return (
        income.category !== 'Balance Carried Forward' &&
        d.month() + 1 === currentMonth &&
        d.year() === currentYear
      );
    })
    .reduce((sum, income) => sum + income.amount, 0);
};

export const selectTotalExpense = (state: RootState): number => {
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  return state.expense.expenses
    .filter(expense => {
      const d = dayjs(expense.date);
      return d.month() + 1 === currentMonth && d.year() === currentYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const selectOpeningBalance = (state: RootState): number => {
  const currentMonthStr = dayjs().format('YYYY-MM');
  const bcfEntry = state.income.incomes.find(
    i =>
      i.category === 'Balance Carried Forward' &&
      dayjs(i.date).format('YYYY-MM') === currentMonthStr
  );
  return bcfEntry ? bcfEntry.amount : state.settings.openingBalance;
};

export const selectCurrentBalance = (state: RootState): number => {
  const openingBalance = selectOpeningBalance(state);
  const totalIncome = selectTotalIncome(state);
  const totalExpense = selectTotalExpense(state);
  return openingBalance + totalIncome - totalExpense;
};

export const selectBudgetUsed = (state: RootState): number => {
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  return state.expense.expenses
    .filter(expense => {
      const d = dayjs(expense.date);
      return (
        !expense.fixedCommitment &&
        d.month() + 1 === currentMonth &&
        d.year() === currentYear
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const selectBudgetRemaining = (state: RootState): number => {
  const monthlyBudget = state.budget.budget?.monthlyBudget ?? 0;
  const budgetUsed = selectBudgetUsed(state);
  return monthlyBudget - budgetUsed;
};

export const selectBudgetPercentage = (state: RootState): number => {
  const monthlyBudget = state.budget.budget?.monthlyBudget ?? 0;
  if (monthlyBudget === 0) return 0;
  const budgetUsed = selectBudgetUsed(state);
  return Math.min(Math.round((budgetUsed / monthlyBudget) * 100), 100);
};

export const selectRecentTransactions = (state: RootState) => {
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  const incomes = state.income.incomes
    .filter(income => {
      const d = dayjs(income.date);
      return d.month() + 1 === currentMonth && d.year() === currentYear;
    })
    .map(i => ({
      ...i,
      type: 'income' as const,
    }));
  const expenses = state.expense.expenses
    .filter(expense => {
      const d = dayjs(expense.date);
      return d.month() + 1 === currentMonth && d.year() === currentYear;
    })
    .map(e => ({
      ...e,
      type: 'expense' as const,
    }));

  return [...incomes, ...expenses]
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    .slice(0, 10);
};

export const selectExpensesByCategory = (state: RootState) => {
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  const monthExpenses = state.expense.expenses.filter(expense => {
    const d = dayjs(expense.date);
    return d.month() + 1 === currentMonth && d.year() === currentYear;
  });

  const categoryMap: Record<string, number> = {};
  monthExpenses.forEach(expense => {
    categoryMap[expense.category] =
      (categoryMap[expense.category] || 0) + expense.amount;
  });

  return Object.entries(categoryMap)
    .map(([category, amount]) => ({category, amount}))
    .sort((a, b) => b.amount - a.amount);
};
