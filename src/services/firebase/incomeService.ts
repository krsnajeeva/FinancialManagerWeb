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
import { Income } from '../../types/income';

export const incomeFirebaseService = {
  getAll: async (userId?: string): Promise<Income[]> => {
    const collRef = collection(db, COLLECTIONS.INCOMES);
    let q = query(collRef);
    if (userId) {
      q = query(collRef, where('userId', '==', userId));
    }
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((docSnap: any) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        category: data.category || '',
        description: data.description || '',
        amount: data.amount || 0,
        account: data.account || 'cash',
        date: data.date || '',
        createdAt: data.createdAt || '',
        userId: data.userId || '',
      } as Income;
    });
    return list.sort((a: Income, b: Income) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  add: async (income: Omit<Income, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.INCOMES), income);
    return docRef.id;
  },

  update: async (id: string, income: Partial<Income>): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.INCOMES, id), income);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.INCOMES, id));
  },
};
