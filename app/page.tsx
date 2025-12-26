"use client";

import { useFinance } from "@/context/FinanceContext";
import { SummaryCards, RecentTransactions } from "@/components/dashboard/DashboardWidgets";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { LoanForm } from "@/components/loans/LoanForm";

export default function Home() {
  const { isLoading, expenses, loans } = useFinance();
  const [modalType, setModalType] = useState<"expense" | "loan" | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your financial overview.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setModalType("expense")} className="flex-1 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
          <Button onClick={() => setModalType("loan")} variant="outline" className="flex-1">
            Add Loan
          </Button>
        </div>
      </div>

      {/* Summary */}
      <SummaryCards />

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <RecentTransactions />
        </div>

        <div className="col-span-3 lg:col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-center items-center text-center space-y-4 bg-muted/10">
          <h3 className="text-lg font-semibold">Monthly Limit</h3>
          <div className="relative h-32 w-32 rounded-full border-8 border-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No limit set</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Set a monthly budget to track your progress. (Coming Soon)
          </p>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalType === "expense"}
        onClose={() => setModalType(null)}
        title="Add New Expense"
      >
        <ExpenseForm onSuccess={() => setModalType(null)} />
      </Modal>

      <Modal
        isOpen={modalType === "loan"}
        onClose={() => setModalType(null)}
        title="Add Loan Record"
      >
        <LoanForm onSuccess={() => setModalType(null)} />
      </Modal>
    </div>
  );
}
