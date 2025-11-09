"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { categoriesService, Category } from "@/lib/services/categories.service";
import CategoryForm from "@/components/categories/CategoryForm";

export default function EditCategoryPage() {
  const params = useParams();
  const id = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await categoriesService.getCategory(id);
      setCategory(response.data);
    } catch (error) {
      console.error("Error fetching category:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Зареждане...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">
          Категорията не е намерена
        </div>
      </div>
    );
  }

  return <CategoryForm category={category} mode="edit" />;
}
