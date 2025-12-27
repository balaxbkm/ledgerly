"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRESET_COLORS, PRESET_ICONS, CATEGORY_ICONS } from "@/utils/constants";
import { cn } from "@/utils/cn";
import { Check, Search, X, ChevronRight } from "lucide-react";

interface CategoryFormProps {
    initialData?: Category;
    onSubmit: (data: Omit<Category, "id">) => Promise<void>;
    onCancel: () => void;
}

export function CategoryForm({ initialData, onSubmit, onCancel }: CategoryFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [color, setColor] = useState(initialData?.color || PRESET_COLORS[0]);
    const [icon, setIcon] = useState(initialData?.icon || PRESET_ICONS[0].name);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Icon Picker State
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [iconSearch, setIconSearch] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({
                name,
                color,
                icon,
                isDefault: initialData?.isDefault || false,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredIcons = PRESET_ICONS.filter((i) =>
        i.name.toLowerCase().includes(iconSearch.toLowerCase())
    ).sort((a, b) => {
        if (a.name === icon) return -1;
        if (b.name === icon) return 1;
        return 0;
    });

    const SelectedIcon = CATEGORY_ICONS[icon] || CATEGORY_ICONS.Misc;

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Groceries"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1 rounded-md">
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={cn(
                                    "h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center shrink-0",
                                    c,
                                    color === c ? "border-foreground ring-2 ring-primary ring-offset-2" : "border-transparent"
                                )}
                            >
                                {color === c && <Check className="h-4 w-4" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Icon</Label>
                    <div className="flex items-center gap-4 p-3 border border-dashed border-slate-200 rounded-md bg-card">
                        <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center border",
                            color
                        )}>
                            <SelectedIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{icon}</p>
                            <p className="text-xs text-muted-foreground">Click change to select another icon</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsIconPickerOpen(true)}>
                            Change <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="w-full h-11 bg-[#0f1729] hover:bg-[#0f1729]/90 text-white font-bold shadow-lg shadow-[#0f1729]/20 rounded-xl"
                    >
                        {isSubmitting ? "Saving..." : initialData ? "Update Category" : "Add Category"}
                    </Button>
                </div>
            </form>

            {/* Icon Picker Overlay */}
            {mounted && isIconPickerOpen && createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
                    <div className="bg-card w-full max-w-3xl rounded-xl border shadow-lg flex flex-col max-h-[80vh] animate-in zoom-in-95 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">Select Icon</h3>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsIconPickerOpen(false)}
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search icons..."
                                    value={iconSearch}
                                    onChange={(e) => setIconSearch(e.target.value)}
                                    className="pl-9"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {filteredIcons.slice(0, 100).map(({ name: iconName, icon: Icon }) => (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => {
                                            setIcon(iconName);
                                            setIsIconPickerOpen(false);
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 rounded-xl border p-3 hover:bg-slate-50 hover:border-slate-300 transition-all aspect-square group",
                                            icon === iconName
                                                ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800 hover:border-slate-800 shadow-md transform scale-105"
                                                : "bg-white border-slate-200 text-slate-600"
                                        )}
                                        title={iconName}
                                    >
                                        <Icon className={cn("h-7 w-7 transition-transform group-hover:scale-110", icon === iconName ? "text-white" : "text-slate-700")} />
                                        <span className={cn("text-[10px] font-medium truncate w-full text-center leading-tight", icon === iconName ? "text-slate-200" : "text-slate-500")}>
                                            {iconName}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {filteredIcons.length > 100 && (
                                <div className="text-center pt-6 text-xs font-medium text-slate-400">
                                    Showing first 100 of {filteredIcons.length} matches. Type specifically to find more.
                                </div>
                            )}
                            {filteredIcons.length === 0 && (
                                <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
                                    <Search className="h-8 w-8 opacity-50" />
                                    <p>No icons found matching "{iconSearch}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
