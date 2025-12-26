"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/input";

interface PinInputProps {
    length?: number;
    onComplete: (pin: string) => void;
    disabled?: boolean;
    error?: boolean;
}

export function PinInput({ length = 4, onComplete, disabled, error }: PinInputProps) {
    const [values, setValues] = useState<string[]>(new Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newValues = [...values];
        newValues[index] = value.slice(-1); // Only last char
        setValues(newValues);

        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newValues.every((v) => v !== "")) {
            onComplete(newValues.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !values[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").slice(0, length);
        if (!/^\d+$/.test(paste)) return;

        const newValues = paste.split("");
        while (newValues.length < length) newValues.push("");
        setValues(newValues);

        if (newValues.every((v) => v !== "")) {
            onComplete(newValues.join(""));
        }
        inputRefs.current[Math.min(paste.length, length - 1)]?.focus();
    };

    // Auto-focus first input on mount
    useEffect(() => {
        if (!disabled && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [disabled]);

    return (
        <div className="flex gap-4 justify-center">
            {values.map((val, index) => (
                <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="number" // Use number for mobile keyboard, but css to hide spinner
                    inputMode="numeric"
                    value={val}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className={cn(
                        "w-12 h-14 text-center text-2xl font-bold bg-muted/50 focus:bg-background transition-all",
                        error && "border-destructive ring-destructive",
                        "pb-2" // Adjust for font baseline
                    )}
                    maxLength={1}
                />
            ))}
        </div>
    );
}
