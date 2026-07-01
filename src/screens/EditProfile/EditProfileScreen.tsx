import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setUserName, setUserHandle } from '../../redux/slices/settingsSlice';
import { USE_STATIC_DATA } from '../../config/appConfig';
import { GradientText } from '../../components';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../../components/common/Icon';
import ScreenHeader from '../../components/cards/ScreenHeader';
import { db } from '../../services/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EditProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const userId = useAppSelector(state => state.settings.userId);
  const userEmail = useAppSelector(state => state.settings.userEmail);
  const userName = useAppSelector(state => state.settings.userName);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(userEmail);
  const [dob, setDob] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (USE_STATIC_DATA) {
        // Mock profile initialization
        const parts = userName.split(' ');
        setFirstName(parts[0] || 'Lois');
        setLastName(parts.slice(1).join(' ') || 'Becket');
        setEmail(userEmail || 'loisbecket@gmail.com');
        setDob('2024-03-18');
        setPhoneNumber('(454) 726-0592');
        setPassword('123456');
        setFetching(false);
        return;
      }

      if (!userId) {
        const parts = userName.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
        setEmail(userEmail);
        setFetching(false);
        return;
      }

      try {
        setFetching(true);
        const docSnap = await getDoc(doc(db, 'users', userId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data) {
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setEmail(data.email || userEmail);
            setDob(data.dob || '');
            setPhoneNumber(data.phoneNumber || '');
            setPassword(data.password || '');
          }
        } else {
          // Initialize empty defaults using settings slice info
          const parts = userName.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
          setEmail(userEmail);
        }
      } catch (error) {
        console.error('Error fetching user data from Firestore:', error);
        alert('Failed to retrieve profile details.');
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [userId, userEmail, userName]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !dob.trim() ||
      !password.trim()
    ) {
      alert('Please fill in all editable fields.');
      return;
    }

    setSaving(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const baseHandle = `@${firstName.trim().toLowerCase()}_${lastName.trim().toLowerCase()}`;

    if (USE_STATIC_DATA) {
      setTimeout(() => {
        setSaving(false);
        dispatch(setUserName(fullName));
        dispatch(setUserHandle(baseHandle));
        alert('Profile updated successfully!');
        navigate(-1);
      }, 1000);
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dob: dob.trim(),
        password: password.trim(),
      });

      dispatch(setUserName(fullName));
      dispatch(setUserHandle(baseHandle));
      setSaving(false);
      alert('Profile updated successfully!');
      navigate(-1);
    } catch (error) {
      setSaving(false);
      alert('Failed to save changes. Please check your connection.');
      console.error('Update profile error:', error);
    }
  };

  const headerColors = theme.primaryGradient;
  const headerBgGradient = `linear-gradient(90deg, ${headerColors.join(', ')})`;
  const gradientString = `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1] || '#FFFFFF'} 40%)`;
  const buttonGradient = `linear-gradient(90deg, ${theme.buttonGradient.join(', ')})`;

  if (fetching) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
          width: '100%',
          height: '100%',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${theme.accent}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ marginTop: '12px', fontSize: '16px', color: theme.secondaryText, fontWeight: '600' }}>
          Loading Profile...
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: theme.background,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: headerBgGradient,
          overflow: 'hidden',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
          paddingBottom: '8px',
        }}
      >
        <ScreenHeader title="Edit Profile" light showBack={true} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: gradientString, padding: '24px 20px 40px 20px' }}>
        {/* Form Card */}
        <form
          onSubmit={handleSave}
          style={{
            width: '100%',
            backgroundColor: theme.cardBackground,
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
            border: theme.isDark ? `1px solid ${theme.border}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          <GradientText text="Edit Profile" fontSize={28} fontWeight="800" style={{ marginBottom: '20px' }} />

          {/* First Name & Last Name (2-column Row) */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginBottom: '6px' }}>
                First Name
              </label>
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
              <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginBottom: '6px' }}>
                Last Name
              </label>
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

          {/* Email Field - Read Only / Disabled */}
          <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginTop: '14px', marginBottom: '6px' }}>
            Email
          </label>
          <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: '12px', height: '48px', padding: '0 16px', backgroundColor: theme.isDark ? '#2D2D2D' : '#EEEEEE' }}>
            <input
              type="email"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: theme.secondaryText, fontSize: '14px', fontWeight: '600', cursor: 'not-allowed' }}
              value={email}
              disabled
              placeholder="Enter email"
            />
          </div>

          {/* Date of Birth Field */}
          <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginTop: '14px', marginBottom: '6px' }}>
            Date of Birth
          </label>
          <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: '12px', height: '48px', padding: '0 16px', backgroundColor: theme.inputBackground }}>
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

          {/* Phone Number Field with Flag prefix - Read Only / Disabled */}
          <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginTop: '14px', marginBottom: '6px' }}>
            Phone Number
          </label>
          <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: '12px', height: '48px', padding: '0 12px 0 16px', backgroundColor: theme.isDark ? '#2D2D2D' : '#EEEEEE', alignItems: 'center', cursor: 'not-allowed' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '20px' }}>🇮🇳</span>
              <Icon name="chevron-down" size={16} color={theme.secondaryText} />
            </div>
            <div style={{ width: '1px', height: '24px', backgroundColor: theme.border, margin: '0 10px' }} />
            <input
              type="tel"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: theme.secondaryText, fontSize: '14px', fontWeight: '600', cursor: 'not-allowed' }}
              value={phoneNumber}
              disabled
              placeholder="(000) 000-0000"
            />
          </div>

          {/* Password Field */}
          <label style={{ fontSize: '13px', color: theme.secondaryText, fontWeight: '600', marginTop: '14px', marginBottom: '6px' }}>
            Set Password
          </label>
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

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '12px',
              border: 'none',
              background: buttonGradient,
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            className={saving ? "" : "active-opacity"}
          >
            {saving ? (
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
              'Save'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileScreen;
