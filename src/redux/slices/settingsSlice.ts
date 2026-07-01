import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ThemeId} from '../../constants/theme';

interface SettingsState {
  openingBalance: number;
  userName: string;
  userHandle: string;
  currency: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  userId: string;
  userEmail: string;
  activeThemeId: ThemeId;
  swipeEnabled: boolean;
  userAvatar?: string;
}

const initialState: SettingsState = {
  openingBalance: 0,
  userName: 'Enjelin Morgeana',
  userHandle: '@enjelin_morgeana',
  currency: '₹',
  isAdmin: true,
  isLoggedIn: false,
  isOnboarded: false,
  userId: '',
  userEmail: '',
  activeThemeId: 'theme1',
  swipeEnabled: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setOpeningBalance(state, action: PayloadAction<number>) {
      state.openingBalance = action.payload;
    },
    setUserName(state, action: PayloadAction<string>) {
      state.userName = action.payload;
    },
    setUserHandle(state, action: PayloadAction<string>) {
      state.userHandle = action.payload;
    },
    setCurrency(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    },
    setIsAdmin(state, action: PayloadAction<boolean>) {
      state.isAdmin = action.payload;
    },
    setLoggedIn(state, action: PayloadAction<boolean>) {
      state.isLoggedIn = action.payload;
    },
    setOnboarded(state, action: PayloadAction<boolean>) {
      state.isOnboarded = action.payload;
    },
    setUserId(state, action: PayloadAction<string>) {
      state.userId = action.payload;
    },
    setUserEmail(state, action: PayloadAction<string>) {
      state.userEmail = action.payload;
    },
    setThemeId(state, action: PayloadAction<ThemeId>) {
      state.activeThemeId = action.payload;
    },
    setSwipeEnabled(state, action: PayloadAction<boolean>) {
      state.swipeEnabled = action.payload;
    },
    setUserAvatar(state, action: PayloadAction<string | undefined>) {
      state.userAvatar = action.payload;
    },
  },
});

export const {
  setOpeningBalance,
  setUserName,
  setUserHandle,
  setCurrency,
  setIsAdmin,
  setLoggedIn,
  setOnboarded,
  setUserId,
  setUserEmail,
  setThemeId,
  setSwipeEnabled,
  setUserAvatar,
} = settingsSlice.actions;

export default settingsSlice.reducer;
