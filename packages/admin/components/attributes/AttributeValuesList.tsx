"use client";

import { useState } from "react";
import { attributesService, AttributeValue } from "@/lib/services/attributes.service";
import AttributeValueItem from "./AttributeValueItem";
import AddValueForm from "./AddValueForm";

interface AttributeValuesListProps {
  groupId: string;
  displayType: 'dropdown' | 'radio' | 'color';
  values: AttributeValue[];
  onValuesChange: (values: AttributeValue[]) => void;
}

export default function AttributeValuesList({
  groupId,
  displayType,
  values,
  onValuesChange
}: AttributeValuesListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleValueAdded = (newValue: AttributeValue) => {
    // Prepend new value to the beginning of the list
    onValuesChange([newValue, ...values]);
    setIsAdding(false);
  };

  const handleValueUpdated = (updatedValue: AttributeValue) => {
    const updatedValues = values.map((v) =>
      v.id === updatedValue.id ? updatedValue : v
    );
    onValuesChange(updatedValues);
  };

  const handleDelete = async (valueId: string) => {
    try {
      setLoading(true);
      await attributesService.deleteAttributeValue(valueId);
      onValuesChange(values.filter((v) => v.id !== valueId));
    } catch (error) {
      console.error("Error deleting attribute value:", error);
      alert("Failed to delete attribute value");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newValues = [...values];
    [newValues[index - 1], newValues[index]] = [newValues[index], newValues[index - 1]];

    try {
      setLoading(true);
      const valueIds = newValues.map(v => v.id);
      await attributesService.reorderAttributeValues(groupId, valueIds);
      onValuesChange(newValues);
    } catch (error) {
      console.error("Error reordering values:", error);
      alert("Failed to reorder values");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === values.length - 1) return;

    const newValues = [...values];
    [newValues[index], newValues[index + 1]] = [newValues[index + 1], newValues[index]];

    try {
      setLoading(true);
      const valueIds = newValues.map(v => v.id);
      await attributesService.reorderAttributeValues(groupId, valueIds);
      onValuesChange(newValues);
    } catch (error) {
      console.error("Error reordering values:", error);
      alert("Failed to reorder values");
    } finally {
      setLoading(false);
    }
  };

  const handleSortAZ = async () => {
    const sorted = [...values].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", 'bg')
    );

    try {
      setLoading(true);
      const valueIds = sorted.map(v => v.id);
      await attributesService.reorderAttributeValues(groupId, valueIds);
      onValuesChange(sorted);
    } catch (error) {
      console.error("Error sorting values:", error);
      alert("Failed to sort values");
    } finally {
      setLoading(false);
    }
  };

  const handleSortZA = async () => {
    const sorted = [...values].sort((a, b) =>
      (b.name || "").localeCompare(a.name || "", 'bg')
    );

    try {
      setLoading(true);
      const valueIds = sorted.map(v => v.id);
      await attributesService.reorderAttributeValues(groupId, valueIds);
      onValuesChange(sorted);
    } catch (error) {
      console.error("Error sorting values:", error);
      alert("Failed to sort values");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with sort and add buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {values.length > 1 && (
            <>
              <button
                type="button"
                onClick={handleSortAZ}
                disabled={loading}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                title="Сортирай А-Я"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                А-Я
              </button>
              <button
                type="button"
                onClick={handleSortZA}
                disabled={loading}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                title="Сортирай Я-А"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                Я-А
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <span>+</span>
          Добави
        </button>
      </div>

      {/* Add New Value Form (at top) */}
      {isAdding && (
        <AddValueForm
          groupId={groupId}
          displayType={displayType}
          onValueAdded={handleValueAdded}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {/* Values List */}
      <div className="space-y-2">
        {values.length === 0 && !isAdding ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Няма добавени стойности. Кликнете "Добави" за да добавите първата стойност.
            </p>
          </div>
        ) : (
          values.map((value, index) => (
            <AttributeValueItem
              key={value.id}
              value={value}
              index={index}
              totalCount={values.length}
              displayType={displayType}
              onUpdate={handleValueUpdated}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              loading={loading}
            />
          ))
        )}
      </div>
    </div>
  );
}
