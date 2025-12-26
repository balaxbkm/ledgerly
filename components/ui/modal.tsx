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

    React.useEffect(() => {
        if (isOpen) setShow(true);
        else setTimeout(() => setShow(false), 200); // Wait for anim
    }, [isOpen]);

    if (!show && !isOpen) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-200",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            <div
                className={cn(
                    "bg-card text-card-foreground w-full max-w-lg rounded-xl border shadow-lg transform transition-all duration-200 flex flex-col max-h-[90vh]",
                    isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                )}
            >
                <div className="flex items-center justify-between p-6 border-b shrink-0">
                    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
