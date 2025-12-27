"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Loader2, CreditCard, Wallet, Smartphone, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinance } from "@/context/FinanceContext";
import { cn } from "@/utils/cn";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";

const expenseSchema = z.object({
    amount: z.coerce.number().min(1, "Amount must be at least 1"),
    category: z.string().min(1, "Category is required"),
    paymentMethod: z.enum(["Cash", "Card", "UPI"], {
        required_error: "Please select a payment method",
    }),
    date: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
    onSuccess?: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
    const { addExpense, categories } = useFinance();
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);
    const activeItemRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            paymentMethod: "UPI",
            date: format(new Date(), "yyyy-MM-dd"),
            notes: "",
            category: "",
        },
    });

    const paymentMethod = watch("paymentMethod");
    const selectedCategory = watch("category");

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Auto-scroll to selected category when dropdown opens
    useEffect(() => {
        if (isCategoryOpen && activeItemRef.current) {
            activeItemRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
        }
    }, [isCategoryOpen]);

    const onSubmit = async (data: ExpenseFormValues) => {
        try {
            await addExpense({
                amount: Number(data.amount),
                category: data.category,
                paymentMethod: data.paymentMethod,
                date: data.date,
                notes: data.notes || "",
            });
            reset();
            onSuccess?.();
        } catch (error) {
            console.error("Failed to add expense", error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-5">

                {/* Amount */}
                <div className="space-y-2">
                    <Label htmlFor="amount" className="text-slate-600 font-semibold">Amount</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            className="pl-8 h-12 border-slate-200 focus-visible:ring-indigo-500 font-bold text-xl"
                            {...register("amount")}
                        />
                    </div>
                    {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                </div>

                {/* Category & Date Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-2 relative" ref={categoryRef}>
                        <Label htmlFor="category" className="text-slate-600 font-semibold">Category</Label>
                        <div
                            className={cn(
                                "flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                                errors.category && "border-red-500"
                            )}
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        >
                            <span className={cn(!selectedCategory && "text-slate-500")}>
                                {selectedCategory || "Select"}
                            </span>
                            <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isCategoryOpen && "rotate-180")} />
                        </div>

                        {/* Hidden Input for Form Validation */}
                        <input type="hidden" {...register("category")} />

                        {isCategoryOpen && (
                            <div className="absolute left-0 top-full z-[60] mt-2 w-full min-w-[180px] rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
                                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 bg-slate-50 border-b border-slate-100 uppercase tracking-wider">
                                    Select Category
                                </div>
                                <div className="max-h-[240px] overflow-y-auto">
                                    {categories.map((cat) => {
                                        const isSelected = selectedCategory === cat.name;
                                        return (
                                            <div
                                                key={cat.id}
                                                ref={isSelected ? activeItemRef : null}
                                                onClick={() => {
                                                    setValue("category", cat.name, { shouldValidate: true });
                                                    setIsCategoryOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full px-4 py-2.5 text-left text-sm transition-colors border-l-2 flex items-center justify-between cursor-pointer",
                                                    isSelected
                                                        ? "bg-indigo-50 text-indigo-700 border-indigo-500 font-medium"
                                                        : "text-slate-600 border-transparent hover:bg-slate-50"
                                                )}
                                            >
                                                {cat.name}
                                                {isSelected && <Check className="h-3.5 w-3.5" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-slate-600 font-semibold">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            className="h-11 border-slate-200 focus-visible:ring-indigo-500"
                            {...register("date")}
                        />
                        {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                    </div>
                </div>

                {/* Creative Payment Method Selection */}
                <div className="space-y-3">
                    <Label className="text-slate-600 font-semibold">Payment Method</Label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: "UPI", icon: Smartphone, label: "UPI" },
                            { id: "Card", icon: CreditCard, label: "Card" },
                            { id: "Cash", icon: Wallet, label: "Cash" },
                        ].map((method) => {
                            const Icon = method.icon;
                            const isSelected = paymentMethod === method.id;
                            return (
                                <div
                                    key={method.id}
                                    onClick={() => setValue("paymentMethod", method.id as "UPI" | "Card" | "Cash")}
                                    className={cn(
                                        "cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 gap-2",
                                        isSelected
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm scale-[1.02]"
                                            : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-500"
                                    )}
                                >
                                    <Icon className={cn("h-6 w-6", isSelected ? "text-indigo-600" : "text-slate-400")} />
                                    <span className="text-xs font-bold">{method.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-600 font-semibold">Notes (Optional)</Label>
                    <Textarea
                        id="notes"
                        placeholder="What was this for?"
                        className="resize-none border-slate-200 focus-visible:ring-indigo-500 min-h-[80px]"
                        {...register("notes")}
                    />
                </div>

            </div>

            <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                    </>
                ) : (
                    "Add Expense"
                )}
            </Button>
        </form>
    );
}
