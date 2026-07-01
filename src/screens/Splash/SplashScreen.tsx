import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../../components/common/Icon';

const SplashScreen: React.FC = () => {
  const theme = useTheme();

  // Background gradient matching active theme
  const splashColors = theme.isDark ? theme.bgGradient : theme.primaryGradient;
  const gradientString = `linear-gradient(180deg, ${splashColors.join(', ')})`;
  
  const floatingIconColor = theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(31, 41, 55, 0.08)';
  const titleColor = theme.isDark ? '#FFFFFF' : theme.primaryText;

  // Floating background outline icons positions
  const floatingIcons = [
    { name: 'wallet-outline', size: 36, top: '15%', left: '10%' },
    { name: 'chart-pie', size: 40, top: '22%', right: '15%' },
    { name: 'credit-card-outline', size: 36, top: '38%', right: '8%' },
    { name: 'chart-bar', size: 38, bottom: '28%', left: '10%' },
    { name: 'piggy-bank-outline', size: 38, bottom: '20%', right: '12%' },
  ];

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: gradientString,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating Icons */}
      {floatingIcons.map((ico, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: ico.top,
            left: ico.left,
            right: ico.right,
            bottom: ico.bottom,
            pointerEvents: 'none',
          }}
        >
          <Icon name={ico.name} size={ico.size} color={floatingIconColor} />
        </div>
      ))}

      {/* Center Logo Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        {/* Logo Circles */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '60px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50px',
              backgroundColor: theme.cardBackground,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Custom Bar Chart Vector Logo Container */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '4px',
              }}
            >
              {/* Towers row */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ width: '8px', height: '18px', borderRadius: '2px', backgroundColor: theme.accent }} />
                <div style={{ width: '8px', height: '28px', borderRadius: '2px', backgroundColor: theme.accent }} />
                
                {/* Tower 3 with custom up arrow */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '8px' }}>
                  {/* Custom Arrowhead & Stem */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '16px',
                      height: '18px',
                      position: 'relative',
                      marginBottom: '-1px',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderTop: `2px solid ${theme.accent}`,
                        borderLeft: `2px solid ${theme.accent}`,
                        transform: 'rotate(45deg)',
                        position: 'absolute',
                        top: '2px',
                      }}
                    />
                    <div
                      style={{
                        width: '2px',
                        height: '10px',
                        backgroundColor: theme.accent,
                        position: 'absolute',
                        bottom: '1px',
                      }}
                    />
                  </div>
                  <div style={{ width: '8px', height: '38px', borderRadius: '2px', backgroundColor: theme.accent }} />
                </div>
              </div>
              
              {/* Bottom Baseline */}
              <div
                style={{
                  width: '44px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: theme.accent,
                  marginTop: '4px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Title Text */}
        <h1
          style={{
            fontSize: '40px',
            fontWeight: '800',
            textAlign: 'center',
            lineHeight: '46px',
            letterSpacing: '0.5px',
            color: titleColor,
          }}
        >
          Financial
        </h1>
        <h1
          style={{
            fontSize: '40px',
            fontWeight: '800',
            textAlign: 'center',
            lineHeight: '46px',
            letterSpacing: '0.5px',
            color: titleColor,
          }}
        >
          Manager
        </h1>

        {/* Underline Divider */}
        <div
          style={{
            width: '80px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: theme.accent,
            marginTop: '16px',
          }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
