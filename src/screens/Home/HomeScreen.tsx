import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { useTheme } from '../../hooks/useTheme';
import {
  selectTotalIncome,
  selectTotalExpense,
  selectCurrentBalance,
  selectRecentTransactions,
} from '../../redux/selectors';
import { setIncomes } from '../../redux/slices/incomeSlice';
import { setExpenses } from '../../redux/slices/expenseSlice';
import { setBudget, setCategoryBudgets } from '../../redux/slices/budgetSlice';
import { setUserName, setUserHandle, setSwipeEnabled } from '../../redux/slices/settingsSlice';
import { mockIncomes } from '../../data/mockIncome';
import { mockExpenses } from '../../data/mockExpenses';
import { mockBudget, mockCategoryBudgets } from '../../data/mockBudget';
import { USE_STATIC_DATA } from '../../config/appConfig';
import { COLORS } from '../../constants/colors';
import { getGreeting } from '../../utils/date';
import BalanceCard from '../../components/cards/BalanceCard';
import TransactionItem from '../../components/cards/TransactionItem';
import Swipeable from '../../components/common/Swipeable';
import { incomeRepository } from '../../services/incomeRepository';
import { expenseRepository } from '../../services/expenseRepository';
import { db } from '../../services/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { incomeFirebaseService } from '../../services/firebase/incomeService';
import { expenseFirebaseService } from '../../services/firebase/expenseService';
import { budgetFirebaseService } from '../../services/firebase/budgetService';
import Icon from '../../components/common/Icon';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const totalIncome = useAppSelector(selectTotalIncome);
  const totalExpense = useAppSelector(selectTotalExpense);
  const currentBalance = useAppSelector(selectCurrentBalance);
  const recentTransactions = useAppSelector(selectRecentTransactions);
  const userName = useAppSelector(state => state.settings.userName);
  const userId = useAppSelector(state => state.settings.userId);
  const incomes = useAppSelector(state => state.income.incomes);
  const swipeEnabled = useAppSelector(state => state.settings.swipeEnabled);

  useEffect(() => {
    if (USE_STATIC_DATA) {
      if (incomes.length === 0) {
        dispatch(setIncomes(mockIncomes));
        dispatch(setExpenses(mockExpenses));
        dispatch(setBudget(mockBudget));
        dispatch(setCategoryBudgets(mockCategoryBudgets));
      }
      return;
    }

    if (!userId) return;

    // Fetch User Profile Name from Firestore
    getDoc(doc(db, 'users', userId))
      .then(userDoc => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data) {
            const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
            const baseHandle = `@${(data.firstName || 'user').toLowerCase()}_${(data.lastName || '').toLowerCase()}`;
            dispatch(setUserName(fullName));
            dispatch(setUserHandle(baseHandle));
            if (data.swipeEnabled !== undefined) {
              dispatch(setSwipeEnabled(data.swipeEnabled));
            }
          }
        }
      })
      .catch(err => console.error('Error fetching user name:', err));

    // Fetch Incomes
    incomeFirebaseService.getAll(userId)
      .then(data => dispatch(setIncomes(data)))
      .catch(err => console.error('Error loading incomes:', err));

    // Fetch Expenses
    expenseFirebaseService.getAll(userId)
      .then(data => dispatch(setExpenses(data)))
      .catch(err => console.error('Error loading expenses:', err));

    // Fetch Budget
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    budgetFirebaseService.getBudget(currentMonth, currentYear, userId)
      .then(b => {
        if (b) {
          dispatch(setBudget(b));
        }
      })
      .catch(err => console.error('Error loading budget:', err));

    budgetFirebaseService.getCategoryBudgets(currentMonth, currentYear, userId)
      .then(cats => dispatch(setCategoryBudgets(cats)))
      .catch(err => console.error('Error loading category budgets:', err));

  }, [dispatch, userId]);

  const handleDeleteTransaction = async (id: string, type: 'income' | 'expense') => {
    try {
      if (type === 'income') {
        await incomeRepository.delete(id);
      } else {
        await expenseRepository.delete(id);
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const renderTransactionItems = () => {
    if (recentTransactions.length === 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 0', gap: '10px' }}>
          <Icon name="receipt-text-outline" size={44} color={theme.secondaryText} />
          <span style={{ fontSize: '14px', color: theme.secondaryText }}>No transactions yet</span>
        </div>
      );
    }

    return recentTransactions.map((transaction, index) => (
      <div key={transaction.id} style={{ display: 'flex', flexDirection: 'column', width: '100%', flexShrink: 0 }}>
        <Swipeable
          onDelete={() => handleDeleteTransaction(transaction.id, transaction.type)}
          borderRadius={12}
          swipeEnabled={swipeEnabled}
          backgroundColor={theme.cardBackground}
        >
          <TransactionItem
            category={transaction.category}
            description={transaction.description}
            date={transaction.date}
            amount={transaction.amount}
            type={transaction.type}
          />
        </Swipeable>
        {index < recentTransactions.length - 1 && (
          <div style={{ height: '1px', backgroundColor: theme.border, margin: '0 16px' }} />
        )}
      </div>
    ));
  };

  const headerColors = theme.primaryGradient;
  const headerBgGradient = `linear-gradient(90deg, ${headerColors.join(', ')})`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: theme.background,
        position: 'relative',
      }}
    >
      {/* Top Section */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        {/* Curved Header Background */}
        <div
          style={{
            background: headerBgGradient,
            borderBottomLeftRadius: '28px',
            borderBottomRightRadius: '28px',
            paddingBottom: '110px',
            paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Greeting Row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 20px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: '400' }}>
                {getGreeting()}
              </span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: COLORS.white, marginTop: '2px' }}>
                {userName}
              </span>
            </div>

            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '22px',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  color: COLORS.white,
                }}
                className="active-opacity"
              >
                <Icon name="bell-outline" size={22} color={COLORS.white} />
              </button>
              <div
                style={{
                  position: 'absolute',
                  top: '9px',
                  right: '9px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '5px',
                  backgroundColor: '#FF6D00',
                  border: `1.5px solid ${theme.accent}`,
                  animation: 'pulse 1.8s infinite',
                }}
              />
            </div>
          </div>
        </div>

        {/* Balance Card Overlapping */}
        <div style={{ marginTop: '-90px', zIndex: 10, position: 'relative' }}>
          <BalanceCard
            totalBalance={currentBalance}
            income={totalIncome}
            expenses={totalExpense}
            onMenuPress={() => navigate('/add-income')}
          />
        </div>

        {/* History Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
            marginTop: '24px',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '17px', fontWeight: '700', color: theme.primaryText }}>
            Transactions History
          </span>
          <button
            onClick={() => navigate('/statistics')}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: theme.accent, fontSize: '14px', fontWeight: '600' }}
            className="active-opacity"
          >
            See all
          </button>
        </div>
      </div>

      {/* Scrollable list container */}
      <div style={{ flex: 1, padding: '0 16px 24px 16px', display: 'flex', overflow: 'hidden' }}>
        <div
          style={{
            flex: 1,
            backgroundColor: theme.cardBackground,
            borderRadius: '20px',
            border: theme.isDark ? `1px solid ${theme.border}` : 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 0',
          }}
        >
          {renderTransactionItems()}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => navigate('/add-expense')}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: theme.accent,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 6px 14px rgba(10, 46, 44, 0.35)',
          color: COLORS.white,
          zIndex: 99,
        }}
        className="active-opacity"
      >
        <Icon name="plus" size={26} color={COLORS.white} />
      </button>
    </div>
  );
};

export default HomeScreen;
