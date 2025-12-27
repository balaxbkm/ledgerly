"use client";

import { useFinance } from "@/context/FinanceContext";
import { SummaryCards, RecentTransactions } from "@/components/dashboard/DashboardWidgets";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { LoanForm } from "@/components/loans/LoanForm";

export default function Home() {
  const { isLoading, expenses, loans } = useFinance();
  const [modalType, setModalType] = useState<"expense" | "loan" | null>(null);

  // Mock limit for UI - in real app would come from settings
  const limit = 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back to your financial overview.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setModalType("expense")} className="flex-1 shadow-lg shadow-slate-900/20 bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
          <Button onClick={() => setModalType("loan")} variant="outline" className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl">
            Add Loan
          </Button>
        </div>
      </div>

      {/* Summary */}
      <SummaryCards />

      {/* Recent Activity & Limits */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity Container */}
        <div className="col-span-4 lg:col-span-4 rounded-2xl border border-slate-200 bg-white shadow-sm p-6 overflow-hidden">
          <RecentTransactions />
        </div>

        {/* Monthly Limit Container */}
        <div className="col-span-3 lg:col-span-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden group">

          <div className="absolute inset-0 bg-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 space-y-2">
            <h3 className="text-lg font-bold text-slate-700">Monthly Limit</h3>
            <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
              Set a monthly budget to track your progress and avoid overspending.
            </p>
          </div>

          <div className="relative h-40 w-40 flex items-center justify-center z-10">
            {/* Background Circle */}
            <div className="absolute inset-0 rounded-full border-[12px] border-slate-200" />
            {/* Inner Content */}
            <div className="flex flex-col items-center gap-1">
              <Target className="h-6 w-6 text-slate-300 mb-1" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Limit</span>
            </div>
          </div>

          <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 relative z-10" disabled>
            Configure Limit (Soon)
          </Button>
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
