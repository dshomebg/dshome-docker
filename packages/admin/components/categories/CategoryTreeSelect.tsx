"use client";

import { useState } from "react";
import { Category } from "@/lib/services/categories.service";

interface CategoryTreeSelectProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  excludeId?: string;
}

interface TreeNodeProps {
  category: Category;
  level: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  excludeId?: string;
}

function TreeNode({ category, level, selectedId, onSelect, excludeId }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isExcluded = excludeId === category.id;

  if (isExcluded) {
    return null;
  }

  return (
    <>
      <div
        className="flex items-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
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
        <button
          type="button"
          onClick={() => onSelect(category.id)}
          className={`flex-1 text-left text-sm ${
            selectedId === category.id
              ? "font-semibold text-brand-600 dark:text-brand-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {category.name}
        </button>
      </div>
      {isExpanded &&
        hasChildren &&
        category.children!.map((child) => (
          <TreeNode
            key={child.id}
            category={child}
            level={level + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            excludeId={excludeId}
          />
        ))}
    </>
  );
}

export default function CategoryTreeSelect({
  categories,
  selectedId,
  onSelect,
  excludeId,
}: CategoryTreeSelectProps) {
  return (
    <div className="rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="max-h-64 overflow-y-auto p-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`w-full py-2 text-left text-sm ${
            selectedId === null
              ? "font-semibold text-brand-600 dark:text-brand-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          No Parent (Root Category)
        </button>
        {categories.map((category) => (
          <TreeNode
            key={category.id}
            category={category}
            level={0}
            selectedId={selectedId}
            onSelect={onSelect}
            excludeId={excludeId}
          />
        ))}
      </div>
    </div>
  );
}
