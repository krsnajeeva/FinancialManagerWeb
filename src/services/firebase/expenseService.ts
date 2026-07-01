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
import { Expense } from '../../types/expense';

export const expenseFirebaseService = {
  getAll: async (userId?: string): Promise<Expense[]> => {
    const collRef = collection(db, COLLECTIONS.EXPENSES);
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
        fixedCommitment: data.fixedCommitment || false,
        date: data.date || '',
        createdAt: data.createdAt || '',
        userId: data.userId || '',
      } as Expense;
    });
    return list.sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  add: async (expense: Omit<Expense, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.EXPENSES), expense);
    return docRef.id;
  },

  update: async (id: string, expense: Partial<Expense>): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.EXPENSES, id), expense);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.EXPENSES, id));
  },
};
