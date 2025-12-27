"use client";

import { useState } from "react";
import { Plus, ArrowRightLeft, TrendingUp, TrendingDown, AlertOctagon } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { LoanList } from "@/components/loans/LoanList";
import { LoanForm } from "@/components/loans/LoanForm";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn, formatCurrency } from "@/utils/cn";

export default function LoansPage() {
    const { loans } = useFinance();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"lent" | "borrowed">("lent");

    const lentCount = loans.filter((l) => l.loanType === "lent" && l.status === "pending").length;
    const borrowedCount = loans.filter((l) => l.loanType === "borrowed" && l.status === "pending").length;
    const writeOffTotal = loans
        .filter((l) => l.status === "written-off")
        .reduce((sum, l) => sum + (l.amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Loans & Debts</h1>
                    <p className="text-muted-foreground">Track money you owe and money owed to you.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                </Button>
            </div>

            {/* Stats/Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                    onClick={() => setActiveTab("lent")}
                    className={cn(
                        "relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group text-left",
                        activeTab === "lent"
                            ? "border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-500/10"
                            : "border-slate-200 bg-white hover:border-emerald-200 hover:shadow-md"
                    )}
                >
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className={cn(
                            "text-xs font-bold uppercase tracking-wider transition-colors",
                            activeTab === "lent" ? "text-emerald-600" : "text-slate-500"
                        )}>
                            Money Lent
                        </span>
                        <span className="text-4xl font-black text-slate-800 tracking-tight">
                            {lentCount}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                            Active Records
                        </span>
                    </div>
                    <div className={cn(
                        "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300",
                        activeTab === "lent"
                            ? "bg-emerald-500 text-white shadow-emerald-500/30 shadow-lg rotate-0"
                            : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 group-hover:-rotate-12"
                    )}>
                        <TrendingUp className="h-7 w-7" />
                    </div>
                    {activeTab === "lent" && (
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <TrendingUp className="h-32 w-32 -mb-8 -mr-8 text-emerald-600" />
                        </div>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("borrowed")}
                    className={cn(
                        "relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group text-left",
                        activeTab === "borrowed"
                            ? "border-orange-500/50 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg shadow-orange-500/10"
                            : "border-slate-200 bg-white hover:border-orange-200 hover:shadow-md"
                    )}
                >
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className={cn(
                            "text-xs font-bold uppercase tracking-wider transition-colors",
                            activeTab === "borrowed" ? "text-orange-600" : "text-slate-500"
                        )}>
                            Money Borrowed
                        </span>
                        <span className="text-4xl font-black text-slate-800 tracking-tight">
                            {borrowedCount}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                            Active Records
                        </span>
                    </div>
                    <div className={cn(
                        "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300",
                        activeTab === "borrowed"
                            ? "bg-orange-500 text-white shadow-orange-500/30 shadow-lg rotate-0"
                            : "bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600 group-hover:rotate-12"
                    )}>
                        <TrendingDown className="h-7 w-7" />
                    </div>
                    {activeTab === "borrowed" && (
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <TrendingDown className="h-32 w-32 -mb-8 -mr-8 text-orange-600" />
                        </div>
                    )}
                </button>

                <div className="relative overflow-hidden p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between group">
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Total Write-offs
                        </span>
                        <span className="text-2xl font-black text-slate-700 tracking-tight">
                            {formatCurrency(writeOffTotal)}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                            Lifetime Loss Value
                        </span>
                    </div>
                    <div className="h-14 w-14 rounded-full flex items-center justify-center bg-slate-200 text-slate-500 group-hover:bg-slate-300 transition-colors">
                        <AlertOctagon className="h-7 w-7" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    {activeTab === "lent" ? "People who owe you" : "People you owe"}
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                </h2>
                <LoanList loans={loans} typeFilter={activeTab} />
            </div>

            {/* Modal */}
            <Modal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add Loan Record"
            >
                <LoanForm onSuccess={() => setIsAddOpen(false)} initialType={activeTab} />
            </Modal>
        </div>
    );
}
