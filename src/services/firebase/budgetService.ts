import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc,
  deleteDoc 
} from 'firebase/firestore';
import { db, COLLECTIONS } from './config';
import { Budget, CategoryBudget } from '../../types/budget';

export const budgetFirebaseService = {
  getBudget: async (month: number, year: number, userId?: string): Promise<Budget | null> => {
    const collRef = collection(db, COLLECTIONS.BUDGETS);
    let q = query(
      collRef,
      where('month', '==', month),
      where('year', '==', year)
    );
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      monthlyBudget: data.monthlyBudget || 0,
      month: data.month,
      year: data.year,
      userId: data.userId || '',
    } as Budget;
  },

  setBudget: async (budget: Budget): Promise<void> => {
    await setDoc(doc(db, COLLECTIONS.BUDGETS, budget.id), budget);
  },

  getCategoryBudgets: async (
    month: number,
    year: number,
    userId?: string,
  ): Promise<CategoryBudget[]> => {
    const collRef = collection(db, COLLECTIONS.CATEGORY_BUDGETS);
    let q = query(
      collRef,
      where('month', '==', month),
      where('year', '==', year)
    );
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap: any) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        category: data.category || '',
        budgetAmount: data.budgetAmount || 0,
        month: data.month,
        year: data.year,
        userId: data.userId || '',
      } as CategoryBudget;
    });
  },

  setCategoryBudget: async (categoryBudget: CategoryBudget): Promise<void> => {
    await setDoc(doc(db, COLLECTIONS.CATEGORY_BUDGETS, categoryBudget.id), categoryBudget);
  },

  deleteCategoryBudget: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.CATEGORY_BUDGETS, id));
  },
};
