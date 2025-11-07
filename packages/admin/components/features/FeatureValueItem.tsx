"use client";

import { useState } from "react";
import { featuresService, FeatureValue } from "@/lib/services/features.service";

interface FeatureValueItemProps {
  value: FeatureValue;
  index: number;
  totalCount: number;
  onUpdate: (updatedValue: FeatureValue) => void;
  onDelete: (valueId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  loading: boolean;
}

export default function FeatureValueItem({
  value,
  index,
  totalCount,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  loading
}: FeatureValueItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(value.name);

  const handleUpdate = async () => {
    try {
      const response = await featuresService.updateFeatureValue(value.id, {
        name: editName,
      });
      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating feature value:", error);
      alert("Failed to update feature value");
    }
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this value?")) {
      return;
    }
    onDelete(value.id);
  };

  const startEdit = () => {
    setIsEditing(true);
    setEditName(value.name);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/[0.05] dark:bg-white/[0.02]">
      {/* Order buttons */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          disabled={index === 0 || loading}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={index === totalCount - 1 || loading}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ▼
        </button>
      </div>

      {isEditing ? (
        /* Edit mode */
        <div className="flex flex-1 items-center gap-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder="Value name"
          />

          <button
            type="button"
            onClick={handleUpdate}
            disabled={loading}
            className="rounded bg-brand-500 px-3 py-2 text-sm text-white hover:bg-brand-600"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded bg-gray-500 px-3 py-2 text-sm text-white hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        /* Display mode */
        <>
          <div className="flex flex-1 items-center gap-3">
            <span className="font-medium text-gray-900 dark:text-white">
              {value.name}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={startEdit}
              className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="text-sm text-error-600 hover:text-error-700 dark:text-error-400"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
