"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Trash, Database, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/context/FinanceContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { refreshData, seedData, clearData } = useFinance();
    const { logout } = useAuth();

    const handleReset = async () => {
        if (confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
            await clearData();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
                <p className="text-slate-500">Manage your preferences and data.</p>
            </div>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Monitor className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">Appearance</CardTitle>
                            <CardDescription className="text-slate-500">Customize how Ledgerly looks on your device.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-8">
                    <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
                        {["light", "dark", "system"].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setTheme(mode)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-3 h-32 group relative overflow-hidden",
                                    theme === mode
                                        ? "border-indigo-500 bg-indigo-50/50 text-indigo-700"
                                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-500"
                                )}
                            >
                                {theme === mode && (
                                    <div className="absolute top-2 right-2 h-2 w-2 bg-indigo-500 rounded-full shadow-sm animate-pulse" />
                                )}

                                <div className={cn(
                                    "p-3 rounded-full transition-colors",
                                    theme === mode ? "bg-white shadow-sm" : "bg-slate-100 group-hover:bg-white"
                                )}>
                                    {mode === "light" && <Sun className="h-6 w-6" />}
                                    {mode === "dark" && <Moon className="h-6 w-6" />}
                                    {mode === "system" && <Monitor className="h-6 w-6" />}
                                </div>
                                <span className="capitalize text-sm font-bold">{mode}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                            <Database className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">Data Management</CardTitle>
                            <CardDescription className="text-slate-500">Control your local data safely.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                    <div className="flex items-center justify-between p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="space-y-1">
                            <p className="font-bold text-slate-700">Clear All Data</p>
                            <p className="text-sm text-slate-500">Remove all expenses, loans, and settings permanently.</p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            className="bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-200 shadow-sm transition-all"
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Reset Data
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="space-y-1">
                            <p className="font-bold text-slate-700">Populate Sample Data</p>
                            <p className="text-sm text-slate-500">Add example expenses and loans for testing purposes.</p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (confirm("Load sample data? This will add example expenses and loans to your existing lists.")) {
                                    seedData(true);
                                }
                            }}
                            className="bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 shadow-sm transition-all cursor-pointer"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Load Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center pt-8 opacity-50">
                <p className="text-xs text-slate-400 font-medium">Ledgerly v1.0.0 • Connected to Firebase</p>
            </div>
        </div>
    );
}
