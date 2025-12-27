"use client";

import { useMemo } from "react";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from "recharts";
import { Expense } from "@/types";
import { formatCurrency, cn } from "@/utils/cn";
import { format, subMonths, isSameMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, PieChart as PieIcon, BarChart3 } from "lucide-react";

// Modern Creative Palette
const COLORS = [
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#f43f5e", // Rose
    "#f97316", // Orange
    "#eab308", // Yellow
    "#10b981", // Emerald
    "#06b6d4"  // Cyan
];

interface ChartProps {
    expenses: Expense[];
}

export function CategoryPieChart({ expenses }: ChartProps) {
    const data = useMemo(() => {
        const map = new Map<string, number>();
        expenses.forEach(e => {
            const current = map.get(e.category) || 0;
            map.set(e.category, current + e.amount);
        });
        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [expenses]);

    if (data.length === 0) return <NoData title="Spending Distribution" icon={PieIcon} />;

    return (
        <Card className="h-full min-h-[450px] rounded-2xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <PieIcon className="h-5 w-5 text-indigo-500" />
                    Spending Distribution
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="45%"
                            innerRadius={80} // Donut style
                            outerRadius={110}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={6}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    className="transition-all duration-300 hover:opacity-80"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => formatCurrency(value)}
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                padding: '12px 16px',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(4px)'
                            }}
                            itemStyle={{ color: '#1e293b', fontWeight: 600, fontSize: '14px' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={120} // Give legend space
                            iconType="circle"
                            content={
                                ({ payload }: any) => (
                                    <div className="flex flex-wrap justify-center gap-2 mt-4 px-2 overflow-y-auto max-h-[120px] custom-scrollbar">
                                        {payload.map((entry: any, index: number) => (
                                            <div key={`legend-${index}`} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                <span className="text-xs font-medium text-slate-600 truncate max-w-[80px]" title={entry.value}>
                                                    {entry.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text for Donut */}
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-sm font-medium text-slate-400">Total</span>
                </div>
            </CardContent>
        </Card>
    );
}

export function MonthlyBarChart({ expenses }: ChartProps) {
    const data = useMemo(() => {
        const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));

        return months.map(date => {
            const monthExpenses = expenses
                .filter(e => isSameMonth(new Date(e.date), date))
                .reduce((sum, e) => sum + e.amount, 0);

            return {
                name: format(date, "MMM"),
                fullName: format(date, "MMMM yyyy"),
                total: monthExpenses
            };
        });
    }, [expenses]);

    const hasData = data.some(d => d.total > 0);
    if (!hasData) return <NoData title="Monthly Trends" icon={BarChart3} />;

    return (
        <Card className="h-full min-h-[450px] rounded-2xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                    Monthly Spending Trends
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={40}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `₹${value / 1000}k`}
                            width={45}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dx={-5}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc', opacity: 0.8 }}
                            formatter={(value: any) => formatCurrency(value)}
                            labelFormatter={(label, payload) => payload[0]?.payload.fullName || label}
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                padding: '12px 16px',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)'
                            }}
                            itemStyle={{ color: '#6366f1', fontWeight: 600, fontSize: '15px' }}
                            labelStyle={{ color: '#64748b', fontWeight: 500, marginBottom: '8px', fontSize: '12px' }}
                        />
                        <Bar
                            dataKey="total"
                            fill="url(#barGradient)"
                            radius={[8, 8, 8, 8]}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function NoData({ title, icon: Icon }: { title?: string, icon?: any }) {
    return (
        <Card className="h-full min-h-[450px] flex flex-col justify-center items-center text-slate-400 p-8 rounded-2xl border-slate-200 bg-slate-50 border-dashed">
            <div className="p-4 bg-slate-100 rounded-full mb-4">
                {Icon ? <Icon className="h-8 w-8 text-slate-300" /> : <Layers className="h-8 w-8 text-slate-300" />}
            </div>
            {title && <h3 className="text-lg font-bold mb-2 text-slate-600">{title}</h3>}
            <p className="text-sm font-medium text-slate-400 max-w-[200px] text-center leading-relaxed">
                Start adding expenses to see visualized data here.
            </p>
        </Card>
    );
}
