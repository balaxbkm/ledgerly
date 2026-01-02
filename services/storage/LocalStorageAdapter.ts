import { StorageService } from "./StorageService";
import { Expense, Loan, Settings, Category } from "@/types";

const KEYS = {
    EXPENSES: "ledgerly_expenses",
    LOANS: "ledgerly_loans",
    SETTINGS: "ledgerly_settings",
    CATEGORIES: "ledgerly_categories",
};

export class LocalStorageAdapter implements StorageService {
    /* Helper to simulate async for API-like behavior */
    private async delay(ms = 100): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private get<T>(key: string): T[] {
        if (typeof window === "undefined") return [];
        try {
            const item = localStorage.getItem(key);
            if (!item) return [];
            const parsed = JSON.parse(item);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error(`Error parsing data for key ${key}:`, error);
            return [];
        }
    }

    private set<T>(key: string, data: T[]): void {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving data for key ${key}:`, error);
        }
    }

    // --- Expenses ---
    async getExpenses(): Promise<Expense[]> {
        await this.delay();
        return this.get<Expense>(KEYS.EXPENSES);
    }

    async addExpense(expense: Expense): Promise<void> {
        await this.delay();
        const expenses = this.get<Expense>(KEYS.EXPENSES);
        this.set(KEYS.EXPENSES, [expense, ...expenses]);
    }

    async updateExpense(updated: Expense): Promise<void> {
        await this.delay();
        const expenses = this.get<Expense>(KEYS.EXPENSES);
        const newExpenses = expenses.map((e) => (e.id === updated.id ? updated : e));
        this.set(KEYS.EXPENSES, newExpenses);
    }

    async deleteExpense(id: string): Promise<void> {
        await this.delay();
        const expenses = this.get<Expense>(KEYS.EXPENSES);
        this.set(KEYS.EXPENSES, expenses.filter((e) => e.id !== id));
    }

    // --- Loans ---
    async getLoans(): Promise<Loan[]> {
        await this.delay();
        return this.get<Loan>(KEYS.LOANS);
    }

    async addLoan(loan: Loan): Promise<void> {
        await this.delay();
        const loans = this.get<Loan>(KEYS.LOANS);
        this.set(KEYS.LOANS, [loan, ...loans]);
    }

    async updateLoan(updated: Loan): Promise<void> {
        await this.delay();
        const loans = this.get<Loan>(KEYS.LOANS);
        const newLoans = loans.map((l) => (l.id === updated.id ? updated : l));
        this.set(KEYS.LOANS, newLoans);
    }

    async deleteLoan(id: string): Promise<void> {
        await this.delay();
        const loans = this.get<Loan>(KEYS.LOANS);
        this.set(KEYS.LOANS, loans.filter((l) => l.id !== id));
    }

    // --- Categories ---
    async getCategories(): Promise<Category[]> {
        await this.delay();
        return this.get<Category>(KEYS.CATEGORIES);
    }

    async addCategory(category: Category): Promise<void> {
        await this.delay();
        const categories = this.get<Category>(KEYS.CATEGORIES);
        this.set(KEYS.CATEGORIES, [category, ...categories]);
    }

    async updateCategory(updated: Category): Promise<void> {
        await this.delay();
        const categories = this.get<Category>(KEYS.CATEGORIES);
        const newCategories = categories.map((c) => (c.id === updated.id ? updated : c));
        this.set(KEYS.CATEGORIES, newCategories);
    }

    async deleteCategory(id: string): Promise<void> {
        await this.delay();
        const categories = this.get<Category>(KEYS.CATEGORIES);
        this.set(KEYS.CATEGORIES, categories.filter((c) => c.id !== id));
    }

    // --- Settings ---
    async getSettings(): Promise<Settings | null> {
        await this.delay();
        const item = localStorage.getItem(KEYS.SETTINGS);
        return item ? JSON.parse(item) : null;
    }

    async saveSettings(settings: Settings): Promise<void> {
        await this.delay();
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    }

    async clearAll(): Promise<void> {
        await this.delay();
        localStorage.clear();
    }
}
