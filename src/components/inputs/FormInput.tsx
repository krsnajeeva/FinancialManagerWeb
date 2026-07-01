import React from 'react';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerStyle?: React.CSSProperties;
}

const FormInput: React.FC<FormInputProps> = ({ label, error, containerStyle, style, ...props }) => {
  const theme = useTheme();

  return (
    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', width: '100%', ...containerStyle }}>
      <span
        style={{
          fontSize: '13px',
          color: theme.secondaryText,
          marginBottom: '8px',
          fontWeight: '500',
        }}
      >
        {label}
      </span>
      <input
        style={{
          border: `1px solid ${error ? COLORS.error : theme.border}`,
          borderRadius: '12px',
          padding: '14px 16px',
          fontSize: '15px',
          color: theme.primaryText,
          backgroundColor: theme.inputBackground,
          outline: 'none',
          boxSizing: 'border-box',
          width: '100%',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span
          style={{
            fontSize: '12px',
            color: COLORS.error,
            marginTop: '4px',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
