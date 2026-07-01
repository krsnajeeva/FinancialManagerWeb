import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../common/Icon';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const tabRoutes = ['/home', '/statistics', '/budget', '/profile'];
  const showTabs = tabRoutes.includes(location.pathname);

  const tabs = [
    { name: 'Home', route: '/home', icon: 'home' },
    { name: 'Statistics', route: '/statistics', icon: 'chart-bar' },
    { name: 'Budget', route: '/budget', icon: 'wallet' },
    { name: 'Profile', route: '/profile', icon: 'account' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Ambient background — behind everything */}
      <div className="ambient-bg" />

      {/* App frame — on top of ambient bg */}
      <div className="app-frame flex-col" style={{ backgroundColor: theme.background, position: 'relative', zIndex: 1 }}>
        
        {/* Main Content Area */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }} className="flex-col">
          {children}
        </div>

        {/* Bottom Tab Bar */}
        {showTabs && (
          <div
            style={{
              backgroundColor: theme.tabBarBackground,
              borderTop: `1px solid ${theme.tabBarBorder}`,
              height: '64px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              paddingBottom: '4px',
              zIndex: 100,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              flexShrink: 0,
            }}
          >
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.route;
              const activeColor = theme.tabBarActiveColor;
              const inactiveColor = theme.tabBarInactiveColor;

              return (
                <button
                  key={tab.name}
                  onClick={() => navigate(tab.route)}
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '4px',
                    padding: '8px',
                    width: '60px',
                    color: isActive ? activeColor : inactiveColor,
                    transition: 'color 0.2s ease',
                  }}
                  className="active-opacity"
                >
                  <Icon name={tab.icon} size={22} color={isActive ? activeColor : inactiveColor} />
                  <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '500' }}>{tab.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLayout;
