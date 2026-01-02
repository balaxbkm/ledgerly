"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addMonths } from "date-fns";
import { Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinance } from "@/context/FinanceContext";
import { cn } from "@/utils/cn";
import { Textarea } from "@/components/ui/textarea";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";

const loanSchema = z.object({
    personName: z.string().min(1, "Person name is required"),
    amount: z.coerce.number().min(1, "Amount must be at least 1"),
    loanType: z.enum(["lent", "borrowed"]),
    repaymentType: z.enum(["one-time", "emi"]),
    startDate: z.string().min(1, "Start date is required"),
    dueDate: z.string().optional(),
    interestRate: z.coerce.number().optional(),
    tenureMonths: z.coerce.number().optional(),
    fixedInterestAmount: z.coerce.number().optional(),
    notes: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.repaymentType === "one-time" && !data.dueDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Due date is required for one-time repayment",
            path: ["dueDate"],
        });
    }
    if (data.repaymentType === "emi" && (!data.tenureMonths || data.tenureMonths < 1)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Valid tenure is required for EMI",
            path: ["tenureMonths"],
        });
    }
});

type LoanFormValues = z.infer<typeof loanSchema>;

interface LoanFormProps {
    onSuccess?: () => void;
    initialType?: "lent" | "borrowed";
}

export function LoanForm({ onSuccess, initialType = "lent" }: LoanFormProps) {
    const { addLoan } = useFinance();

    const form = useForm<LoanFormValues>({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            loanType: initialType,
            repaymentType: "one-time",
            startDate: format(new Date(), "yyyy-MM-dd"),
            dueDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
            interestRate: 0,
            fixedInterestAmount: 0,
            tenureMonths: 12,
            notes: "",
        },
    });

    const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } = form;

    const loanType = watch("loanType");
    const repaymentType = watch("repaymentType");

    const onSubmit = async (data: LoanFormValues) => {
        try {
            // Calculate due date for EMI based on tenure
            const finalDueDate = data.repaymentType === "emi" && data.startDate && data.tenureMonths
                ? format(addMonths(new Date(data.startDate), data.tenureMonths), "yyyy-MM-dd")
                : data.dueDate;

            // Calculate EMI Amount (Standard Reducing Balance)
            let calculatedEmi = 0;
            if (data.repaymentType === "emi" && data.tenureMonths && data.tenureMonths > 0) {
                const principal = Number(data.amount);
                const annualRate = Number(data.interestRate || 0);

                if (annualRate > 0) {
                    const monthlyRate = annualRate / 12 / 100;
                    const tenureMonths = data.tenureMonths;

                    // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
                    const x = Math.pow(1 + monthlyRate, tenureMonths);
                    calculatedEmi = (principal * monthlyRate * x) / (x - 1);
                } else {
                    calculatedEmi = principal / data.tenureMonths;
                }

                calculatedEmi = parseFloat(calculatedEmi.toFixed(2));
            }

            await addLoan({
                ...data,
                personName: data.personName,
                amount: Number(data.amount),
                loanType: data.loanType,
                repaymentType: data.repaymentType,
                status: "pending",
                interestRate: data.interestRate ? Number(data.interestRate) : undefined, // Stored as Annual %
                tenureMonths: data.repaymentType === "emi" ? Number(data.tenureMonths) : undefined,
                fixedInterestAmount: data.repaymentType === "one-time" ? Number(data.fixedInterestAmount) : undefined,
                dueDate: finalDueDate,
                emiAmount: calculatedEmi,
            });
            form.reset();
            onSuccess?.();
        } catch (error) {
            console.error("Failed to add loan", error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Loan Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                    type="button"
                    onClick={() => setValue("loanType", "lent")}
                    className={cn(
                        "flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-md transition-all",
                        loanType === "lent"
                            ? "bg-emerald-500 text-white shadow-md"
                            : "text-slate-500 hover:bg-slate-200"
                    )}
                >
                    <ArrowUpRight className="h-4 w-4" />
                    Lend
                </button>
                <button
                    type="button"
                    onClick={() => setValue("loanType", "borrowed")}
                    className={cn(
                        "flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-md transition-all",
                        loanType === "borrowed"
                            ? "bg-orange-500 text-white shadow-md"
                            : "text-slate-500 hover:bg-slate-200"
                    )}
                >
                    <ArrowDownRight className="h-4 w-4" />
                    Borrow
                </button>
            </div>

            <div className="grid gap-5">
                {/* Person Name */}
                <div className="space-y-2">
                    <Label htmlFor="personName" className="text-slate-600 font-semibold">
                        {loanType === "lent" ? "Borrower's Name" : "Lender, Bank or Company Name"}
                    </Label>
                    <Input
                        id="personName"
                        placeholder={loanType === "lent" ? "e.g. John Doe" : "e.g. SBI Credit Card"}
                        className="h-11 border-slate-200 focus-visible:ring-indigo-500"
                        {...register("personName")}
                    />
                    {errors.personName && <p className="text-xs text-red-500">{errors.personName.message}</p>}
                </div>

                {/* Amount & Interest Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-slate-600 font-semibold">Amount</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                className="pl-8 h-11 border-slate-200 focus-visible:ring-indigo-500 font-bold text-lg"
                                {...register("amount")}
                            />
                        </div>
                        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                    </div>

                    <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <Label htmlFor="interest" className="text-slate-600 font-semibold">Interest Rate (%)</Label>
                        <Input
                            id="interest"
                            type="number"
                            placeholder="0"
                            className="h-11 border-slate-200 focus-visible:ring-indigo-500"
                            {...register("interestRate")}
                        />
                    </div>
                </div>

                {/* Repayment Type Toggle */}
                <div className="space-y-2">
                    <Label className="text-slate-600 font-semibold">Repayment Type</Label>
                    <div className="flex gap-4">
                        <label className={cn(
                            "flex-1 border rounded-xl p-3 cursor-pointer transition-all hover:bg-slate-50 relative overflow-hidden",
                            repaymentType === "one-time" ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/50" : "border-slate-200"
                        )}>
                            <div className="flex items-center gap-3 relative z-10">
                                <input
                                    type="radio"
                                    value="one-time"
                                    className="w-4 h-4 text-indigo-600 accent-indigo-600"
                                    {...register("repaymentType")}
                                />
                                <div>
                                    <span className="block font-bold text-sm text-slate-800">One-time Payment</span>
                                    <span className="block text-xs text-slate-500 mt-0.5">Full amount returned at once</span>
                                </div>
                            </div>
                        </label>
                        <label className={cn(
                            "flex-1 border rounded-xl p-3 cursor-pointer transition-all hover:bg-slate-50 relative overflow-hidden",
                            repaymentType === "emi" ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/50" : "border-slate-200"
                        )}>
                            <div className="flex items-center gap-3 relative z-10">
                                <input
                                    type="radio"
                                    value="emi"
                                    className="w-4 h-4 text-indigo-600 accent-indigo-600"
                                    {...register("repaymentType")}
                                />
                                <div>
                                    <span className="block font-bold text-sm text-slate-800">EMI / Monthly</span>
                                    <span className="block text-xs text-slate-500 mt-0.5">Paid back in installments</span>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Dates Row */}
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Due Date or Tenure */}
                    <div className="space-y-2">
                        {repaymentType === "one-time" ? (
                            <Controller
                                control={control}
                                name="dueDate"
                                render={({ field }) => (
                                    <CustomDatePicker
                                        label="Due Date"
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={errors.dueDate?.message}
                                    />
                                )}
                            />
                        ) : (
                            <>
                                <Label htmlFor="tenure" className="text-slate-600 font-semibold">Tenure (Months)</Label>
                                <Input
                                    id="tenure"
                                    type="number"
                                    placeholder="12"
                                    className="h-11 border-slate-200 focus-visible:ring-indigo-500"
                                    {...register("tenureMonths")}
                                />
                                {errors.tenureMonths && <p className="text-xs text-red-500">{errors.tenureMonths.message}</p>}
                            </>
                        )}
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                        <Controller
                            control={control}
                            name="startDate"
                            render={({ field }) => (
                                <CustomDatePicker
                                    label={loanType === "lent" ? "Lent Date" : "Borrowed Date"}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.startDate?.message}
                                />
                            )}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-600 font-semibold">Notes (Optional)</Label>
                    <Textarea
                        id="notes"
                        placeholder="Additional details..."
                        className="resize-none border-slate-200 focus-visible:ring-indigo-500 min-h-[80px]"
                        {...register("notes")}
                    />
                </div>
            </div>

            <Button
                type="submit"
                className={cn(
                    "w-full h-11 text-white font-bold shadow-lg transition-all",
                    loanType === "lent"
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                        : "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20"
                )}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    loanType === "lent" ? "Record Loan (Lend)" : "Record Debt (Borrow)"
                )}
            </Button>
        </form>
    );
}
