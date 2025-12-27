"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Expense } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/context/FinanceContext";
import { cn, formatCurrency } from "@/utils/cn";
import { CATEGORY_COLORS, getExpenseIcon } from "@/utils/constants";

interface ExpenseCardProps {
    expense: Expense;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
    const { deleteExpense } = useFinance();
    const Icon = getExpenseIcon(expense.category, expense.notes);

    return (
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg rounded-2xl border-slate-200 bg-white group hover:border-slate-300">
            <CardContent className="p-4 flex items-center justify-between gap-4">
                {/* Left: Icon/Category & Details */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm group-hover:scale-105 group-hover:rotate-3",
                        CATEGORY_COLORS[expense.category] || "bg-slate-100 text-slate-600"
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-800 text-base truncate pr-2">
                            {expense.notes || expense.category}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                            <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                {expense.category}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end">
                        <span className="font-black text-lg text-slate-800 whitespace-nowrap tracking-tight">
                            {formatCurrency(expense.amount)}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            {expense.paymentMethod}
                        </span>
                    </div>

                    <div className="border-l border-slate-100 pl-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteExpense(expense.id);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
