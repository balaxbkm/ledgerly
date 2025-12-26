"use client";

import { format } from "date-fns";
import { Check, Trash2, Clock, AlertCircle } from "lucide-react";
import { Loan } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/context/FinanceContext";
import { cn, formatCurrency } from "@/utils/cn";

interface LoanListProps {
    loans: Loan[];
    typeFilter: "lent" | "borrowed";
}

export function LoanList({ loans, typeFilter }: LoanListProps) {
    const { deleteLoan, updateLoan } = useFinance();

    const filtered = loans.filter((l) => l.loanType === typeFilter);

    const toggleStatus = async (loan: Loan) => {
        const newStatus = loan.status === "paid" ? "pending" : "paid";
        await updateLoan({ ...loan, status: newStatus });
    };

    if (filtered.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <p>No {typeFilter === "lent" ? "lending" : "borrowing"} records found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {filtered.map((loan) => {
                const isPaid = loan.status === "paid";
                const isOverdue = !isPaid && loan.dueDate && new Date(loan.dueDate) < new Date();

                return (
                    <Card key={loan.id} className={cn(
                        "border-l-4 transition-all hover:shadow-md",
                        isPaid ? "border-l-primary opacity-70" :
                            isOverdue ? "border-l-destructive" :
                                typeFilter === "lent" ? "border-l-secondary" : "border-l-orange-500"
                    )}>
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className={cn("font-semibold truncate", isPaid && "line-through text-muted-foreground")}>
                                        {loan.personName}
                                    </h3>
                                    {isOverdue && (
                                        <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> Overdue
                                        </span>
                                    )}
                                    {isPaid && (
                                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                            <Check className="h-3 w-3" /> Paid
                                        </span>
                                    )}
                                </div>

                                <div className="text-xs text-muted-foreground space-y-0.5">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{format(new Date(loan.startDate), "MMM d, yyyy")}</span>
                                        {loan.dueDate && (
                                            <span className={cn(isOverdue && "text-destructive font-medium")}>
                                                → Due {format(new Date(loan.dueDate), "MMM d, yyyy")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex flex-col items-end mr-3">
                                    <span className={cn("font-bold text-lg", typeFilter === "lent" ? "text-secondary" : "text-orange-600")}>
                                        {formatCurrency(loan.amount)}
                                    </span>
                                    {loan.interestRate && loan.interestRate > 0 && (
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {loan.interestRate}% (+{formatCurrency((loan.amount * loan.interestRate) / 100)})
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn("h-8 text-xs", isPaid && "bg-primary/10 text-primary hover:bg-primary/20")}
                                        onClick={() => toggleStatus(loan)}
                                    >
                                        {isPaid ? "Mark Unpaid" : "Mark Paid"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => deleteLoan(loan.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
