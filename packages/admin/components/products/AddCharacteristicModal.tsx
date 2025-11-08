"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { featuresService } from "@/lib/services/features.service";

interface FeatureValue {
  id: string;
  name: string;
  featureGroupId: string;
}

interface FeatureGroup {
  id: string;
  name: string;
  values?: FeatureValue[];
}

interface AddCharacteristicModalProps {
  featureGroups: FeatureGroup[];
  selectedFeatures: Array<{ featureValueId: string }>;
  onAdd: (featureValueId: string) => void;
  onClose: () => void;
  onRefresh: () => void;
}

export default function AddCharacteristicModal({
  featureGroups,
  selectedFeatures,
  onAdd,
  onClose,
  onRefresh,
}: AddCharacteristicModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newValueName, setNewValueName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return featureGroups;
    return featureGroups.filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [featureGroups, searchTerm]);

  const selectedGroup = featureGroups.find((g) => g.id === selectedGroupId);

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setNewValueName("");
    setError(null);
  };

  const handleSelectValue = (valueId: string) => {
    onAdd(valueId);
    // Reset modal
    setSelectedGroupId("");
    setNewValueName("");
    setSearchTerm("");
  };

  const handleCreateNewValue = async () => {
    if (!newValueName.trim() || !selectedGroupId) return;

    try {
      setCreating(true);
      setError(null);

      // Create new feature value
      const response = await featuresService.createFeatureValue(
        selectedGroupId,
        {
          name: newValueName.trim(),
          position: selectedGroup?.values?.length || 0,
        }
      );

      // Add the newly created value
      onAdd(response.data.id);

      // Refresh feature groups to get the new value
      await onRefresh();

      // Reset modal
      setSelectedGroupId("");
      setNewValueName("");
      setSearchTerm("");
    } catch (err: any) {
      console.error("Error creating feature value:", err);
      setError(err.response?.data?.message || "Failed to create feature value");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-xl bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Добави характеристика
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg bg-error-50 p-3 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-2 gap-6 p-6">
          {/* Left: Group Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Избери група
            </label>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Търси група..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-600"
              />
            </div>

            {/* Groups List */}
            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleSelectGroup(group.id)}
                    className={`w-full border-b border-gray-200 px-4 py-3 text-left text-sm transition-colors last:border-b-0 dark:border-gray-700 ${
                      selectedGroupId === group.id
                        ? "bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                        : "text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
                    }`}
                  >
                    {group.name}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Няма намерени групи
                </div>
              )}
            </div>
          </div>

          {/* Right: Values Selection */}
          <div>
            {selectedGroup ? (
              <>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Стойности за: {selectedGroup.name}
                </label>

                {/* Existing Values */}
                {selectedGroup.values && selectedGroup.values.length > 0 ? (
                  <div className="mb-4 max-h-64 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700">
                    {selectedGroup.values.map((value) => {
                      const isSelected = selectedFeatures.some(
                        (f) => f.featureValueId === value.id
                      );

                      return (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() => !isSelected && handleSelectValue(value.id)}
                          disabled={isSelected}
                          className={`w-full border-b border-gray-200 px-4 py-3 text-left text-sm transition-colors last:border-b-0 dark:border-gray-700 ${
                            isSelected
                              ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                              : "text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
                          }`}
                        >
                          {value.name}
                          {isSelected && (
                            <span className="ml-2 text-xs text-gray-500">
                              (Вече добавена)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mb-4 rounded-lg border border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    Няма налични стойности
                  </div>
                )}

                {/* New Value Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Или добави нова стойност
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Въведи нова стойност..."
                      value={newValueName}
                      onChange={(e) => setNewValueName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !creating) {
                          handleCreateNewValue();
                        }
                      }}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={handleCreateNewValue}
                      disabled={!newValueName.trim() || creating}
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
                    >
                      {creating ? "Създаване..." : "Добави"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Новата стойност автоматично ще бъде добавена към характеристиките
                  </p>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Изберете група от лявата страна
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Затвори
          </button>
        </div>
      </div>
    </div>
  );
}
