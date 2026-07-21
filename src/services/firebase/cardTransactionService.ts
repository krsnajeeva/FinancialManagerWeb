import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, COLLECTIONS } from './config';
import { CardTransaction } from '../../types/card';

export const cardTransactionFirebaseService = {
  getAll: async (userId?: string): Promise<CardTransaction[]> => {
    const collRef = collection(db, COLLECTIONS.CARD_TRANSACTIONS);
    let q = query(collRef);
    if (userId) {
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
    return list;
  },

  getByCardId: async (cardId: string): Promise<CardTransaction[]> => {
    const collRef = collection(db, COLLECTIONS.CARD_TRANSACTIONS);
    const q = query(collRef, where('cardId', '==', cardId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap: any) => {
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
  },

  add: async (transaction: Omit<CardTransaction, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.CARD_TRANSACTIONS), transaction);
    return docRef.id;
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.CARD_TRANSACTIONS, id));
  },

  deleteByCardId: async (cardId: string): Promise<void> => {
    const collRef = collection(db, COLLECTIONS.CARD_TRANSACTIONS);
    const q = query(collRef, where('cardId', '==', cardId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  },
};
