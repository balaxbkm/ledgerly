"use client";

import { useMemo } from "react";
import { Download, TrendingUp, Calendar, Wallet } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { CategoryPieChart, MonthlyBarChart } from "@/components/reports/ReportsCharts";
import { Button } from "@/components/ui/button";
import { format, isSameMonth, subMonths } from "date-fns";
import { formatCurrency, cn } from "@/utils/cn";
import { Card, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
    const { expenses } = useFinance();

    const handleDownload = () => {
        const headers = ["Date", "Category", "Amount", "Method", "Notes"];
        const rows = expenses.map(e => [
            format(new Date(e.date), "yyyy-MM-dd"),
            e.category,
            e.amount,
            e.paymentMethod,
            `"${e.notes || ""}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ledgerly-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
    };

    // --- Insights Calculation ---
    const insights = useMemo(() => {
        const now = new Date();
        const thisMonth = expenses.filter(e => isSameMonth(new Date(e.date), now));
        const totalThisMonth = thisMonth.reduce((sum, e) => sum + e.amount, 0);

        const lastMonthDate = subMonths(now, 1);
        const lastMonth = expenses.filter(e => isSameMonth(new Date(e.date), lastMonthDate));
        const totalLastMonth = lastMonth.reduce((sum, e) => sum + e.amount, 0);

        const diff = totalThisMonth - totalLastMonth;
        const trend = totalLastMonth > 0 ? (diff / totalLastMonth) * 100 : 0;

        // Top Category
        const catMap = new Map<string, number>();
        thisMonth.forEach(e => catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount));
        let topCategory = "N/A";
        let topCategoryAmount = 0;
        for (const [cat, amount] of Array.from(catMap.entries())) {
            if (amount > topCategoryAmount) {
                topCategory = cat;
                topCategoryAmount = amount;
            }
        }

        // Avg Monthly (last 6 months)
        const sixMonthsAgo = subMonths(now, 6);
        const recentExpenses = expenses.filter(e => new Date(e.date) >= sixMonthsAgo);
        const totalRecent = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
        const avgMonthly = totalRecent / 6;

        return {
            totalThisMonth,
            trend,
            topCategory,
            topCategoryAmount,
            avgMonthly
        };
    }, [expenses]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports</h1>
                    <p className="text-slate-500">Visualize your financial habits and trends.</p>
                </div>
                <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Key Insights Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50 to-white overflow-hidden relative">
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                            <Wallet className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">This Month</span>
                        </div>
                        <div className="text-3xl font-black text-slate-800 tracking-tight">
                            {formatCurrency(insights.totalThisMonth)}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium">
                            <span className={cn(
                                insights.trend > 0 ? "text-red-500" : "text-emerald-500"
                            )}>
                                {insights.trend > 0 ? "+" : ""}{insights.trend.toFixed(1)}%
                            </span>
                            <span className="text-slate-400">vs last month</span>
                        </div>
                    </CardContent>
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-indigo-100/50 rounded-full blur-2xl" />
                </Card>

                <Card className="rounded-2xl border-slate-200 shadow-sm bg-gradient-to-br from-purple-50 to-white overflow-hidden relative">
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Top Category</span>
                        </div>
                        <div className="text-3xl font-black text-slate-800 tracking-tight truncate" title={insights.topCategory}>
                            {insights.topCategory}
                        </div>
                        <div className="text-xs font-medium text-slate-400 mt-1">
                            {formatCurrency(insights.topCategoryAmount)} spent this month
                        </div>
                    </CardContent>
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-purple-100/50 rounded-full blur-2xl" />
                </Card>

                <Card className="rounded-2xl border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50 to-white overflow-hidden relative">
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Monthly Avg</span>
                        </div>
                        <div className="text-3xl font-black text-slate-800 tracking-tight">
                            {formatCurrency(insights.avgMonthly)}
                        </div>
                        <div className="text-xs font-medium text-slate-400 mt-1">
                            Based on last 6 months
                        </div>
                    </CardContent>
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-emerald-100/50 rounded-full blur-2xl" />
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <CategoryPieChart expenses={expenses} />
                </div>
                <div className="lg:col-span-2">
                    <MonthlyBarChart expenses={expenses} />
                </div>
            </div>
        </div>
    );
}
