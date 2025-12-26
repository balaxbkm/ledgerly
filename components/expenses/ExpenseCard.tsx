"use client";

import { format } from "date-fns";
import {
    Trash2,
} from "lucide-react";
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
        <Card className="relative overflow-hidden transition-all hover:shadow-md group">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-transparent group-hover:bg-primary transition-colors" />
            <CardContent className="p-4 flex items-center justify-between gap-4">
                {/* Left: Icon/Category & Details */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                        CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Misc
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex flex-col truncate">
                        <span className="font-medium truncate">{expense.notes || expense.category}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                            <span>•</span>
                            <span>{expense.category}</span>
                            <span>•</span>
                            <span>{expense.paymentMethod}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-lg whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        onClick={() => deleteExpense(expense.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
