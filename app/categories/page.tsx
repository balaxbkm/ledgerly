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
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-3 text-slate-400 hover:text-slate-600">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Categories</h1>
                    </div>
                    <p className="text-slate-500 ml-9">Organize your expenses with custom categories.</p>
                </div>
                <Button onClick={handleAdd} className="w-full sm:w-auto shadow-lg shadow-[#0f1729]/20 bg-[#0f1729] hover:bg-[#0f1729]/90 text-white border-none rounded-xl">
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
