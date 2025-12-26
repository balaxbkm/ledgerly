"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PinInput } from "@/components/auth/PinInput";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupPage() {
    const { setPin } = useAuth();
    const [step, setStep] = useState<"create" | "confirm">("create");
    const [firstPin, setFirstPin] = useState("");
    const [error, setError] = useState(false);

    const handleCreate = (pin: string) => {
        setFirstPin(pin);
        setStep("confirm");
    };

    const handleConfirm = async (pin: string) => {
        if (pin === firstPin) {
            await setPin(pin);
        } else {
            setError(true);
            setFirstPin("");
            setStep("create"); // Reset to start
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md border-none shadow-xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit">
                        <ShieldCheck className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">
                        {step === "create" ? "Create your PIN" : "Confirm your PIN"}
                    </CardTitle>
                    <CardDescription>
                        {step === "create"
                            ? "Secure your financial data with a 4-digit PIN."
                            : "Re-enter your PIN to confirm."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    <PinInput
                        key={step} // Force remount to clear input
                        onComplete={step === "create" ? handleCreate : handleConfirm}
                        error={error}
                    />

                    {error && (
                        <p className="text-sm font-medium text-destructive">
                            PINs did not match. Please try again.
                        </p>
                    )}

                    <div className="text-center text-xs text-muted-foreground w-3/4">
                        Is stored securely on your device. Only you can access it.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
