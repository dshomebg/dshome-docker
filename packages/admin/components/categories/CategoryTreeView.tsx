"use client";

import { useState } from "react";
import Link from "next/link";
import { Category } from "@/lib/services/categories.service";

interface CategoryTreeViewProps {
  categories: Category[];
  loading: boolean;
  onDelete: (id: string, name: string) => void;
}

interface TreeNodeProps {
  category: Category;
  level: number;
  onDelete: (id: string, name: string) => void;
}

function TreeNode({ category, level, onDelete }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.02]">
        <td className="px-6 py-4">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${level * 1.5}rem` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 dark:text-gray-400"
              >
                {isExpanded ? "▼" : "▶"}
              </button>
            ) : (
              <span className="w-4" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {category.name}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              category.status === "active"
                ? "bg-success-100 text-success-800 dark:bg-success-500/10 dark:text-success-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400"
            }`}
          >
            {category.status}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {category.slug}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(category.createdAt).toLocaleDateString()}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/catalog/categories/${category.id}`}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(category.id, category.name)}
              className="text-sm font-medium text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {isExpanded &&
        hasChildren &&
        category.children!.map((child) => (
          <TreeNode
            key={child.id}
            category={child}
            level={level + 1}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}

export default function CategoryTreeView({
  categories,
  loading,
  onDelete,
}: CategoryTreeViewProps) {
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <svg
          className="mb-4 h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">No categories found</p>
      </div>
    );
  }

  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-white/[0.05] dark:bg-white/[0.02]">
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Name
          </th>
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Status
          </th>
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Slug
          </th>
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Created
          </th>
          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <TreeNode
            key={category.id}
            category={category}
            level={0}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
}
