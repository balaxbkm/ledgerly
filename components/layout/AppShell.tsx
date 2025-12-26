"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Header } from "./Header";
import { cn } from "@/utils/cn";

interface AppShellProps {
    children: ReactNode;
    showNav?: boolean;
}

export function AppShell({ children, showNav }: AppShellProps) {
    const pathname = usePathname();
    const isAuthPage = pathname === "/setup" || pathname === "/login";

    // If showNav is explicitly passed, respect it. Otherwise, defaults to !isAuthPage
    const shouldShowNav = showNav ?? !isAuthPage;

    if (!shouldShowNav) {
        return <main className="min-h-screen bg-background">{children}</main>;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Header */}
            <Header />

            {/* Main Content */}
            <main className={cn(
                "flex-1 px-4 py-6 md:p-8",
                "mt-16 mb-20 md:mt-0 md:mb-0 md:ml-64", // Spacing for fixed navs
                "transition-all duration-200"
            )}>
                <div className="mx-auto max-w-5xl">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNav />
        </div>
    );
}
