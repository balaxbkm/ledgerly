"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/utils/cn";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, CreditCard, MoreHorizontal, Calendar } from "lucide-react";
import { format, isSameMonth, subMonths } from "date-fns";
import { CATEGORY_COLORS, CATEGORY_ICONS, getExpenseIcon } from "@/utils/constants";

export function SummaryCards() {
    const { expenses, loans } = useFinance();
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const lastMonth = subMonths(selectedMonth, 1);

    // Calculate Expenses
    const thisMonthExpenses = expenses
        .filter(e => isSameMonth(new Date(e.date), selectedMonth))
        .reduce((sum, e) => sum + e.amount, 0);

    const lastMonthExpenses = expenses
        .filter(e => isSameMonth(new Date(e.date), lastMonth))
        .reduce((sum, e) => sum + e.amount, 0);

    const expenseTrend = lastMonthExpenses > 0
        ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
        : 0;

    // Calculate Loans (Net)
    const moneyLent = loans
        .filter(l => l.loanType === "lent" && l.status === "pending")
        .reduce((sum, l) => sum + l.amount, 0);

    const moneyBorrowed = loans
        .filter(l => l.loanType === "borrowed" && l.status === "pending")
        .reduce((sum, l) => sum + l.amount, 0);

    const activeItemRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isPickerOpen && activeItemRef.current) {
            activeItemRef.current.scrollIntoView({ block: "center" });
        }
    }, [isPickerOpen]);

    const groupedMonths = useMemo(() => {
        const months = Array.from({ length: 18 }, (_, i) => {
            const d = subMonths(new Date(), i);
            return {
                date: d,
                year: format(d, "yyyy"),
                label: format(d, "MMMM"),
            };
        });

        const groups: Record<string, typeof months> = {};
        months.forEach(m => {
            if (!groups[m.year]) groups[m.year] = [];
            groups[m.year].push(m);
        });
        return groups;
    }, []);

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="overflow-visible">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
                    <div className="flex items-center gap-2 relative">
                        <button
                            onClick={() => setIsPickerOpen(!isPickerOpen)}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 uppercase"
                        >
                            {format(selectedMonth, "MMM yyyy")}
                        </button>

                        {isPickerOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10 bg-transparent"
                                    onClick={() => setIsPickerOpen(false)}
                                />
                                <div className="absolute right-0 top-full z-20 mt-2 w-32 rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95 overflow-hidden">
                                    <div className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        {Object.entries(groupedMonths)
                                            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                                            .map(([year, months]) => (
                                                <div key={year}>
                                                    <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground bg-muted text-left sticky top-0 z-10 border-b border-t first:border-t-0 mb-1">
                                                        {year}
                                                    </div>
                                                    {months.map((m) => {
                                                        const isActive = isSameMonth(selectedMonth, m.date);
                                                        return (
                                                            <button
                                                                key={m.date.toISOString()}
                                                                ref={isActive ? activeItemRef : null}
                                                                onClick={() => {
                                                                    setSelectedMonth(m.date);
                                                                    setIsPickerOpen(false);
                                                                }}
                                                                className={cn(
                                                                    "w-full px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50 font-medium",
                                                                    isActive
                                                                        ? "bg-primary/10 text-primary"
                                                                        : "text-popover-foreground"
                                                                )}
                                                            >
                                                                {m.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </>
                        )}
                        <CreditCard className="h-4 w-4 text-muted-foreground opacity-50 ml-2" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(thisMonthExpenses)}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        {expenseTrend > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1 text-destructive" />
                        ) : (
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500 transform rotate-180" />
                        )}
                        <span className={expenseTrend > 0 ? "text-destructive" : "text-green-500"}>
                            {Math.abs(expenseTrend).toFixed(1)}%
                        </span>
                        <span className="ml-1">from previous month</span>
                    </p>
                </CardContent>
            </Card>


            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Money Lent</CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-secondary">{formatCurrency(moneyLent)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Active loans to give back to you
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Money Borrowed</CardTitle>
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">{formatCurrency(moneyBorrowed)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Debts you need to clear
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export function RecentTransactions() {
    const { expenses, loans, categories } = useFinance();

    // Combine and sort
    const transactions = [
        ...expenses.map(e => ({ ...e, type: "expense" as const, dateObj: new Date(e.date) })),
        ...loans.map(l => ({ ...l, type: "loan" as const, dateObj: new Date(l.startDate) }))
    ].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
        .slice(0, 5);

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                No recent activity.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <div className="space-y-4">
                {transactions.map((item) => {
                    // Determine Icon and Color
                    let Icon = MoreHorizontal;
                    let colorClass = "bg-muted text-muted-foreground";

                    if (item.type === "expense") {
                        const cat = categories.find(c => c.name === (item as any).category);
                        if (cat) {
                            Icon = CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS.Misc;
                            colorClass = cat.color;
                        } else {
                            // Fallback for legacy data or missing cats
                            Icon = getExpenseIcon((item as any).category, (item as any).notes);
                            colorClass = CATEGORY_COLORS[(item as any).category] || CATEGORY_COLORS.Misc;
                        }
                    } else {
                        // Loan styling
                        if ((item as any).loanType === "lent") {
                            Icon = ArrowUpRight;
                            colorClass = "bg-secondary/10 text-secondary";
                        } else {
                            Icon = ArrowDownRight;
                            colorClass = "bg-destructive/10 text-destructive";
                        }
                    }

                    return (
                        <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs",
                                    colorClass
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">
                                        {item.type === "expense" ? (item as any).category : (item as any).personName}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {format(item.dateObj, "MMM d")} • {item.type === "expense" ? (item as any).notes || "Expense" : "Loan"}
                                    </p>
                                </div>
                            </div>
                            <div className="font-medium">
                                {item.type === "expense" ? "-" : (item as any).loanType === "lent" ? "-" : "+"}
                                {formatCurrency(item.amount)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
