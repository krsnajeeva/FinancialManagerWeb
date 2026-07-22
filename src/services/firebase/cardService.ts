import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db, COLLECTIONS } from './config';
import { CreditCardItem, CardTransaction } from '../../types/card';

export const cardFirebaseService = {
  getAll: async (userId?: string): Promise<CreditCardItem[]> => {
    try {
      const collRef = collection(db, COLLECTIONS.CARDS);
      let q = query(collRef);
      if (userId) {
        q = query(collRef, where('userId', '==', userId));
      }
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap: any) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          cardName: data.cardName || '',
          cardType: data.cardType || 'Visa',
          cardNumber: data.cardNumber || '',
          totalLimit: data.totalLimit || 0,
          usedAmount: data.usedAmount || 0,
          cardHolderName: data.cardHolderName || '',
          expiryDate: data.expiryDate || '',
          cvv: data.cvv || '',
          statementDate: data.statementDate || '',
          paymentDate: data.paymentDate || '',
          cardTheme: data.cardTheme || 'theme1',
          userId: data.userId || '',
          createdAt: data.createdAt || new Date().toISOString(),
          sharedCardId: data.sharedCardId || undefined,
        } as CreditCardItem;
      });
      return list;
    } catch (err) {
      console.warn('Firestore getAll cards failed or permissions missing:', err);
      return [];
    }
  },

  add: async (card: Omit<CreditCardItem, 'id'>): Promise<string> => {
    try {
      const cleanedCard: any = {};
      Object.keys(card).forEach(key => {
        const val = (card as any)[key];
        if (val !== undefined) {
          cleanedCard[key] = val;
        }
      });
      const docRef = await addDoc(collection(db, COLLECTIONS.CARDS), cleanedCard);
      return docRef.id;
    } catch (err) {
      console.warn('Firestore add card failed or permissions missing:', err);
      return Date.now().toString();
    }
  },

  update: async (id: string, card: Partial<CreditCardItem>): Promise<void> => {
    try {
      const cleanedCard: any = {};
      Object.keys(card).forEach(key => {
        const val = (card as any)[key];
        if (val !== undefined) {
          cleanedCard[key] = val;
        }
      });
      await updateDoc(doc(db, COLLECTIONS.CARDS, id), cleanedCard);
    } catch (err) {
      console.warn('Firestore update card failed or permissions missing:', err);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.CARDS, id));
    } catch (err) {
      console.warn('Firestore delete card failed or permissions missing:', err);
    }
  },

  // Card Transactions Firestore Methods
  getTransactions: async (cardId?: string, userId?: string): Promise<CardTransaction[]> => {
    try {
      const collRef = collection(db, COLLECTIONS.CARD_TRANSACTIONS);
      let q = query(collRef);
      if (userId && cardId) {
        q = query(collRef, where('userId', '==', userId), where('cardId', '==', cardId));
      } else if (cardId) {
        q = query(collRef, where('cardId', '==', cardId));
      } else if (userId) {
        q = query(collRef, where('userId', '==', userId));
      }
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap: any) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          cardId: data.cardId || '',
          category: data.category || '',
          description: data.description || '',
          amount: data.amount || 0,
          date: data.date || '',
          createdAt: data.createdAt || new Date().toISOString(),
          userId: data.userId || '',
          type: data.type || 'expense',
        } as CardTransaction;
      });
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (err) {
      console.warn('Firestore getTransactions failed or permissions missing:', err);
      return [];
    }
  },

  addTransaction: async (transaction: Omit<CardTransaction, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.CARD_TRANSACTIONS), transaction);
      return docRef.id;
    } catch (err) {
      console.warn('Firestore addTransaction failed or permissions missing:', err);
      return Date.now().toString();
    }
  },

  deleteTransaction: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.CARD_TRANSACTIONS, id));
    } catch (err) {
      console.warn('Firestore deleteTransaction failed or permissions missing:', err);
    }
  },

  // Delete Card along with all its transactions
  deleteCardAndTransactions: async (cardId: string): Promise<void> => {
    try {
      // Delete card document
      await deleteDoc(doc(db, COLLECTIONS.CARDS, cardId));
      
      // Delete all associated card transactions
      const txRef = collection(db, COLLECTIONS.CARD_TRANSACTIONS);
      const q = query(txRef, where('cardId', '==', cardId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      console.warn('Firestore deleteCardAndTransactions failed or permissions missing:', err);
    }
  },
};
