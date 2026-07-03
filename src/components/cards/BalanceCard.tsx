import React from 'react';
import { COLORS } from '../../constants/colors';
import { formatAmount } from '../../utils/calculations';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../common/Icon';

interface BalanceCardProps {
  totalBalance: number;
  income: number;
  expenses: number;
  onMenuPress?: () => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  income,
  expenses,
  onMenuPress,
}) => {
  const theme = useTheme();
  const [isBalanceHidden, setIsBalanceHidden] = React.useState(true);

  // Convert array colors list to CSS linear-gradient string
  const gradientString = `linear-gradient(135deg, ${theme.primaryGradient.join(', ')})`;

  return (
    <div
      style={{
        margin: '0 16px',
        borderRadius: '20px',
        boxShadow: '0 10px 20px rgba(15, 48, 45, 0.15)',
        backgroundColor: theme.primaryGradient[0],
        overflow: 'hidden',
        background: gradientString,
        color: COLORS.white,
      }}
    >
      {/* Top section with balance */}
      <div style={{ padding: '22px 20px 24px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setIsBalanceHidden(!isBalanceHidden)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              background: 'none',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            className="active-opacity"
          >
            <span>Total Balance</span>
            <Icon name={isBalanceHidden ? 'chevron-down' : 'chevron-up'} size={18} color="rgba(255,255,255,0.85)" />
          </button>
          
          <button
            onClick={onMenuPress}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: COLORS.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="active-opacity"
          >
            <Icon name="dots-horizontal" size={24} color={COLORS.white} />
          </button>
        </div>

        <span
          style={{
            fontSize: '32px',
            fontWeight: '700',
            marginTop: '10px',
            letterSpacing: '0.3px',
          }}
        >
          {isBalanceHidden ? '***' : `₹ ${formatAmount(totalBalance)}`}
        </span>
      </div>

      {/* Bottom section with income/expenses */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          padding: '18px 20px',
          backgroundColor: 'rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Income */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255,255,255,0.18)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="arrow-down" size={14} color="#48C78E" />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: '500' }}>Income</span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '700' }}>
            {isBalanceHidden ? '***' : `₹ ${formatAmount(income)}`}
          </span>
        </div>

        {/* Expenses */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255,255,255,0.18)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="arrow-up" size={14} color="#FF6D6D" />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: '500' }}>Expenses</span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '700' }}>
            {isBalanceHidden ? '***' : `₹ ${formatAmount(expenses)}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
