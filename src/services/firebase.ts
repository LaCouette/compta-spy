import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Transaction } from '../types/accounting';

const EXPENSES_COLLECTION = 'expenses';

export const addExpense = async (expense: Omit<Transaction, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
      ...expense,
      date: Timestamp.fromDate(expense.date),
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...expense };
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const updateExpense = async (id: string, expense: Partial<Transaction>) => {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, id);
    if (expense.date) {
      expense.date = Timestamp.fromDate(expense.date);
    }
    await updateDoc(expenseRef, expense);
    return { id, ...expense };
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: string) => {
  try {
    await deleteDoc(doc(db, EXPENSES_COLLECTION, id));
    return id;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const getExpenses = async (startDate?: Date, endDate?: Date) => {
  try {
    let q = collection(db, EXPENSES_COLLECTION);
    
    if (startDate && endDate) {
      q = query(
        collection(db, EXPENSES_COLLECTION),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    })) as Transaction[];
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};