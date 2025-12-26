"use client";

import { Download } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { CategoryPieChart, MonthlyBarChart } from "@/components/reports/ReportsCharts";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function ReportsPage() {
    const { expenses } = useFinance();

    const handleDownload = () => {
        const headers = ["Date", "Category", "Amount", "Method", "Notes"];
        const rows = expenses.map(e => [
            format(new Date(e.date), "yyyy-MM-dd"),
            e.category,
            e.amount,
            e.paymentMethod,
            `"${e.notes || ""}"` // Quote notes to handle commas
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ledgerly-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Visualize your financial habits.</p>
                </div>
                <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <CategoryPieChart expenses={expenses} />
                <MonthlyBarChart expenses={expenses} />
            </div>
        </div>
    );
}
