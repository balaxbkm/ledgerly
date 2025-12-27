"use client";

import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_ICONS } from "@/utils/constants";
import { cn } from "@/utils/cn";
import { Edit2, Trash2 } from "lucide-react";

interface CategoryListProps {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
}

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return (
            <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="font-medium">No categories found</p>
                <p className="text-sm">Create your first category to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
                const Icon = CATEGORY_ICONS[category.icon] || CATEGORY_ICONS.Misc;
                return (
                    <Card key={category.id} className="overflow-hidden rounded-2xl border-slate-200 bg-white transition-all duration-200 hover:shadow-lg hover:border-slate-300 group">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                                    category.color
                                )}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <span className="font-bold text-slate-700 truncate max-w-[150px] text-base" title={category.name}>
                                    {category.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(category)}
                                    className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                {!category.isDefault && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(category.id)}
                                        className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
