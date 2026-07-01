import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface GradientTextProps {
  text: string;
  fontSize?: number;
  fontWeight?: string;
  style?: React.CSSProperties;
  align?: 'left' | 'center' | 'right';
}

const GradientText: React.FC<GradientTextProps> = ({
  text,
  fontSize = 28,
  fontWeight = '800',
  style,
  align = 'center',
}) => {
  const theme = useTheme();
  
  const gradientString = `linear-gradient(90deg, ${theme.primaryGradient.join(', ')})`;

  return (
    <div
      style={{
        textAlign: align,
        width: '100%',
        ...style,
      }}
    >
      <span
        style={{
          background: gradientString,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: `${fontSize}px`,
          fontWeight: fontWeight,
          display: 'inline-block',
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default GradientText;
