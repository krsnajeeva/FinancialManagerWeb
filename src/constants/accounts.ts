export interface Account {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const ACCOUNTS: Account[] = [
  {id: 'cash', name: 'Cash', icon: 'cash', color: '#4CAF50'},
  {id: 'credit', name: 'Accounts', icon: 'bank', color: '#2196F3'},
  {id: 'card', name: 'Card', icon: 'credit-card', color: '#9C27B0'},
];
