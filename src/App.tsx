import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { store, persistor } from './redux/store';
import { useAppSelector } from './redux/hooks';
import AppLayout from './components/Layout/AppLayout';

// Purge stale persist state from previous sessions that saved isLoggedIn: true
const PERSIST_VERSION = '1';
if (localStorage.getItem('app_persist_version') !== PERSIST_VERSION) {
  localStorage.removeItem('persist:root');
  localStorage.setItem('app_persist_version', PERSIST_VERSION);
}

// Core Screens (placeholder imports, we will write these files next)
import SplashScreen from './screens/Splash/SplashScreen';
import OnboardingScreen from './screens/Onboarding/OnboardingScreen';
import LoginScreen from './screens/Login/LoginScreen';
import SignupScreen from './screens/Signup/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPassword/ForgotPasswordScreen';
import HomeScreen from './screens/Home/HomeScreen';
import StatisticsScreen from './screens/Statistics/StatisticsScreen';
import BudgetScreen from './screens/Budget/BudgetScreen';
import ProfileScreen from './screens/Profile/ProfileScreen';
import AddExpenseScreen from './screens/AddExpense/AddExpenseScreen';
import AddIncomeScreen from './screens/AddIncome/AddIncomeScreen';
import AddBudgetScreen from './screens/AddBudget/AddBudgetScreen';
import EditProfileScreen from './screens/EditProfile/EditProfileScreen';
import MyCardsScreen from './screens/MyCards/MyCardsScreen';
import AddCardScreen from './screens/AddCard/AddCardScreen';
import AddCardTransactionScreen from './screens/AddCardTransaction/AddCardTransactionScreen';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = useAppSelector((state) => state.settings.isLoggedIn);
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = useAppSelector((state) => state.settings.isLoggedIn);
  return !isLoggedIn ? <>{children}</> : <Navigate to="/home" replace />;
};

const NavigationWrapper: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const isOnboarded = useAppSelector((state) => state.settings.isOnboarded);
  const isLoggedIn = useAppSelector((state) => state.settings.isLoggedIn);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/onboarding"
          element={
            <PublicRoute>
              {isOnboarded ? <Navigate to="/login" replace /> : <OnboardingScreen />}
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginScreen />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupScreen />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordScreen />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <StatisticsScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <BudgetScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-expense"
          element={
            <ProtectedRoute>
              <AddExpenseScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-income"
          element={
            <ProtectedRoute>
              <AddIncomeScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-budget"
          element={
            <ProtectedRoute>
              <AddBudgetScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-cards"
          element={
            <ProtectedRoute>
              <MyCardsScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-card"
          element={
            <ProtectedRoute>
              <AddCardScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-card-transaction"
          element={
            <ProtectedRoute>
              <AddCardTransactionScreen />
            </ProtectedRoute>
          }
        />

        {/* Root Redirects */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/home" replace />
            ) : isOnboarded ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

const App: React.FC = () => {
  const basename = import.meta.env.DEV ? '/' : '/FinancialManagerWeb';
  return (
    <Provider store={store}>
      <Router basename={basename}>
        <NavigationWrapper />
      </Router>
    </Provider>
  );
};

export default App;
