import {USE_STATIC_DATA} from '../config/appConfig';
import {Expense} from '../types/expense';
import {mockExpenses} from '../data/mockExpenses';
import {expenseFirebaseService} from './firebase/expenseService';
import {store} from '../redux/store';
import {
  setExpenses,
  addExpense as addExpenseAction,
  updateExpense,
  deleteExpense,
} from '../redux/slices/expenseSlice';
import {uuidv4} from '../utils/uuid';

export const expenseRepository = {
  getAll: async (): Promise<Expense[]> => {
    if (USE_STATIC_DATA) {
      const state = store.getState();
      if (state.expense.expenses.length === 0) {
        store.dispatch(setExpenses(mockExpenses));
        return mockExpenses;
      }
      return state.expense.expenses;
    }
    return expenseFirebaseService.getAll();
  },

  add: async (expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    const newExpense: Expense = {
      ...expenseData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    if (USE_STATIC_DATA) {
      store.dispatch(addExpenseAction(newExpense));
      return newExpense;
    }

    const id = await expenseFirebaseService.add(newExpense);
    return {...newExpense, id};
  },

  update: async (id: string, data: Partial<Expense>): Promise<void> => {
    if (USE_STATIC_DATA) {
      const state = store.getState();
      const existing = state.expense.expenses.find(e => e.id === id);
      if (existing) {
        store.dispatch(updateExpense({...existing, ...data}));
      }
      return;
    }
    await expenseFirebaseService.update(id, data);
  },

  delete: async (id: string): Promise<void> => {
    if (USE_STATIC_DATA) {
      store.dispatch(deleteExpense(id));
      return;
    }
    await expenseFirebaseService.delete(id);
    store.dispatch(deleteExpense(id));
  },
};
