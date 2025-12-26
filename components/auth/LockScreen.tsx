"use client";

import { useAuth } from "@/context/AuthContext";
import { PinInput } from "./PinInput";
import { Lock } from "lucide-react";
import { useState } from "react";
// Removed unused framer-motion import

export function LockScreen() {
    const { isLocked, unlock } = useAuth();
    const [error, setError] = useState(false);

    // If not locked, don't render
    // We use "hidden" or null. return null is safer to prevent interaction.
    if (!isLocked) return null;

    const handleUnlock = async (pin: string) => {
        const success = await unlock(pin);
        if (!success) {
            setError(true);
            setTimeout(() => setError(false), 500); // Reset error state
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex flex-col items-center space-y-8 animate-in zoom-in-95 duration-300">
                <div className="rounded-full bg-primary/10 p-6">
                    <Lock className="h-12 w-12 text-primary" />
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-muted-foreground">Enter your PIN to unlock Ledgerly</p>
                </div>

                <PinInput
                    onComplete={handleUnlock}
                    error={error}
                />

                {error && (
                    <p className="text-sm font-medium text-destructive animate-pulse">
                        Incorrect PIN, please try again.
                    </p>
                )}
            </div>
        </div>
    );
}
