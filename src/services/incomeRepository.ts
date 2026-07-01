import {USE_STATIC_DATA} from '../config/appConfig';
import {Income} from '../types/income';
import {mockIncomes} from '../data/mockIncome';
import {incomeFirebaseService} from './firebase/incomeService';
import {store} from '../redux/store';
import {
  setIncomes,
  addIncome as addIncomeAction,
  updateIncome,
  deleteIncome,
} from '../redux/slices/incomeSlice';
import {uuidv4} from '../utils/uuid';

export const incomeRepository = {
  getAll: async (): Promise<Income[]> => {
    if (USE_STATIC_DATA) {
      const state = store.getState();
      if (state.income.incomes.length === 0) {
        store.dispatch(setIncomes(mockIncomes));
        return mockIncomes;
      }
      return state.income.incomes;
    }
    return incomeFirebaseService.getAll();
  },

  add: async (incomeData: Omit<Income, 'id' | 'createdAt'>): Promise<Income> => {
    const newIncome: Income = {
      ...incomeData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    if (USE_STATIC_DATA) {
      store.dispatch(addIncomeAction(newIncome));
      return newIncome;
    }

    const id = await incomeFirebaseService.add(newIncome);
    return {...newIncome, id};
  },

  update: async (id: string, data: Partial<Income>): Promise<void> => {
    if (USE_STATIC_DATA) {
      const state = store.getState();
      const existing = state.income.incomes.find(i => i.id === id);
      if (existing) {
        store.dispatch(updateIncome({...existing, ...data}));
      }
      return;
    }
    await incomeFirebaseService.update(id, data);
  },

  delete: async (id: string): Promise<void> => {
    if (USE_STATIC_DATA) {
      store.dispatch(deleteIncome(id));
      return;
    }
    await incomeFirebaseService.delete(id);
    store.dispatch(deleteIncome(id));
  },
};
