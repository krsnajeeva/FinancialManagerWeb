import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addExpense } from '../../redux/slices/expenseSlice';
import { COLORS } from '../../constants/colors';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { ACCOUNTS } from '../../constants/accounts';
import SelectionGrid from '../../components/inputs/SelectionGrid';
import ScreenHeader from '../../components/cards/ScreenHeader';
import { getCurrentDate } from '../../utils/date';
import { uuidv4 } from '../../utils/uuid';
import { USE_STATIC_DATA } from '../../config/appConfig';
import { expenseFirebaseService } from '../../services/firebase/expenseService';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../../components/common/Icon';

const AddExpenseScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [account, setAccount] = useState<'cash' | 'credit' | 'card'>('credit');
  const [amount, setAmount] = useState('');
  const [fixedCommitment, setFixedCommitment] = useState(false);
  const [date, setDate] = useState(getCurrentDate());

  const userId = useAppSelector(state => state.settings.userId);
  const [loading, setLoading] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const [focusedField, setFocusedField] = useState<'category' | 'description' | 'account' | 'amount' | null>('category');

  const parsedAmount = parseFloat(amount);
  const isFormValid = category !== '' && amount !== '' && !isNaN(parsedAmount) && parsedAmount > 0;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) {
      alert('Please select a category and enter a valid positive amount.');
      return;
    }

    const expense = {
      category,
      description: description || category,
      amount: parsedAmount,
      account,
      fixedCommitment,
      date,
      userId,
    };

    setLoading(true);

    if (USE_STATIC_DATA) {
      const mockExpense = {
        ...expense,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      dispatch(addExpense(mockExpense));
      setLoading(false);
      navigate(-1);
      return;
    }

    try {
      const newId = await expenseFirebaseService.add({
        ...expense,
        createdAt: new Date().toISOString(),
      });
      dispatch(addExpense({
        ...expense,
        id: newId,
        createdAt: new Date().toISOString(),
      }));
      setLoading(false);
      navigate(-1);
    } catch (error) {
      setLoading(false);
      alert('Failed to save expense. Please check your connection.');
      console.error('Add expense error:', error);
    }
  };

  const clearAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAccount('credit');
  };

  const clearAmount = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAmount('');
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
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: headerBgGradient,
          overflow: 'hidden',
          paddingBottom: '16px',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
        }}
      >
        <ScreenHeader title="Add Expense" showBack={true} light rightIcon="dots-horizontal" />
      </div>

      {/* Scrollable Form */}
      <div style={{ flex: 1, overflowY: 'auto', marginTop: '-8px' }}>
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '20px',
            margin: '16px',
            marginBottom: '40px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: theme.isDark ? `1px solid ${theme.border}` : 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Category Selection Field */}
          <span style={{ fontSize: '13px', color: theme.secondaryText, marginBottom: '8px', fontWeight: '500' }}>
            Category
          </span>
          <button
            type="button"
            onClick={() => setFocusedField('category')}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: `1.5px solid ${focusedField === 'category' ? theme.accent : theme.border}`,
              borderRadius: '12px',
              padding: '0 16px',
              marginBottom: '16px',
              backgroundColor: theme.inputBackground,
              height: '52px',
              cursor: 'pointer',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            className="active-opacity"
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: theme.isDark ? '#2D2D2D' : 'rgba(47, 126, 121, 0.12)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon
                  name={EXPENSE_CATEGORIES.find(c => c.name === category)?.icon || 'tag'}
                  size={20}
                  color={EXPENSE_CATEGORIES.find(c => c.name === category)?.color || theme.accent}
                />
              </div>
              <span style={{ fontSize: '15px', color: theme.primaryText, fontWeight: '500' }}>
                {category || 'Select Category'}
              </span>
            </div>
          </button>

          {/* Description Input Field */}
          <span style={{ fontSize: '13px', color: theme.secondaryText, marginBottom: '8px', fontWeight: '500' }}>
            Description
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              border: `1.5px solid ${focusedField === 'description' ? theme.accent : theme.border}`,
              borderRadius: '12px',
              padding: '0 16px',
              marginBottom: '16px',
              backgroundColor: theme.inputBackground,
              height: '52px',
              boxSizing: 'border-box',
            }}
          >
            <input
              ref={descriptionInputRef}
              style={{
                flex: 1,
                fontSize: '15px',
                color: theme.primaryText,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                height: '100%',
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={category || 'Enter description'}
              onFocus={() => setFocusedField('description')}
            />
          </div>

          {/* Account Selection Field */}
          <span style={{ fontSize: '13px', color: theme.secondaryText, marginBottom: '8px', fontWeight: '500' }}>
            Account
          </span>
          <button
            type="button"
            onClick={() => setFocusedField('account')}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: `1.5px solid ${focusedField === 'account' ? theme.accent : theme.border}`,
              borderRadius: '12px',
              padding: '0 16px',
              marginBottom: '16px',
              backgroundColor: theme.inputBackground,
              height: '52px',
              cursor: 'pointer',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            className="active-opacity"
          >
            <span style={{ fontSize: '15px', fontWeight: '500', color: theme.accent }}>
              {ACCOUNTS.find(a => a.id === account)?.name || 'Accounts'}
            </span>
            <span
              onClick={clearAccount}
              style={{ fontSize: '14px', color: theme.secondaryText, fontWeight: '500', padding: '8px' }}
            >
              Clear
            </span>
          </button>

          {/* Amount Input Field */}
          <span style={{ fontSize: '13px', color: theme.secondaryText, marginBottom: '8px', fontWeight: '500' }}>
            Amount
          </span>
          <div
            onClick={() => {
              setFocusedField('amount');
              amountInputRef.current?.focus();
            }}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: `1.5px solid ${focusedField === 'amount' ? theme.accent : theme.border}`,
              borderRadius: '12px',
              padding: '0 16px',
              marginBottom: '16px',
              backgroundColor: theme.inputBackground,
              height: '52px',
              boxSizing: 'border-box',
              cursor: 'text',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.accent, marginRight: '4px' }}>₹</span>
              <input
                ref={amountInputRef}
                style={{
                  flex: 1,
                  fontSize: '15px',
                  color: theme.primaryText,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  height: '100%',
                }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                onFocus={() => setFocusedField('amount')}
                required
              />
            </div>
            <span
              onClick={clearAmount}
              style={{ fontSize: '14px', color: theme.secondaryText, fontWeight: '500', padding: '8px', cursor: 'pointer' }}
            >
              Clear
            </span>
          </div>

          {/* Add Button */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            style={{
              border: `1.5px solid ${isFormValid ? theme.accent : theme.border}`,
              borderRadius: '20px',
              height: '52px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isFormValid ? theme.cardBackground : (theme.isDark ? '#2D2D2D' : '#FAFAFA'),
              color: isFormValid ? theme.accent : theme.secondaryText,
              fontSize: '16px',
              fontWeight: '600',
              cursor: isFormValid && !loading ? 'pointer' : 'not-allowed',
              outline: 'none',
              marginTop: '8px',
              marginBottom: '4px',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
            }}
            className={isFormValid && !loading ? "active-opacity" : ""}
          >
            {loading ? (
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${theme.accent}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            ) : (
              'Add'
            )}
          </button>

          {/* Dynamic Selection Panel */}
          {focusedField === 'category' && (
            <div>
              <div style={{ height: '1px', backgroundColor: theme.border, margin: '20px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: theme.primaryText, letterSpacing: '0.5px' }}>
                  CATEGORY TYPE
                </span>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <Icon name="pencil-outline" size={16} color={theme.secondaryText} />
                  <button
                    type="button"
                    style={{
                      backgroundColor: theme.accent,
                      padding: '5px 10px',
                      borderRadius: '10px',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                    className="active-opacity"
                  >
                    Add More
                  </button>
                </div>
              </div>
              <SelectionGrid
                items={EXPENSE_CATEGORIES}
                selectedId={category}
                onSelect={(id) => {
                  const catName = EXPENSE_CATEGORIES.find(c => c.id === id)?.name || id;
                  setCategory(catName);
                  setFocusedField('description');
                  // Timeout to let DOM focus correctly
                  setTimeout(() => descriptionInputRef.current?.focus(), 50);
                }}
              />
            </div>
          )}

          {focusedField === 'account' && (
            <div>
              <div style={{ height: '1px', backgroundColor: theme.border, margin: '20px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: theme.primaryText, letterSpacing: '0.5px' }}>
                  ACCOUNT TYPE
                </span>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <Icon name="pencil-outline" size={16} color={theme.secondaryText} />
                  <button
                    type="button"
                    style={{
                      backgroundColor: theme.accent,
                      padding: '5px 10px',
                      borderRadius: '10px',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                    className="active-opacity"
                  >
                    Add More
                  </button>
                </div>
              </div>
              <SelectionGrid
                items={ACCOUNTS}
                selectedId={account}
                onSelect={(id) => {
                  setAccount(id as 'cash' | 'credit' | 'card');
                  setFocusedField('amount');
                  setTimeout(() => amountInputRef.current?.focus(), 50);
                }}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddExpenseScreen;
