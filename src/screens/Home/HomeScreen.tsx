import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { useTheme } from '../../hooks/useTheme';
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

  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const monthInputRef = useRef<HTMLInputElement>(null);

  const userName = useAppSelector(state => state.settings.userName);
  const userId = useAppSelector(state => state.settings.userId);
  const incomes = useAppSelector(state => state.income.incomes);
  const expenses = useAppSelector(state => state.expense.expenses);
  const swipeEnabled = useAppSelector(state => state.settings.swipeEnabled);
  const openingBalanceSetting = useAppSelector(state => state.settings.openingBalance);

  const totalIncome = useMemo(() => {
    return incomes
      .filter(income => {
        const d = dayjs(income.date);
        return (
          income.category !== 'Balance Carried Forward' &&
          d.month() + 1 === selectedMonth &&
          d.year() === selectedYear
        );
      })
      .reduce((sum, income) => sum + income.amount, 0);
  }, [incomes, selectedMonth, selectedYear]);

  const totalExpense = useMemo(() => {
    return expenses
      .filter(expense => {
        const d = dayjs(expense.date);
        return d.month() + 1 === selectedMonth && d.year() === selectedYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses, selectedMonth, selectedYear]);

  const openingBalance = useMemo(() => {
    const monthStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
    const bcfEntry = incomes.find(
      i =>
        i.category === 'Balance Carried Forward' &&
        dayjs(i.date).format('YYYY-MM') === monthStr
    );
    return bcfEntry ? bcfEntry.amount : openingBalanceSetting;
  }, [incomes, selectedMonth, selectedYear, openingBalanceSetting]);

  const currentBalance = openingBalance + totalIncome - totalExpense;

  const recentTransactions = useMemo(() => {
    const periodIncomes = incomes
      .filter(income => {
        const d = dayjs(income.date);
        return d.month() + 1 === selectedMonth && d.year() === selectedYear;
      })
      .map(i => ({
        ...i,
        type: 'income' as const,
      }));

    const periodExpenses = expenses
      .filter(expense => {
        const d = dayjs(expense.date);
        return d.month() + 1 === selectedMonth && d.year() === selectedYear;
      })
      .map(e => ({
        ...e,
        type: 'expense' as const,
      }));

    return [...periodIncomes, ...periodExpenses]
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
      .slice(0, 10);
  }, [incomes, expenses, selectedMonth, selectedYear]);

  useEffect(() => {
    if (USE_STATIC_DATA) {
      if (incomes.length === 0) {
        dispatch(setIncomes(mockIncomes));
        dispatch(setExpenses(mockExpenses));
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

    // Fetch Incomes & Expenses
    Promise.all([
      incomeFirebaseService.getAll(userId),
      expenseFirebaseService.getAll(userId),
    ])
      .then(([incomesData, expensesData]) => {
        dispatch(setIncomes(incomesData));
        dispatch(setExpenses(expensesData));
      })
      .catch(err => console.error('Error loading transaction data:', err));
  }, [dispatch, userId]);

  useEffect(() => {
    if (USE_STATIC_DATA) {
      dispatch(setBudget(mockBudget));
      dispatch(setCategoryBudgets(mockCategoryBudgets));
      return;
    }

    if (!userId) return;

    // Fetch Budget
    budgetFirebaseService.getBudget(selectedMonth, selectedYear, userId)
      .then(b => {
        dispatch(setBudget(b));
      })
      .catch(err => console.error('Error loading budget:', err));

    budgetFirebaseService.getCategoryBudgets(selectedMonth, selectedYear, userId)
      .then(cats => dispatch(setCategoryBudgets(cats)))
      .catch(err => console.error('Error loading category budgets:', err));
  }, [dispatch, userId, selectedMonth, selectedYear]);

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '36px 0', gap: '10px' }}>
          <Icon name="alert-circle-outline" size={44} color={theme.secondaryText} />
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
                {getGreeting()} {userName}
              </span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: COLORS.white, marginTop: '2px' }}>
                {dayjs().month(selectedMonth - 1).year(selectedYear).format('MMMM YYYY')}
              </span>
            </div>

            {/* Calendar month-year picker overlaying button */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => monthInputRef.current?.showPicker()}
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
                <Icon name="calendar-month-outline" size={22} color={COLORS.white} />
              </button>
              <input
                ref={monthInputRef}
                type="month"
                value={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const parts = val.split('-');
                    setSelectedYear(parseInt(parts[0], 10));
                    setSelectedMonth(parseInt(parts[1], 10));
                  }
                }}
                style={{
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  opacity: 0,
                  pointerEvents: 'none',
                  border: 'none',
                  outline: 'none',
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
