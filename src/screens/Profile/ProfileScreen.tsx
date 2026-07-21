import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { COLORS } from '../../constants/colors';
import ScreenHeader from '../../components/cards/ScreenHeader';
import { setLoggedIn, setThemeId, setSwipeEnabled, setUserAvatar } from '../../redux/slices/settingsSlice';
import { useTheme } from '../../hooks/useTheme';
import { THEMES } from '../../constants/theme';
import { USE_STATIC_DATA } from '../../config/appConfig';
import { db } from '../../services/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import Icon from '../../components/common/Icon';

const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const userName = useAppSelector(state => state.settings.userName);
  const userHandle = useAppSelector(state => state.settings.userHandle);
  const swipeEnabled = useAppSelector(state => state.settings.swipeEnabled);
  const userId = useAppSelector(state => state.settings.userId);
  const userAvatar = useAppSelector(state => state.settings.userAvatar);

  const [imageError, setImageError] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const displayName = userName || 'Enjelin Morgeana';
  const displayHandle = userHandle || '@enjelin_morgeana';

  const defaultAvatarUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80';
  const avatarUrl = userAvatar || defaultAvatarUrl;

  const handleToggleSwipe = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    dispatch(setSwipeEnabled(value));
    if (USE_STATIC_DATA || !userId) {
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), {
        swipeEnabled: value,
      });
    } catch (err) {
      console.error('Error updating swipeEnabled in Firestore:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const base64Image = uploadEvent.target?.result as string;
        if (base64Image) {
          setImageError(false);
          dispatch(setUserAvatar(base64Image));
          
          if (!USE_STATIC_DATA && userId) {
            try {
              await updateDoc(doc(db, 'users', userId), {
                userAvatar: base64Image,
              });
            } catch (err) {
              console.error('Error updating userAvatar in Firestore:', err);
            }
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    setImageError(false);
    dispatch(setUserAvatar(undefined));
    if (!USE_STATIC_DATA && userId) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          userAvatar: null,
        });
      } catch (err) {
        console.error('Error removing userAvatar in Firestore:', err);
      }
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      try {
        const rememberMe = localStorage.getItem('@remember_me');
        if (rememberMe !== 'true') {
          localStorage.removeItem('@remembered_email');
          localStorage.removeItem('@remembered_password');
          localStorage.removeItem('@remember_me');
        }
      } catch (err) {
        console.error('Error during logout credentials purge:', err);
      }
      dispatch(setLoggedIn(false));
      navigate('/login');
    }
  };

  const headerColors = theme.primaryGradient;
  const headerBgGradient = `linear-gradient(90deg, ${headerColors.join(', ')})`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: theme.background,
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: headerBgGradient,
          borderBottomLeftRadius: '50px',
          borderBottomRightRadius: '50px',
          height: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          flexShrink: 0,
        }}
      >
        <ScreenHeader title="Profile" light showBack={false} rightIcon="bell-outline" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Avatar Area overlapping curve */}
        <div style={{ marginTop: '-55px', zIndex: 10, position: 'relative' }}>
          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '55px',
              backgroundColor: theme.cardBackground,
              border: `4px solid ${theme.cardBackground}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {!imageError ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                style={{
                  width: '102px',
                  height: '102px',
                  borderRadius: '50%',
                  backgroundColor: theme.accent,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#FFFFFF',
                  fontSize: '40px',
                  fontWeight: '700',
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Native file upload overlay */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
                cursor: 'pointer',
                zIndex: 20,
              }}
            />
          </div>
        </div>

        {/* Profile Info Details */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', padding: '0 24px' }}>
          <span style={{ fontSize: '22px', fontWeight: '700', color: theme.primaryText }}>{displayName}</span>
          <span style={{ fontSize: '15px', color: theme.accent, fontWeight: '600', marginTop: '4px' }}>
            {displayHandle}
          </span>
          {userAvatar && (
            <button
              onClick={handleRemovePhoto}
              style={{
                background: 'none',
                border: 'none',
                color: '#FF3B30',
                fontSize: '12px',
                fontWeight: '600',
                marginTop: '6px',
                cursor: 'pointer',
              }}
            >
              Remove Picture
            </button>
          )}
        </div>

        {/* Options Card List */}
        <div
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            margin: '30px 20px 20px 20px',
            padding: '10px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: theme.isDark ? `1px solid ${theme.border}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            width: '90%',
            boxSizing: 'border-box',
          }}
        >
          {/* Edit Profile Row */}
          <button
            onClick={() => navigate('/edit-profile')}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              width: '100%',
            }}
            className="active-opacity"
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  backgroundColor: theme.isDark ? '#2D2D2D' : '#E8F0FE',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '16px',
                }}
              >
                <Icon name="account" size={22} color={theme.accent} />
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.primaryText }}>Edit Profile</span>
            </div>
            <Icon name="chevron-right" size={24} color="#B0B0B0" />
          </button>

          <div style={{ height: '1px', backgroundColor: theme.border, margin: '0 4px' }} />

          {/* My Cards Row */}
          <button
            onClick={() => navigate('/my-cards')}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              width: '100%',
            }}
            className="active-opacity"
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  backgroundColor: theme.isDark ? '#2D2D2D' : '#E8F0FE',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '16px',
                }}
              >
                <Icon name="credit-card-outline" size={22} color={theme.accent} />
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.primaryText }}>My Cards</span>
            </div>
            <Icon name="chevron-right" size={24} color="#B0B0B0" />
          </button>

          <div style={{ height: '1px', backgroundColor: theme.border, margin: '0 4px' }} />

          {/* App Theme Row */}
          <button
            onClick={() => setShowThemeModal(true)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              width: '100%',
            }}
            className="active-opacity"
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  backgroundColor: theme.isDark ? '#2D2D2D' : '#E8F0FE',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '16px',
                }}
              >
                <Icon name="palette-outline" size={22} color={theme.accent} />
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.primaryText }}>App Theme</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: theme.secondaryText }}>{theme.name}</span>
              <Icon name="chevron-right" size={24} color="#B0B0B0" />
            </div>
          </button>

          <div style={{ height: '1px', backgroundColor: theme.border, margin: '0 4px' }} />

          {/* Swipe Action Toggle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  backgroundColor: theme.isDark ? '#2D2D2D' : '#E8F0FE',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '16px',
                }}
              >
                <Icon name="gesture-swipe-horizontal" size={22} color={theme.accent} />
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.primaryText }}>Swipe Action</span>
            </div>
            <label
              style={{
                position: 'relative',
                display: 'inline-block',
                width: '48px',
                height: '26px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={swipeEnabled}
                onChange={handleToggleSwipe}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: swipeEnabled ? theme.accent : '#D1D5DB',
                  transition: '0.3s',
                  borderRadius: '13px',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    content: '""',
                    height: '20px',
                    width: '20px',
                    left: swipeEnabled ? '25px' : '3px',
                    bottom: '3px',
                    backgroundColor: '#FFFFFF',
                    transition: '0.3s',
                    borderRadius: '50%',
                  }}
                />
              </span>
            </label>
          </div>

          <div style={{ height: '1px', backgroundColor: theme.border, margin: '0 4px' }} />

          {/* Logout Row */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              width: '100%',
            }}
            className="active-opacity"
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  backgroundColor: theme.isDark ? '#2D2D2D' : '#E8F0FE',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '16px',
                }}
              >
                <Icon name="logout" size={20} color={theme.accent} />
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.primaryText }}>Logout</span>
            </div>
            <Icon name="chevron-right" size={24} color="#B0B0B0" />
          </button>
        </div>
      </div>

      {/* Theme Selector Modal Overlay */}
      {showThemeModal && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            zIndex: 1000,
          }}
          onClick={() => setShowThemeModal(false)}
        >
          <div
            style={{
              backgroundColor: theme.cardBackground,
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              maxHeight: '80%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -4px 10px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: theme.primaryText }}>Choose Application Theme</span>
              <button
                onClick={() => setShowThemeModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: theme.secondaryText }}
              >
                <Icon name="close" size={24} color={theme.secondaryText} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', marginBottom: '24px', maxHeight: '300px' }}>
              {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((key) => {
                const item = THEMES[key];
                const isSelected = item.id === theme.id;
                const gradientString = `linear-gradient(90deg, ${item.primaryGradient.join(', ')})`;

                return (
                  <button
                    key={item.id}
                    onClick={() => dispatch(setThemeId(item.id))}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: `1.5px solid ${isSelected ? theme.accent : theme.border}`,
                      backgroundColor: isSelected ? (theme.isDark ? '#2D2D2D' : '#F4F7FF') : 'transparent',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    className="active-opacity"
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: theme.primaryText, marginBottom: '8px' }}>
                        {item.name}
                      </span>
                      {/* Gradient preview capsule */}
                      <div
                        style={{
                          height: '14px',
                          width: '100px',
                          borderRadius: '7px',
                          background: gradientString,
                        }}
                      />
                    </div>
                    {isSelected && (
                      <Icon name="check-circle" size={24} color={theme.accent} />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowThemeModal(false)}
              style={{
                backgroundColor: theme.accent,
                height: '50px',
                borderRadius: '12px',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                width: '100%',
              }}
              className="active-opacity"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
