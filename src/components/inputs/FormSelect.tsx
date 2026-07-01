import React, { useState, useRef, useEffect } from 'react';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../common/Icon';

interface Option {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

interface FormSelectProps {
  label: string;
  options: Option[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  value,
  onSelect,
  placeholder = 'Select an option',
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(o => o.id === value || o.label === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      style={{
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
      }}
    >
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

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '14px 16px',
          backgroundColor: theme.inputBackground,
          cursor: 'pointer',
          width: '100%',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.2s ease',
        }}
        className="active-opacity"
      >
        {selectedOption ? (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            {selectedOption.icon && (
              <Icon
                name={selectedOption.icon}
                size={20}
                color={selectedOption.color || theme.accent}
              />
            )}
            <span style={{ fontSize: '15px', color: theme.primaryText, fontWeight: '500' }}>
              {selectedOption.label}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: '15px', color: '#999999' }}>{placeholder}</span>
        )}
        <Icon name="chevron-down" size={20} color={theme.secondaryText} />
      </button>

      {/* Floating Options Dropdown Modal */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: 0,
            right: 0,
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            maxHeight: '260px',
            overflowY: 'auto',
            zIndex: 1000,
            padding: '4px 0',
          }}
        >
          {options.map((item) => {
            const isItemActive = value === item.id || value === item.label;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item.label);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '14px 20px',
                  border: 'none',
                  background: isItemActive ? `${theme.accent}12` : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background-color 0.2s ease',
                }}
                className="active-opacity"
              >
                {item.icon && (
                  <Icon
                    name={item.icon}
                    size={20}
                    color={item.color || theme.accent}
                  />
                )}
                <span
                  style={{
                    fontSize: '15px',
                    color: theme.primaryText,
                    fontWeight: isItemActive ? '600' : '400',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FormSelect;
