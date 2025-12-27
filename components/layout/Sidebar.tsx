"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, ArrowRightLeft, PieChart, Settings, LogOut, Tags } from "lucide-react";
import { cn } from "@/utils/cn";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/expenses", label: "Expenses", icon: Wallet },
    { href: "/loans", label: "Loans & Debts", icon: ArrowRightLeft },
    { href: "/reports", label: "Reports", icon: PieChart },
    { href: "/categories", label: "Categories", icon: Tags },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-50/50 backdrop-blur-xl fixed left-0 top-0 z-50">
            <div className="flex h-20 items-center px-6 border-b border-slate-100 bg-white/50">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                        L
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
                        Ledgerly
                    </span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-white text-emerald-700 shadow-md ring-1 ring-emerald-100"
                                    : "text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />
                            )}
                            <Icon className={cn(
                                "h-5 w-5 transition-colors",
                                isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 bg-white/30 space-y-2">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm transition-all"
                >
                    <Settings className="h-5 w-5 text-slate-400" />
                    Settings
                </Link>
                <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:shadow-sm transition-all">
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
