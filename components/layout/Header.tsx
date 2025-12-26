import { Bell } from "lucide-react";

export function Header() {
    return (
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-b z-40 flex items-center justify-between px-4">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ledgerly
            </span>
            <button className="p-2 -mr-2 text-muted-foreground hover:text-primary">
                <Bell className="h-5 w-5" />
            </button>
        </header>
    );
}
