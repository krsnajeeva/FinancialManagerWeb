import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addCard } from '../../redux/slices/cardSlice';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../../components/common/Icon';
import ScreenHeader from '../../components/cards/ScreenHeader';
import { USE_STATIC_DATA } from '../../config/appConfig';
import { cardFirebaseService } from '../../services/firebase/cardService';
import { CARD_THEMES } from '../../constants/cardThemes';
import { CreditCardItem } from '../../types/card';

const AddCardScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const userId = useAppSelector(state => state.settings.userId);

  const [cardName, setCardName] = useState('');
  const [cardType, setCardType] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [totalLimit, setTotalLimit] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [statementDay, setStatementDay] = useState('');
  const [paymentDueDays, setPaymentDueDays] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('theme1');
  const [submitting, setSubmitting] = useState(false);

  const cards = useAppSelector(state => state.card?.cards) || [];
  const [isSharedLimit, setIsSharedLimit] = useState(false);
  const [sharedWithCardId, setSharedWithCardId] = useState('');

  // Format Card Number (space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleSharedCardChange = (cardId: string) => {
    setSharedWithCardId(cardId);
    const selectedCard = cards.find(c => c.id === cardId);
    if (selectedCard) {
      setTotalLimit(selectedCard.totalLimit.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !cardNumber.trim() || !totalLimit) {
      alert('Please fill in required card details.');
      return;
    }

    setSubmitting(true);
    const selectedParentCard = cards.find(c => c.id === sharedWithCardId);
    const finalSharedCardId = isSharedLimit && selectedParentCard
      ? (selectedParentCard.sharedCardId || selectedParentCard.id)
      : undefined;

    const newCard: CreditCardItem = {
      id: Date.now().toString(),
      cardName: cardName.trim(),
      cardType: cardType.trim() || 'Visa',
      cardNumber: cardNumber.trim(),
      totalLimit: parseFloat(totalLimit) || 0,
      usedAmount: 0,
      cardHolderName: cardHolderName.trim() || 'Card Holder',
      expiryDate: expiryDate.trim() || '08/30',
      cvv: cvv.trim() || '123',
      statementDay: parseInt(statementDay) || 1,
      paymentDueDays: parseInt(paymentDueDays) || 20,
      cardTheme: selectedTheme,
      userId: userId || undefined,
      createdAt: new Date().toISOString(),
      sharedCardId: finalSharedCardId,
    };

    try {
      if (!USE_STATIC_DATA && userId) {
        const firestoreId = await cardFirebaseService.add(newCard);
        newCard.id = firestoreId;
      }
      dispatch(addCard(newCard));
      navigate('/my-cards');
    } catch (err) {
      console.error('Error adding card:', err);
      dispatch(addCard(newCard));
      navigate('/my-cards');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        minHeight: '100vh',
        backgroundColor: theme.background,
        overflowY: 'auto',
        padding: '0 0 40px 0',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          background: `linear-gradient(90deg, ${theme.primaryGradient.join(', ')})`,
          paddingBottom: '16px',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
        }}
      >
        <ScreenHeader title="Add Card" showBack={true} light rightIcon="dots-horizontal" />
      </div>

      {/* Form Content */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '10px 24px 30px 24px',
          gap: '18px',
          maxWidth: '500px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Card Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Card Name</label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="e.g. Tata - HDFC"
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBackground,
              color: theme.primaryText,
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
            }}
          />
        </div>

        {/* Card Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Card Type</label>
          <input
            type="text"
            value={cardType}
            onChange={(e) => setCardType(e.target.value)}
            placeholder="e.g. Visa / MasterCard"
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBackground,
              color: theme.primaryText,
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
            }}
          />
        </div>

        {/* Card Number */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="3234 8678 4234 7628"
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBackground,
              color: theme.primaryText,
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
              letterSpacing: '0.5px',
            }}
          />
        </div>

        {/* Shared Limit Toggle (Only if other cards exist) */}
        {cards.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: theme.primaryText }}>Shared Credit Limit</span>
                <span style={{ fontSize: '12px', color: theme.secondaryText }}>Share limit with an existing card</span>
              </div>
              <div 
                onClick={() => {
                  const next = !isSharedLimit;
                  setIsSharedLimit(next);
                  if (!next) {
                    setSharedWithCardId('');
                    setTotalLimit('');
                  } else if (cards.length > 0) {
                    handleSharedCardChange(cards[0].id);
                  }
                }}
                style={{
                  width: '46px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: isSharedLimit ? theme.accent : theme.border,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                <div 
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    position: 'absolute',
                    top: '2px',
                    left: isSharedLimit ? '24px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
              </div>
            </div>

            {/* Shared With Card Dropdown */}
            {isSharedLimit && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Select Card to Share Limit With</label>
                <select
                  value={sharedWithCardId}
                  onChange={(e) => handleSharedCardChange(e.target.value)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.cardBackground,
                    color: theme.primaryText,
                    fontSize: '15px',
                    fontWeight: '500',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {cards.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.cardName} (•••• {c.cardNumber.slice(-4)}) - Limit: ₹{c.totalLimit.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Total Limit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Total Limit</label>
          <input
            type="number"
            value={totalLimit}
            onChange={(e) => setTotalLimit(e.target.value)}
            disabled={isSharedLimit}
            placeholder="e.g. 187000"
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              backgroundColor: isSharedLimit ? (theme.isDark ? '#2D2D2D' : '#F1F5F9') : theme.cardBackground,
              color: isSharedLimit ? theme.secondaryText : theme.primaryText,
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
              cursor: isSharedLimit ? 'not-allowed' : 'text',
            }}
          />
        </div>

        {/* Card Holder Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Card Holder Name</label>
          <input
            type="text"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            placeholder="e.g. Jeevanandham K"
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBackground,
              color: theme.primaryText,
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
            }}
          />
        </div>

        {/* Expiry Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Expiry date</label>
          <input
            type="month"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            placeholder="Select Expiry Date"
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBackground,
              color: theme.primaryText,
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
            }}
          />
        </div>

        {/* CVV */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>CVV</label>
          <input
            type="password"
            maxLength={4}
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="e.g. 123"
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBackground,
              color: theme.primaryText,
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
            }}
          />
        </div>

        {/* Bill Generation Day */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Bill Generation Day</label>
          <input
            type="number"
            min={1}
            max={31}
            value={statementDay}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 31)) {
                setStatementDay(val);
              }
            }}
            placeholder="e.g. 24"
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBackground,
              color: theme.primaryText,
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
            }}
          />
          <span style={{ fontSize: '11px', color: theme.secondaryText, marginTop: '-2px' }}>Day of month when your statement is generated</span>
        </div>

        {/* Payment Due Days */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Payment Due (Days after bill)</label>
          <input
            type="number"
            min={1}
            max={60}
            value={paymentDueDays}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 60)) {
                setPaymentDueDays(val);
              }
            }}
            placeholder="e.g. 20"
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBackground,
              color: theme.primaryText,
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
            }}
          />
          <span style={{ fontSize: '11px', color: theme.secondaryText, marginTop: '-2px' }}>Number of days after statement to pay</span>
        </div>

        {/* Choose Card Theme */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Choose Card Theme</label>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '10px',
              scrollbarWidth: 'thin',
            }}
          >
            {CARD_THEMES.map(t => {
              const isSelected = t.id === selectedTheme;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  style={{
                    width: '105px',
                    minWidth: '105px',
                    height: '68px',
                    borderRadius: '12px',
                    border: `2px solid ${isSelected ? theme.accent : 'transparent'}`,
                    boxShadow: isSelected ? `0 0 0 2px ${theme.accent}` : 'none',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    backgroundImage: `url(${t.image})`,
                    backgroundSize: '116%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    boxSizing: 'border-box',
                  }}
                  className="active-opacity"
                >
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '10px',
                        backgroundColor: theme.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                      }}
                    >
                      <Icon name="check" size={14} color="#FFFFFF" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: '10px',
            backgroundColor: theme.accent,
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 4px 12px ${theme.accent}4D`,
            transition: 'background-color 0.2s',
          }}
          className="active-opacity"
        >
          {submitting ? 'Adding Card...' : 'Add Card'}
        </button>
      </form>
    </div>
  );
};

export default AddCardScreen;
