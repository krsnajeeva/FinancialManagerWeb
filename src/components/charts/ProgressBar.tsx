import React from 'react';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';

interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color,
  height = 10,
  showLabel = true,
}) => {
  const theme = useTheme();
  const barColor = color || theme.accent;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', width: '100%' }}>
      <div
        style={{
          flex: 1,
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : COLORS.divider,
          borderRadius: '5px',
          overflow: 'hidden',
          height: `${height}px`,
        }}
      >
        <div
          style={{
            width: `${clampedPercentage}%`,
            backgroundColor: barColor,
            height: `${height}px`,
            borderRadius: '5px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: '12px',
            fontWeight: '600',
            minWidth: '35px',
            textAlign: 'right',
            color: barColor,
          }}
        >
          {Math.round(clampedPercentage)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
