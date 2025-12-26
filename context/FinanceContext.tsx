"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Expense, Loan, Settings, Category } from "@/types";
import { StorageService } from "@/services/storage/StorageService";
import { LocalStorageAdapter } from "@/services/storage/LocalStorageAdapter";
import { useAuth } from "@/context/AuthContext";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/utils/constants";

interface FinanceContextType {
    expenses: Expense[];
    loans: Loan[];
    settings: Settings | null;
    categories: Category[]; // NEW
    isLoading: boolean;

    // Expenses
    addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
    updateExpense: (expense: Expense) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;

    // Loans
    addLoan: (loan: Omit<Loan, "id">) => Promise<void>;
    updateLoan: (loan: Loan) => Promise<void>;
    deleteLoan: (id: string) => Promise<void>;

    // Categories (NEW)
    addCategory: (category: Omit<Category, "id">) => Promise<void>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;

    // Settings
    saveSettings: (settings: Settings) => Promise<void>;
    refreshData: () => Promise<void>;
    seedData: (force?: boolean) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);



export function FinanceProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [storage] = useState<StorageService>(() => new LocalStorageAdapter());

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [loadedExpenses, loadedLoans, loadedSettings, loadedCategories] = await Promise.all([
                storage.getExpenses(),
                storage.getLoans(),
                storage.getSettings(),
                storage.getCategories(),
            ]);
            setExpenses(loadedExpenses);
            setLoans(loadedLoans);
            setSettings(loadedSettings);
            setCategories(loadedCategories);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    }, [storage]);

    const seedData = useCallback(async (force: boolean = false) => {
        const { SAMPLE_EXPENSES, SAMPLE_LOANS } = await import("@/utils/sampleData");

        // Seed Categories
        const currentCategories = await storage.getCategories();
        if (force || currentCategories.length === 0) {
            for (const [name, color] of Object.entries(CATEGORY_COLORS)) {
                await storage.addCategory({
                    id: crypto.randomUUID(),
                    name,
                    color,
                    icon: name,
                    isDefault: true
                });
            }
        }

        // Seed expenses
        const currentExpenses = await storage.getExpenses();
        if (force || currentExpenses.length === 0) {
            for (const exp of SAMPLE_EXPENSES) {
                const newExpense: Expense = { ...exp, id: crypto.randomUUID() };
                await storage.addExpense(newExpense);
            }
        }

        // Seed loans
        const currentLoans = await storage.getLoans();
        if (force || currentLoans.length === 0) {
            for (const loan of SAMPLE_LOANS) {
                const newLoan: Loan = { ...loan, id: crypto.randomUUID() };
                await storage.addLoan(newLoan);
            }
        }

        await loadData();
    }, [storage, loadData]);

    useEffect(() => {
        if (isAuthenticated) {
            loadData().then(() => {
                seedData();
            });
        }
    }, [isAuthenticated, loadData, seedData]);

    // Expenses
    const addExpense = async (data: Omit<Expense, "id">) => {
        const newExpense: Expense = { ...data, id: crypto.randomUUID() };
        await storage.addExpense(newExpense);
        await loadData();
    };

    const updateExpense = async (expense: Expense) => {
        await storage.updateExpense(expense);
        await loadData();
    };

    const deleteExpense = async (id: string) => {
        await storage.deleteExpense(id);
        await loadData();
    };

    // Loans
    const addLoan = async (data: Omit<Loan, "id">) => {
        const newLoan: Loan = { ...data, id: crypto.randomUUID() };
        await storage.addLoan(newLoan);
        await loadData();
    };

    const updateLoan = async (loan: Loan) => {
        await storage.updateLoan(loan);
        await loadData();
    };

    const deleteLoan = async (id: string) => {
        await storage.deleteLoan(id);
        await loadData();
    };

    // Categories
    const addCategory = async (data: Omit<Category, "id">) => {
        const newCategory: Category = { ...data, id: crypto.randomUUID() };
        await storage.addCategory(newCategory);
        await loadData();
    }

    const updateCategory = async (category: Category) => {
        await storage.updateCategory(category);
        await loadData();
    }

    const deleteCategory = async (id: string) => {
        await storage.deleteCategory(id);
        await loadData();
    }

    // Settings
    const saveSettings = async (newSettings: Settings) => {
        await storage.saveSettings(newSettings);
        await loadData();
    };

    return (
        <FinanceContext.Provider
            value={{
                expenses,
                loans,
                settings,
                categories,
                isLoading,
                addExpense,
                updateExpense,
                deleteExpense,
                addLoan,
                updateLoan,
                deleteLoan,
                addCategory,
                updateCategory,
                deleteCategory,
                saveSettings,
                refreshData: loadData,
                seedData,
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance() {
    const context = useContext(FinanceContext);
    if (!context) {
        throw new Error("useFinance must be used within a FinanceProvider");
    }
    return context;
}
