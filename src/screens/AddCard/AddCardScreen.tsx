import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addCard } from '../../redux/slices/cardSlice';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../../components/common/Icon';
import ScreenHeader from '../../components/cards/ScreenHeader';
import { USE_STATIC_DATA } from '../../config/appConfig';
import { cardFirebaseService } from '../../services/firebase/cardService';
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
  const [statementDate, setStatementDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Format Card Number (space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !cardNumber.trim() || !totalLimit) {
      alert('Please fill in required card details.');
      return;
    }

    setSubmitting(true);
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
      statementDate: statementDate.trim() || '10/05/2026',
      paymentDate: paymentDate.trim() || '20/05/2026',
      userId: userId || undefined,
      createdAt: new Date().toISOString(),
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

        {/* Total Limit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Total Limit</label>
          <input
            type="number"
            value={totalLimit}
            onChange={(e) => setTotalLimit(e.target.value)}
            placeholder="e.g. 187000"
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

        {/* Statement Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Statement Date</label>
          <input
            type="date"
            value={statementDate}
            onChange={(e) => setStatementDate(e.target.value)}
            placeholder="Select Statement Date"
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

        {/* Payment Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Payment Date</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            placeholder="Select Payment Date"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: '10px',
            backgroundColor: '#3B82F6',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
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
