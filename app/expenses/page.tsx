"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ExpenseCategory } from "@/types";
import { cn } from "@/utils/cn";

export default function ExpensesPage() {
    const { expenses, isLoading } = useFinance();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "All">("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [sortConfig, setSortConfig] = useState<{ key: "date" | "amount" | "category" | "paymentMethod"; direction: "asc" | "desc" }>({
        key: "date",
        direction: "desc",
    });
    const [isSortOpen, setIsSortOpen] = useState(false);

    const filteredExpenses = useMemo(() => {
        return expenses
            .filter((e) => {
                const matchesSearch = e.notes?.toLowerCase().includes(search.toLowerCase()) ||
                    e.amount.toString().includes(search);
                const matchesCategory = categoryFilter === "All" || e.category === categoryFilter;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                const { key, direction } = sortConfig;
                let comparison = 0;

                if (key === "date") {
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                } else if (key === "amount") {
                    comparison = a.amount - b.amount;
                } else if (key === "category") {
                    comparison = a.category.localeCompare(b.category);
                } else if (key === "paymentMethod") {
                    comparison = a.paymentMethod.localeCompare(b.paymentMethod);
                }

                return direction === "asc" ? comparison : -comparison;
            });
    }, [expenses, search, categoryFilter, sortConfig]);

    const categories: (ExpenseCategory | "All")[] = ["All", "Food", "Fuel", "Rent", "Shopping", "Travel", "Medical", "Entertainment", "Bills", "Education", "Stationery", "EMI", "Investment", "Misc"];



    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
                    <p className="text-muted-foreground">Manage and track your spending.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                </Button>
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search expenses..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {/* Sort Dropdown */}
                    <div className="relative flex-1 sm:flex-none">
                        <div className="flex h-10 items-center rounded-md border border-input bg-background">
                            <button
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className="flex h-full items-center px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground border-r border-input rounded-l-md cursor-pointer"
                            >
                                <span className="capitalize">{sortConfig.key === "paymentMethod" ? "Payment Method" : sortConfig.key}</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSortConfig((current) => ({
                                        ...current,
                                        direction: current.direction === "asc" ? "desc" : "asc",
                                    }));
                                }}
                                className="flex h-full items-center px-2 hover:bg-accent hover:text-accent-foreground rounded-r-md cursor-pointer"
                                title={sortConfig.direction === "asc" ? "Switch to Descending" : "Switch to Ascending"}
                            >
                                {sortConfig.direction === "asc" ? (
                                    <ArrowUp className="h-4 w-4" />
                                ) : (
                                    <ArrowDown className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        {isSortOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10 bg-transparent"
                                    onClick={() => setIsSortOpen(false)}
                                />
                                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95">
                                    <div className="p-1 space-y-1">
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Sort By</div>
                                        {(["date", "amount", "category", "paymentMethod"] as const).map((key) => (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    setSortConfig((current) => ({ ...current, key }));
                                                    setIsSortOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted flex items-center justify-between cursor-pointer",
                                                    sortConfig.key === key ? "bg-primary/10 text-primary font-medium" : "text-popover-foreground"
                                                )}
                                            >
                                                <span className="capitalize">{key === "paymentMethod" ? "Payment Method" : key}</span>
                                                {sortConfig.key === key && (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                )}
                                            </button>
                                        ))}


                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative flex-1 sm:flex-none">
                        <Button
                            variant="outline"
                            className="gap-2 w-full justify-between sm:w-auto"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <span>{categoryFilter === "All" ? "Filter" : categoryFilter}</span>
                            </div>
                            {categoryFilter !== "All" && (
                                <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                    {filteredExpenses.length}
                                </span>
                            )}
                        </Button>

                        {isFilterOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10 bg-transparent"
                                    onClick={() => setIsFilterOpen(false)}
                                />
                                <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95">
                                    <div className="max-h-[300px] overflow-y-auto space-y-1 p-1">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    setCategoryFilter(cat);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                                                    categoryFilter === cat ? "bg-primary/10 text-primary font-medium" : "text-popover-foreground"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <ExpenseList expenses={filteredExpenses} isLoading={isLoading} sortKey={sortConfig.key} />

            {/* Add Modal */}
            <Modal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add New Expense"
            >
                <ExpenseForm onSuccess={() => setIsAddOpen(false)} />
            </Modal>
        </div>
    );
}
