import { Bell } from "lucide-react";

export function Header() {
    return (
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200 z-40 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                    L
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Ledgerly
                </span>
            </div>
            <button className="p-2 -mr-2 text-slate-500 hover:text-emerald-600 transition-colors">
                <Bell className="h-5 w-5" />
            </button>
        </header>
    );
}
