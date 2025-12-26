import { Expense } from "@/types";
import { ExpenseCard } from "./ExpenseCard";
import { Inbox } from "lucide-react";

interface ExpenseListProps {
    expenses: Expense[];
    isLoading?: boolean;
}

export function ExpenseList({ expenses, isLoading, sortKey = "date" }: ExpenseListProps & { sortKey?: string }) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-muted/50" />
                ))}
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <Inbox className="h-10 w-10 mb-3 opacity-50" />
                <p className="font-medium">No expenses found</p>
                <p className="text-sm">Add a new expense to get started.</p>
            </div>
        );
    }

    if (sortKey !== "date") {
        return (
            <div className="space-y-3">
                {expenses.map((expense) => (
                    <ExpenseCard key={expense.id} expense={expense} />
                ))}
            </div>
        );
    }



    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    let lastDate = "";

    return (
        <div className="space-y-4">
            {expenses.map((expense) => {
                const currentDate = new Date(expense.date).toDateString();
                const showHeader = currentDate !== lastDate;
                lastDate = currentDate;

                return (
                    <div key={expense.id} className="space-y-2">
                        {showHeader && (
                            <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                                {getDateLabel(expense.date)}
                            </h3>
                        )}
                        <ExpenseCard expense={expense} />
                    </div>
                );
            })}
        </div>
    );
}
