"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/context/FinanceContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { refreshData, seedData } = useFinance();
    const { logout } = useAuth();

    const handleReset = () => {
        if (confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how Ledgerly looks on your device.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {["light", "dark", "system"].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setTheme(mode)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all w-24 h-24 gap-2",
                                    theme === mode
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-muted hover:border-primary/50"
                                )}
                            >
                                {mode === "light" && <Sun className="h-6 w-6" />}
                                {mode === "dark" && <Moon className="h-6 w-6" />}
                                {mode === "system" && <Monitor className="h-6 w-6" />}
                                <span className="capitalize text-xs font-medium">{mode}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Control your local data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border rounded-lg p-4">
                        <div>
                            <p className="font-medium">Clear All Data</p>
                            <p className="text-sm text-muted-foreground">Remove all expenses, loans, and settings.</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 hover:border-destructive/50"
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                    {/* Divider */}
                    <div className="flex items-center justify-between border rounded-lg p-4">
                        <div>
                            <p className="font-medium">Populate Sample Data</p>
                            <p className="text-sm text-muted-foreground">Add example expenses and loans for testing.</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (confirm("Load sample data? This will add example expenses and loans to your existing lists.")) {
                                    seedData(true);
                                }
                            }}
                            className="cursor-pointer"
                        >
                            Load Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center pt-8">
                <p className="text-xs text-muted-foreground">Ledgerly v1.0.0 • Local Storage Mode</p>
            </div>
        </div>
    );
}
