import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { COLORS } from '../../constants/colors';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { formatAmount } from '../../utils/calculations';
import ScreenHeader from '../../components/cards/ScreenHeader';
import Swipeable from '../../components/common/Swipeable';
import { setBudget, setCategoryBudgets } from '../../redux/slices/budgetSlice';
import { useTheme } from '../../hooks/useTheme';
import { budgetRepository } from '../../services/budgetRepository';
import { excelExportService } from '../../utils/excelExport';
import dayjs from 'dayjs';
import Icon from '../../components/common/Icon';

const BudgetScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const userId = useAppSelector(state => state.settings.userId);
  const incomes = useAppSelector(state => state.income.incomes);
  const expenses = useAppSelector(state => state.expense.expenses);
  const categoryBudgets = useAppSelector(state => state.budget.categoryBudgets);
  const swipeEnabled = useAppSelector(state => state.settings.swipeEnabled);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const monthInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchBudgetData = async () => {
      setLoading(true);
      try {
        const b = await budgetRepository.getBudget(selectedMonth, selectedYear, userId);
        dispatch(setBudget(b || null));
        const cb = await budgetRepository.getCategoryBudgets(selectedMonth, selectedYear, userId);
        dispatch(setCategoryBudgets(cb));
      } catch (error) {
        console.error('Error fetching budget data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgetData();
  }, [userId, dispatch, selectedMonth, selectedYear]);

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

  const budgetUsed = useMemo(() => {
    return expenses
      .filter(expense => {
        const d = dayjs(expense.date);
        return (
          !expense.fixedCommitment &&
          d.month() + 1 === selectedMonth &&
          d.year() === selectedYear
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses, selectedMonth, selectedYear]);

  const expensesByCategory = useMemo(() => {
    const monthExpenses = expenses.filter(expense => {
      const d = dayjs(expense.date);
      return d.month() + 1 === selectedMonth && d.year() === selectedYear;
    });

    const categoryMap: Record<string, number> = {};
    monthExpenses.forEach(expense => {
      categoryMap[expense.category] =
        (categoryMap[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, selectedMonth, selectedYear]);

  const monthlyBudget = categoryBudgets.reduce((sum, cat) => sum + cat.budgetAmount, 0);
  const budgetRemaining = Math.max(monthlyBudget - budgetUsed, 0);
  const budgetPercentage = monthlyBudget > 0 ? Math.round((budgetUsed / monthlyBudget) * 100) : 0;
  const balance = totalIncome - totalExpense;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const isPastOrFuture = !(selectedMonth === currentMonth && selectedYear === currentYear);

  const handleAddBudgetPress = () => {
    if (isPastOrFuture) {
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
    } else {
      navigate('/add-budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await budgetRepository.deleteCategoryBudget(id);
    } catch (err) {
      console.error('Error deleting category budget:', err);
    }
  };

  const handleMonthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // YYYY-MM
    if (val) {
      const parts = val.split('-');
      setSelectedYear(parseInt(parts[0], 10));
      setSelectedMonth(parseInt(parts[1], 10));
      setShowDatePicker(false);
    }
  };

  // Custom Progress Bar with Centered Percentage
  const CenteredProgressBar = ({ percentage, color = theme.accent }: { percentage: number; color?: string }) => {
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    return (
      <div
        style={{
          height: '20px',
          backgroundColor: theme.isDark ? '#333333' : '#F2F2F2',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          position: 'relative',
          margin: '4px 0',
          width: '100%',
        }}
      >
        <div
          style={{
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            borderRadius: '10px',
            width: `${clampedPercentage}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease',
          }}
        />
        <span style={{ fontSize: '11px', fontWeight: '700', color: theme.primaryText, zIndex: 1 }}>
          {Math.round(clampedPercentage)}%
        </span>
      </div>
    );
  };

  const handleExportExcel = () => {
    const monthYearStr = dayjs().month(selectedMonth - 1).year(selectedYear).format('MMMM YYYY');
    
    const mappedCategoryBudgets = categoryBudgets.map(catBudget => {
      const spent =
        expensesByCategory.find(
          e => e.category.toLowerCase() === catBudget.category.toLowerCase(),
        )?.amount ?? 0;
      const remaining = Math.max(catBudget.budgetAmount - spent, 0);
      const percentage =
        catBudget.budgetAmount > 0
          ? Math.round((spent / catBudget.budgetAmount) * 100)
          : 0;
      return {
        category: catBudget.category,
        budgetAmount: catBudget.budgetAmount,
        spent,
        remaining,
        percentage,
      };
    });

    excelExportService.exportBudget({
      budgetSummary: {
        monthYear: monthYearStr,
        totalIncome,
        totalExpenses: totalExpense,
        balance,
        monthlyBudget,
        budgetUsed,
        budgetRemaining,
        budgetPercentage,
      },
      categoryBudgets: mappedCategoryBudgets,
    });
  };

  const headerColors = theme.primaryGradient;
  const headerBgGradient = `linear-gradient(90deg, ${headerColors.join(', ')})`;

  // Current month string YYYY-MM
  const monthInputVal = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: theme.background,
        overflow: 'hidden',
      }}
    >
      {/* Top Section */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Curved Header */}
        <div
          style={{
            background: headerBgGradient,
            borderBottomLeftRadius: '28px',
            borderBottomRightRadius: '28px',
            paddingBottom: '72px',
          }}
        >
          <ScreenHeader
            title="Budget"
            light
            showBack={false}
            rightIcon="download-outline"
            onRightPress={handleExportExcel}
          />
        </div>

        {/* Your Balance Card Overlapping */}
        <div
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            margin: '0 16px',
            marginTop: '-55px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            position: 'relative',
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: '700', color: theme.primaryText, textAlign: 'center', marginBottom: '16px' }}>
            Your Balance: ₹{formatAmount(balance)}
          </span>

          <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', width: '100%' }}>
            {/* Income Pill */}
            <div style={{ flex: 1, borderRadius: '12px', padding: '10px', backgroundColor: '#2F7E79', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', overflow: 'hidden' }}>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Income</span>
              <span style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px', whiteSpace: 'nowrap' }}>
                ₹{formatAmount(totalIncome)}
              </span>
            </div>

            {/* Expenses Pill */}
            <div style={{ flex: 1, borderRadius: '12px', padding: '10px', backgroundColor: '#E05858', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', overflow: 'hidden' }}>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Expenses</span>
              <span style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px', whiteSpace: 'nowrap' }}>
                ₹{formatAmount(totalExpense)}
              </span>
            </div>

            {/* Budget Pill */}
            <div style={{ flex: 1, borderRadius: '12px', padding: '10px', backgroundColor: theme.accent, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', overflow: 'hidden' }}>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>Your Budget</span>
              <span style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px', whiteSpace: 'nowrap' }}>
                ₹{formatAmount(monthlyBudget)}
              </span>
            </div>
          </div>
        </div>

        {/* Total Budget Card */}
        <div
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            margin: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: theme.isDark ? `1px solid ${theme.border}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 8px 20px' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: theme.primaryText }}>Total Budget</span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: theme.primaryText }}>
              ₹{formatAmount(monthlyBudget)}
            </span>
          </div>

          <div style={{ padding: '0 20px' }}>
            <CenteredProgressBar percentage={budgetPercentage} color={theme.accent} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '4px 20px 20px 20px', marginTop: '4px' }}>
            <span style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '500' }}>
              Spent: ₹{formatAmount(budgetUsed)}
            </span>
            <span style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '500' }}>
              Left: ₹{formatAmount(budgetRemaining)}
            </span>
          </div>

          {/* Action Footer Banner */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.accent,
              padding: '14px 0',
              color: COLORS.white,
            }}
          >
            {/* Monthpicker click wrapper */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', cursor: 'pointer' }}>
              <button
                type="button"
                onClick={() => {
                  // showPicker() is the modern API; fallback: click the input directly
                  try {
                    (monthInputRef.current as any)?.showPicker?.();
                  } catch {
                    monthInputRef.current?.click();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                  background: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Icon name="cog" size={18} color="#FFFFFF" />
                <span>Select Month</span>
              </button>
              {/* Hidden native month input — triggered programmatically */}
              <input
                ref={monthInputRef}
                type="month"
                value={monthInputVal}
                onChange={handleMonthYearChange}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                  top: '50%',
                  left: '50%',
                }}
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>

            <div style={{ width: '1px', height: '18px', backgroundColor: '#FFFFFF', opacity: 0.3 }} />

            <div style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <button
                onClick={handleAddBudgetPress}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                  background: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: isPastOrFuture ? 0.5 : 1,
                }}
                className="active-opacity"
              >
                <Icon name="plus-circle-outline" size={18} color="#FFFFFF" />
                <span>Add Budget</span>
              </button>

              {showTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '5%',
                    right: '5%',
                    backgroundColor: theme.isDark ? '#2D2D2D' : '#333333',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    zIndex: 100,
                  }}
                >
                  <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: '600', textAlign: 'center' }}>
                    This feature is enabled only for current month
                  </span>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-6px',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: `6px solid ${theme.isDark ? '#2D2D2D' : '#333333'}`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets list */}
      <div style={{ flex: 1, padding: '0 16px 24px 16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading && categoryBudgets.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: `3px solid ${theme.accent}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        ) : categoryBudgets.length > 0 ? (
          <div
            style={{
              flex: 1,
              borderRadius: '16px',
              backgroundColor: theme.cardBackground,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: theme.isDark ? `1px solid ${theme.border}` : 'none',
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {categoryBudgets.map((catBudget, index) => {
              const spent =
                expensesByCategory.find(
                  e => e.category.toLowerCase() === catBudget.category.toLowerCase(),
                )?.amount ?? 0;
              const remaining = Math.max(catBudget.budgetAmount - spent, 0);
              const percentage =
                catBudget.budgetAmount > 0
                  ? Math.round((spent / catBudget.budgetAmount) * 100)
                  : 0;
              const categoryData = EXPENSE_CATEGORIES.find(
                c => c.name.toLowerCase() === catBudget.category.toLowerCase(),
              );

              return (
                <Swipeable
                  key={catBudget.id}
                  onDelete={() => handleDeleteBudget(catBudget.id)}
                  borderRadius={12}
                  containerStyle={{ marginBottom: index === categoryBudgets.length - 1 ? 0 : '20px' }}
                  swipeEnabled={swipeEnabled}
                  backgroundColor={theme.cardBackground}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '18px',
                            backgroundColor: `${categoryData?.color || theme.accent}15`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Icon
                            name={categoryData?.icon || 'tag-outline'}
                            size={20}
                            color={categoryData?.color || theme.accent}
                          />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.primaryText }}>
                          {catBudget.category}
                        </span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: theme.primaryText }}>
                        ₹{formatAmount(catBudget.budgetAmount)}
                      </span>
                    </div>

                    <CenteredProgressBar percentage={percentage} color={categoryData?.color || theme.accent} />

                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: theme.secondaryText, fontWeight: '500' }}>
                        ₹{formatAmount(spent)}
                      </span>
                      <span style={{ fontSize: '12px', color: theme.secondaryText, fontWeight: '500' }}>
                        ₹{formatAmount(remaining)}
                      </span>
                    </div>
                  </div>
                </Swipeable>
              );
            })}
          </div>
        ) : (
          <div
            onClick={handleAddBudgetPress}
            style={{
              flex: 1,
              backgroundColor: theme.cardBackground,
              borderRadius: '16px',
              margin: '0 16px',
              padding: '40px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: theme.isDark ? `1px solid ${theme.border}` : 'none',
            }}
            className="active-opacity"
          >
            <Icon name="wallet-outline" size={48} color={theme.secondaryText} />
            <span style={{ fontSize: '16px', fontWeight: '700', color: theme.primaryText, marginTop: '12px' }}>
              No budgets set yet
            </span>
            <span style={{ fontSize: '13px', color: theme.secondaryText, textAlign: 'center', marginTop: '4px', lineHeight: '18px' }}>
              Tap "Add Budget" to monitor category limits and expenses.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetScreen;
