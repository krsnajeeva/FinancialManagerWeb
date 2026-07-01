import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import {
  setUserName,
  setUserHandle,
  setLoggedIn,
  setUserId,
  setUserEmail,
  setSwipeEnabled,
} from '../../redux/slices/settingsSlice';
import { USE_STATIC_DATA } from '../../config/appConfig';
import { GradientText } from '../../components';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../../components/common/Icon';
import { auth, db } from '../../services/firebase/config';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SUGGESTED_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com', 'Others'];

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadRememberedCredentials = () => {
      try {
        const rememberState = localStorage.getItem('@remember_me');
        if (rememberState === 'true') {
          const savedEmail = localStorage.getItem('@remembered_email');
          const savedPassword = localStorage.getItem('@remembered_password');
          if (savedEmail) setEmail(savedEmail);
          if (savedPassword) setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (err) {
        console.error('Failed to load remembered credentials:', err);
      }
    };
    loadRememberedCredentials();
  }, []);

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

  const saveRememberedCredentials = (cleanEmail: string, cleanPassword: string) => {
    try {
      if (rememberMe) {
        localStorage.setItem('@remember_me', 'true');
        localStorage.setItem('@remembered_email', cleanEmail);
        localStorage.setItem('@remembered_password', cleanPassword);
      } else {
        localStorage.setItem('@remember_me', 'false');
      }
    } catch (err) {
      console.error('Failed to save remember credentials:', err);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      alert('Please enter both email and password.');
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

    if (USE_STATIC_DATA) {
      // Offline mock login flow
      setTimeout(() => {
        saveRememberedCredentials(cleanEmail, cleanPassword);
        setLoading(false);
        dispatch(setUserName('Lois Becket'));
        dispatch(setUserHandle('@lois_becket'));
        dispatch(setUserEmail('loisbecket@gmail.com'));
        dispatch(setUserId('lois-becket-id'));
        dispatch(setLoggedIn(true));
        navigate('/home');
      }, 1000);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const firebaseUser = userCredential.user;

      // Fetch user details from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let fullName = 'User';
      let baseHandle = '@user';
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData) {
          fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
          baseHandle = `@${(userData.firstName || 'user').toLowerCase()}_${(userData.lastName || '').toLowerCase()}`;
          if (userData.swipeEnabled !== undefined) {
            dispatch(setSwipeEnabled(userData.swipeEnabled));
          }
        }
      }

      saveRememberedCredentials(cleanEmail, cleanPassword);
      setLoading(false);
      dispatch(setUserName(fullName));
      dispatch(setUserHandle(baseHandle));
      dispatch(setUserEmail(firebaseUser.email || cleanEmail));
      dispatch(setUserId(firebaseUser.uid));
      dispatch(setLoggedIn(true));
      navigate('/home');
    } catch (error: any) {
      setLoading(false);
      let errorMessage = 'Failed to log in. Please check your credentials and connection.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      }
      alert(errorMessage);
      console.error('Login error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    if (USE_STATIC_DATA) {
      setTimeout(() => {
        setLoading(false);
        dispatch(setUserName('Lois Becket'));
        dispatch(setUserHandle('@lois_becket'));
        dispatch(setUserEmail('loisbecket@gmail.com'));
        dispatch(setUserId('lois-becket-id'));
        dispatch(setLoggedIn(true));
        navigate('/home');
      }, 1000);
      return;
    }

    try {
      const userCredential = await signInAnonymously(auth);
      const firebaseUser = userCredential.user;

      // Sync user profile to Firestore under their real uid
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let fullName = 'Lois Becket';
      let baseHandle = '@lois_becket';
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          firstName: 'Lois',
          lastName: 'Becket',
          email: 'loisbecket@gmail.com',
          phone: '',
          dob: '',
          createdAt: new Date().toISOString(),
          swipeEnabled: true,
        });
      } else {
        const userData = userDoc.data();
        if (userData) {
          fullName = `${userData.firstName || 'Lois'} ${userData.lastName || 'Becket'}`.trim();
          baseHandle = `@${(userData.firstName || 'lois').toLowerCase()}_${(userData.lastName || 'becket').toLowerCase()}`;
          if (userData.swipeEnabled !== undefined) {
            dispatch(setSwipeEnabled(userData.swipeEnabled));
          }
        }
      }

      setLoading(false);
      dispatch(setUserName(fullName));
      dispatch(setUserHandle(baseHandle));
      dispatch(setUserEmail('loisbecket@gmail.com'));
      dispatch(setUserId(firebaseUser.uid));
      dispatch(setLoggedIn(true));
      navigate('/home');
    } catch (error: any) {
      setLoading(false);
      alert('Google Sign-In failed or was cancelled. Please check your connection.');
      console.error('Google login error:', error);
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
      {/* Login Card */}
      <form
        onSubmit={handleLogin}
        style={{
          width: '100%',
          backgroundColor: theme.cardBackground,
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}
      >
        <GradientText text="Get Started now" fontSize={28} fontWeight="800" style={{ marginBottom: '6px' }} />
        <span
          style={{
            fontSize: '13px',
            color: theme.secondaryText,
            textAlign: 'center',
            marginBottom: '24px',
            lineHeight: '18px',
          }}
        >
          Create an account or log in to explore our app
        </span>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            height: '50px',
            backgroundColor: theme.inputBackground,
            color: theme.primaryText,
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '20px',
            outline: 'none',
          }}
          className="active-opacity"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.698H24.48v8.883h12.955c-.558 3.012-2.255 5.565-4.802 7.28v6.044h7.77c4.547-4.19 7.13-10.36 7.13-17.51z" fill="#4285F4"/>
            <path d="M24.48 48c6.504 0 11.96-2.154 15.945-5.839l-7.77-6.044c-2.154 1.446-4.91 2.3-8.175 2.3-6.29 0-11.618-4.25-13.52-9.964H2.92v6.24C6.89 43.56 15.13 48 24.48 48z" fill="#34A853"/>
            <path d="M10.96 28.453A14.424 14.424 0 0 1 9.96 24c0-1.563.27-3.083.75-4.453v-6.24H2.92A23.97 23.97 0 0 0 .48 24c0 3.875.929 7.543 2.44 10.693l8.04-6.24z" fill="#FBBC05"/>
            <path d="M24.48 9.583c3.545 0 6.727 1.218 9.228 3.61l6.917-6.917C36.43 2.383 30.973 0 24.48 0 15.13 0 6.89 4.44 2.92 11.307l8.04 6.24c1.902-5.713 7.23-9.964 13.52-9.964z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* OR Divider */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: theme.border }} />
          <span style={{ fontSize: '13px', color: theme.secondaryText }}>Or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: theme.border }} />
        </div>

        {/* Email field */}
        <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginBottom: '8px' }}>
          Email
        </label>
        <div style={{ zIndex: 100, position: 'relative', width: '100%', marginBottom: '16px' }}>
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
              width: '100%',
              boxSizing: 'border-box',
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

        {/* Password field */}
        <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginBottom: '8px' }}>
          Password
        </label>
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
            marginBottom: '16px',
            boxSizing: 'border-box',
          }}
        >
          <input
            type={showPassword ? 'text' : 'password'}
            style={{
              flex: 1,
              fontSize: '14px',
              color: theme.primaryText,
              fontWeight: '600',
              border: 'none',
              background: 'transparent',
              outline: 'none',
            }}
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

        {/* Remember & Forgot Row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '4px',
            marginBottom: '28px',
          }}
        >
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Icon
              name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={20}
              color={rememberMe ? theme.accent : theme.secondaryText}
            />
            <span style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '500' }}>Remember me</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span style={{ fontSize: '13px', color: theme.accent, fontWeight: '600' }}>Forgot Password ?</span>
          </button>
        </div>

        {/* Log In Button */}
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
            'Log In'
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '14px', color: theme.secondaryText }}>Don’t have an account? </span>
        <button
          type="button"
          onClick={() => navigate('/signup')}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0 4px' }}
        >
          <span style={{ fontSize: '14px', color: theme.accent, fontWeight: '700' }}>Sign Up</span>
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
