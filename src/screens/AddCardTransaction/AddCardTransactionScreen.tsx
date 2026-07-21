import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addCardTransaction } from '../../redux/slices/cardSlice';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import SelectionGrid from '../../components/inputs/SelectionGrid';
import ScreenHeader from '../../components/cards/ScreenHeader';
import { getCurrentDate } from '../../utils/date';
import { USE_STATIC_DATA } from '../../config/appConfig';
import { cardFirebaseService } from '../../services/firebase/cardService';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../../components/common/Icon';
import { CardTransaction } from '../../types/card';

const AddCardTransactionScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const searchParams = new URLSearchParams(location.search);
  const paramCardId = searchParams.get('cardId') || location.state?.cardId;

  const cards = useAppSelector(state => state.card?.cards) || [];
  const userId = useAppSelector(state => state.settings.userId);

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string>(
    paramCardId || (cards.length > 0 ? cards[0].id : '')
  );
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDate());
  const [loading, setLoading] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const [focusedField, setFocusedField] = useState<'category' | 'description' | 'card' | 'amount' | 'date' | null>('category');

  const parsedAmount = parseFloat(amount);
  const isFormValid = category !== '' && amount !== '' && !isNaN(parsedAmount) && parsedAmount > 0;

  const clearAmount = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAmount('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) {
      alert('Please select a category and enter a valid positive amount.');
      return;
    }

    setLoading(true);

    const activeCardId = selectedCardId || (cards.length > 0 ? cards[0].id : '');

    const transactionData: Omit<CardTransaction, 'id'> = {
      cardId: activeCardId,
      category,
      description: description || category,
      amount: parsedAmount,
      date,
      createdAt: new Date().toISOString(),
      userId: userId || '',
      type: 'expense',
    };

    try {
      let finalId = Date.now().toString();
      if (!USE_STATIC_DATA && userId) {
        finalId = await cardFirebaseService.addTransaction(transactionData);
      }
      const newTransaction: CardTransaction = {
        ...transactionData,
        id: finalId,
      };
      dispatch(addCardTransaction(newTransaction));
      navigate('/my-cards');
    } catch (err) {
      console.error('Error adding card transaction:', err);
      dispatch(addCardTransaction({ ...transactionData, id: Date.now().toString() }));
      navigate('/my-cards');
    } finally {
      setLoading(false);
    }
  };

  const headerColors = theme.primaryGradient;
  const headerBgGradient = `linear-gradient(90deg, ${headerColors.join(', ')})`;
  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];

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
        <ScreenHeader title="Add Card Transaction" showBack={true} light rightIcon="dots-horizontal" />
      </div>

      {/* Scrollable Form Container */}
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

          {/* Card Selection Field (if cards exist) */}
          {cards.length > 0 && (
            <>
              <span style={{ fontSize: '13px', color: theme.secondaryText, marginBottom: '8px', fontWeight: '500' }}>
                Card
              </span>
              <button
                type="button"
                onClick={() => setFocusedField('card')}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: `1.5px solid ${focusedField === 'card' ? theme.accent : theme.border}`,
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
                    <Icon name="credit-card-outline" size={20} color={theme.accent} />
                  </div>
                  <span style={{ fontSize: '15px', color: theme.accent, fontWeight: '500' }}>
                    {selectedCard ? `${selectedCard.cardName} (•••• ${selectedCard.cardNumber.slice(-4)})` : 'Select Card'}
                  </span>
                </div>
                <Icon name="chevron-down" size={20} color={theme.secondaryText} />
              </button>
            </>
          )}

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
                step="any"
                onFocus={() => setFocusedField('amount')}
              />
            </div>
            {amount !== '' && (
              <span
                onClick={clearAmount}
                style={{ fontSize: '14px', color: theme.secondaryText, fontWeight: '500', padding: '8px', cursor: 'pointer' }}
              >
                Clear
              </span>
            )}
          </div>

          {/* Date Input Field */}
          <span style={{ fontSize: '13px', color: theme.secondaryText, marginBottom: '8px', fontWeight: '500' }}>
            Date
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: `1.5px solid ${focusedField === 'date' ? theme.accent : theme.border}`,
              borderRadius: '12px',
              padding: '0 16px',
              marginBottom: '16px',
              backgroundColor: theme.inputBackground,
              height: '52px',
              boxSizing: 'border-box',
            }}
          >
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onFocus={() => setFocusedField('date')}
              style={{
                flex: 1,
                fontSize: '15px',
                color: theme.primaryText,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                height: '100%',
                fontWeight: '500',
              }}
            />
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
            {loading ? 'Saving...' : 'Add'}
          </button>

          {/* Dynamic Selection Panel inside formCard */}
          {focusedField === 'category' && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ height: '1px', backgroundColor: theme.border, marginBottom: '20px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: theme.secondaryText, letterSpacing: '0.5px' }}>
                  CATEGORY TYPE
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon name="pencil-outline" size={16} color={theme.secondaryText} />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: theme.secondaryText, cursor: 'pointer' }}>
                    Add More
                  </span>
                </div>
              </div>
              <SelectionGrid
                items={EXPENSE_CATEGORIES}
                selectedId={category}
                onSelect={(id) => {
                  const catName = EXPENSE_CATEGORIES.find(c => c.id === id)?.name || id;
                  setCategory(catName);
                }}
              />
            </div>
          )}

          {focusedField === 'card' && cards.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ height: '1px', backgroundColor: theme.border, marginBottom: '20px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: theme.secondaryText, letterSpacing: '0.5px' }}>
                  SELECT CARD
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cards.map(c => {
                  const isSelected = c.id === selectedCardId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCardId(c.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: `1.5px solid ${isSelected ? theme.accent : theme.border}`,
                        backgroundColor: isSelected ? 'rgba(47, 126, 121, 0.08)' : theme.cardBackground,
                        cursor: 'pointer',
                        textAlign: 'left',
                        outline: 'none',
                      }}
                      className="active-opacity"
                    >
                      <Icon name="credit-card" size={18} color={isSelected ? theme.accent : theme.secondaryText} />
                      <span style={{ fontSize: '14px', fontWeight: isSelected ? '600' : '500', color: isSelected ? theme.accent : theme.primaryText }}>
                        {c.cardName} (•••• {c.cardNumber.slice(-4)})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddCardTransactionScreen;
