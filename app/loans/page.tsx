"use client";

import { useState } from "react";
import { Plus, ArrowRightLeft } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { LoanList } from "@/components/loans/LoanList";
import { LoanForm } from "@/components/loans/LoanForm";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/utils/cn";

export default function LoansPage() {
    const { loans } = useFinance();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"lent" | "borrowed">("lent");

    const lentCount = loans.filter((l) => l.loanType === "lent" && l.status === "pending").length;
    const borrowedCount = loans.filter((l) => l.loanType === "borrowed" && l.status === "pending").length;

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
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-lg">
                <button
                    onClick={() => setActiveTab("lent")}
                    className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-md transition-all",
                        activeTab === "lent"
                            ? "bg-card shadow-sm border text-primary"
                            : "hover:bg-card/50 text-muted-foreground"
                    )}
                >
                    <span className="text-sm font-medium">Money Lent</span>
                    <span className="text-2xl font-bold">{lentCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Records</span>
                </button>
                <button
                    onClick={() => setActiveTab("borrowed")}
                    className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-md transition-all",
                        activeTab === "borrowed"
                            ? "bg-card shadow-sm border text-destructive"
                            : "hover:bg-card/50 text-muted-foreground"
                    )}
                >
                    <span className="text-sm font-medium">Money Borrowed</span>
                    <span className="text-2xl font-bold">{borrowedCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Records</span>
                </button>
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
                <LoanForm onSuccess={() => setIsAddOpen(false)} />
            </Modal>
        </div>
    );
}
