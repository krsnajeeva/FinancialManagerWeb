import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { setOnboarded } from '../../redux/slices/settingsSlice';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../../components/common/Icon';

const OnboardingScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleGetStarted = () => {
    dispatch(setOnboarded(true));
    navigate('/login');
  };

  const bgGradient = `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1] || '#FFFFFF'} 55%)`;
  const buttonGradient = `linear-gradient(90deg, ${theme.buttonGradient.join(', ')})`;

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '60px 0 40px 0',
        background: bgGradient,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Juggling Illustration Area */}
      <div
        style={{
          display: 'flex',
          flex: 1.2,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Circular Rings Background */}
        <div
          style={{
            width: '290px',
            height: '290px',
            borderRadius: '145px',
            border: `1.5px solid ${theme.accent}14`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
          }}
        >
          <div
            style={{
              width: '210px',
              height: '210px',
              borderRadius: '105px',
              border: `1.5px solid ${theme.accent}22`,
            }}
          />
        </div>

        {/* Floating Coin Bubble */}
        <div
          style={{
            position: 'absolute',
            width: '54px',
            height: '54px',
            borderRadius: '27px',
            backgroundColor: theme.accent,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 3px 5px rgba(0,0,0,0.15)',
            zIndex: 5,
            left: '16%',
            top: '32%',
          }}
        >
          <Icon name="currency-usd" size={32} color="#FFFFFF" />
        </div>

        {/* Floating Pie Bubble */}
        <div
          style={{
            position: 'absolute',
            width: '54px',
            height: '54px',
            borderRadius: '27px',
            backgroundColor: theme.cardBackground,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 3px 5px rgba(0,0,0,0.15)',
            zIndex: 5,
            right: '16%',
            top: '34%',
            overflow: 'hidden',
          }}
        >
          {/* Sector representation */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '19px',
              borderWidth: '9px',
              borderStyle: 'solid',
              borderColor: '#26C6DA #FFCA28 #EC407A #EC407A',
              transform: 'rotate(35deg)',
            }}
          />
        </div>

        {/* Character representation */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1,
            marginTop: '40px',
          }}
        >
          {/* Hair/Beard */}
          <div
            style={{
              width: '58px',
              height: '24px',
              backgroundColor: '#795548',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              marginBottom: '-6px',
            }}
          />
          {/* Face */}
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '26px',
              backgroundColor: '#FFCCBC',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '10px',
            }}
          >
            {/* Glasses */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
              <div
                style={{
                  width: '16px',
                  height: '12px',
                  borderRadius: '6px',
                  border: '2px solid #4E342E',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }}
              />
              <div
                style={{
                  width: '16px',
                  height: '12px',
                  borderRadius: '6px',
                  border: '2px solid #4E342E',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>
            {/* Beard mouth */}
            <div
              style={{
                width: '32px',
                height: '18px',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
                backgroundColor: '#795548',
                marginTop: '6px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '6px',
                  borderBottomLeftRadius: '7px',
                  borderBottomRightRadius: '7px',
                  backgroundColor: '#FFFFFF',
                }}
              />
            </div>
          </div>
          {/* Shirt */}
          <div
            style={{
              width: '64px',
              height: '50px',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px',
              marginTop: '2px',
              backgroundColor: theme.accent,
            }}
          />
          {/* Legs */}
          <div
            style={{
              width: '48px',
              height: '50px',
              backgroundColor: '#3F51B5',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
            }}
          />
        </div>
      </div>

      {/* Text and Actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 0.8,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          padding: '0 24px',
        }}
      >
        <span
          style={{
            fontSize: '34px',
            fontWeight: '800',
            textAlign: 'center',
            lineHeight: '40px',
            letterSpacing: '-0.5px',
            color: theme.primaryText,
          }}
        >
          Spend Smarter
        </span>
        <span
          style={{
            fontSize: '34px',
            fontWeight: '800',
            textAlign: 'center',
            lineHeight: '40px',
            letterSpacing: '-0.5px',
            color: theme.primaryText,
            marginBottom: '10px',
          }}
        >
          Save More
        </span>

        <button
          onClick={handleGetStarted}
          style={{
            width: '85%',
            marginTop: '40px',
            height: '54px',
            borderRadius: '27px',
            border: 'none',
            background: buttonGradient,
            color: '#FFFFFF',
            fontSize: '18px',
            fontWeight: '700',
            letterSpacing: '0.3px',
            cursor: 'pointer',
            boxShadow: '0 6px 10px rgba(0, 0, 0, 0.28)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'transform 0.1s ease',
          }}
          className="active-opacity"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
