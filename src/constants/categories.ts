export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  {id: 'food', name: 'Food', icon: 'food', color: '#FF9800'},
  {id: 'vegetables', name: 'Vegetables', icon: 'leaf', color: '#4CAF50'},
  {id: 'groceries', name: 'Groceries', icon: 'cart', color: '#2196F3'},
  {id: 'cake', name: 'Cake', icon: 'cake', color: '#E91E63'},
  {id: 'loan', name: 'Loan', icon: 'bank', color: '#9C27B0'},
  {id: 'snacks', name: 'Snacks', icon: 'food-apple', color: '#FF5722'},
  {id: 'rent', name: 'Rent', icon: 'home', color: '#795548'},
  {id: 'household', name: 'Household', icon: 'home-city', color: '#607D8B'},
  {id: 'electricity', name: 'Electricity', icon: 'flash', color: '#FFC107'},
  {id: 'lpg_bill', name: 'LPG Bill', icon: 'fire', color: '#F44336'},
  {id: 'mobile_recharge', name: 'Mobile Recharge', icon: 'cellphone', color: '#00BCD4'},
  {id: 'apparel', name: 'Apparel', icon: 'tshirt-crew', color: '#673AB7'},
  {id: 'education', name: 'Education', icon: 'school', color: '#3F51B5'},
  {id: 'health', name: 'Health', icon: 'heart-pulse', color: '#F44336'},
  {id: 'beauty', name: 'Beauty', icon: 'palette-outline', color: '#E91E63'},
  {id: 'transportation', name: 'Transportation', icon: 'train', color: '#03A9F4'},
  {id: 'broadband_payment', name: 'Broadband Payment', icon: 'wifi', color: '#00ACC1'},
  {id: 'entertainment', name: 'Entertainment', icon: 'movie', color: '#FF5722'},
  {id: 'gift', name: 'Gift', icon: 'gift', color: '#FF4081'},
  {id: 'investment', name: 'Investment', icon: 'chart-line', color: '#009688'},
  {id: 'travel', name: 'Travel', icon: 'airplane', color: '#3F51B5'},
  {id: 'petrol', name: 'Petrol', icon: 'gas-station', color: '#0288D1'},
  {id: 'breakfast', name: 'Breakfast', icon: 'coffee', color: '#FFB300'},
  {id: 'lunch', name: 'Lunch', icon: 'silverware-fork-knife', color: '#E65100'},
  {id: 'dinner', name: 'Dinner', icon: 'food-variant', color: '#673AB7'},
  {id: 'other', name: 'Other', icon: 'dots-horizontal', color: '#9E9E9E'},
];

export const INCOME_CATEGORIES: Category[] = [
  {id: 'salary', name: 'Salary', icon: 'cash', color: '#4CAF50'},
  {id: 'bonus', name: 'Bonus', icon: 'gift', color: '#FF9800'},
  {id: 'gift', name: 'Gift', icon: 'gift-outline', color: '#E91E63'},
  {id: 'business', name: 'Business', icon: 'briefcase', color: '#2196F3'},
  {id: 'refund', name: 'Refund', icon: 'cash-refund', color: '#00BCD4'},
  {id: 'allowance', name: 'Allowance', icon: 'wallet', color: '#9C27B0'},
  {id: 'profit', name: 'Profit', icon: 'trending-up', color: '#8BC34A'},
  {id: 'cash', name: 'Cash', icon: 'cash-multiple', color: '#4CAF50'},
  {id: 'other', name: 'Other', icon: 'dots-horizontal', color: '#9E9E9E'},
];

export const FIXED_COMMITMENT_CATEGORIES = [
  'loan',
  'rent',
  'electricity',
  'lpg_bill',
  'education',
];
