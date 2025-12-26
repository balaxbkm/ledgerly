"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, ArrowRightLeft, PieChart, Tags } from "lucide-react";
import { cn } from "@/utils/cn";

const navItems = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/expenses", label: "Expenses", icon: Wallet },
    { href: "/loans", label: "Loans", icon: ArrowRightLeft },
    { href: "/reports", label: "Reports", icon: PieChart },
    { href: "/categories", label: "Cats", icon: Tags },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "fill-current/20")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
