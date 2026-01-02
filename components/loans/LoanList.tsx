"use client";

import { useEffect, useState, useRef } from "react";
import { format, differenceInMonths, addMonths, isAfter, isSameDay, differenceInDays, differenceInMinutes } from "date-fns";
import { Check, Trash2, Clock, AlertCircle, Calendar, Wallet, Banknote, XCircle, AlertTriangle, CreditCard, Plus, User, History, TrendingUp } from "lucide-react";
import { Loan } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useFinance } from "@/context/FinanceContext";
import { cn, formatCurrency } from "@/utils/cn";

interface LoanListProps {
    loans: Loan[];
    typeFilter: "lent" | "borrowed";
}

type DialogType = "alert" | "confirm" | "prompt" | "payment" | "history" | "topup";

interface DialogState {
    isOpen: boolean;
    type: DialogType;
    title: string;
    message?: string | React.ReactNode;
    defaultValue?: string;
    placeholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: (value?: string) => void;
    payload?: any;
}

export function LoanList({ loans, typeFilter }: LoanListProps) {
    const { deleteLoan, updateLoan } = useFinance();
    const [dialog, setDialog] = useState<DialogState>({
        isOpen: false,
        type: "alert",
        title: "",
        onConfirm: () => { },
    });
    const promptInputRef = useRef<HTMLInputElement>(null);

    // Initial value for prompt input
    const [promptValue, setPromptValue] = useState("");
    const [topUpAmount, setTopUpAmount] = useState("");
    const [topUpMode, setTopUpMode] = useState<'tenure' | 'emi'>('tenure');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update current time every second to handle "Undo" button visibility live
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const filtered = loans.filter((l) => l.loanType === typeFilter);

    // Standard Amortization: We do NOT auto-increase the principal balance for EMI loans.
    // Instead, interest is calculated at the time of payment allocation.
    // So we remove the previous auto-apply effect to prevent double accounting or non-standard balance inflation.

    const closeDialog = () => {
        setDialog(prev => ({ ...prev, isOpen: false }));
        setPromptValue("");
    };

    const showAlert = (title: string, message: string) => {
        setDialog({
            isOpen: true,
            type: "alert",
            title,
            message,
            confirmLabel: "OK",
            onConfirm: () => closeDialog(),
        });
    };

    const showConfirm = (title: string, message: string | React.ReactNode, onConfirm: () => void, confirmLabel = "Confirm") => {
        setDialog({
            isOpen: true,
            type: "confirm",
            title,
            message,
            confirmLabel,
            cancelLabel: "Cancel",
            onConfirm: () => {
                onConfirm();
                closeDialog();
            },
        });
    };

    const showPrompt = (title: string, placeholder: string, onConfirm: (val: string) => void, defaultValue = "") => {
        setPromptValue(defaultValue);
        setDialog({
            isOpen: true,
            type: "prompt",
            title,
            placeholder,
            confirmLabel: "Submit",
            cancelLabel: "Cancel",
            onConfirm: (val) => {
                onConfirm(val || "");
                closeDialog();
            },
        });
        setTimeout(() => promptInputRef.current?.focus(), 100);
    };

    const addToHistory = (loan: Loan, action: "payment" | "status_change" | "creation" | "edit" | "undo", description: string, amount?: number): Loan => {
        const historyItem = {
            id: crypto.randomUUID(),
            action,
            date: new Date().toISOString(),
            description,
            amount,
        };
        return {
            ...loan,
            history: [historyItem, ...(loan.history || [])]
        };
    };

    const handleHistory = (loan: Loan) => {
        setDialog({
            isOpen: true,
            type: "history",
            title: `History: ${loan.personName}`,
            payload: loan,
            onConfirm: () => { },
        });
    };


    const handleUndo = async (loan: Loan) => {
        if (!loan.undoData) return;
        await updateLoan(addToHistory({
            ...loan,
            status: loan.undoData.previousStatus,
            amount: loan.undoData.previousAmount,
            undoData: undefined
        }, "undo", `Undid previous action. Status reverted to ${loan.undoData.previousStatus}.`));
    };

    const toggleStatus = async (loan: Loan) => {
        const newStatus = loan.status === "paid" ? "pending" : "paid";
        const undoData = newStatus === 'paid' ? {
            timestamp: new Date().toISOString(),
            previousStatus: loan.status,
            previousAmount: loan.amount,
            actionType: "status_change" as const
        } : undefined;

        const historyAction = newStatus === 'paid' ? "payment" : "status_change";
        const historyDesc = newStatus === 'paid' ? "Marked as fully paid" : "Re-opened loan";

        await updateLoan(addToHistory({ ...loan, status: newStatus, undoData }, historyAction, historyDesc));
    };

    const handleDelete = (loan: Loan) => {
        showConfirm(
            "Delete Loan Record",
            `Are you sure you want to delete the loan record for ${loan.personName}? This action cannot be undone.`,
            () => deleteLoan(loan.id),
            "Delete"
        );
    };

    const handleWriteOff = (loan: Loan) => {
        showConfirm(
            "Write Off Loan",
            `Are you sure you want to write off the loan for ${loan.personName}? This will mark it as closed/loss.`,
            () => updateLoan(addToHistory({
                ...loan,
                status: "written-off",
                undoData: {
                    timestamp: new Date().toISOString(),
                    previousStatus: loan.status,
                    previousAmount: loan.amount,
                    actionType: "write_off"
                }
            }, "status_change", "Loan written off")),
            "Write Off"
        );
    };

    const handlePartialPayment = (loan: Loan) => {
        showPrompt(
            "Partial Payment",
            `Enter payment amount for ${loan.personName}`,
            (amountStr) => {
                const amount = parseFloat(amountStr);
                if (isNaN(amount) || amount <= 0) {
                    showAlert("Invalid Amount", "Please enter a valid positive number.");
                    return;
                }

                if (amount >= loan.amount) {
                    // Chained confirmation for full payment
                    // Chained confirmation for full payment
                    showConfirm(
                        "Confirm Full Payment",
                        <div className="flex flex-col items-center gap-3 py-2">
                            <span className="text-slate-500 text-sm font-medium">Paying Full Outstanding</span>
                            <span className="text-4xl font-black text-emerald-600 tracking-tight">{formatCurrency(loan.amount)}</span> {/* Use loan.amount as it covers full */}
                            <p className="text-xs text-slate-400 text-center max-w-[240px] leading-relaxed">
                                You entered {formatCurrency(amount)}. This will clear the entire loan balance and mark it as paid.
                            </p>
                        </div>,
                        () => updateLoan(addToHistory({
                            ...loan,
                            status: "paid",
                            undoData: {
                                timestamp: new Date().toISOString(),
                                previousStatus: loan.status,
                                previousAmount: loan.amount,
                                actionType: "payment"
                            }
                        }, "payment", `Full payment of ${formatCurrency(amount)} recorded`, amount)),
                        "Mark Paid"
                    );
                } else {
                    updateLoan(addToHistory({
                        ...loan,
                        amount: loan.amount - amount,
                        partPaymentCount: (loan.partPaymentCount || 0) + 1
                    }, "payment", `Partial payment of ${formatCurrency(amount)}`, amount));
                }
            }
        );
    };

    const handlePayOptions = (loan: Loan) => {
        setDialog({
            isOpen: true,
            type: "payment",
            title: `Payment for ${loan.personName}`,
            payload: loan,
            onConfirm: () => { }, // Not used for this type
        });
    };

    const handleTopUp = (loan: Loan) => {
        setTopUpAmount("");
        setTopUpMode("tenure");
        setDialog({
            isOpen: true,
            type: "topup",
            title: `Lend More to ${loan.personName}`,
            payload: loan,
            onConfirm: () => { },
        });
    };

    const submitTopUp = () => {
        const loan = dialog.payload;
        const addedAmount = parseFloat(topUpAmount);

        if (isNaN(addedAmount) || addedAmount <= 0) {
            showAlert("Invalid Amount", "Please enter a valid positive number.");
            return;
        }

        let updatedLoan = { ...loan };
        let description = "";

        if (loan.repaymentType === 'emi') {
            updatedLoan.amount = (updatedLoan.amount || 0) + addedAmount;

            if (topUpMode === 'emi') {
                // Increase EMI: Keep tenure roughly same, so recalculate EMI for new Principal
                const startDate = new Date(loan.startDate);
                const monthsPassed = differenceInMonths(new Date(), startDate);
                const remainingMonths = Math.max(1, (loan.tenureMonths || 12) - monthsPassed);

                const P = updatedLoan.amount;
                const N = remainingMonths;
                const R = (loan.interestRate || 0) / 12 / 100;

                let newEmi = 0;
                if (R > 0) {
                    const x = Math.pow(1 + R, N);
                    newEmi = (P * R * x) / (x - 1);
                } else {
                    newEmi = P / N;
                }

                updatedLoan.emiAmount = Math.ceil(newEmi);
                description = `Top-up: ${formatCurrency(addedAmount)} added. EMI increased to ${formatCurrency(updatedLoan.emiAmount)} to maintain tenure.`;
            } else {
                // Increase Tenure: Keep EMI same.
                const emiCount = (loan.history || []).filter((h: any) => h.action === "payment" && h.description.toLowerCase().includes("emi")).length;

                const currentEmi = loan.emiAmount || 1;
                const P = updatedLoan.amount;
                const R = (loan.interestRate || 0) / 12 / 100;

                let newRemaining = 0;
                if (R > 0) {
                    if ((P * R) < currentEmi) {
                        const nper = -Math.log(1 - (P * R) / currentEmi) / Math.log(1 + R);
                        newRemaining = Math.ceil(nper - 0.1);
                    } else {
                        newRemaining = Math.ceil(P / currentEmi);
                    }
                } else {
                    newRemaining = Math.ceil(P / currentEmi);
                }

                updatedLoan.tenureMonths = emiCount + newRemaining;
                description = `Top-up: ${formatCurrency(addedAmount)} added. Tenure extended to ${updatedLoan.tenureMonths} months.`;
            }
        } else {
            // Non-EMI (Fixed Interest or One-time)
            // Existing logic: add flat interest if defined? Or just Principal?
            // "35% P.A." implies simple/compound interest.
            // If we top up, we technically restart or just add principal?
            // Let's follow previous logic: P + Interest.
            // But wait, previous logic added interest IMMEDIATELY to 'amount'. That effectively compounds it upfront.
            // If 'interestRate' is present, we might assume interest accumulates.
            // For safety and simplicity given "Top Up", let's just add Principal. User can edit interest if needed?
            // Or stick to previous code's logic if it was "Fixed Interest" mode?
            // The previous code unconditionally calculated `interestComponent`.
            // Let's replicate reasonable behavior: Just add Principal.
            updatedLoan.amount += addedAmount;
            description = `Top-up: ${formatCurrency(addedAmount)} added.`;
        }

        updateLoan(addToHistory(updatedLoan, "edit", description, addedAmount));
        setDialog(prev => ({ ...prev, isOpen: false }));
    };

    if (filtered.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <p>No {typeFilter === "lent" ? "lending" : "borrowing"} records found.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {filtered.map((loan) => {
                    const isPaid = loan.status === "paid";
                    const isWrittenOff = loan.status === "written-off";
                    const startDate = new Date(loan.startDate);
                    const now = currentTime;

                    let displayDueDate = loan.dueDate ? new Date(loan.dueDate) : addMonths(startDate, 1);

                    // Dynamic Due Date Logic for EMI
                    if (loan.repaymentType === "emi") {
                        const monthsPassed = differenceInMonths(now, startDate);
                        let targetDate = addMonths(startDate, monthsPassed + 1);

                        if (monthsPassed > 0) {
                            const currentMonthDue = addMonths(startDate, monthsPassed);
                            if (isAfter(now, currentMonthDue) || isSameDay(now, currentMonthDue)) {
                                targetDate = currentMonthDue;
                            }
                        } else {
                            targetDate = addMonths(startDate, 1);
                        }
                        displayDueDate = targetDate;
                    }

                    const isOverdue = !isPaid && !isWrittenOff && isAfter(now, displayDueDate) && !isSameDay(now, displayDueDate);
                    const daysOverdue = isOverdue ? differenceInDays(now, displayDueDate) : 0;

                    // Pre-calculate Standard EMI & Total Interest for Display
                    let displayTotalInterest = 0;
                    if (loan.repaymentType === "emi" && loan.status !== 'paid' && loan.status !== 'written-off') {
                        let emi = loan.emiAmount;
                        const P = loan.amount;
                        const R = (loan.interestRate || 0) / 12 / 100;
                        const N_Total = loan.tenureMonths || 1;
                        if (!emi) {
                            if (R > 0) {
                                const x = Math.pow(1 + R, N_Total);
                                emi = (P * R * x) / (x - 1);
                            } else { emi = P / N_Total; }
                        }
                        emi = emi || 0;

                        if (R > 0 && emi > P * R) {
                            const nper = -Math.log(1 - (P * R) / emi) / Math.log(1 + R);
                            const remaining = Math.ceil(nper - 0.1);
                            displayTotalInterest = (emi * remaining) - P;
                        } else {
                            displayTotalInterest = 0;
                        }
                    } else {
                        // One-time repayment: use fixed amount or calculate flat rate interest
                        if (loan.fixedInterestAmount) {
                            displayTotalInterest = loan.fixedInterestAmount;
                        } else if (loan.interestRate && loan.interestRate > 0) {
                            // Implied flat interest: Principal * (Rate/100)
                            // This is the standard interpretation for "One-time repayment with X% interest" without a timeline.
                            displayTotalInterest = loan.amount * (loan.interestRate / 100);
                        }
                    }

                    return (
                        <Card key={loan.id} className={cn(
                            "rounded-2xl border transition-all duration-300 hover:shadow-lg group relative overflow-hidden",
                            isPaid ? "border-slate-200 bg-slate-50 opacity-60" :
                                isWrittenOff ? "border-slate-200 bg-slate-100 opacity-60" :
                                    isOverdue ? "border-red-200 bg-red-50/30 shadow-sm" :
                                        typeFilter === "lent"
                                            ? "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
                                            : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30"
                        )}>
                            {/* Decorative gradient blob for active cards */}
                            {!isPaid && !isWrittenOff && (
                                <div className={cn(
                                    "absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity pointer-events-none translate-x-1/2 -translate-y-1/2",
                                    typeFilter === "lent" ? "bg-emerald-500" : "bg-orange-500"
                                )} />
                            )}

                            <CardContent className="p-5">
                                <div className="flex items-center justify-between gap-4 relative z-10">
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-300 shadow-sm",
                                        isPaid || isWrittenOff ? "bg-slate-100 border-slate-200" :
                                            typeFilter === "lent"
                                                ? "bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-100 group-hover:border-emerald-200"
                                                : "bg-orange-50 border-orange-100 text-orange-600 group-hover:bg-orange-100 group-hover:border-orange-200"
                                    )}>
                                        <User className={cn("h-6 w-6", (isPaid || isWrittenOff) ? "text-slate-400" : "currentColor")} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h3 className={cn("font-bold text-base truncate", (isPaid || isWrittenOff) ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800")}>
                                                {loan.personName}
                                            </h3>
                                            {isOverdue && (
                                                <span className="text-[10px] bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
                                                    <AlertCircle className="h-3 w-3" /> Overdue
                                                </span>
                                            )}
                                            {isPaid && (
                                                <span className="text-[10px] bg-slate-200 text-slate-600 border border-slate-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
                                                    <Check className="h-3 w-3" /> Paid
                                                </span>
                                            )}
                                            {isWrittenOff && (
                                                <span className="text-[10px] bg-slate-200 text-slate-600 border border-slate-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
                                                    <XCircle className="h-3 w-3" /> Loss
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-xs text-slate-500 font-medium flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                <Clock className="h-3 w-3 text-slate-400" />
                                                <span>{format(startDate, "MMM d, yyyy")}</span>
                                            </div>
                                            {!isPaid && !isWrittenOff && (
                                                <span className={cn(
                                                    "flex items-center gap-1 px-2 py-1 rounded-md border",
                                                    isOverdue
                                                        ? "bg-red-50 text-red-600 border-red-100 font-bold"
                                                        : "bg-slate-50 text-slate-500 border-slate-100"
                                                )}>
                                                    {isOverdue ? "Due was" : "Next Due:"} {format(displayDueDate, "MMM d, yyyy")}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="flex flex-col items-end">
                                            <span className={cn(
                                                "font-black text-2xl tracking-tight",
                                                (isPaid || isWrittenOff) ? "text-slate-400" :
                                                    typeFilter === "lent" ? "text-emerald-600" : "text-orange-600"
                                            )}>
                                                {formatCurrency(loan.amount)}
                                            </span>
                                            {(loan.interestRate || 0) > 0 || displayTotalInterest > 0 ? (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                    {(loan.interestRate || 0) > 0 && (
                                                        <span>{loan.interestRate}% {loan.repaymentType === "emi" ? "p.a." : ""}</span>
                                                    )}
                                                    {displayTotalInterest > 0 && (
                                                        <span className="ml-1">
                                                            ({(loan.interestRate || 0) > 0 ? "+" : ""}{formatCurrency(displayTotalInterest)})
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                    No Interest
                                                </span>
                                            )}
                                        </div>

                                        {!isPaid && !isWrittenOff && typeFilter === "lent" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200 rounded-full shrink-0 shadow-sm transition-all hover:scale-105"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTopUp(loan);
                                                }}
                                                title="Lend More"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        )}
                                        {!isPaid && !isWrittenOff && typeFilter === "borrowed" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700 border border-orange-200 rounded-full shrink-0 shadow-sm transition-all hover:scale-105"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTopUp(loan);
                                                }}
                                                title="Borrow More"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {loan.notes && (
                                    <div className="mt-3 text-xs text-muted-foreground bg-slate-50 p-2 rounded-md border border-slate-100 italic">
                                        "{loan.notes}"
                                    </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {loan.repaymentType === "emi" && loan.tenureMonths ? (
                                            <div className="flex flex-col items-start text-xs text-muted-foreground w-full">
                                                {(() => {
                                                    // Estimate EMI if not stored (Using Reducing Balance Standard)
                                                    let emiAmount = loan.emiAmount;
                                                    const P = loan.amount;
                                                    const N_Total = loan.tenureMonths;
                                                    const R = (loan.interestRate || 0) / 12 / 100;

                                                    if (!emiAmount) {
                                                        if (R > 0) {
                                                            const x = Math.pow(1 + R, N_Total);
                                                            emiAmount = (P * R * x) / (x - 1);
                                                        } else {
                                                            emiAmount = P / N_Total;
                                                        }
                                                    }
                                                    emiAmount = emiAmount || 1; // Prevent zero division

                                                    // Calculate Remaining EMIs (NPER) accurately
                                                    let remainingEmis = 0;
                                                    let totalFutureInterest = 0;

                                                    if (R > 0) {
                                                        // NPER = -ln(1 - (r*P)/E) / ln(1+r)
                                                        // Check viability: if r*P >= E, loan never clears (interest > emi)
                                                        if ((P * R) < emiAmount) {
                                                            const nper = -Math.log(1 - (P * R) / emiAmount) / Math.log(1 + R);
                                                            remainingEmis = Math.ceil(nper - 0.1);
                                                            totalFutureInterest = (emiAmount * remainingEmis) - P;
                                                        } else {
                                                            remainingEmis = N_Total; // Fallback
                                                            totalFutureInterest = 0;
                                                        }
                                                    } else {
                                                        remainingEmis = Math.ceil(P / emiAmount);
                                                        totalFutureInterest = 0;
                                                    }

                                                    return (
                                                        <div className="flex items-center justify-between w-full">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-0.5 bg-indigo-500/30 rounded-full shrink-0" />
                                                                <div>
                                                                    <div className="flex items-baseline gap-1.5">
                                                                        <span className="font-bold text-indigo-950 text-sm leading-none">
                                                                            {formatCurrency(emiAmount)}
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-500 font-medium">/ month</span>
                                                                    </div>
                                                                    <span className="text-[11px] font-medium text-indigo-600 mt-0.5 block">
                                                                        {Math.max(0, remainingEmis)}<span className="text-indigo-400 font-normal">/{N_Total} EMIs left</span>
                                                                    </span>
                                                                </div>
                                                            </div>


                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-0.5 bg-slate-400/30 rounded-full shrink-0" />
                                                <div className="flex flex-col items-start text-xs text-muted-foreground">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-700">
                                                            Single Repay
                                                        </span>

                                                        {(loan.partPaymentCount || 0) > 0 ? (
                                                            <span className="text-[10px] text-indigo-600 font-medium mt-0.5 flex items-center gap-1">
                                                                {loan.partPaymentCount} Part Payment{(loan.partPaymentCount || 0) > 1 ? 's' : ''}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground mt-0.5 opacity-80">
                                                                Full payment expected
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                        {loan.repaymentType === "emi" ? (
                                            // EMI Buttons (Original)
                                            <>
                                                {!isPaid && !isWrittenOff && (
                                                    <>


                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                                                            onClick={() => handlePayOptions(loan)}
                                                            title="Make Payment"
                                                        >
                                                            <CreditCard className="h-3 w-3 mr-1" /> Pay
                                                        </Button>



                                                        {daysOverdue >= 40 && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 text-xs bg-gray-50 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 border-gray-200 transition-colors"
                                                                onClick={() => handleWriteOff(loan)}
                                                                title="Write Off"
                                                            >
                                                                <XCircle className="h-3 w-3 mr-1" /> Write Off
                                                            </Button>
                                                        )}
                                                    </>
                                                )}

                                                {(isPaid || isWrittenOff) && (
                                                    <span className="text-xs text-muted-foreground italic mr-2">
                                                        {(() => {
                                                            if (!isPaid) return "Loan Written Off";

                                                            const hasForeclosed = loan.history?.some((h: any) => h.description?.toLowerCase().includes("foreclose"));
                                                            if (hasForeclosed) return "Loan Foreclosed";

                                                            if (loan.repaymentType === 'emi') {
                                                                const emiCount = (loan.history || []).filter((h: any) => h.action === "payment" && h.description?.toLowerCase().includes("emi")).length;
                                                                if (emiCount < (loan.tenureMonths || 0)) return "Loan Foreclosed";
                                                            }

                                                            return "Loan Fully Paid";
                                                        })()}
                                                    </span>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 border-blue-200"
                                                    onClick={() => handleHistory(loan)}
                                                    title="View History"
                                                >
                                                    <History className="h-3.5 w-3.5 mr-1.5" /> History
                                                </Button>

                                                {isPaid && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => toggleStatus(loan)}
                                                    >
                                                        Undo
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(loan)}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                                                </Button>
                                            </>
                                        ) : (
                                            // Non-EMI Buttons (New Request)
                                            <>
                                                {!isPaid && !isWrittenOff && (
                                                    <>


                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                                                            onClick={() => handlePayOptions(loan)}
                                                            title="Make Payment"
                                                        >
                                                            <CreditCard className="h-3 w-3 mr-1" /> Pay
                                                        </Button>



                                                        {daysOverdue >= 40 && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 text-xs bg-gray-50 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 border-gray-200 transition-colors"
                                                                onClick={() => handleWriteOff(loan)}
                                                                title="Write Off"
                                                            >
                                                                <XCircle className="h-3 w-3 mr-1" /> Write Off
                                                            </Button>
                                                        )}
                                                    </>
                                                )}

                                                {(isPaid || isWrittenOff) && (
                                                    <span className="text-xs text-muted-foreground italic mr-2">
                                                        {(() => {
                                                            if (!isPaid) return "Loan Written Off";

                                                            const hasForeclosed = loan.history?.some((h: any) => h.description?.toLowerCase().includes("foreclose"));
                                                            if (hasForeclosed) return "Loan Foreclosed";

                                                            if (loan.repaymentType === 'emi') {
                                                                const emiCount = (loan.history || []).filter((h: any) => h.action === "payment" && h.description?.toLowerCase().includes("emi")).length;
                                                                if (emiCount < (loan.tenureMonths || 0)) return "Loan Foreclosed";
                                                            }

                                                            return "Loan Fully Paid";
                                                        })()}
                                                    </span>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 border-blue-200"
                                                    onClick={() => handleHistory(loan)}
                                                    title="View History"
                                                >
                                                    <History className="h-3.5 w-3.5 mr-1.5" /> History
                                                </Button>

                                                {/* Allow unmarking paid/written-off or deleting */}
                                                {isPaid && (loan.undoData && differenceInMinutes(currentTime, new Date(loan.undoData.timestamp)) < 2) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => handleUndo(loan)}
                                                    >
                                                        Undo
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(loan)}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Global Dialog Component */}
            <Modal
                isOpen={dialog.isOpen}
                onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
                title={dialog.title}
            >
                <div className="space-y-4">
                    {dialog.message && (
                        <div className="text-sm text-muted-foreground leading-relaxed">
                            {dialog.message}
                        </div>
                    )}

                    {dialog.type === "payment" && dialog.payload && (
                        <>
                            {dialog.payload.repaymentType === "emi" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
                                    {(() => {
                                        const loan = dialog.payload;
                                        const daysSinceLastPayment = loan.lastEmiPaymentDate
                                            ? differenceInDays(new Date(), new Date(loan.lastEmiPaymentDate))
                                            : 999;
                                        const isEmiPaidRecently = daysSinceLastPayment < 28;

                                        return (
                                            <Button
                                                className={cn(
                                                    "h-24 flex flex-col items-center justify-center gap-2 border-2",
                                                    isEmiPaidRecently
                                                        ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                                                        : "bg-pink-50 text-pink-700 hover:bg-pink-100 hover:text-pink-800 border-pink-100"
                                                )}
                                                variant="outline"
                                                disabled={isEmiPaidRecently}
                                                onClick={() => {
                                                    // Estimate EMI if missing (Standard Reducing Balance)
                                                    let currentEmi = loan.emiAmount;
                                                    if (!currentEmi && loan.tenureMonths) {
                                                        const P = loan.amount;
                                                        const N = loan.tenureMonths || 1;
                                                        const R = (loan.interestRate || 0) / 12 / 100;
                                                        if (R > 0) {
                                                            const x = Math.pow(1 + R, N);
                                                            currentEmi = (P * R * x) / (x - 1);
                                                        } else {
                                                            currentEmi = P / N;
                                                        }
                                                    }
                                                    currentEmi = currentEmi || 0;

                                                    showConfirm(
                                                        "Confirm EMI Payment",
                                                        <div className="flex flex-col items-center gap-3 py-2">
                                                            <span className="text-slate-500 text-sm font-medium">Paying Monthly Installment</span>
                                                            <span className="text-4xl font-black text-slate-800 tracking-tight">{formatCurrency(currentEmi)}</span>
                                                            <p className="text-xs text-slate-400 text-center max-w-[240px] leading-relaxed">
                                                                This payment will cover your EMI for this month and reduce the outstanding balance.
                                                            </p>
                                                        </div>,
                                                        () => {
                                                            const emiPmtCount = (loan.history || []).filter((h: any) => h.action === "payment" && h.description.toLowerCase().includes("emi")).length + 1;
                                                            const getOrdinal = (n: number) => {
                                                                const s = ["th", "st", "nd", "rd"];
                                                                const v = n % 100;
                                                                return n + (s[(v - 20) % 10] || s[v] || s[0]);
                                                            };

                                                            updateLoan(addToHistory({
                                                                ...loan,
                                                                amount: Math.max(0, loan.amount - currentEmi),
                                                                lastEmiPaymentDate: new Date().toISOString()
                                                            }, "payment", `${getOrdinal(emiPmtCount)} EMI Paid`, currentEmi));
                                                        },
                                                        "Pay Now"
                                                    );
                                                }}
                                            >
                                                {isEmiPaidRecently ? (
                                                    <>
                                                        <Check className="h-6 w-6" />
                                                        <div className="flex flex-col items-center text-center">
                                                            <span className="font-semibold text-sm">EMI Paid</span>
                                                            <span className="text-[10px] opacity-75">Wait {28 - daysSinceLastPayment} days</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Calendar className="h-6 w-6" />
                                                        <div className="flex flex-col items-center text-center">
                                                            <span className="font-semibold text-sm">Pay EMI</span>
                                                            <span className="text-[10px] opacity-75">Monthly Installment</span>
                                                        </div>
                                                    </>
                                                )}
                                            </Button>
                                        );
                                    })()}

                                    <Button
                                        className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-2 border-blue-100"
                                        variant="outline"
                                        onClick={() => {
                                            handlePartialPayment(dialog.payload);
                                        }}
                                    >
                                        <Wallet className="h-6 w-6" />
                                        <div className="flex flex-col items-center text-center">
                                            <span className="font-semibold text-sm">Part Pay</span>
                                            <span className="text-[10px] opacity-75">Any Amount</span>
                                        </div>
                                    </Button>

                                    <Button
                                        className="h-24 flex flex-col items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-2 border-green-100"
                                        variant="outline"
                                        onClick={() => {
                                            showConfirm(
                                                "Confirm Foreclosure",
                                                <div className="flex flex-col items-center gap-3 py-2">
                                                    <span className="text-slate-500 text-sm font-medium">Paying Remaining Balance</span>
                                                    <span className="text-4xl font-black text-rose-600 tracking-tight">{formatCurrency(dialog.payload.amount)}</span>
                                                    <p className="text-xs text-slate-400 text-center max-w-[240px] leading-relaxed">
                                                        This will clear the remaining loan balance and close the loan account.
                                                    </p>
                                                </div>,
                                                () => updateLoan(addToHistory({
                                                    ...dialog.payload,
                                                    status: 'paid',
                                                    undoData: {
                                                        timestamp: new Date().toISOString(),
                                                        previousStatus: dialog.payload.status,
                                                        previousAmount: dialog.payload.amount,
                                                        actionType: "payment"
                                                    }
                                                }, "payment", "Foreclosed loan", dialog.payload.amount)),
                                                "Foreclose Loan"
                                            );
                                        }}
                                    >
                                        <Banknote className="h-6 w-6" />
                                        <div className="flex flex-col items-center text-center">
                                            <span className="font-semibold text-sm">Foreclose</span>
                                            <span className="text-[10px] opacity-75">Full Payment</span>
                                        </div>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 py-2">
                                    <Button
                                        className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-2 border-blue-100"
                                        variant="outline"
                                        onClick={() => {
                                            handlePartialPayment(dialog.payload);
                                            // handlePartialPayment will trigger a new dialog state (prompt)
                                            // which naturally replaces this 'payment' dialog.
                                        }}
                                    >
                                        <Wallet className="h-6 w-6" />
                                        <div className="flex flex-col items-center">
                                            <span className="font-semibold">Partial Payment</span>
                                            <span className="text-[10px] opacity-75">Enter Amount</span>
                                        </div>
                                    </Button>
                                    <Button
                                        className="h-20 flex flex-col items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-2 border-green-100"
                                        variant="outline"
                                        onClick={() => {
                                            toggleStatus(dialog.payload);
                                            closeDialog();
                                        }}
                                    >
                                        <Banknote className="h-6 w-6" />
                                        <div className="flex flex-col items-center">
                                            <span className="font-semibold">Full Payment</span>
                                            <span className="text-[10px] opacity-75">Mark as Paid</span>
                                        </div>
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {dialog.type === "history" && dialog.payload && (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {(() => {
                                const history = [...(dialog.payload.history || [])];
                                const hasCreation = history.some(h => h.action === 'creation');

                                if (!hasCreation) {
                                    const typeLabel = dialog.payload.loanType === 'lent' ? 'Lent' : 'Borrowed';

                                    // Calculate Original Principal (Lent Amount)
                                    let originalPrincipal = dialog.payload.amount; // Start with current, will adjust

                                    // 1. Reconstruct Total Payable Original (Current + Paid History)
                                    const totalPaidHistory = history
                                        .filter(h => h.action === 'payment' && h.amount)
                                        .reduce((sum, h) => sum + (h.amount || 0), 0);

                                    const estimatedTotalOriginalPayable = dialog.payload.amount + totalPaidHistory;

                                    if (dialog.payload.repaymentType === 'emi' && dialog.payload.tenureMonths && dialog.payload.emiAmount) {
                                        // Use PV Formula to reverse engineer Principal
                                        const r = (dialog.payload.interestRate || 0) / 12 / 100;
                                        const n = dialog.payload.tenureMonths;
                                        const emi = dialog.payload.emiAmount;

                                        if (r > 0) {
                                            // PV = EMI * [ (1 - (1+r)^-n) / r ]
                                            originalPrincipal = emi * ((1 - Math.pow(1 + r, -n)) / r);
                                        } else {
                                            originalPrincipal = emi * n;
                                        }
                                    } else {
                                        // One-time: Deduct interest from TotalRepayable
                                        if (dialog.payload.fixedInterestAmount) {
                                            originalPrincipal = estimatedTotalOriginalPayable - dialog.payload.fixedInterestAmount;
                                        } else if (dialog.payload.interestRate && dialog.payload.interestRate > 0) {
                                            // Total = P * (1 + R/100)  =>  P = Total / (1 + R/100)
                                            originalPrincipal = estimatedTotalOriginalPayable / (1 + (dialog.payload.interestRate / 100));
                                        } else {
                                            originalPrincipal = estimatedTotalOriginalPayable;
                                        }
                                    }

                                    // Precision cleanup
                                    const rounded = Math.round(originalPrincipal);
                                    if (Math.abs(originalPrincipal - rounded) < 0.1) {
                                        originalPrincipal = rounded;
                                    } else {
                                        originalPrincipal = Math.round(originalPrincipal * 100) / 100;
                                    }

                                    // Generate Description
                                    let description = "";
                                    if (dialog.payload.repaymentType === 'emi') {
                                        description = `${dialog.payload.interestRate}% p.a. • ${dialog.payload.tenureMonths} Months`;
                                    } else {
                                        if (dialog.payload.fixedInterestAmount) {
                                            description = `Fixed Interest: ${formatCurrency(dialog.payload.fixedInterestAmount)}`;
                                        } else if (dialog.payload.interestRate) {
                                            description = `${dialog.payload.interestRate}% Interest`;
                                        } else {
                                            description = "No Interest";
                                        }

                                        if (dialog.payload.tenureMonths) {
                                            description += ` • ${dialog.payload.tenureMonths} Months`;
                                        } else {
                                            description += ` • Single Repay`;
                                        }
                                    }

                                    history.push({
                                        id: 'creation-event',
                                        action: 'creation',
                                        date: dialog.payload.startDate,
                                        description: description,
                                        amount: originalPrincipal
                                    });
                                }

                                const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                                if (sortedHistory.length === 0) {
                                    return (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                            <p>No history recorded yet.</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="relative border-l border-slate-200 ml-3 space-y-6 py-2">
                                        {sortedHistory.map((item: any) => (
                                            <div key={item.id} className="relative pl-6">
                                                <div className={cn(
                                                    "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ring-1",
                                                    item.action === "payment" ? "bg-green-500 ring-green-100" :
                                                        item.action === "creation" ? "bg-indigo-500 ring-indigo-100" :
                                                            item.action === "undo" ? "bg-orange-500 ring-orange-100" :
                                                                "bg-slate-400 ring-slate-100"
                                                )} />
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className={cn(
                                                            "text-sm font-semibold",
                                                            item.action === "payment" ? "text-green-700" :
                                                                item.action === "creation" ? "text-indigo-700" :
                                                                    "text-slate-700"
                                                        )}>
                                                            {(() => {
                                                                if (item.action === "payment") {
                                                                    if (item.description?.toLowerCase().includes("emi")) return "EMI Payment";
                                                                    if (item.description?.toLowerCase().includes("partial")) return "Partial Payment";
                                                                    if (item.description?.toLowerCase().includes("fully paid") || item.description?.toLowerCase().includes("foreclose")) return "Full Payment";
                                                                    return "Payment Received";
                                                                }
                                                                return item.action === "creation" ? (dialog.payload.loanType === 'lent' ? "Lent Initiated" : "Borrowed Initiated") :
                                                                    item.action === "status_change" ? "Status Updated" :
                                                                        item.action === "undo" ? "Action Undone" :
                                                                            item.action === "edit" ? "Record Updated" : "Activity";
                                                            })()}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {format(new Date(item.date), "MMM d, h:mm a")}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600">{item.description}</p>
                                                    {item.amount && (
                                                        <span className="text-xs font-medium text-slate-900">
                                                            {formatCurrency(item.amount)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {dialog.type === "topup" && dialog.payload && (
                        <div className="space-y-6 py-2">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top-up Amount</label>
                                <Input
                                    type="number"
                                    placeholder="Enter amount..."
                                    className="text-2xl font-bold h-14 text-center border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {dialog.payload.repaymentType === 'emi' && (
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Effect on Loan</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setTopUpMode('tenure')}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 relative overflow-hidden",
                                                topUpMode === 'tenure'
                                                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-[1.02]"
                                                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <Clock className="h-6 w-6 mb-1" />
                                            <span className="font-bold text-sm">Increase Tenure</span>
                                            <span className="text-[10px] opacity-75">EMI stays same</span>
                                            {topUpMode === 'tenure' && (
                                                <div className="absolute top-2 right-2">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                                </div>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setTopUpMode('emi')}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 relative overflow-hidden",
                                                topUpMode === 'emi'
                                                    ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md transform scale-[1.02]"
                                                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <TrendingUp className="h-6 w-6 mb-1" />
                                            <span className="font-bold text-sm">Increase EMI</span>
                                            <span className="text-[10px] opacity-75">Tenure stays same</span>
                                            {topUpMode === 'emi' && (
                                                <div className="absolute top-2 right-2">
                                                    <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <Button
                                className="w-full h-12 text-md font-semibold shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={submitTopUp}
                            >
                                Confirm Top Up
                            </Button>
                        </div>
                    )}

                    {dialog.type === "prompt" && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <span className="text-slate-500 text-sm font-medium text-center px-4">
                                {dialog.placeholder}
                            </span>
                            <div className="relative w-full max-w-[240px]">
                                <Input
                                    ref={promptInputRef}
                                    type="number"
                                    className="text-center text-4xl font-black h-20 border-0 border-b-2 border-slate-200 focus-visible:ring-0 focus-visible:border-indigo-500 rounded-none px-2 placeholder:text-slate-200 text-slate-800 bg-transparent shadow-none"
                                    value={promptValue}
                                    onChange={(e) => setPromptValue(e.target.value)}
                                    placeholder="0"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            dialog.onConfirm(promptValue);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {dialog.type !== "payment" && dialog.type !== "history" && dialog.type !== "topup" && (
                        <div className="flex justify-end gap-3 mt-6">
                            {dialog.type !== "alert" && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setDialog(prev => ({ ...prev, isOpen: false }))}
                                >
                                    {dialog.cancelLabel || "Cancel"}
                                </Button>
                            )}
                            <Button
                                onClick={() => dialog.onConfirm(dialog.type === "prompt" ? promptValue : undefined)}
                                variant={dialog.type === "confirm" && dialog.confirmLabel?.includes("Delete") ? "destructive" : "default"}
                            >
                                {dialog.confirmLabel || "Confirm"}
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
