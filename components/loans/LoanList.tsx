"use client";

import { useEffect, useState, useRef } from "react";
import { format, differenceInMonths, addMonths, isAfter, isSameDay, differenceInDays, differenceInMinutes } from "date-fns";
import { Check, Trash2, Clock, AlertCircle, Calendar, Wallet, Banknote, XCircle, AlertTriangle, CreditCard, Plus, User, History } from "lucide-react";
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

type DialogType = "alert" | "confirm" | "prompt" | "payment" | "history";

interface DialogState {
    isOpen: boolean;
    type: DialogType;
    title: string;
    message?: string;
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
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update current time every second to handle "Undo" button visibility live
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const filtered = loans.filter((l) => l.loanType === typeFilter);

    // Effect: Apply monthly interest for EMI loans on the 1st of each month
    useEffect(() => {
        const checkAndApplyInterest = async () => {
            const now = new Date();
            for (const loan of loans) {
                if (loan.repaymentType === 'emi' && loan.status === 'pending' && (loan.interestRate || 0) > 0) {
                    const lastApplied = loan.lastInterestAppliedDate ? new Date(loan.lastInterestAppliedDate) : new Date(loan.startDate);

                    // check if current time is in a subsequent month relative to the last time we applied interest
                    const isFutureMonth = (now.getFullYear() > lastApplied.getFullYear()) ||
                        (now.getFullYear() === lastApplied.getFullYear() && now.getMonth() > lastApplied.getMonth());

                    if (isFutureMonth) {
                        // Calculate interest on the *current outstanding* amount
                        const interestToAdd = loan.amount * ((loan.interestRate || 0) / 100);

                        // Update the loan
                        await updateLoan({
                            ...loan,
                            amount: loan.amount + interestToAdd,
                            lastInterestAppliedDate: now.toISOString()
                        });
                    }
                }
            }
        };

        checkAndApplyInterest();
    }, [loans, updateLoan]);

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

    const showConfirm = (title: string, message: string, onConfirm: () => void, confirmLabel = "Confirm") => {
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
                    showConfirm(
                        "Full Payment Detected",
                        `The amount entered (${formatCurrency(amount)}) covers the full outstanding loan (${formatCurrency(loan.amount)}). Mark as fully paid?`,
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
        showPrompt(
            "Lend More",
            `Enter additional amount to lend to ${loan.personName}`,
            (amountStr) => {
                const addedAmount = parseFloat(amountStr);
                if (isNaN(addedAmount) || addedAmount <= 0) {
                    showAlert("Invalid Amount", "Please enter a valid positive number.");
                    return;
                }

                const interestRate = loan.interestRate || 0;
                const interestComponent = addedAmount * (interestRate / 100);
                const totalToAdd = addedAmount + interestComponent;

                const updatedLoan = {
                    ...loan,
                    amount: loan.amount + totalToAdd,
                };

                // For non-EMI, track the fixed interest component
                if (loan.repaymentType !== 'emi') {
                    updatedLoan.fixedInterestAmount = (updatedLoan.fixedInterestAmount || 0) + interestComponent;
                }

                updateLoan(addToHistory(updatedLoan, "edit", `Top-up: Added ${formatCurrency(addedAmount)} (+${formatCurrency(interestComponent)} interest)`, totalToAdd));

                // Optional: Show success feedback or confirmation
            }
        );
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
                                            {(loan.interestRate || 0) > 0 || (loan.fixedInterestAmount || 0) > 0 ? (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                    {(loan.interestRate || 0) > 0 && `${loan.interestRate}%`}
                                                    {loan.repaymentType === "emi" ? (
                                                        (loan.interestRate || 0) > 0 && ` + ${formatCurrency(loan.amount * ((loan.interestRate || 0) / 100))}/mo`
                                                    ) : (loan.fixedInterestAmount || 0) > 0 ? (
                                                        ` + ${formatCurrency(loan.fixedInterestAmount || 0)}`
                                                    ) : ""}
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
                                            <div className="flex flex-col items-start text-xs text-muted-foreground">
                                                {(() => {
                                                    // Calculate EMI Amount (prefer stored fixed amount, else estimate)
                                                    // Note: Fallback estimate using current amount is widely inaccurate for old loans if principal decreases, 
                                                    // but best effort if data missing.
                                                    const emiAmount = loan.emiAmount || ((loan.amount + (loan.amount * (loan.interestRate || 0) / 100)) / loan.tenureMonths);
                                                    const remainingEmis = Math.ceil(loan.amount / (emiAmount || 1));

                                                    return (
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
                                                                    {Math.max(0, remainingEmis)} <span className="text-indigo-400 font-normal">of {loan.tenureMonths} EMIs left</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-0.5 bg-slate-400/30 rounded-full shrink-0" />
                                                <div className="flex flex-col items-start text-xs text-muted-foreground">
                                                    <span className="font-medium text-slate-700">
                                                        Single Repay
                                                    </span>
                                                    {(loan.partPaymentCount || 0) > 0 ? (
                                                        <span className="text-[10px] text-red-600 font-medium mt-0.5 flex items-center gap-1">
                                                            {loan.partPaymentCount} Part Payment{(loan.partPaymentCount || 0) > 1 ? 's' : ''}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground mt-0.5 opacity-80">
                                                            Full payment expected
                                                        </span>
                                                    )}
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

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 border-blue-200"
                                                            onClick={() => handleHistory(loan)}
                                                            title="View History"
                                                        >
                                                            <History className="h-3.5 w-3.5 mr-1.5" /> History
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
                                                        {isPaid ? "Loan Fully Paid" : "Loan Written Off"}
                                                    </span>
                                                )}

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

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 border-blue-200"
                                                            onClick={() => handleHistory(loan)}
                                                            title="View History"
                                                        >
                                                            <History className="h-3.5 w-3.5 mr-1.5" /> History
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
                                                        {isPaid ? "Loan Fully Paid" : "Loan Written Off"}
                                                    </span>
                                                )}

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
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {dialog.message}
                        </p>
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
                                                    // Calculate current EMI
                                                    const currentEmi = loan.emiAmount || ((loan.amount + (loan.amount * (loan.interestRate || 0) / 100)) / (loan.tenureMonths || 1));

                                                    showConfirm(
                                                        "Confirm EMI Payment",
                                                        `Pay current EMI of ${formatCurrency(currentEmi)}? This will reduce the outstanding balance.`,
                                                        () => updateLoan({
                                                            ...loan,
                                                            amount: Math.max(0, loan.amount - currentEmi),
                                                            lastEmiPaymentDate: new Date().toISOString()
                                                        }),
                                                        "Pay EMI"
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
                                                "Foreclose Loan",
                                                `Are you sure you want to foreclose this loan? This will mark it as fully paid.`,
                                                () => updateLoan({
                                                    ...dialog.payload,
                                                    status: 'paid',
                                                    undoData: {
                                                        timestamp: new Date().toISOString(),
                                                        previousStatus: dialog.payload.status,
                                                        previousAmount: dialog.payload.amount,
                                                        actionType: "payment"
                                                    }
                                                }),
                                                "Foreclose"
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
                            {!dialog.payload.history || dialog.payload.history.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p>No history recorded yet.</p>
                                </div>
                            ) : (
                                <div className="relative border-l border-slate-200 ml-3 space-y-6 py-2">
                                    {(dialog.payload.history as any[]).map((item: any) => (
                                        <div key={item.id} className="relative pl-6">
                                            <div className={cn(
                                                "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ring-1",
                                                item.action === "payment" ? "bg-green-500 ring-green-100" :
                                                    item.action === "creation" ? "bg-blue-500 ring-blue-100" :
                                                        item.action === "undo" ? "bg-orange-500 ring-orange-100" :
                                                            "bg-slate-400 ring-slate-100"
                                            )} />
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className={cn(
                                                        "text-sm font-semibold",
                                                        item.action === "payment" ? "text-green-700" : "text-slate-700"
                                                    )}>
                                                        {item.action === "payment" ? "Payment Received" :
                                                            item.action === "creation" ? "Loan Created" :
                                                                item.action === "status_change" ? "Status Updated" :
                                                                    item.action === "undo" ? "Action Undone" :
                                                                        item.action === "edit" ? "Record Updated" : "Activity"}
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
                            )}
                        </div>
                    )}

                    {dialog.type === "prompt" && (
                        <div className="py-2">
                            <Input
                                ref={promptInputRef}
                                value={promptValue}
                                onChange={(e) => setPromptValue(e.target.value)}
                                placeholder={dialog.placeholder}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        dialog.onConfirm(promptValue);
                                    }
                                }}
                            />
                        </div>
                    )}

                    {dialog.type !== "payment" && dialog.type !== "history" && (
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
