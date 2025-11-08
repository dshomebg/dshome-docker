"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { featuresService, FeatureGroup } from "@/lib/services/features.service";

interface FeatureFormProps {
  featureGroup?: FeatureGroup;
  mode: "create" | "edit";
}

interface FeatureValue {
  id?: string; // Existing value ID (from backend)
  value: string;
  tempId?: string; // Temp ID for new values
  position?: number; // Position for ordering
  _deleted?: boolean; // Mark for deletion
}

export default function FeatureForm({ featureGroup, mode }: FeatureFormProps) {
  const router = useRouter();
  const [name, setName] = useState(featureGroup?.name || "");
  const [values, setValues] = useState<FeatureValue[]>(
    featureGroup?.values?.map(v => ({ id: v.id, value: v.name, position: v.position })) || []
  );
  const [loading, setLoading] = useState(false);

  const handleAddValue = () => {
    setValues([{ value: "", tempId: Date.now().toString() }, ...values]);
  };

  const handleRemoveValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index].value = value;
    setValues(newValues);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newValues = [...values];
    [newValues[index - 1], newValues[index]] = [newValues[index], newValues[index - 1]];
    setValues(newValues);
  };

  const handleMoveDown = (index: number) => {
    if (index === values.length - 1) return;
    const newValues = [...values];
    [newValues[index], newValues[index + 1]] = [newValues[index + 1], newValues[index]];
    setValues(newValues);
  };

  const handleSortAZ = () => {
    const sorted = [...values].sort((a, b) =>
      (a.value || "").localeCompare(b.value || "", 'bg')
    );
    setValues(sorted);
  };

  const handleSortZA = () => {
    const sorted = [...values].sort((a, b) =>
      (b.value || "").localeCompare(a.value || "", 'bg')
    );
    setValues(sorted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Името на групата е задължително");
      return;
    }

    // Filter out empty values
    const validValues = values
      .filter(v => v.value && v.value.trim() !== "")
      .map(v => ({ value: v.value.trim() }));

    // Check for duplicates
    const uniqueValues = new Set(validValues.map(v => v.value.toLowerCase()));
    if (uniqueValues.size !== validValues.length) {
      alert("Има дублирани стойности. Моля, премахнете дубликатите.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "create") {
        const response = await featuresService.createFeatureGroup({
          name,
          status: "active",
        });

        // Add all values to the group with positions
        if (validValues.length > 0) {
          for (let i = 0; i < validValues.length; i++) {
            await featuresService.createFeatureValue(response.data.id, {
              name: validValues[i].value,
              position: i
            });
          }
        }

        router.push("/catalog/features");
        router.refresh();
      } else if (mode === "edit" && featureGroup) {
        // Update group name
        await featuresService.updateFeatureGroup(featureGroup.id, {
          name,
          status: featureGroup.status,
        });

        // Create a map of current value IDs for quick lookup
        const currentValueIds = new Set(values.filter(v => v.id).map(v => v.id));

        // Delete removed values (values that existed but are not in current list)
        for (const existingValue of featureGroup.values || []) {
          if (!currentValueIds.has(existingValue.id)) {
            await featuresService.deleteFeatureValue(existingValue.id);
          }
        }

        // Track if we need to reorder
        let needsReorder = false;

        // Process each current value
        for (let i = 0; i < values.length; i++) {
          const val = values[i];
          // Skip empty values
          if (!val.value || !val.value.trim()) continue;

          if (val.id) {
            // Existing value - check if it changed
            const original = featureGroup.values?.find(v => v.id === val.id);
            if (original) {
              if (original.name !== val.value.trim()) {
                // Update existing value name
                await featuresService.updateFeatureValue(val.id, {
                  name: val.value.trim(),
                  position: i
                });
              }
              if (original.position !== i) {
                needsReorder = true;
              }
            }
          } else {
            // New value - create it
            await featuresService.createFeatureValue(featureGroup.id, {
              name: val.value.trim(),
              position: i
            });
            needsReorder = true;
          }
        }

        // Reorder all values if positions changed
        if (needsReorder) {
          const valueIds = values.filter(v => v.id && v.value && v.value.trim()).map(v => v.id!);
          if (valueIds.length > 0) {
            await featuresService.reorderFeatureValues(featureGroup.id, valueIds);
          }
        }

        router.push("/catalog/features");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error saving feature group:", error);
      const errorMessage = error.response?.data?.message || error.message || "Грешка при запазване";
      alert(`Грешка: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          {mode === "create" ? "Нова група характеристики" : "Редакция на група"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Попълнете името на групата и добавете нейните възможни стойности.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Име на групата <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='напр. "Мощност"'
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                required
              />
            </div>

            {/* Стойности */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Стойности
                </label>
                <div className="flex items-center gap-2">
                  {values.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handleSortAZ}
                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
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
                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                        title="Сортирай Я-А"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                        </svg>
                        Я-А
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleAddValue}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    <span>+</span>
                    Добави
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {values.map((val, index) => (
                  <div key={val.id || val.tempId || index} className="flex items-center gap-2">
                    {/* Move Up/Down Buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:text-brand-400"
                        title="Премести нагоре"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === values.length - 1}
                        className="text-gray-400 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:text-brand-400"
                        title="Премести надолу"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Position Number */}
                    <div className="flex h-10 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {index + 1}
                    </div>

                    {/* Value Input */}
                    <input
                      type="text"
                      value={val.value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      placeholder='напр. "100 W"'
                      className="flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(index)}
                      className="text-gray-400 hover:text-error-600 dark:hover:text-error-400"
                      title="Изтрий"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                {values.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Няма добавени стойности. Кликнете &quot;Добави&quot; за да добавите първата стойност.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/catalog/features")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Отказ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            {loading ? "Запазва се..." : "Запази"}
          </button>
        </div>
      </form>
    </div>
  );
}
