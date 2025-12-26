"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // Standard Zod import
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";
import { ExpenseCategory, PaymentMethod, Expense } from "@/types";
import { useFinance } from "@/context/FinanceContext";

const expenseSchema = z.object({
    amount: z.coerce.number().min(1, "Amount must be positive"),
    category: z.string().min(1, "Category is required"),
    paymentMethod: z.enum(["Cash", "Card", "UPI"] as [string, ...string[]]),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "Card", "UPI"];

interface ExpenseFormProps {
    onSuccess?: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
    const { addExpense, categories } = useFinance();

    const form = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema) as any,
        defaultValues: {
            amount: undefined,
            category: categories[0]?.name || "Food",
            paymentMethod: "UPI",
            date: format(new Date(), "yyyy-MM-dd"), // Input date type needs yyyy-MM-dd
            notes: "",
        },
    });

    const onSubmit = async (data: ExpenseFormData) => {
        try {
            // Preserve current time with the selected date to ensure proper sorting
            const selectedDate = new Date(data.date);
            const now = new Date();
            selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

            await addExpense({
                amount: data.amount as unknown as number, // Transformed by Zod
                category: data.category as ExpenseCategory,
                paymentMethod: data.paymentMethod as PaymentMethod,
                date: selectedDate.toISOString(),
                notes: data.notes,
            });
            form.reset();
            onSuccess?.();
        } catch (error) {
            console.error("Failed to add expense", error);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        className="text-lg font-semibold"
                        {...form.register("amount")}
                    />
                    {form.formState.errors.amount && (
                        <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                    )}
                </div>

                <div className="space-y-3">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        {...form.register("date")}
                    />
                    {form.formState.errors.date && (
                        <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <Label>Category</Label>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => form.setValue("category", cat.name)}
                            className={cn(
                                "px-3 py-1.5 text-sm rounded-full border transition-all cursor-pointer",
                                form.watch("category") === cat.name
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-background hover:bg-muted"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <Label>Payment Method</Label>
                <div className="flex gap-2">
                    {PAYMENT_METHODS.map((method) => (
                        <button
                            key={method}
                            type="button"
                            onClick={() => form.setValue("paymentMethod", method)}
                            className={cn(
                                "flex-1 px-3 py-2 text-sm text-center rounded-md border transition-all",
                                form.watch("paymentMethod") === method
                                    ? "bg-secondary text-secondary-foreground border-secondary font-medium"
                                    : "bg-background hover:bg-muted"
                            )}
                        >
                            {method}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                    id="notes"
                    placeholder="What was this for?"
                    {...form.register("notes")}
                />
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Plus className="mr-2 h-4 w-4" />
                )}
                Add Expense
            </Button>
        </form>
    );
}
