"use client";

import { useMemo } from "react";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { Expense } from "@/types";
import { formatCurrency } from "@/utils/cn";
import { format, subMonths, isSameMonth, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a855f7", "#ec4899", "#64748b"
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
        return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    if (data.length === 0) return <NoData />;

    return (
        <Card className="h-[400px]">
            <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function MonthlyBarChart({ expenses }: ChartProps) {
    const data = useMemo(() => {
        // Last 6 months
        const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));

        return months.map(date => {
            const monthExpenses = expenses
                .filter(e => isSameMonth(new Date(e.date), date))
                .reduce((sum, e) => sum + e.amount, 0);

            return {
                name: format(date, "MMM"),
                total: monthExpenses
            };
        });
    }, [expenses]);

    const hasData = data.some(d => d.total > 0);
    if (!hasData) return <NoData title="Monthly Trends" />;

    return (
        <Card className="h-[400px]">
            <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `₹${value / 1000}k`}
                            width={40}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            formatter={(value: any) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function NoData({ title }: { title?: string }) {
    return (
        <Card className="h-[400px] flex flex-col justify-center items-center text-muted-foreground p-6">
            {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
            <p>No enough data to display details.</p>
        </Card>
    );
}
