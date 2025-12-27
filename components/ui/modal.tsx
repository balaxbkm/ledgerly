"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [show, setShow] = React.useState(isOpen);
    const [animateIn, setAnimateIn] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setShow(true);
            setTimeout(() => setAnimateIn(true), 10);
        } else {
            setAnimateIn(false);
            setTimeout(() => setShow(false), 200); // Wait for exit anim
        }
    }, [isOpen]);

    if (!show) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[6px] transition-opacity duration-300",
            animateIn ? "opacity-100" : "opacity-0"
        )}>
            <div
                className={cn(
                    "bg-white w-full max-w-lg rounded-3xl shadow-2xl transform transition-all duration-300 flex flex-col max-h-[90vh] overflow-hidden border border-white/20 ring-1 ring-black/5 modal-content",
                    animateIn ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-8 opacity-0"
                )}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/50 backdrop-blur-md">
                    <h2 className="text-xl font-bold tracking-tight text-slate-800">{title}</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
