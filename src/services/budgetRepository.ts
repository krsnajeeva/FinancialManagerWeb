import {USE_STATIC_DATA} from '../config/appConfig';
import {Budget, CategoryBudget} from '../types/budget';
import {mockBudget, mockCategoryBudgets} from '../data/mockBudget';
import {budgetFirebaseService} from './firebase/budgetService';
import {store} from '../redux/store';
import {
  setBudget,
  setCategoryBudgets,
  addCategoryBudget,
  updateCategoryBudget,
  deleteCategoryBudget,
} from '../redux/slices/budgetSlice';

export const budgetRepository = {
  getBudget: async (month: number, year: number, userId?: string): Promise<Budget | null> => {
    if (USE_STATIC_DATA) {
      const state = store.getState();
      if (!state.budget.budget) {
        store.dispatch(setBudget(mockBudget));
        return mockBudget;
      }
      return state.budget.budget;
    }
    return budgetFirebaseService.getBudget(month, year, userId);
  },

  setBudget: async (budget: Budget): Promise<void> => {
    if (USE_STATIC_DATA) {
      store.dispatch(setBudget(budget));
      return;
    }
    await budgetFirebaseService.setBudget(budget);
  },

  getCategoryBudgets: async (
    month: number,
    year: number,
    userId?: string,
  ): Promise<CategoryBudget[]> => {
    if (USE_STATIC_DATA) {
      const state = store.getState();
      if (state.budget.categoryBudgets.length === 0) {
        store.dispatch(setCategoryBudgets(mockCategoryBudgets));
        return mockCategoryBudgets;
      }
      return state.budget.categoryBudgets;
    }
    return budgetFirebaseService.getCategoryBudgets(month, year, userId);
  },

  saveCategoryBudget: async (categoryBudget: CategoryBudget): Promise<void> => {
    if (USE_STATIC_DATA) {
      const state = store.getState();
      const existing = state.budget.categoryBudgets.find(
        b =>
          b.category.toLowerCase() === categoryBudget.category.toLowerCase() &&
          b.month === categoryBudget.month &&
          b.year === categoryBudget.year,
      );

      if (existing) {
        const updated = {
          ...categoryBudget,
          id: existing.id,
        };
        store.dispatch(updateCategoryBudget(updated));
      } else {
        store.dispatch(addCategoryBudget(categoryBudget));
      }
      return;
    }
    await budgetFirebaseService.setCategoryBudget(categoryBudget);
    
    // Also sync to redux store directly so screens refresh immediately
    const state = store.getState();
    const existing = state.budget.categoryBudgets.find(
      b =>
        b.category.toLowerCase() === categoryBudget.category.toLowerCase() &&
        b.month === categoryBudget.month &&
        b.year === categoryBudget.year,
    );
    if (existing) {
      store.dispatch(updateCategoryBudget({ ...categoryBudget, id: existing.id }));
    } else {
      store.dispatch(addCategoryBudget(categoryBudget));
    }
  },

  deleteCategoryBudget: async (id: string): Promise<void> => {
    if (USE_STATIC_DATA) {
      store.dispatch(deleteCategoryBudget(id));
      return;
    }
    await budgetFirebaseService.deleteCategoryBudget(id);
    store.dispatch(deleteCategoryBudget(id));
  },
};
