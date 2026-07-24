import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setCards, updateCard, deleteCard, setCardTransactions, addCardTransaction } from '../../redux/slices/cardSlice';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../../components/common/Icon';
import ScreenHeader from '../../components/cards/ScreenHeader';
import TransactionItem from '../../components/cards/TransactionItem';
import { formatAmount } from '../../utils/calculations';
import { getCurrentDate } from '../../utils/date';
import { cardFirebaseService } from '../../services/firebase/cardService';
import { USE_STATIC_DATA } from '../../config/appConfig';
import { CreditCardItem, CardTransaction } from '../../types/card';
import { CARD_THEMES } from '../../constants/cardThemes';
import { selectCardAvailableLimits } from '../../redux/selectors';

const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const MyCardsScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const cards = useAppSelector(state => state.card?.cards) || [];
  const cardTransactions = useAppSelector(state => state.card?.cardTransactions) || [];
  const userId = useAppSelector(state => state.settings.userId);
  const availableLimits = useAppSelector(selectCardAvailableLimits);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHideDetails, setIsHideDetails] = useState(true);

  // Pay Now Modal States
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayCardId, setSelectedPayCardId] = useState<string>('');
  const [payAmount, setPayAmount] = useState('');
  const [submittingPay, setSubmittingPay] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!USE_STATIC_DATA && userId) {
      cardFirebaseService.getAll(userId).then(fetched => {
        if (fetched) {
          dispatch(setCards(fetched));
        }
      }).catch(err => console.error('Error fetching cards:', err));

      cardFirebaseService.getTransactions(undefined, userId).then(txs => {
        if (txs) {
          dispatch(setCardTransactions(txs));
        }
      }).catch(err => console.error('Error fetching card transactions:', err));
    }
  }, [dispatch, userId]);

  const activeCard: CreditCardItem | null = cards[activeIndex] || null;
  const isAddCardSlide = activeIndex >= cards.length;

  // Filter Card Transactions for active card
  const activeCardTransactions = cardTransactions.filter(
    t => activeCard && t.cardId === activeCard.id
  );

  const cardExpensesTotal = activeCardTransactions
    .filter(t => t.type !== 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const cardPaymentsTotal = activeCardTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netCardExpense = Math.max(0, cardExpensesTotal - cardPaymentsTotal);

  // Calculations
  const cardLimit = activeCard ? activeCard.totalLimit : 0;
  const usedAmount = activeCard ? Math.max(0, (activeCard.usedAmount || 0) + netCardExpense) : 0;

  // Available Limit = Card Limit - Total Transactions (Or Shared)
  const availableLimit = activeCard ? (availableLimits[activeCard.id] ?? 0) : 0;
  const usedPercentage = cardLimit > 0 ? Math.min(100, Math.round((usedAmount / cardLimit) * 100)) : 0;

  // Due Calculation: Due = Payment Date - Statement Date
  const calculateDueDays = (): number | null => {
    if (!activeCard || !activeCard.statementDay || !activeCard.paymentDueDays) {
      return null;
    }
    try {
      const today = dayjs();
      const stmtDay = Math.min(activeCard.statementDay, today.daysInMonth());

      // Find the most recent statement date
      let lastStatement = today.date(stmtDay);
      if (lastStatement.isAfter(today)) {
        lastStatement = lastStatement.subtract(1, 'month');
        // Clamp day for the previous month
        const prevMonthDays = lastStatement.daysInMonth();
        if (activeCard.statementDay > prevMonthDays) {
          lastStatement = lastStatement.date(prevMonthDays);
        }
      }

      // Payment due date = last statement date + paymentDueDays
      const paymentDue = lastStatement.add(activeCard.paymentDueDays, 'day');

      // If payment is already past, hide the due (return null)
      if (today.isAfter(paymentDue, 'day')) {
        return null;
      }

      return Math.max(0, paymentDue.diff(today, 'day'));
    } catch (err) {
      console.log('Error calculating due days:', err);
    }
    return null;
  };

  const dueDays = calculateDueDays();

  // Combine cards + Add Card slide
  const sliderData = [...cards, { isAddCard: true, id: 'add_card_slide' }];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      if (index !== activeIndex && index >= 0 && index < sliderData.length) {
        setActiveIndex(index);
      }
    }
  };

  const scrollToSlide = (index: number) => {
    setActiveIndex(index);
    if (sliderRef.current) {
      const width = sliderRef.current.clientWidth;
      sliderRef.current.scrollTo({ left: index * width, behavior: 'smooth' });
    }
  };

  const handleDeleteCard = async (card: CreditCardItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${card.cardName}"? All transactions associated with this card will also be permanently deleted.`
    );
    if (confirmDelete) {
      try {
        // Handle shared limit promotion: if this is a primary card, promote the first secondary card
        const secondaryCards = cards.filter(c => c.sharedCardId === card.id);
        if (secondaryCards.length > 0) {
          const newPrimary = secondaryCards[0];
          const updatedNewPrimary: CreditCardItem = {
            ...newPrimary,
            sharedCardId: undefined,
            totalLimit: card.totalLimit,
          };

          if (!USE_STATIC_DATA && userId) {
            await cardFirebaseService.update(newPrimary.id, {
              sharedCardId: '',
              totalLimit: card.totalLimit,
            });
          }
          dispatch(updateCard(updatedNewPrimary));

          // Update other secondary cards to point to the new promoted primary card
          for (let i = 1; i < secondaryCards.length; i++) {
            const secCard = secondaryCards[i];
            const updatedSecCard: CreditCardItem = {
              ...secCard,
              sharedCardId: newPrimary.id,
            };
            if (!USE_STATIC_DATA && userId) {
              await cardFirebaseService.update(secCard.id, {
                sharedCardId: newPrimary.id,
              });
            }
            dispatch(updateCard(updatedSecCard));
          }
        }

        if (!USE_STATIC_DATA && userId) {
          await cardFirebaseService.deleteCardAndTransactions(card.id);
        }
        dispatch(deleteCard(card.id));
        if (activeIndex >= cards.length - 1) {
          setActiveIndex(Math.max(0, cards.length - 2));
        }
        alert(`Card "${card.cardName}" has been deleted.`);
      } catch (err) {
        console.error('Error deleting card:', err);
        dispatch(deleteCard(card.id));
      }
    }
  };

  const handleOpenPayModal = () => {
    setSelectedPayCardId(activeCard ? activeCard.id : (cards.length > 0 ? cards[0].id : ''));
    setPayAmount(usedAmount > 0 ? usedAmount.toString() : '');
    setShowPayModal(true);
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const payCard = cards.find(c => c.id === selectedPayCardId) || activeCard;
    if (!payCard) return;

    setSubmittingPay(true);

    const transactionData: Omit<CardTransaction, 'id'> = {
      cardId: payCard.id,
      category: 'Bill Payment',
      description: `Bill Payment - ${payCard.cardName}`,
      amount: amountNum,
      date: getCurrentDate(),
      createdAt: new Date().toISOString(),
      userId: userId || '',
      type: 'income',
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
      alert(`₹${formatAmount(amountNum)} paid for ${payCard.cardName}!`);
      setShowPayModal(false);
    } catch (err) {
      console.error('Error recording payment in Firebase:', err);
      dispatch(addCardTransaction({ ...transactionData, id: Date.now().toString() }));
      setShowPayModal(false);
    } finally {
      setSubmittingPay(false);
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
        position: 'relative',
        boxSizing: 'border-box',
        paddingBottom: '90px',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(90deg, ${theme.primaryGradient.join(', ')})`,
          borderBottomLeftRadius: '30px',
          borderBottomRightRadius: '30px',
          paddingBottom: '24px',
        }}
      >
        <ScreenHeader title="My Cards" light showBack={true} rightIcon="bell-outline" />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          marginTop: '-15px',
          boxSizing: 'border-box',
          padding: '0 16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Horizontal Card Slider */}
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              gap: '0px',
              paddingTop: '12px',
              paddingBottom: '12px',
              marginTop: '-24px',
            }}
          >
            {sliderData.map((item: any) => {
              if (item.isAddCard) {
                return (
                  <div
                    key="add_card_slide"
                    onClick={() => navigate('/add-card')}
                    style={{
                      minWidth: '100%',
                      maxWidth: '100%',
                      scrollSnapAlign: 'start',
                      height: '210px',
                      borderRadius: '20px',
                      border: `2.5px dashed ${theme.border}`,
                      backgroundColor: theme.isDark ? '#1E293B' : theme.background,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      position: 'relative',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                      flexShrink: 0,
                    }}
                    className="active-opacity"
                  >
                    <div
                      style={{
                        width: '160px',
                        height: '105px',
                        borderRadius: '14px',
                        background: theme.buttonGradient ? `linear-gradient(135deg, ${theme.buttonGradient.join(', ')})` : theme.accent,
                        position: 'relative',
                        boxShadow: `0 8px 18px ${theme.accent}40`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '12px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <div style={{ width: '100%', height: '14px', backgroundColor: theme.isDark ? '#000000' : '#1E1B4B', borderRadius: '3px', marginTop: '10px' }} />
                      <div style={{ width: '60px', height: '6px', backgroundColor: '#FFFFFF', opacity: 0.8, borderRadius: '3px' }} />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-12px',
                          right: '-12px',
                          width: '44px',
                          height: '44px',
                          borderRadius: '22px',
                          backgroundColor: theme.accent,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          boxShadow: `0 4px 10px ${theme.accent}4D`,
                          color: '#FFFFFF',
                        }}
                      >
                        <Icon name="plus" size={26} color="#FFFFFF" />
                      </div>
                    </div>
                  </div>
                );
              }

              const card: CreditCardItem = item;
              const cardAvailable = availableLimits[card.id] ?? 0;
              const cardThemeObj = CARD_THEMES.find(t => t.id === (card.cardTheme || 'theme1')) || CARD_THEMES[0];

              return (
                <div
                  key={card.id}
                  style={{
                    minWidth: '100%',
                    maxWidth: '100%',
                    scrollSnapAlign: 'start',
                    height: '210px',
                    borderRadius: '20px',
                    backgroundImage: `url(${cardThemeObj.image})`,
                    backgroundSize: '110%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: '#FFFFFF',
                    padding: '20px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                    isolation: 'isolate',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '0.3px', color: 'rgba(255,255,255,0.9)' }}>
                      {card.cardName || 'Card Name - Bank'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '1px' }}>
                        {(card.cardType || 'VISA').toUpperCase()}
                      </span>
                      <button
                        onClick={(e) => handleDeleteCard(card, e)}
                        title="Delete Card"
                        style={{
                          border: 'none',
                          background: 'none',
                          color: 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        className="active-opacity"
                      >
                        <Icon name="trash-can-outline" size={18} color="rgba(255,255,255,0.8)" />
                      </button>
                    </div>
                  </div>

                  <div style={{ zIndex: 2, margin: '8px 0 4px 0' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '2px', fontFamily: 'monospace' }}>
                      {isHideDetails
                        ? '•••• •••• •••• ' + (card.cardNumber.slice(-4) || '7628')
                        : card.cardNumber || '3234 8678 4234 7628'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Available Limit
                        {(card.sharedCardId || cards.some(c => c.sharedCardId === card.id)) && (
                          <span style={{ fontSize: '9px', backgroundColor: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: '8px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
                            Shared
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>
                        {isHideDetails ? '••••••' : formatAmount(cardAvailable)}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsHideDetails(!isHideDetails)}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      className="active-opacity"
                    >
                      <Icon name={isHideDetails ? 'eye-off-outline' : 'eye-outline'} size={20} color="rgba(255,255,255,0.8)" />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', display: 'block' }}>Card Holder name</span>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{card.cardHolderName || 'Jeevanandham K'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', display: 'block' }}>Expiry date</span>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{card.expiryDate || '08/30'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', display: 'block' }}>CVV</span>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{isHideDetails ? '***' : card.cvv || '123'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slider Pagination Dots */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '6px', marginTop: '14px', marginBottom: '16px' }}>
            {sliderData.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToSlide(index)}
                style={{
                  width: index === activeIndex ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: index === activeIndex ? theme.accent : '#CBD5E1',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Details & Summary Box (when cards exist and active card selected) */}
          {cards.length > 0 && !isAddCardSlide && activeCard && (
            <>
              <div
                style={{
                  width: '100%',
                  backgroundColor: theme.isDark ? '#1E293B' : '#F4F6FB',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  border: theme.isDark ? `1px solid ${theme.border}` : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: theme.secondaryText, display: 'block' }}>Used</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: theme.primaryText }}>₹{formatAmount(usedAmount)}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: theme.secondaryText, display: 'block' }}>Available</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: theme.primaryText }}>₹{formatAmount(availableLimit)}</span>
                  </div>
                </div>

                <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${usedPercentage}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }} />
                </div>

                <div style={{ textAlign: 'center', fontSize: '13px', color: theme.secondaryText, fontWeight: '500' }}>
                  Total Credit Limit: ₹{formatAmount(cardLimit)} {activeCard && (activeCard.sharedCardId || cards.some(c => c.sharedCardId === activeCard.id)) ? '(Shared Limit)' : ''}
                </div>

                <div style={{ height: '1px', backgroundColor: theme.border, margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: theme.primaryText }}>₹{formatAmount(usedAmount)}</span>
                    {dueDays !== null ? (
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#B78103', display: 'block', marginTop: '2px' }}>
                        {dueDays === 0 ? 'Due today' : `Due in ${dueDays} days`}
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', fontWeight: '600', color: theme.secondaryText, display: 'block', marginTop: '2px' }}>
                        Bill Not Generated
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleOpenPayModal}
                    style={{
                      backgroundColor: theme.accent,
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '700',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: `0 4px 10px ${theme.accent}4D`,
                    }}
                    className="active-opacity"
                  >
                    PAY NOW
                  </button>
                </div>
              </div>

              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  margin: '18px 0 10px 0',
                  padding: '0 4px',
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: theme.primaryText, display: 'block' }}>
                    Bill Day
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: theme.primaryText, marginTop: '4px', display: 'block' }}>
                    {activeCard.statementDay ? `${activeCard.statementDay}${getOrdinalSuffix(activeCard.statementDay)} of month` : '-'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: theme.primaryText, display: 'block' }}>
                    Due After
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: theme.primaryText, marginTop: '4px', display: 'block' }}>
                    {activeCard.paymentDueDays ? `${activeCard.paymentDueDays} days` : '-'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Transactions History Section (Separate Collection, Same UI Design as HomeScreen) */}
          <div style={{ width: '100%', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '17px', fontWeight: '700', color: theme.primaryText }}>
                Transactions History
              </span>
            </div>

            {cards.length === 0 || isAddCardSlide ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: theme.primaryText, fontWeight: '700', fontSize: '16px' }}>
                No Transactions
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: theme.cardBackground,
                  borderRadius: '16px',
                  padding: '4px 0',
                  border: theme.isDark ? `1px solid ${theme.border}` : 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {activeCardTransactions.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 0', gap: '10px' }}>
                    <Icon name="alert-circle-outline" size={44} color={theme.secondaryText} />
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>No transactions yet for this card</span>
                  </div>
                ) : (
                  activeCardTransactions.map((transaction, index) => (
                    <div key={transaction.id} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <TransactionItem
                        category={transaction.category}
                        description={transaction.description}
                        date={transaction.date}
                        amount={transaction.amount}
                        type={transaction.type || 'expense'}
                      />
                      {index < activeCardTransactions.length - 1 && (
                        <div style={{ height: '1px', backgroundColor: theme.border, margin: '0 16px' }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB (+) Button for Add Card Transaction */}
      {cards.length > 0 && !isAddCardSlide && (
        <button
          onClick={() => navigate(activeCard ? `/add-card-transaction?cardId=${activeCard.id}` : '/add-card-transaction')}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            backgroundColor: theme.accent,
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: `0 8px 18px ${theme.accent}66`,
            zIndex: 100,
          }}
          className="active-opacity"
        >
          <Icon name="plus" size={28} color="#FFFFFF" />
        </button>
      )}

      {/* Pay Now Modal */}
      {showPayModal && (
        <div
          style={{
            position: 'fixed',
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
          onClick={() => setShowPayModal(false)}
        >
          <div
            style={{
              backgroundColor: theme.cardBackground,
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              boxShadow: '0 -4px 10px rgba(0,0,0,0.15)',
              maxWidth: '500px',
              width: '100%',
              margin: '0 auto',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: '20px', fontWeight: '700', color: theme.primaryText, display: 'block' }}>
              Pay Card Bill
            </span>

            {/* Select Card Selector inside Pay Modal */}
            {cards.length > 0 && (
              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Select Card</label>
                <select
                  value={selectedPayCardId}
                  onChange={(e) => setSelectedPayCardId(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.background,
                    color: theme.primaryText,
                    fontSize: '14px',
                    fontWeight: '500',
                    outline: 'none',
                  }}
                >
                  {cards.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.cardName} (•••• {c.cardNumber.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleCompletePayment} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: theme.secondaryText }}>Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount"
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.background,
                    color: theme.primaryText,
                    fontSize: '16px',
                    fontWeight: '600',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: theme.secondaryText,
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPay}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: theme.accent,
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: `0 4px 10px ${theme.accent}4D`,
                  }}
                  className="active-opacity"
                >
                  {submittingPay ? 'Processing...' : 'Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCardsScreen;
