import { StorageService } from "./StorageService";
import { Expense, Loan, Settings, Category } from "@/types";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    getDoc,
    setDoc,
    doc,
    deleteDoc,
    query,
    orderBy
} from "firebase/firestore";

const COLLECTION_EXPENSES = "expenses";
const COLLECTION_LOANS = "loans";
const COLLECTION_CATEGORIES = "categories";
const COLLECTION_SETTINGS = "settings";
const DOC_SETTINGS = "app_settings";

export class FirebaseAdapter implements StorageService {

    // --- Expenses ---
    async getExpenses(): Promise<Expense[]> {
        try {
            const q = query(collection(db, COLLECTION_EXPENSES), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data() as Expense);
        } catch (error) {
            console.error("Error getting expenses:", error);
            return [];
        }
    }

    async addExpense(expense: Expense): Promise<void> {
        try {
            await setDoc(doc(db, COLLECTION_EXPENSES, expense.id), expense);
        } catch (error) {
            console.error("Error adding expense:", error);
            throw error;
        }
    }

    async updateExpense(updated: Expense): Promise<void> {
        try {
            await setDoc(doc(db, COLLECTION_EXPENSES, updated.id), updated, { merge: true });
        } catch (error) {
            console.error("Error updating expense:", error);
            throw error;
        }
    }

    async deleteExpense(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, COLLECTION_EXPENSES, id));
        } catch (error) {
            console.error("Error deleting expense:", error);
            throw error;
        }
    }

    // --- Loans ---
    async getLoans(): Promise<Loan[]> {
        try {
            // Loans don't have a single date field that's always populated for sorting ideally, 
            // but startDate is a good candidate.
            const querySnapshot = await getDocs(collection(db, COLLECTION_LOANS));
            return querySnapshot.docs.map(doc => doc.data() as Loan);
        } catch (error) {
            console.error("Error getting loans:", error);
            return [];
        }
    }

    async addLoan(loan: Loan): Promise<void> {
        try {
            await setDoc(doc(db, COLLECTION_LOANS, loan.id), loan);
        } catch (error) {
            console.error("Error adding loan:", error);
            throw error;
        }
    }

    async updateLoan(updated: Loan): Promise<void> {
        try {
            await setDoc(doc(db, COLLECTION_LOANS, updated.id), updated, { merge: true });
        } catch (error) {
            console.error("Error updating loan:", error);
            throw error;
        }
    }

    async deleteLoan(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, COLLECTION_LOANS, id));
        } catch (error) {
            console.error("Error deleting loan:", error);
            throw error;
        }
    }

    // --- Categories ---
    async getCategories(): Promise<Category[]> {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_CATEGORIES));
            return querySnapshot.docs.map(doc => doc.data() as Category);
        } catch (error) {
            console.error("Error getting categories:", error);
            return [];
        }
    }

    async addCategory(category: Category): Promise<void> {
        try {
            await setDoc(doc(db, COLLECTION_CATEGORIES, category.id), category);
        } catch (error) {
            console.error("Error adding category:", error);
            throw error;
        }
    }

    async updateCategory(updated: Category): Promise<void> {
        try {
            await setDoc(doc(db, COLLECTION_CATEGORIES, updated.id), updated, { merge: true });
        } catch (error) {
            console.error("Error updating category:", error);
            throw error;
        }
    }

    async deleteCategory(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, COLLECTION_CATEGORIES, id));
        } catch (error) {
            console.error("Error deleting category:", error);
            throw error;
        }
    }

    // --- Settings ---
    async getSettings(): Promise<Settings | null> {
        try {
            const docRef = doc(db, COLLECTION_SETTINGS, DOC_SETTINGS);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as Settings;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error getting settings:", error);
            return null;
        }
    }

    async saveSettings(settings: Settings): Promise<void> {
        try {
            await setDoc(doc(db, COLLECTION_SETTINGS, DOC_SETTINGS), settings);
        } catch (error) {
            console.error("Error saving settings:", error);
            throw error;
        }
    }

    async clearAll(): Promise<void> {
        try {
            const collections = [COLLECTION_EXPENSES, COLLECTION_LOANS, COLLECTION_CATEGORIES, COLLECTION_SETTINGS];
            for (const colName of collections) {
                const q = query(collection(db, colName));
                const snapshot = await getDocs(q);
                const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deletePromises);
            }
        } catch (error) {
            console.error("Error clearing all data:", error);
            throw error;
        }
    }
}
