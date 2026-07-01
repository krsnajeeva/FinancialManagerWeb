import React from 'react';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  outlined?: boolean;
  style?: React.CSSProperties;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  outlined = false,
  style,
}) => {
  const theme = useTheme();

  const buttonColor = theme.accent;

  const baseStyle: React.CSSProperties = {
    borderRadius: '12px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
    ...style,
  };

  const filledStyle: React.CSSProperties = {
    backgroundColor: buttonColor,
    color: COLORS.white,
    border: 'none',
  };

  const outlinedStyle: React.CSSProperties = {
    border: `1.5px solid ${buttonColor}`,
    backgroundColor: 'transparent',
    color: buttonColor,
  };

  return (
    <button
      onClick={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      style={{
        ...baseStyle,
        ...(outlined ? outlinedStyle : filledStyle),
      }}
      className={disabled || loading ? "" : "active-opacity"}
    >
      {loading ? (
        <div
          style={{
            width: '20px',
            height: '20px',
            border: `2px solid ${outlined ? buttonColor : COLORS.white}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        title
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default PrimaryButton;
