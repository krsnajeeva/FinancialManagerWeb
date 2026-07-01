import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import {
  setUserName,
  setUserHandle,
  setLoggedIn,
  setUserId,
  setUserEmail,
} from '../../redux/slices/settingsSlice';
import { USE_STATIC_DATA } from '../../config/appConfig';
import { GradientText } from '../../components';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../../components/common/Icon';
import { auth, db } from '../../services/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SUGGESTED_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com', 'Others'];

const SignupScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanDob = dob.trim();
    const cleanPhone = phoneNumber.trim();
    const cleanPassword = password.trim();

    if (!cleanFirst || !cleanLast || !cleanEmail || !cleanDob || !cleanPhone || !cleanPassword) {
      alert('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (cleanPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const fullName = `${cleanFirst} ${cleanLast}`;
    const baseHandle = `@${cleanFirst.toLowerCase()}_${cleanLast.toLowerCase()}`;

    if (USE_STATIC_DATA) {
      setTimeout(() => {
        setLoading(false);
        dispatch(setUserName(fullName));
        dispatch(setUserHandle(baseHandle));
        dispatch(setUserEmail(cleanEmail));
        dispatch(setUserId('lois-becket-id'));
        dispatch(setLoggedIn(true));
        navigate('/home');
      }, 1000);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const firebaseUser = userCredential.user;

      // Add user doc to Firestore users collection
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        id: firebaseUser.uid,
        firstName: cleanFirst,
        lastName: cleanLast,
        email: cleanEmail,
        dob: cleanDob,
        phoneNumber: cleanPhone,
        createdAt: new Date().toISOString(),
        swipeEnabled: true,
      });

      setLoading(false);
      dispatch(setUserName(fullName));
      dispatch(setUserHandle(baseHandle));
      dispatch(setUserEmail(cleanEmail));
      dispatch(setUserId(firebaseUser.uid));
      dispatch(setLoggedIn(true));
      navigate('/home');
    } catch (error: any) {
      setLoading(false);
      let errorMessage = 'Failed to register. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak.';
      }
      alert(errorMessage);
      console.error('Registration error:', error);
    }
  };

  const gradientString = `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1] || '#FFFFFF'} 40%)`;
  const buttonGradient = `linear-gradient(90deg, ${theme.buttonGradient.join(', ')})`;

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        background: gradientString,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '50px 20px 40px 20px',
        alignItems: 'center',
      }}
    >
      {/* Form Card */}
      <form
        onSubmit={handleRegister}
        style={{
          width: '100%',
          backgroundColor: theme.cardBackground,
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          position: 'relative',
          paddingTop: '36px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}
      >
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: theme.primaryText,
          }}
          className="active-opacity"
        >
          <Icon name="arrow-left" size={22} color={theme.primaryText} />
        </button>

        <GradientText text="Sign Up" fontSize={28} fontWeight="800" />

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: '4px', marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', color: theme.secondaryText }}>Already have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0 4px' }}
          >
            <span style={{ fontSize: '13px', color: theme.accent, fontWeight: '700' }}>Login</span>
          </button>
        </div>

        {/* First & Last Name row */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginBottom: '6px' }}>First Name</label>
            <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: '12px', height: '48px', padding: '0 16px', backgroundColor: theme.inputBackground }}>
              <input
                type="text"
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: theme.primaryText, fontSize: '14px', fontWeight: '600' }}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
                required
              />
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginBottom: '6px' }}>Last Name</label>
            <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: '12px', height: '48px', padding: '0 16px', backgroundColor: theme.inputBackground }}>
              <input
                type="text"
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: theme.primaryText, fontSize: '14px', fontWeight: '600' }}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last"
                required
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginTop: '14px', marginBottom: '6px' }}>Email</label>
        <div style={{ zIndex: 100, position: 'relative', width: '100%', marginBottom: '14px' }}>
          <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: '12px', height: '48px', padding: '0 16px', backgroundColor: theme.inputBackground }}>
            <input
              type="email"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: theme.primaryText, fontSize: '14px', fontWeight: '600' }}
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter email"
              autoCapitalize="none"
              required
            />
          </div>

          {showSuggestions && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
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

        {/* Date of Birth Field */}
        <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginBottom: '6px' }}>Date of Birth</label>
        <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: '12px', height: '48px', padding: '0 16px', backgroundColor: theme.inputBackground, marginBottom: '14px' }}>
          <input
            type="date"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              color: theme.primaryText,
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'inherit',
            }}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>

        {/* Phone Number Field */}
        <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginBottom: '6px' }}>Phone Number</label>
        <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: '12px', height: '48px', padding: '0 12px 0 16px', backgroundColor: theme.inputBackground, alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '20px' }}>🇮🇳</span>
            <Icon name="chevron-down" size={16} color={theme.secondaryText} />
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: theme.border, margin: '0 10px' }} />
          <input
            type="tel"
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: theme.primaryText, fontSize: '14px', fontWeight: '600' }}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="(000) 000-0000"
            required
          />
        </div>

        {/* Password Field */}
        <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginBottom: '6px' }}>Set Password</label>
        <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: '12px', height: '48px', padding: '0 16px', backgroundColor: theme.inputBackground, alignItems: 'center', marginBottom: '20px' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: theme.primaryText, fontSize: '14px', fontWeight: '600' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoCapitalize="none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <Icon
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={theme.secondaryText}
            />
          </button>
        </div>

        {/* Register Button */}
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
            'Register'
          )}
        </button>
      </form>
    </div>
  );
};

export default SignupScreen;
