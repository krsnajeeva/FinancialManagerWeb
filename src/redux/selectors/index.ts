import { RootState } from '../store';
import dayjs from 'dayjs';
import { createSelector } from '@reduxjs/toolkit';

export const selectIncomes = (state: RootState) => state.income.incomes;
export const selectExpenses = (state: RootState) => state.expense.expenses;
export const selectBudget = (state: RootState) => state.budget.budget;
export const selectCategoryBudgets = (state: RootState) =>
  state.budget.categoryBudgets;
export const selectSettings = (state: RootState) => state.settings;

export const selectCurrentMonthIncomes = createSelector(
  [selectIncomes],
  (incomes) => {
    const currentMonth = dayjs().month() + 1;
    const currentYear = dayjs().year();
    return incomes.filter(income => {
      const d = dayjs(income.date);
      return d.month() + 1 === currentMonth && d.year() === currentYear;
    });
  }
);

export const selectCurrentMonthExpenses = createSelector(
  [selectExpenses],
  (expenses) => {
    const currentMonth = dayjs().month() + 1;
    const currentYear = dayjs().year();
    return expenses.filter(expense => {
      const d = dayjs(expense.date);
      return d.month() + 1 === currentMonth && d.year() === currentYear;
    });
  }
);

export const selectTotalIncome = createSelector(
  [selectIncomes],
  (incomes): number => {
    const currentMonth = dayjs().month() + 1;
    const currentYear = dayjs().year();
    return incomes
      .filter(income => {
        const d = dayjs(income.date);
        return (
          income.category !== 'Balance Carried Forward' &&
          d.month() + 1 === currentMonth &&
          d.year() === currentYear
        );
      })
      .reduce((sum, income) => sum + income.amount, 0);
  }
);

export const selectTotalExpense = createSelector(
  [selectExpenses],
  (expenses): number => {
    const currentMonth = dayjs().month() + 1;
    const currentYear = dayjs().year();
    return expenses
      .filter(expense => {
        const d = dayjs(expense.date);
        return d.month() + 1 === currentMonth && d.year() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }
);

export const selectOpeningBalance = createSelector(
  [selectIncomes, selectSettings],
  (incomes, settings): number => {
    const currentMonthStr = dayjs().format('YYYY-MM');
    const bcfEntry = incomes.find(
      i =>
        i.category === 'Balance Carried Forward' &&
        dayjs(i.date).format('YYYY-MM') === currentMonthStr
    );
    return bcfEntry ? bcfEntry.amount : settings.openingBalance;
  }
);

export const selectCurrentBalance = createSelector(
  [selectOpeningBalance, selectTotalIncome, selectTotalExpense],
  (openingBalance, totalIncome, totalExpense): number => {
    return openingBalance + totalIncome - totalExpense;
  }
);

export const selectBudgetUsed = createSelector(
  [selectExpenses],
  (expenses): number => {
    const currentMonth = dayjs().month() + 1;
    const currentYear = dayjs().year();
    return expenses
      .filter(expense => {
        const d = dayjs(expense.date);
        return (
          !expense.fixedCommitment &&
          d.month() + 1 === currentMonth &&
          d.year() === currentYear
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }
);

export const selectBudgetRemaining = createSelector(
  [selectBudget, selectBudgetUsed],
  (budget, budgetUsed): number => {
    const monthlyBudget = budget?.monthlyBudget ?? 0;
    return monthlyBudget - budgetUsed;
  }
);

export const selectBudgetPercentage = createSelector(
  [selectBudget, selectBudgetUsed],
  (budget, budgetUsed): number => {
    const monthlyBudget = budget?.monthlyBudget ?? 0;
    if (monthlyBudget === 0) return 0;
    return Math.min(Math.round((budgetUsed / monthlyBudget) * 100), 100);
  }
);

export const selectRecentTransactions = createSelector(
  [selectIncomes, selectExpenses],
  (incomes, expenses) => {
    const currentMonth = dayjs().month() + 1;
    const currentYear = dayjs().year();
    const filteredIncomes = incomes
      .filter(income => {
        const d = dayjs(income.date);
        return d.month() + 1 === currentMonth && d.year() === currentYear;
      })
      .map(i => ({
        ...i,
        type: 'income' as const,
      }));
    const filteredExpenses = expenses
      .filter(expense => {
        const d = dayjs(expense.date);
        return d.month() + 1 === currentMonth && d.year() === currentYear;
      })
      .map(e => ({
        ...e,
        type: 'expense' as const,
      }));

    return [...filteredIncomes, ...filteredExpenses]
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
      .slice(0, 10);
  }
);

export const selectExpensesByCategory = createSelector(
  [selectExpenses],
  (expenses) => {
    const currentMonth = dayjs().month() + 1;
    const currentYear = dayjs().year();
    const monthExpenses = expenses.filter(expense => {
      const d = dayjs(expense.date);
      return d.month() + 1 === currentMonth && d.year() === currentYear;
    });

    const categoryMap: Record<string, number> = {};
    monthExpenses.forEach(expense => {
      categoryMap[expense.category] =
        (categoryMap[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }
);
