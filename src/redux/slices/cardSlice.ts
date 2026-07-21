import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CreditCardItem, CardTransaction} from '../../types/card';

interface CardState {
  cards: CreditCardItem[];
  cardTransactions: CardTransaction[];
  loading: boolean;
  error: string | null;
}

const initialState: CardState = {
  cards: [],
  cardTransactions: [],
  loading: false,
  error: null,
};

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {
    setCards(state, action: PayloadAction<CreditCardItem[]>) {
      state.cards = action.payload;
    },
    addCard(state, action: PayloadAction<CreditCardItem>) {
      state.cards.push(action.payload);
    },
    updateCard(state, action: PayloadAction<CreditCardItem>) {
      const index = state.cards.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.cards[index] = action.payload;
      }
    },
    deleteCard(state, action: PayloadAction<string>) {
      state.cards = (state.cards || []).filter(c => c.id !== action.payload);
      state.cardTransactions = (state.cardTransactions || []).filter(t => t.cardId !== action.payload);
    },
    setCardTransactions(state, action: PayloadAction<CardTransaction[]>) {
      state.cardTransactions = action.payload || [];
    },
    addCardTransaction(state, action: PayloadAction<CardTransaction>) {
      if (!state.cardTransactions) state.cardTransactions = [];
      state.cardTransactions.unshift(action.payload);
    },
    deleteCardTransaction(state, action: PayloadAction<string>) {
      state.cardTransactions = (state.cardTransactions || []).filter(t => t.id !== action.payload);
    },
    setCardLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setCardError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setCards,
  addCard,
  updateCard,
  deleteCard,
  setCardTransactions,
  addCardTransaction,
  deleteCardTransaction,
  setCardLoading,
  setCardError,
} = cardSlice.actions;

export default cardSlice.reducer;
