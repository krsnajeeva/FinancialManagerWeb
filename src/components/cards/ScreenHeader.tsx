import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../common/Icon';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
  light?: boolean;
  noPadding?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  showBack = true,
  rightIcon,
  onRightPress,
  light = false,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const textColor = light ? COLORS.white : theme.primaryText;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        width: '100%',
      }}
    >
      {showBack ? (
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: 'none',
            background: light ? 'rgba(255, 255, 255, 0.22)' : 'none',
            borderRadius: light ? '20px' : '0px',
            cursor: 'pointer',
            color: textColor,
          }}
          className="active-opacity"
        >
          <Icon name="chevron-left" size={26} color={textColor} />
        </button>
      ) : (
        <div style={{ width: '40px' }} />
      )}

      <span style={{ fontSize: '18px', fontWeight: '700', color: textColor }}>{title}</span>

      {rightIcon ? (
        <button
          onClick={onRightPress}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: textColor,
          }}
          className="active-opacity"
        >
          <Icon name={rightIcon} size={24} color={textColor} />
        </button>
      ) : (
        <div style={{ width: '40px' }} />
      )}
    </div>
  );
};

export default ScreenHeader;
