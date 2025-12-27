import { useState } from "react";
import { format } from "date-fns";
import { Check, Trash2, Clock, AlertCircle, ChevronDown, ChevronUp, Plus, Banknote, History, Wallet } from "lucide-react";
import { Loan, LoanTransaction, LoanTransactionType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinance } from "@/context/FinanceContext";
import { cn, formatCurrency } from "@/utils/cn";
import { Modal } from "@/components/ui/modal";

interface LoanListProps {
    loans: Loan[];
    typeFilter: "lent" | "borrowed";
}

export function LoanList({ loans, typeFilter }: LoanListProps) {
    const { deleteLoan, updateLoan } = useFinance();
    const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
    const [transactionNote, setTransactionNote] = useState("");
    const [transactionAmount, setTransactionAmount] = useState<number | "">("");
    const [showHistoryModal, setShowHistoryModal] = useState<string | null>(null); // Loan ID

    const filtered = loans.filter((l) => l.loanType === typeFilter);

    const toggleExpand = (id: string) => {
        setExpandedLoanId(expandedLoanId === id ? null : id);
        setTransactionNote("");
        setTransactionAmount("");
    };

    const handleTransaction = async (loan: Loan, type: LoanTransactionType, customAmount?: number) => {
        const amount = customAmount || (typeof transactionAmount === 'number' ? transactionAmount : 0);

        if (amount <= 0 && type !== 'payment') return; // For payment, we might pass full amount which is calculated

        const newTransaction: LoanTransaction = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            amount: amount,
            type: type,
            note: transactionNote,
        };

        const updatedHistory = [...(loan.history || []), newTransaction];

        let updatedPaidAmount = loan.paidAmount || 0;
        let updatedPrincipal = loan.amount;
        let updatedStatus = loan.status;

        if (type === 'payment') {
            updatedPaidAmount += amount;
        } else if (type === 'lending') {
            updatedPrincipal += amount;
        }

        // Calculate outstanding to check status
        const totalInterest = loan.interestRate
            ? (updatedPrincipal * loan.interestRate) / 100
            : 0;
        const totalPayable = updatedPrincipal + totalInterest;

        if (updatedPaidAmount >= totalPayable - 1) { // Tolerance for floating point
            updatedStatus = 'paid';
        } else if (updatedStatus === 'paid') {
            updatedStatus = 'pending'; // Reopen if amounts change
        }

        await updateLoan({
            ...loan,
            amount: updatedPrincipal,
            paidAmount: updatedPaidAmount,
            history: updatedHistory,
            status: updatedStatus
        });

        setTransactionNote("");
        setTransactionAmount("");
    };

    // Note: Simple Interest Calculation for display
    const getOutstanding = (loan: Loan) => {
        const principal = loan.amount;
        const interest = loan.interestRate ? (principal * loan.interestRate) / 100 : 0;
        const total = principal + interest;
        const paid = loan.paidAmount || 0;
        return Math.max(0, total - paid);
    };

    const getEMIAmount = (loan: Loan) => {
        if (loan.repaymentType !== 'emi') return 0;
        // Simple Logic: (Principal + Interest) / Tenure
        // Use existing emiAmount if available, else calc
        if (loan.emiAmount) return loan.emiAmount;

        const principal = loan.amount;
        const interest = loan.interestRate ? (principal * loan.interestRate) / 100 : 0;
        const total = principal + interest;
        const months = loan.tenureMonths || 12; // Default 12 to avoid div by 0
        return total / months;
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
                const isExpanded = expandedLoanId === loan.id;
                const outstanding = getOutstanding(loan);
                const emiValue = getEMIAmount(loan);

                return (
                    <Card key={loan.id} className={cn(
                        "border-l-4 transition-all hover:shadow-md",
                        isPaid ? "border-l-primary opacity-70" :
                            isOverdue ? "border-l-destructive" :
                                typeFilter === "lent" ? "border-l-secondary" : "border-l-orange-500"
                    )}>
                        <CardContent className="p-0">
                            {/* Header Section (Always Visible) */}
                            <div
                                className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                                onClick={() => toggleExpand(loan.id)}
                            >
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
                                        {loan.repaymentType === 'emi' && (
                                            <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full font-medium">
                                                EMI ({loan.tenureMonths}m)
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
                                    <div className="flex flex-col items-end mr-2">
                                        <span className={cn("font-bold text-lg", typeFilter === "lent" ? "text-secondary" : "text-orange-600")}>
                                            {formatCurrency(loan.amount)}
                                        </span>
                                        {loan.interestRate && loan.interestRate > 0 && (
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {loan.interestRate}% (+{formatCurrency((loan.amount * loan.interestRate) / 100)})
                                            </span>
                                        )}
                                    </div>
                                    {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                                </div>
                            </div>

                            {/* Expanded Section */}
                            {isExpanded && (
                                <div className="bg-gradient-to-br from-card to-muted/30 p-4 rounded-b-xl border-t space-y-5 animate-in slide-in-from-top-2">
                                    {/* 1. Key Metrics */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Outstanding</span>
                                            <span className="text-2xl font-bold text-foreground">{formatCurrency(outstanding)}</span>
                                        </div>
                                        {loan.repaymentType === 'emi' && (
                                            <div className="flex flex-col items-end text-right">
                                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Monthly EMI</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold text-primary">{formatCurrency(emiValue)}</span>
                                                    <span className="text-[10px] text-muted-foreground">/mo</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. Action Center */}
                                    <div className="bg-background rounded-xl border p-1 shadow-sm">
                                        {/* Note Input - Full Width, clean */}
                                        <div className="px-3 border-b">
                                            <Input
                                                className="border-none shadow-none focus-visible:ring-0 px-0 h-10 bg-transparent placeholder:text-muted-foreground/50"
                                                placeholder="Add a reference note (optional)..."
                                                value={transactionNote}
                                                onChange={(e) => setTransactionNote(e.target.value)}
                                            />
                                        </div>

                                        {/* Interactive Zone */}
                                        <div className="p-3 grid gap-3">
                                            {/* If EMI, Show Quick Pay Button */}
                                            {loan.repaymentType === 'emi' && !isPaid && (
                                                <div className="flex gap-2">
                                                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleTransaction(loan, 'payment', emiValue)}>
                                                        Pay EMI {formatCurrency(emiValue)}
                                                    </Button>
                                                    <Button variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => handleTransaction(loan, 'payment', outstanding)}>
                                                        Foreclose
                                                    </Button>
                                                </div>
                                            )}

                                            {/* If One-Time and not paid, Show Quick Full Pay */}
                                            {loan.repaymentType !== 'emi' && !isPaid && (
                                                <Button
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handleTransaction(loan, 'payment', outstanding)}
                                                >
                                                    Mark Fully Paid ({formatCurrency(outstanding)})
                                                </Button>
                                            )}

                                            {/* Custom Transaction Row */}
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                                    <Input
                                                        className="pl-6"
                                                        placeholder="Custom Amount"
                                                        type="number"
                                                        value={transactionAmount}
                                                        onChange={(e) => setTransactionAmount(e.target.value === "" ? "" : Number(e.target.value))}
                                                    />
                                                </div>
                                                <Button
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    onClick={() => handleTransaction(loan, 'lending')}
                                                    disabled={!transactionAmount}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" /> Lend
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleTransaction(loan, 'payment')}
                                                    disabled={!transactionAmount}
                                                >
                                                    <Wallet className="h-4 w-4 mr-1" /> Recv
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Footer Links */}
                                    <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                                        <button onClick={() => deleteLoan(loan.id)} className="flex items-center hover:text-destructive transition-colors">
                                            <Trash2 className="h-3 w-3 mr-1" /> Delete Record
                                        </button>
                                        <button onClick={() => setShowHistoryModal(loan.id)} className="flex items-center hover:text-foreground transition-colors">
                                            View History <History className="h-3 w-3 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {/* History Modal */}
            <Modal
                isOpen={!!showHistoryModal}
                onClose={() => setShowHistoryModal(null)}
                title="Transaction History"
            >
                <div className="space-y-4">
                    {loans.find(l => l.id === showHistoryModal)?.history?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No history records found.</p>
                    ) : (
                        <div className="space-y-2">
                            {loans.find(l => l.id === showHistoryModal)?.history?.slice().reverse().map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                                    <div>
                                        <p className="font-medium text-sm flex items-center gap-2">
                                            {t.type === 'lending' ? 'Lent Additional' : 'Received Payment'}
                                            <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                                                {format(new Date(t.date), "MMM d, yyyy")}
                                            </span>
                                        </p>
                                        {t.note && <p className="text-xs text-muted-foreground mt-0.5">"{t.note}"</p>}
                                    </div>
                                    <span className={cn(
                                        "font-bold",
                                        t.type === 'lending' ? "text-secondary" : "text-green-600"
                                    )}>
                                        {t.type === 'lending' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
