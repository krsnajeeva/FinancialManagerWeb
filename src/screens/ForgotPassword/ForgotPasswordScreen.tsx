import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { USE_STATIC_DATA } from '../../config/appConfig';
import { GradientText } from '../../components';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../../components/common/Icon';
import ScreenHeader from '../../components/cards/ScreenHeader';
import { auth, db } from '../../services/firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const SUGGESTED_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com', 'Others'];

const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [code, setCode] = useState<string[]>(['', '', '', '', '']);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setEmail(text);
    if (text.endsWith('@')) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectDomain = (domain: string) => {
    if (domain === 'Others') {
      setShowSuggestions(false);
    } else {
      setEmail(email + domain);
      setShowSuggestions(false);
    }
  };

  const getMaskedEmail = (rawEmail: string) => {
    const parts = rawEmail.split('@');
    if (parts.length !== 2) return rawEmail;
    const name = parts[0];
    const domain = parts[1];
    
    let maskedName = name;
    if (name.length > 3) {
      maskedName = name.substring(0, 3) + '...';
    }
    
    let maskedDomain = domain;
    const domainParts = domain.split('.');
    if (domainParts.length >= 2) {
      const mainDomain = domainParts[0];
      const tld = domainParts.slice(1).join('.');
      if (mainDomain.length > 3) {
        maskedDomain = mainDomain.substring(0, 3) + '...' + '.' + tld;
      }
    }
    return `${maskedName}@${maskedDomain}`;
  };

  const handleResetRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      alert('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    if (USE_STATIC_DATA) {
      setTimeout(() => {
        setLoading(false);
        alert('For testing purposes, your 5-digit verification code is: 12345');
        setStep(2);
      }, 1000);
      return;
    }

    try {
      // Check if email exists in users collection
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setLoading(false);
        alert('No account is registered with this email address.');
        return;
      }

      // Send real password reset email
      await sendPasswordResetEmail(auth, cleanEmail);

      setLoading(false);
      alert('We have sent a password reset link to your email. For testing the verification UI, your 5-digit code is: 12345');
      setStep(2);
    } catch (error: any) {
      setLoading(false);
      let errorMessage = 'Failed to request password reset. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }
      alert(errorMessage);
      console.error('Reset request error:', error);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = cleanText;
    setCode(newCode);

    // Auto focus next box if character is typed
    if (cleanText.length > 0 && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 5) {
      alert('Please enter all 5 digits of the code.');
      return;
    }

    if (fullCode === '12345') {
      alert('Verification successful! A password reset link has been sent to your email.');
      navigate('/login');
    } else {
      alert('The verification code you entered is incorrect. Try again.');
    }
  };

  const handleResendCode = () => {
    setCode(['', '', '', '', '']);
    alert('Your 5-digit verification code has been resent: 12345');
  };

  const headerColors = theme.primaryGradient;
  const gradientString = `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1] || '#FFFFFF'} 40%)`;
  const buttonGradient = `linear-gradient(90deg, ${theme.buttonGradient.join(', ')})`;

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: theme.background,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Gradient Header with Back Button */}
      <div
        style={{
          background: `linear-gradient(90deg, ${headerColors.join(', ')})`,
          overflow: 'hidden',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
          paddingBottom: '8px',
        }}
      >
        <ScreenHeader title="Forgot Password" light showBack={true} />
      </div>

      <div
        style={{
          flex: 1,
          background: gradientString,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px 40px 20px',
          alignItems: 'center',
        }}
      >
        {/* Form Card */}
        <div
          style={{
            width: '100%',
            backgroundColor: theme.cardBackground,
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
          }}
        >
          <GradientText text="Forgot Password" fontSize={28} fontWeight="800" style={{ marginBottom: '20px' }} />

          {step === 1 ? (
            /* Step 1: Email Form */
            <form onSubmit={handleResetRequest} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <span
                style={{
                  fontSize: '13px',
                  color: theme.secondaryText,
                  textAlign: 'center',
                  marginBottom: '24px',
                  lineHeight: '18px',
                }}
              >
                Please enter your email to reset the password
              </span>

              <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginBottom: '8px' }}>
                Email
              </label>
              <div style={{ zIndex: 100, position: 'relative', width: '100%', marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    height: '50px',
                    padding: '0 16px',
                    backgroundColor: theme.inputBackground,
                    boxSizing: 'border-box',
                    width: '100%',
                  }}
                >
                  <input
                    type="email"
                    style={{
                      flex: 1,
                      fontSize: '14px',
                      color: theme.primaryText,
                      fontWeight: '600',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                    }}
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    autoCapitalize="none"
                    required
                  />
                </div>

                {showSuggestions && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '52px',
                      left: 0,
                      right: 0,
                      backgroundColor: theme.cardBackground,
                      borderRadius: '12px',
                      border: `1px solid ${theme.border}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      padding: '4px 0',
                    }}
                  >
                    {SUGGESTED_DOMAINS.map((domain, index) => (
                      <div key={domain}>
                        <button
                          type="button"
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '10px 16px',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                          onClick={() => handleSelectDomain(domain)}
                          className="active-opacity"
                        >
                          <span style={{ fontSize: '14px', color: theme.primaryText, fontWeight: '500' }}>
                            {domain === 'Others' ? 'Others' : `${email}${domain}`}
                          </span>
                          <Icon
                            name={domain === 'Others' ? 'pencil-outline' : 'email-outline'}
                            size={16}
                            color={theme.secondaryText}
                          />
                        </button>
                        {index < SUGGESTED_DOMAINS.length - 1 && (
                          <div style={{ height: '1px', backgroundColor: theme.border }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '12px',
                  border: 'none',
                  background: buttonGradient,
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                className={loading ? "" : "active-opacity"}
              >
                {loading ? (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #FFFFFF',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Verification Code Form */
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <span
                style={{
                  fontSize: '13px',
                  color: theme.secondaryText,
                  textAlign: 'center',
                  marginBottom: '16px',
                  lineHeight: '18px',
                  padding: '0 10px',
                }}
              >
                We sent a reset link to{' '}
                <span style={{ fontWeight: '700', color: theme.primaryText }}>{getMaskedEmail(email)}</span>
                <br />
                enter 5 digit code that mentioned in the email
              </span>

              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: theme.primaryText,
                  textAlign: 'center',
                  marginBottom: '16px',
                }}
              >
                Check your email
              </span>

              {/* 5 digit boxes */}
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '8px', marginBottom: '28px' }}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(ref) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    style={{
                      flex: 1,
                      height: '50px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '12px',
                      backgroundColor: theme.inputBackground,
                      fontSize: '20px',
                      fontWeight: '700',
                      color: theme.primaryText,
                      textAlign: 'center',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '12px',
                  border: 'none',
                  background: buttonGradient,
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                className="active-opacity"
              >
                Verify Code
              </button>

              {/* Resend Link */}
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                <span style={{ fontSize: '13px', color: theme.secondaryText }}>Haven’t got the email yet? </span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0 4px' }}
                >
                  <span style={{ fontSize: '13px', color: theme.accent, fontWeight: '700', textDecoration: 'underline' }}>
                    Resend email
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
