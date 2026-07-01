import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Budget, CategoryBudget} from '../../types/budget';

interface BudgetState {
  budget: Budget | null;
  categoryBudgets: CategoryBudget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budget: null,
  categoryBudgets: [],
  loading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudget(state, action: PayloadAction<Budget | null>) {
      state.budget = action.payload;
    },
    updateMonthlyBudget(state, action: PayloadAction<number>) {
      if (state.budget) {
        state.budget.monthlyBudget = action.payload;
      }
    },
    setCategoryBudgets(state, action: PayloadAction<CategoryBudget[]>) {
      state.categoryBudgets = action.payload;
    },
    addCategoryBudget(state, action: PayloadAction<CategoryBudget>) {
      state.categoryBudgets.push(action.payload);
    },
    updateCategoryBudget(state, action: PayloadAction<CategoryBudget>) {
      const index = state.categoryBudgets.findIndex(
        b => b.id === action.payload.id,
      );
      if (index !== -1) {
        state.categoryBudgets[index] = action.payload;
      }
    },
    deleteCategoryBudget(state, action: PayloadAction<string>) {
      state.categoryBudgets = state.categoryBudgets.filter(
        b => b.id !== action.payload,
      );
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setBudget,
  updateMonthlyBudget,
  setCategoryBudgets,
  addCategoryBudget,
  updateCategoryBudget,
  deleteCategoryBudget,
  setLoading,
  setError,
} = budgetSlice.actions;

export default budgetSlice.reducer;
