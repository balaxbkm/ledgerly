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
            <div className="text-center py-10 text-muted-foreground">
                No categories found. Create one!
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
                const Icon = CATEGORY_ICONS[category.icon] || CATEGORY_ICONS.Misc;
                return (
                    <Card key={category.id} className="overflow-hidden">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center",
                                    category.color
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="font-medium truncate max-w-[120px]" title={category.name}>
                                    {category.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(category)}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                {!category.isDefault && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(category.id)}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
