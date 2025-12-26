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
        <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card text-card-foreground fixed left-0 top-0">
            <div className="flex h-16 items-center px-6 border-b">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Ledgerly
                </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent",
                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t space-y-2">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                >
                    <Settings className="h-5 w-5" />
                    Settings
                </Link>
                <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
