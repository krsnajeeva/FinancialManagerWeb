import React from 'react';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../common/Icon';

interface CategoryChipProps {
  name: string;
  icon: string;
  color: string;
  selected: boolean;
  onPress: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  name,
  icon,
  color,
  selected,
  onPress,
}) => {
  const theme = useTheme();

  const chipAccentColor = theme.accent;
  const selectedBg = theme.isDark ? 'rgba(255,255,255,0.08)' : `${chipAccentColor}10`;

  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: '20px',
        border: `1.5px solid ${selected ? chipAccentColor : theme.border}`,
        backgroundColor: selected ? selectedBg : theme.cardBackground,
        marginRight: '8px',
        marginBottom: '8px',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.2s ease',
      }}
      className="active-opacity"
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '14px',
          backgroundColor: `${color}20`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: '6px',
        }}
      >
        <Icon name={icon} size={18} color={color} />
      </div>
      <span
        style={{
          fontSize: '12px',
          color: selected ? chipAccentColor : theme.primaryText,
          fontWeight: '500',
        }}
      >
        {name}
      </span>
    </button>
  );
};

export default CategoryChip;
