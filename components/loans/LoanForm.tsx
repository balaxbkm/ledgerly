"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addMonths } from "date-fns";
import { Loader2, Plus, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";
import { LoanType, Loan } from "@/types";
import { useFinance } from "@/context/FinanceContext";

const loanSchema = z.object({
    personName: z.string().min(1, "Person name is required"),
    amount: z.coerce.number().min(1, "Amount must be positive"),
    loanType: z.enum(["borrowed", "lent"] as [string, ...string[]]),
    interestRate: z.coerce.number().optional().default(0),
    repaymentType: z.enum(["one-time", "emi"]).optional(),
    tenureMonths: z.coerce.number().optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    dueDate: z.string().optional(),
});

type LoanFormData = z.infer<typeof loanSchema>;

interface LoanFormProps {
    onSuccess?: () => void;
}

export function LoanForm({ onSuccess }: LoanFormProps) {
    const { addLoan } = useFinance();

    const form = useForm<LoanFormData>({
        resolver: zodResolver(loanSchema) as any,
        defaultValues: {
            personName: "",
            amount: undefined,
            loanType: "lent",
            repaymentType: "one-time",
            startDate: format(new Date(), "yyyy-MM-dd"),
            dueDate: "",
        },
    });

    const onSubmit = async (data: LoanFormData) => {
        try {
            await addLoan({
                personName: data.personName,
                amount: data.amount as unknown as number,
                loanType: data.loanType as LoanType,
                interestRate: data.interestRate,
                repaymentType: data.repaymentType as "one-time" | "emi" | undefined,
                tenureMonths: data.tenureMonths,
                startDate: new Date(data.startDate).toISOString(),
                dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
                status: "pending",
            });
            form.reset();
            onSuccess?.();
        } catch (error) {
            console.error("Failed to add loan", error);
        }
    };

    const loanType = form.watch("loanType");
    const repaymentType = form.watch("repaymentType");
    const tenureMonths = form.watch("tenureMonths");
    const startDate = form.watch("startDate");

    // Auto-calculate due date when tenure changes
    const handleTenureChange = (months: number) => {
        form.setValue("tenureMonths", months);
        if (startDate) {
            const start = new Date(startDate);
            const due = addMonths(start, months);
            form.setValue("dueDate", format(due, "yyyy-MM-dd"));
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* ... (Lending/Borrowing buttons) ... */}
            <div className="space-y-3">
                <Label>I am...</Label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => form.setValue("loanType", "lent")}
                        className={cn(
                            "px-3 py-2 text-sm font-medium rounded-md border transition-all",
                            loanType === "lent"
                                ? "bg-secondary text-secondary-foreground border-secondary"
                                : "bg-background hover:bg-muted"
                        )}
                    >
                        Lending (Giving)
                    </button>
                    <button
                        type="button"
                        onClick={() => form.setValue("loanType", "borrowed")}
                        className={cn(
                            "px-3 py-2 text-sm font-medium rounded-md border transition-all",
                            loanType === "borrowed"
                                ? "bg-destructive text-destructive-foreground border-destructive"
                                : "bg-background hover:bg-muted"
                        )}
                    >
                        Borrowing (Taking)
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <Label htmlFor="personName">
                    {loanType === "lent" ? "Who are you lending to?" : "Who are you borrowing from?"}
                </Label>
                <Input
                    id="personName"
                    placeholder={loanType === "lent" ? "e.g. John Doe" : "e.g. Bank, Finance Co, or Person Name"}
                    {...form.register("personName")}
                />
                {form.formState.errors.personName && (
                    <p className="text-sm text-destructive">{form.formState.errors.personName.message}</p>
                )}
            </div>

            {loanType === "lent" ? (
                <>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-8 space-y-3">
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
                        <div className="col-span-4 space-y-3">
                            <Label htmlFor="interestRate">Interest (%)</Label>
                            <Input
                                id="interestRate"
                                type="number"
                                placeholder="0"
                                {...form.register("interestRate")}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <Label>Repayment Type</Label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    form.setValue("repaymentType", "one-time");
                                    form.setValue("tenureMonths", undefined);
                                    form.setValue("dueDate", "");
                                }}
                                className={cn(
                                    "flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-all",
                                    repaymentType === "one-time"
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background hover:bg-muted"
                                )}
                            >
                                One-time Payback
                            </button>
                            <button
                                type="button"
                                onClick={() => form.setValue("repaymentType", "emi")}
                                className={cn(
                                    "flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-all",
                                    repaymentType === "emi"
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background hover:bg-muted"
                                )}
                            >
                                EMI
                            </button>
                        </div>
                    </div>

                    {repaymentType === "emi" && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <Label>EMI Tenure</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[3, 6, 9, 12].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => handleTenureChange(m)}
                                        className={cn(
                                            "px-3 py-2 text-sm font-medium rounded-md border transition-all",
                                            tenureMonths === m
                                                ? "bg-primary/20 text-primary border-primary ring-1 ring-primary"
                                                : "bg-background hover:bg-muted"
                                        )}
                                    >
                                        {m} Months
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
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
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        type="date"
                        {...form.register("startDate")}
                    />
                </div>
                <div className="space-y-3">
                    <Label htmlFor="dueDate">Due Date {repaymentType === "one-time" && "(Optional)"}</Label>
                    <Input
                        id="dueDate"
                        type="date"
                        {...form.register("dueDate")}
                        readOnly={repaymentType === "emi"}
                        className={cn(repaymentType === "emi" && "bg-muted cursor-not-allowed")}
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Plus className="mr-2 h-4 w-4" />
                )}
                Add Record
            </Button>
        </form>
    );
}
