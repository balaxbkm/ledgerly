"use client";

import { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { CategoryList } from "@/components/categories/CategoryList";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Category } from "@/types";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CategoriesPage() {
    const router = useRouter();
    const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

    const handleAdd = () => {
        setEditingCategory(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            await deleteCategory(id);
        }
    };

    const handleSubmit = async (data: Omit<Category, "id">) => {
        if (editingCategory) {
            await updateCategory({ ...editingCategory, ...data });
        } else {
            await addCategory(data);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="container max-w-4xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Categories</h1>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Category
                </Button>
            </div>

            <CategoryList
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal
                title={editingCategory ? "Edit Category" : "Add Category"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <CategoryForm
                    initialData={editingCategory}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
