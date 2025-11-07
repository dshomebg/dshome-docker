"use client";

import { useState } from "react";
import { featuresService } from "@/lib/services/features.service";

interface AddValueFormProps {
  groupId: string;
  onValueAdded: (newValue: any) => void;
  onCancel: () => void;
}

export default function AddValueForm({
  groupId,
  onValueAdded,
  onCancel
}: AddValueFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Value name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await featuresService.createFeatureValue(groupId, { name });
      onValueAdded(response.data);

      // Reset form
      setName("");
    } catch (error) {
      console.error("Error creating feature value:", error);
      alert("Failed to create feature value");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName("");
    onCancel();
  };

  return (
    <div className="rounded-lg border border-brand-300 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-500/10">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
        Add New Value
      </h3>
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          placeholder="Value name (e.g., 12 месеца, 24 месеца)"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="rounded bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Add Value
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
