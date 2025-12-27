"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency, cn } from "@/utils/cn";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, MoreHorizontal, Calendar, TrendingDown, Layers } from "lucide-react";
import { format, isSameMonth, subMonths } from "date-fns";
import { CATEGORY_ICONS, getExpenseIcon } from "@/utils/constants";

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
        <div className="grid gap-6 md:grid-cols-3">
            {/* Total Spending - Creative Blue/Indigo Theme */}
            <div className="relative rounded-2xl border border-indigo-500/50 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg shadow-indigo-500/10 transition-all duration-300 hover:shadow-xl group">
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transition-transform duration-500 group-hover:scale-110">
                        <Wallet className="h-32 w-32 -mb-6 -mr-6 text-indigo-600" />
                    </div>
                </div>

                <div className="relative p-6 z-10 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                            Total Spending
                        </span>
                        <div className="relative">
                            <button
                                onClick={() => setIsPickerOpen(!isPickerOpen)}
                                className="text-[10px] font-bold bg-white/50 hover:bg-white text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 transition-colors uppercase flex items-center gap-1 shadow-sm"
                            >
                                <Calendar className="h-3 w-3" />
                                {format(selectedMonth, "MMM yyyy")}
                            </button>
                            {isPickerOpen && (
                                <>
                                    <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setIsPickerOpen(false)} />
                                    <div className="absolute right-0 top-full z-20 mt-2 w-32 rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
                                        <div className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                                            {Object.entries(groupedMonths)
                                                .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                                                .map(([year, months]) => (
                                                    <div key={year}>
                                                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
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
                                                                        "w-full px-3 py-2 text-left text-xs transition-colors font-medium border-l-2",
                                                                        isActive
                                                                            ? "bg-indigo-50 text-indigo-700 border-indigo-500"
                                                                            : "text-slate-600 border-transparent hover:bg-slate-50"
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
                        </div>
                    </div>

                    <span className="text-4xl font-black text-slate-800 tracking-tight mt-2">
                        {formatCurrency(thisMonthExpenses)}
                    </span>

                    <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex items-center gap-1",
                            expenseTrend > 0
                                ? "bg-red-50 text-red-600 border-red-100"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}>
                            {expenseTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(expenseTrend).toFixed(1)}%
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Money Lent - Creative Emerald Theme */}
            <div className="relative overflow-hidden p-6 rounded-2xl border border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-500/10 transition-all duration-300 hover:shadow-xl group">
                <div className="flex flex-col gap-1 relative z-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Money Lent
                    </span>
                    <span className="text-4xl font-black text-slate-800 tracking-tight mt-2">
                        {formatCurrency(moneyLent)}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                        Active loans to give back to you
                    </span>
                </div>

                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transition-transform duration-500 group-hover:scale-110">
                    <TrendingUp className="h-32 w-32 -mb-8 -mr-8 text-emerald-600" />
                </div>

                <div className="h-10 w-10 absolute top-6 right-6 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center rotate-0 group-hover:-rotate-12 transition-transform duration-300">
                    <ArrowUpRight className="h-5 w-5" />
                </div>
            </div>

            {/* Money Borrowed - Creative Orange Theme */}
            <div className="relative overflow-hidden p-6 rounded-2xl border border-orange-500/50 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg shadow-orange-500/10 transition-all duration-300 hover:shadow-xl group">
                <div className="flex flex-col gap-1 relative z-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                        Money Borrowed
                    </span>
                    <span className="text-4xl font-black text-slate-800 tracking-tight mt-2">
                        {formatCurrency(moneyBorrowed)}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                        Debts you need to clear
                    </span>
                </div>

                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transition-transform duration-500 group-hover:scale-110">
                    <TrendingDown className="h-32 w-32 -mb-8 -mr-8 text-orange-600" />
                </div>

                <div className="h-10 w-10 absolute top-6 right-6 rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center rotate-0 group-hover:rotate-12 transition-transform duration-300">
                    <ArrowDownRight className="h-5 w-5" />
                </div>
            </div>
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
            <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
                Recent Activity
            </h2>
            <div className="space-y-3">
                {transactions.map((item) => {
                    // Determine Icon and Color
                    let Icon = MoreHorizontal;
                    let colorClass = "bg-slate-100 text-slate-500";
                    let amountClass = "text-slate-700";

                    if (item.type === "expense") {
                        const cat = categories.find(c => c.name === (item as any).category);
                        if (cat) {
                            Icon = CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS.Misc;
                            // colorClass = cat.color; // Using more controlled palette below
                            colorClass = "bg-indigo-50 text-indigo-600 border border-indigo-100";
                        } else {
                            Icon = getExpenseIcon((item as any).category, (item as any).notes);
                            colorClass = "bg-slate-100 text-slate-500 border border-slate-200";
                        }
                    } else {
                        // Loan styling
                        if ((item as any).loanType === "lent") {
                            Icon = ArrowUpRight;
                            colorClass = "bg-emerald-50 text-emerald-600 border border-emerald-100";
                            amountClass = "text-emerald-600";
                        } else {
                            Icon = ArrowDownRight;
                            colorClass = "bg-orange-50 text-orange-600 border border-orange-100";
                            amountClass = "text-orange-600";
                        }
                    }

                    return (
                        <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center shadow-sm",
                                    colorClass
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 leading-none group-hover:text-slate-900 transition-colors">
                                        {item.type === "expense" ? (item as any).category : (item as any).personName}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1.5 font-medium">
                                        {format(item.dateObj, "MMM d")} • <span className="text-slate-500">{(item as any).notes || (item.type === "expense" ? "Expense" : "Loan")}</span>
                                    </p>
                                </div>
                            </div>
                            <div className={cn("font-black text-sm", amountClass)}>
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
