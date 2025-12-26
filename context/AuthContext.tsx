"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
    isAuthenticated: boolean; // True if PIN is set and user has unlocked at least once (session valid)
    isLocked: boolean; // True if app is locked (requires PIN)
    hasPin: boolean; // True if PIN is set in storage
    isLoading: boolean;
    setPin: (pin: string) => Promise<void>;
    unlock: (pin: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_PIN = "ledgerly_pin_hash";
const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
    const [hasPin, setHasPin] = useState(false);
    const [isLocked, setIsLocked] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Session valid?
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();

    // Initial Check
    useEffect(() => {
        const storedPin = localStorage.getItem(STORAGE_KEY_PIN);
        if (storedPin) {
            setHasPin(true);
            setIsLocked(true); // Always lock on reload
        } else {
            setHasPin(false);
            setIsLocked(false);
        }
        setIsLoading(false);
    }, []);

    // Redirect Logic
    useEffect(() => {
        if (isLoading) return;

        if (!hasPin && pathname !== "/setup") {
            router.replace("/setup");
        } else if (hasPin && pathname === "/setup") {
            router.replace("/");
        }
    }, [hasPin, pathname, isLoading, router]);

    // Inactivity Timer
    useEffect(() => {
        if (!isAuthenticated || isLocked) return;

        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsLocked(true);
            }, INACTIVITY_LIMIT_MS);
        };

        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keydown", resetTimer);
        window.addEventListener("click", resetTimer);
        window.addEventListener("touchstart", resetTimer);

        resetTimer(); // Start timer

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keydown", resetTimer);
            window.removeEventListener("click", resetTimer);
            window.removeEventListener("touchstart", resetTimer);
        };
    }, [isAuthenticated, isLocked]);

    /* Utilities */
    const hashPin = async (pin: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    const setPin = async (pin: string) => {
        const hash = await hashPin(pin);
        localStorage.setItem(STORAGE_KEY_PIN, hash);
        setHasPin(true);
        setIsLocked(false);
        setIsAuthenticated(true);
        router.replace("/");
    };

    const unlock = async (pin: string) => {
        const storedHash = localStorage.getItem(STORAGE_KEY_PIN);
        const inputHash = await hashPin(pin);

        if (storedHash === inputHash) {
            setIsLocked(false);
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        // Optional: Clear PIN? Or just lock?
        // User requested: "4-digit PIN-based lock"
        // Usually logout just locks. Resetting is hard delete.
        setIsLocked(true);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLocked,
                hasPin,
                isLoading,
                setPin,
                unlock,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
