import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Income} from '../../types/income';

interface IncomeState {
  incomes: Income[];
  loading: boolean;
  error: string | null;
}

const initialState: IncomeState = {
  incomes: [],
  loading: false,
  error: null,
};

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setIncomes(state, action: PayloadAction<Income[]>) {
      state.incomes = action.payload;
    },
    addIncome(state, action: PayloadAction<Income>) {
      state.incomes.unshift(action.payload);
    },
    updateIncome(state, action: PayloadAction<Income>) {
      const index = state.incomes.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.incomes[index] = action.payload;
      }
    },
    deleteIncome(state, action: PayloadAction<string>) {
      state.incomes = state.incomes.filter(i => i.id !== action.payload);
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
  setIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
  setLoading,
  setError,
} = incomeSlice.actions;

export default incomeSlice.reducer;
