import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const COLLECTIONS = {
  INCOMES: 'incomes',
  EXPENSES: 'expenses',
  BUDGETS: 'budgets',
  CATEGORY_BUDGETS: 'categoryBudgets',
  CARDS: 'cards',
  CARD_TRANSACTIONS: 'cardTransactions',
  SETTINGS: 'settings',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCoZxsugiGBUoTHzBkXwxsNUMeVEiW3_Cc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mybudget-25e72.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mybudget-25e72",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mybudget-25e72.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "31204714695",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:31204714695:web:156a516ddc5cdf4acb76e2",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://mybudget-25e72-default-rtdb.firebaseio.com",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PBP1GJ2CCL",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
