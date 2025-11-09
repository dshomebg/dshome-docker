"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { categoriesService, Category } from "@/lib/services/categories.service";
import CategoryTreeView from "@/components/categories/CategoryTreeView";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Filter categories by search term
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = filterCategoriesByName(categories, searchTerm.toLowerCase());
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  const filterCategoriesByName = (cats: Category[], search: string): Category[] => {
    const result: Category[] = [];

    for (const cat of cats) {
      const matches = cat.name.toLowerCase().includes(search);
      const childMatches = cat.children ? filterCategoriesByName(cat.children, search) : [];

      if (matches || childMatches.length > 0) {
        result.push({
          ...cat,
          children: childMatches.length > 0 ? childMatches : cat.children,
        });
      }
    }

    return result;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesService.getCategoryTree();
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${name}"?`)) {
      return;
    }

    try {
      await categoriesService.deleteCategory(id);
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      alert(error.response?.data?.message || "Неуспешно изтриване на категорията");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
            Категории
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Управление на категориите в йерархична структура
          </p>
        </div>
        <Link
          href="/catalog/categories/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-center font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Нова категория
        </Link>
      </div>

      {/* Search Box */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Търсене по име на категория..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Tree View Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <CategoryTreeView
            categories={filteredCategories}
            loading={loading}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
