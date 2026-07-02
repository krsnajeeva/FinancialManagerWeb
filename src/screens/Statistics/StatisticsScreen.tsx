import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { COLORS } from '../../constants/colors';
import { formatAmount } from '../../utils/calculations';
import ScreenHeader from '../../components/cards/ScreenHeader';
import TransactionItem from '../../components/cards/TransactionItem';
import Swipeable from '../../components/common/Swipeable';
import { incomeRepository } from '../../services/incomeRepository';
import { expenseRepository } from '../../services/expenseRepository';
import dayjs from 'dayjs';
import { useTheme } from '../../hooks/useTheme';
import { excelExportService } from '../../utils/excelExport';
import Icon from '../../components/common/Icon';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

type PeriodType = 'Day' | 'Week' | 'Month' | 'Calendar';
type FilterType = 'All' | 'Expense' | 'Income';

const StatisticsScreen: React.FC = () => {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('Month');
  const [filterType, setFilterType] = useState<FilterType>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(dayjs().format('YYYY-MM'));
  const [sortAscending, setSortAscending] = useState<boolean>(false);

  const expenses = useAppSelector(state => state.expense.expenses);
  const incomes = useAppSelector(state => state.income.incomes);
  const swipeEnabled = useAppSelector(state => state.settings.swipeEnabled);

  const handleDeleteTransaction = async (id: string, type: 'income' | 'expense') => {
    try {
      if (type === 'income') {
        await incomeRepository.delete(id);
      } else {
        await expenseRepository.delete(id);
      }
      if (selectedTransactionId === id) {
        setSelectedTransactionId(null);
      }
    } catch (err) {
      console.error('Error deleting transaction in stats:', err);
    }
  };

  const items = useMemo(() => {
    if (filterType === 'All') {
      return [
        ...expenses.map(e => ({ ...e, type: 'expense' as const })),
        ...incomes.map(i => ({ ...i, type: 'income' as const })),
      ];
    }
    return filterType === 'Expense'
      ? expenses.map(e => ({ ...e, type: 'expense' as const }))
      : incomes.map(i => ({ ...i, type: 'income' as const }));
  }, [expenses, incomes, filterType]);

  const chartData = useMemo(() => {
    let rawData = [];
    if (selectedPeriod === 'Day') {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = dayjs().subtract(i, 'day');
        const dateStr = d.format('YYYY-MM-DD');
        const dayTransactions = items.filter(item => dayjs(item.date).format('YYYY-MM-DD') === dateStr);
        const total = dayTransactions.reduce((sum, item) => sum + item.amount, 0);

        data.push({
          value: total,
          label: d.format('DD MMM'),
          transactions: dayTransactions,
        });
      }
      rawData = data;
    } else if (selectedPeriod === 'Week') {
      const startOfWeek = dayjs().startOf('week');
      const data = [];
      for (let i = 0; i < 7; i++) {
        const d = startOfWeek.add(i, 'day');
        const dateStr = d.format('YYYY-MM-DD');
        const dayTransactions = items.filter(item => dayjs(item.date).format('YYYY-MM-DD') === dateStr);
        const total = dayTransactions.reduce((sum, item) => sum + item.amount, 0);

        data.push({
          value: total,
          label: d.format('ddd'),
          transactions: dayTransactions,
        });
      }
      rawData = data;
    } else if (selectedPeriod === 'Month') {
      const selectedDateObj = dayjs(selectedMonthYear);
      const daysInMonth = selectedDateObj.daysInMonth();
      const data = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const d = selectedDateObj.date(day);
        const dateStr = d.format('YYYY-MM-DD');
        const dayTransactions = items.filter(item => dayjs(item.date).format('YYYY-MM-DD') === dateStr);
        const total = dayTransactions.reduce((sum, item) => sum + item.amount, 0);
        const shouldShowLabel = day === 1 || day % 5 === 0 || day === daysInMonth;

        data.push({
          value: total,
          label: shouldShowLabel ? d.format('D MMM') : '',
          transactions: dayTransactions,
        });
      }
      rawData = data;
    } else {
      // selectedPeriod === 'Calendar'
      const centerDate = dayjs(selectedCalendarDate);
      const data = [];
      for (let i = -3; i <= 3; i++) {
        const d = centerDate.add(i, 'day');
        const dateStr = d.format('YYYY-MM-DD');
        const dayTransactions = items.filter(item => dayjs(item.date).format('YYYY-MM-DD') === dateStr);
        const total = dayTransactions.reduce((sum, item) => sum + item.amount, 0);

        data.push({
          value: total,
          label: d.format('DD MMM'),
          transactions: dayTransactions,
        });
      }
      rawData = data;
    }

    return rawData;
  }, [items, selectedPeriod, selectedCalendarDate, selectedMonthYear]);

  const filteredTransactions = useMemo(() => {
    return items.filter(item => {
      const itemDate = dayjs(item.date);

      if (selectedPeriod === 'Day') {
        return itemDate.isSame(dayjs(), 'day');
      }

      if (selectedPeriod === 'Week') {
        const startOfWeek = dayjs().startOf('week');
        const endOfWeek = dayjs().endOf('week');
        return (
          itemDate.isAfter(startOfWeek.subtract(1, 'second')) &&
          itemDate.isBefore(endOfWeek.add(1, 'second'))
        );
      }

      if (selectedPeriod === 'Month') {
        const selectedDateObj = dayjs(selectedMonthYear);
        return itemDate.month() === selectedDateObj.month() && itemDate.year() === selectedDateObj.year();
      }

      // selectedPeriod === 'Calendar'
      const centerDate = dayjs(selectedCalendarDate);
      return itemDate.isSame(centerDate, 'day');
    });
  }, [items, selectedPeriod, selectedCalendarDate, selectedMonthYear]);

  const topSpending = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => sortAscending ? a.amount - b.amount : b.amount - a.amount)
      .slice(0, 5);
  }, [filteredTransactions, sortAscending]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const netBalance = totalIncome - totalExpense;

  const handleExportExcel = () => {
    const periodStr = selectedPeriod;
    let dateScopeStr = '';

    if (selectedPeriod === 'Day') {
      dateScopeStr = dayjs().format('DD MMMM YYYY');
    } else if (selectedPeriod === 'Week') {
      const startOfWeek = dayjs().startOf('week').format('DD MMM');
      const endOfWeek = dayjs().endOf('week').format('DD MMM YYYY');
      dateScopeStr = `${startOfWeek} - ${endOfWeek}`;
    } else if (selectedPeriod === 'Month') {
      dateScopeStr = dayjs(selectedMonthYear).format('MMMM YYYY');
    } else {
      dateScopeStr = dayjs(selectedCalendarDate).format('DD MMMM YYYY');
    }

    excelExportService.exportStatistics({
      transactions: filteredTransactions,
      filters: {
        period: periodStr,
        dateScope: dateScopeStr,
        transactionType: filterType,
      },
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
      },
    });
  };

  const hasChartData = useMemo(() => {
    return chartData.some(d => d.value > 0);
  }, [chartData]);

  const emptyListMessage = useMemo(() => {
    if (selectedPeriod === 'Day') return 'No transactions found for today.';
    if (selectedPeriod === 'Week') return 'No transactions found for this week.';
    if (selectedPeriod === 'Month') {
      return `No transactions found for ${dayjs(selectedMonthYear).format('MMMM YYYY')}.`;
    }
    return `No transactions found for ${dayjs(selectedCalendarDate).format('DD MMMM YYYY')}.`;
  }, [selectedPeriod, selectedCalendarDate, selectedMonthYear]);

  const periods: PeriodType[] = ['Day', 'Week', 'Month', 'Calendar'];

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
      <ScreenHeader
        title="Statistics"
        showBack={false}
        rightIcon="download-outline"
        onRightPress={handleExportExcel}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Period Tabs */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            margin: '12px 16px 0 16px',
            backgroundColor: theme.inputBackground,
            borderRadius: '8px',
            padding: '4px',
            gap: '6px',
          }}
        >
          {periods.map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedPeriod === period ? theme.accent : 'transparent',
                color: selectedPeriod === period ? '#FFFFFF' : theme.secondaryText,
                fontSize: '14px',
                fontWeight: selectedPeriod === period ? '700' : '500',
                transition: 'all 0.2s ease',
              }}
              className="active-opacity"
            >
              {period}
            </button>
          ))}
        </div>

        {/* Date Selector Indicator & Dropdown Filters */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: '0 20px', marginTop: '16px', gap: '10px', position: 'relative', zIndex: 100 }}>
          
          {selectedPeriod === 'Calendar' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: `1.5px solid ${theme.accent}`, borderRadius: '10px', padding: '6px 12px', backgroundColor: 'rgba(47, 126, 121, 0.05)', color: theme.accent }}>
              <Icon name="calendar" size={16} color={theme.accent} />
              <input
                type="date"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: theme.accent,
                  fontSize: '13px',
                  fontWeight: '600',
                  outline: 'none',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
                value={selectedCalendarDate}
                onChange={(e) => setSelectedCalendarDate(e.target.value)}
              />
            </div>
          )}

          {selectedPeriod === 'Month' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: `1.5px solid ${theme.accent}`, borderRadius: '10px', padding: '6px 12px', backgroundColor: 'rgba(47, 126, 121, 0.05)', color: theme.accent }}>
              <Icon name="calendar" size={16} color={theme.accent} />
              <input
                type="month"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: theme.accent,
                  fontSize: '13px',
                  fontWeight: '600',
                  outline: 'none',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
                value={selectedMonthYear}
                onChange={(e) => setSelectedMonthYear(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '6px',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              padding: '8px 16px',
              backgroundColor: theme.inputBackground,
              cursor: 'pointer',
              outline: 'none',
              fontSize: '13px',
              fontWeight: '600',
              color: theme.primaryText,
            }}
            className="active-opacity"
          >
            <span>{filterType}</span>
            <Icon name="chevron-down" size={18} color={theme.accent} />
          </button>

          {/* Floating Dropdown Menu */}
          {showFilterDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '42px',
                right: '20px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.cardBackground,
                borderRadius: '12px',
                padding: '6px 0',
                width: '120px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 110,
              }}
            >
              {(['All', 'Expense', 'Income'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type);
                    setShowFilterDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: filterType === type ? (theme.isDark ? '#2D2D2D' : '#F4F7FF') : 'transparent',
                    color: filterType === type ? theme.accent : theme.primaryText,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    outline: 'none',
                  }}
                  className="active-opacity"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chart Section */}
        {hasChartData ? (
          <div
            style={{
              height: '220px',
              margin: '20px 16px',
              padding: '16px',
              backgroundColor: theme.cardBackground,
              borderRadius: '16px',
              border: theme.isDark ? `1px solid ${theme.border}` : 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.accent} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={theme.accent} stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: theme.secondaryText, fontSize: '9px' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const txs = data.transactions || [];
                      const text = txs.length === 0
                        ? 'No transactions'
                        : txs.length === 1
                          ? txs[0].category
                          : `${txs[0].category} & ${txs.length - 1} more`;

                      return (
                        <div
                          style={{
                            backgroundColor: theme.cardBackground,
                            border: `1.5px solid ${theme.accent}`,
                            borderRadius: '10px',
                            padding: '8px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: theme.secondaryText, fontWeight: '500' }}>{text}</span>
                          <span style={{ fontSize: '13px', color: theme.accent, fontWeight: '700', marginTop: '2px' }}>
                            ₹{formatAmount(data.value)}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={theme.accent}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            style={{
              height: '200px',
              margin: '20px 16px',
              border: `1px dashed ${theme.border}`,
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0 32px',
              backgroundColor: theme.isDark ? theme.cardBackground : '#FAFAFA',
            }}
          >
            <Icon name="chart-line-variant" size={48} color={theme.secondaryText} />
            <span style={{ fontSize: '16px', fontWeight: '700', color: theme.primaryText, marginTop: '12px' }}>
              No spending data available
            </span>
            <span style={{ fontSize: '13px', color: theme.secondaryText, textAlign: 'center', marginTop: '4px', lineHeight: '18px' }}>
              Add transactions to view your statistics charts.
            </span>
          </div>
        )}

        {/* Top Spending header */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginTop: '16px', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: theme.primaryText }}>Top Spending</span>
          <button
            onClick={() => setSortAscending(!sortAscending)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '8px', color: theme.accent }}
            className="active-opacity"
          >
            <Icon name={sortAscending ? "sort-numeric-ascending" : "sort-numeric-descending"} size={22} color={theme.accent} />
          </button>
        </div>

      {/* Scrollable list container */}
      <div style={{ flex: 1, padding: '0 16px 24px 16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {topSpending.length > 0 ? (
          <div
            style={{
              flex: 1,
              borderRadius: '16px',
              backgroundColor: theme.cardBackground,
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: theme.isDark ? `1px solid ${theme.border}` : 'none',
              padding: '4px 0',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {topSpending.map((item, index) => {
              const isSelected = item.id === selectedTransactionId;
              return (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', width: '100%', flexShrink: 0 }}>
                  <Swipeable
                    onDelete={() => handleDeleteTransaction(item.id, item.type)}
                    borderRadius={12}
                    swipeEnabled={swipeEnabled}
                    backgroundColor={isSelected ? theme.accent : theme.cardBackground}
                  >
                    <TransactionItem
                      category={item.category}
                      description={item.description}
                      date={item.date}
                      amount={item.amount}
                      type={item.type}
                      selected={isSelected}
                      onPress={() => {
                        setSelectedTransactionId(
                          item.id === selectedTransactionId ? null : item.id
                        );
                      }}
                    />
                  </Swipeable>
                  {index < topSpending.length - 1 && (
                    <div style={{ height: '1px', backgroundColor: theme.border, margin: '0 16px' }} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '32px 0',
              borderRadius: '16px',
              border: `1px solid ${theme.border}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.isDark ? theme.cardBackground : '#FAFAFA',
            }}
          >
            <Icon name="alert-circle-outline" size={36} color={theme.secondaryText} />
            <span style={{ fontSize: '14px', color: theme.secondaryText, marginTop: '8px' }}>
              {emptyListMessage}
            </span>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default StatisticsScreen;
