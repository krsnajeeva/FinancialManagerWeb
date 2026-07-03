import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uuidv4 } from '../../utils/uuid';
import dayjs from 'dayjs';
import { COLORS } from '../../constants/colors';
import { EXPENSE_CATEGORIES, Category } from '../../constants/categories';
import { budgetRepository } from '../../services/budgetRepository';
import ScreenHeader from '../../components/cards/ScreenHeader';
import SelectionGrid from '../../components/inputs/SelectionGrid';
import { useAppSelector } from '../../redux/hooks';
import { useTheme } from '../../hooks/useTheme';

const AddBudgetScreen: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const userId = useAppSelector(state => state.settings.userId);

  const [category, setCategory] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [amount, setAmount] = useState('');
  const [focusedField, setFocusedField] = useState<'category' | 'description' | 'amount' | null>(null);
  const [loading, setLoading] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState('');
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  // Use full EXPENSE_CATEGORIES list to match AddExpenseScreen
  const gridCategories = EXPENSE_CATEGORIES;

  // Validate form inputs dynamically
  const parsedAmount = parseFloat(amount);
  const isFormValid = category !== '' && amount !== '' && !isNaN(parsedAmount) && parsedAmount > 0;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) {
      alert('Please select a category and enter a valid positive amount.');
      return;
    }

    setLoading(true);
    try {
      const categoryBudget = {
        id: uuidv4(),
        category: category,
        description: description.trim() || category,
        budgetAmount: parsedAmount,
        month: dayjs().month() + 1,
        year: dayjs().year(),
        userId: userId,
      };

      await budgetRepository.saveCategoryBudget(categoryBudget);
      setLoading(false);
      alert('Budget saved successfully');
      navigate(-1);
    } catch (error) {
      setLoading(false);
      alert('Failed to save budget. Please try again.');
      console.error('Error saving category budget:', error);
    }
  };

  const headerColors = theme.primaryGradient;
  const headerBgGradient = `linear-gradient(90deg, ${headerColors.join(', ')})`;
  const buttonGradient = `linear-gradient(90deg, ${theme.buttonGradient.join(', ')})`;

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
      {/* Curved Gradient Header */}
      <div
        style={{
          background: headerBgGradient,
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
          paddingBottom: '8px',
        }}
      >
        <ScreenHeader title="Add Budget" light showBack={true} rightIcon="bell-outline" />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <form
          onSubmit={handleSave}
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            margin: '16px',
            padding: '20px',
            marginBottom: '40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: theme.isDark ? `1px solid ${theme.border}` : 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Category Input Field */}
          <button
            type="button"
            onClick={() => setFocusedField('category')}
            style={{
              display: 'flex',
              flexDirection: 'row',
              border: `1.5px solid ${focusedField === 'category' ? theme.accent : theme.border}`,
              borderRadius: '12px',
              height: '52px',
              overflow: 'hidden',
              marginBottom: '16px',
              backgroundColor: theme.inputBackground,
              cursor: 'pointer',
              outline: 'none',
              boxSizing: 'border-box',
              padding: 0,
            }}
            className="active-opacity"
          >
            <div
              style={{
                width: '28%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRight: `1.5px solid ${theme.border}`,
                backgroundColor: theme.isDark ? '#2D2D2D' : '#F5ECEE',
                height: '100%',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '700', color: theme.primaryText }}>Category</span>
            </div>
            <div style={{ width: '72%', display: 'flex', alignItems: 'center', padding: '0 16px', textAlign: 'left' }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: category ? theme.primaryText : theme.secondaryText,
                }}
              >
                {category || 'Select category'}
              </span>
            </div>
          </button>

          {/* Description Input Field */}
          <div
            onClick={() => {
              setFocusedField('description');
              descriptionInputRef.current?.focus();
            }}
            style={{
              display: 'flex',
              flexDirection: 'row',
              border: `1.5px solid ${focusedField === 'description' ? theme.accent : theme.border}`,
              borderRadius: '12px',
              height: '52px',
              overflow: 'hidden',
              marginBottom: '16px',
              backgroundColor: theme.inputBackground,
              boxSizing: 'border-box',
              cursor: 'text',
            }}
          >
            <div
              style={{
                width: '28%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRight: `1.5px solid ${theme.border}`,
                backgroundColor: theme.isDark ? '#2D2D2D' : '#F5ECEE',
                height: '100%',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '700', color: theme.primaryText }}>Desc</span>
            </div>
            <div style={{ width: '72%', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
              <input
                ref={descriptionInputRef}
                style={{
                  flex: 1,
                  fontSize: '15px',
                  fontWeight: '600',
                  color: theme.primaryText,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  height: '100%',
                }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={category ? `Enter ${category.toLowerCase()} description` : "Enter description"}
                onFocus={() => setFocusedField('description')}
              />
            </div>
          </div>

          {/* Amount Input Field */}
          <div
            onClick={() => {
              setFocusedField('amount');
              amountInputRef.current?.focus();
            }}
            style={{
              display: 'flex',
              flexDirection: 'row',
              border: `1.5px solid ${focusedField === 'amount' ? theme.accent : theme.border}`,
              borderRadius: '12px',
              height: '52px',
              overflow: 'hidden',
              marginBottom: '16px',
              backgroundColor: theme.inputBackground,
              boxSizing: 'border-box',
              cursor: 'text',
            }}
          >
            <div
              style={{
                width: '28%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRight: `1.5px solid ${theme.border}`,
                backgroundColor: theme.isDark ? '#2D2D2D' : '#F5ECEE',
                height: '100%',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '700', color: theme.primaryText }}>Amount</span>
            </div>
            <div style={{ width: '72%', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
              <input
                ref={amountInputRef}
                style={{
                  flex: 1,
                  fontSize: '15px',
                  fontWeight: '600',
                  color: theme.primaryText,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  height: '100%',
                }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                type="number"
                step="0.01"
                min="0"
                onFocus={() => setFocusedField('amount')}
                required
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '12px',
              border: 'none',
              background: isFormValid ? buttonGradient : theme.border,
              color: isFormValid ? '#FFFFFF' : theme.secondaryText,
              fontSize: '16px',
              fontWeight: '700',
              cursor: isFormValid && !loading ? 'pointer' : 'not-allowed',
              boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box',
              marginTop: '8px',
            }}
            className={isFormValid && !loading ? "active-opacity" : ""}
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
              'Save'
            )}
          </button>

          {focusedField === 'category' && (
            <>
              <div style={{ height: '1px', backgroundColor: theme.border, margin: '24px 0' }} />

              {/* Selection Grid */}
              <SelectionGrid
                items={gridCategories}
                selectedId={selectedCatId}
                onSelect={id => {
                  const cat = EXPENSE_CATEGORIES.find(c => c.id === id);
                  if (cat) {
                    setCategory(cat.name);
                    setSelectedCatId(cat.id);
                    setFocusedField('description');
                    setTimeout(() => descriptionInputRef.current?.focus(), 50);
                  }
                }}
              />
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddBudgetScreen;
