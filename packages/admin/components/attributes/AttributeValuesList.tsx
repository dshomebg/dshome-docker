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
    onValuesChange([...values, newValue]);
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

  return (
    <div className="space-y-4">
      {/* Values List */}
      <div className="space-y-2">
        {values.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No values added yet. Click "Add Value" to create one.
          </p>
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

      {/* Add New Value */}
      {isAdding ? (
        <AddValueForm
          groupId={groupId}
          displayType={displayType}
          onValueAdded={handleValueAdded}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-400 dark:hover:text-brand-400"
        >
          + Add Value
        </button>
      )}
    </div>
  );
}
