import React from 'react';
import { COLORS } from '../../constants/colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import { formatDate } from '../../utils/date';
import { formatAmount } from '../../utils/calculations';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../common/Icon';

interface TransactionItemProps {
  category: string;
  description: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  selected?: boolean;
  onPress?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  category,
  description,
  date,
  amount,
  type,
  selected = false,
  onPress,
}) => {
  const theme = useTheme();
  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  const categoryData = allCategories.find(
    c => c.name.toLowerCase() === category.toLowerCase(),
  );
  const iconName = categoryData?.icon || 'cash';
  const iconColor = categoryData?.color || theme.secondaryText;

  // We append 15 for 8% opacity in hex for background, or standard rgba
  const bgOpacityColor = `${iconColor}15`;

  return (
    <div
      onClick={onPress}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: '12px',
        cursor: onPress ? 'pointer' : 'default',
        backgroundColor: selected ? theme.accent : 'transparent',
        transition: 'background-color 0.2s ease',
      }}
      className={onPress ? "active-opacity" : ""}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '24px',
          backgroundColor: selected ? 'rgba(255, 255, 255, 0.2)' : bgOpacityColor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={iconName} size={24} color={selected ? COLORS.white : iconColor} />
      </div>

      <div style={{ flex: 1, marginLeft: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <span
          style={{
            fontSize: '15px',
            fontWeight: '600',
            color: selected ? COLORS.white : theme.primaryText,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {description || category}
        </span>
        <span
          style={{
            fontSize: '13px',
            marginTop: '2px',
            color: selected ? 'rgba(255, 255, 255, 0.8)' : theme.secondaryText,
          }}
        >
          {formatDate(date)}
        </span>
      </div>

      <span
        style={{
          fontSize: '16px',
          fontWeight: '600',
          flexShrink: 0,
          color: selected ? COLORS.white : (type === 'income' ? COLORS.income : COLORS.expense),
        }}
      >
        {type === 'income' ? '+' : '-'} ₹ {formatAmount(amount)}
      </span>
    </div>
  );
};

export default TransactionItem;
