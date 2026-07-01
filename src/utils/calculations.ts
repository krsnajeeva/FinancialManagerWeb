import {Expense} from '../types/expense';
import {Income} from '../types/income';
import dayjs from 'dayjs';

export const calculateTotalIncome = (
  incomes: Income[],
  month?: number,
  year?: number,
): number => {
  const currentMonth = month ?? dayjs().month() + 1;
  const currentYear = year ?? dayjs().year();

  return incomes
    .filter(income => {
      const incomeDate = dayjs(income.date);
      return (
        incomeDate.month() + 1 === currentMonth &&
        incomeDate.year() === currentYear
      );
    })
    .reduce((sum, income) => sum + income.amount, 0);
};

export const calculateTotalExpense = (
  expenses: Expense[],
  month?: number,
  year?: number,
): number => {
  const currentMonth = month ?? dayjs().month() + 1;
  const currentYear = year ?? dayjs().year();

  return expenses
    .filter(expense => {
      const expenseDate = dayjs(expense.date);
      return (
        expenseDate.month() + 1 === currentMonth &&
        expenseDate.year() === currentYear
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateBudgetUsed = (
  expenses: Expense[],
  month?: number,
  year?: number,
): number => {
  const currentMonth = month ?? dayjs().month() + 1;
  const currentYear = year ?? dayjs().year();

  return expenses
    .filter(expense => {
      const expenseDate = dayjs(expense.date);
      return (
        !expense.fixedCommitment &&
        expenseDate.month() + 1 === currentMonth &&
        expenseDate.year() === currentYear
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateCurrentBalance = (
  openingBalance: number,
  totalIncome: number,
  totalExpense: number,
): number => {
  return openingBalance + totalIncome - totalExpense;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
