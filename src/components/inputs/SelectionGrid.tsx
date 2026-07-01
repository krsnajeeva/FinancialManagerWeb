import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../common/Icon';

interface SelectionGridItem {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface SelectionGridProps {
  items: SelectionGridItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  numColumns?: number;
}

const SelectionGrid: React.FC<SelectionGridProps> = ({
  items,
  selectedId,
  onSelect,
  numColumns = 3,
}) => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
        gap: '8px',
        width: '100%',
        marginBottom: '10px',
      }}
    >
      {items.map((item) => {
        const isSelected = selectedId === item.id || selectedId === item.name;
        const selectedBg = theme.isDark ? 'rgba(255,255,255,0.08)' : `${theme.accent}12`;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '6px 8px',
              borderRadius: '12px',
              border: `1.5px solid ${isSelected ? theme.accent : theme.border}`,
              backgroundColor: isSelected ? selectedBg : theme.cardBackground,
              height: '46px',
              cursor: 'pointer',
              outline: 'none',
              textAlign: 'left',
              gap: '4px',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
            }}
            className="active-opacity"
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: `${item.color}18`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name={item.icon} size={16} color={item.color} />
            </div>
            
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: isSelected ? theme.accent : theme.primaryText,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}
            >
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SelectionGrid;
