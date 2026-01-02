import { Expense, Loan, Settings, Category } from "@/types";

export interface StorageService {
    // Expenses
    getExpenses(): Promise<Expense[]>;
    addExpense(expense: Expense): Promise<void>;
    updateExpense(expense: Expense): Promise<void>;
    deleteExpense(id: string): Promise<void>;

    // Loans
    getLoans(): Promise<Loan[]>;
    addLoan(loan: Loan): Promise<void>;
    updateLoan(loan: Loan): Promise<void>;
    deleteLoan(id: string): Promise<void>;

    // Categories
    getCategories(): Promise<Category[]>;
    addCategory(category: Category): Promise<void>;
    updateCategory(category: Category): Promise<void>;
    deleteCategory(id: string): Promise<void>;

    // Settings
    getSettings(): Promise<Settings | null>;
    saveSettings(settings: Settings): Promise<void>;

    // System
    clearAll(): Promise<void>;
}
