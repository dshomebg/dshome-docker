"use client";

import { useState, useEffect } from "react";
import { categoriesService } from "@/lib/services/categories.service";
import { featuresService, FeatureGroup } from "@/lib/services/features.service";

interface Weight {
  id?: string;
  type: 'price' | 'feature_group';
  featureGroupId?: string;
  featureGroupName?: string;
  weight: number;
  position: number;
}

interface CategoryFeatureWeightsSectionProps {
  categoryId?: string;
  onSave?: () => void;
}

export default function CategoryFeatureWeightsSection({
  categoryId,
  onSave
}: CategoryFeatureWeightsSectionProps) {
  const [weights, setWeights] = useState<Weight[]>([
    { type: 'price', weight: 0, position: 0 }
  ]);
  const [allFeatureGroups, setAllFeatureGroups] = useState<FeatureGroup[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load feature groups
  useEffect(() => {
    fetchFeatureGroups();
  }, []);

  // Load existing weights when editing
  useEffect(() => {
    if (categoryId) {
      fetchCategoryWeights();
    }
  }, [categoryId]);

  const fetchFeatureGroups = async () => {
    try {
      setLoading(true);
      const response = await featuresService.getFeatureGroups({
        limit: 1000,
        status: 'active'
      });
      setAllFeatureGroups(response.data);
    } catch (error) {
      console.error("Error fetching feature groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryWeights = async () => {
    if (!categoryId) return;

    try {
      const response = await categoriesService.getCategoryFeatureWeights(categoryId);
      if (response.data.weights.length > 0) {
        setWeights(response.data.weights as Weight[]);
      }
    } catch (error) {
      console.error("Error fetching category weights:", error);
    }
  };

  const handleAddGroup = (group: FeatureGroup) => {
    // Check if already added
    if (weights.some(w => w.featureGroupId === group.id)) {
      alert("Тази група вече е добавена");
      return;
    }

    setWeights([
      ...weights,
      {
        type: 'feature_group',
        featureGroupId: group.id,
        featureGroupName: group.name,
        weight: 0,
        position: weights.length
      }
    ]);
    setShowAddModal(false);
    setSearchQuery("");
  };

  const handleRemoveGroup = (index: number) => {
    if (weights[index].type === 'price') {
      alert("Цената не може да се премахне");
      return;
    }
    setWeights(weights.filter((_, i) => i !== index));
  };

  const handleWeightChange = (index: number, newWeight: string) => {
    const value = parseInt(newWeight) || 0;
    const clampedValue = Math.max(0, Math.min(100, value));

    const updated = [...weights];
    updated[index].weight = clampedValue;
    setWeights(updated);
  };

  const handleSave = async () => {
    if (!categoryId) {
      alert("Запазете категорията първо преди да добавяте групи");
      return;
    }

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    if (totalWeight > 100) {
      alert(`Общата тежест не може да бъде над 100% (текуща: ${totalWeight}%)`);
      return;
    }

    try {
      setSaving(true);
      await categoriesService.updateCategoryFeatureWeights(
        categoryId,
        weights.map(w => ({
          type: w.type,
          featureGroupId: w.featureGroupId,
          weight: w.weight
        }))
      );
      alert("Групите са запазени успешно");
      if (onSave) onSave();
    } catch (error: any) {
      console.error("Error saving weights:", error);
      alert(error.response?.data?.error || "Грешка при запазване на групите");
    } finally {
      setSaving(false);
    }
  };

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const isValid = totalWeight <= 100;
  const remaining = 100 - totalWeight;

  const filteredGroups = allFeatureGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !weights.some(w => w.featureGroupId === group.id)
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        Групи характеристики
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Конфигурирайте кои характеристики са важни за тази категория. Тежестите се използват за алгоритъма на подобни продукти.
      </p>

      {/* Active Groups */}
      <div className="space-y-3 mb-4">
        {weights.map((w, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
          >
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {w.type === 'price' ? '💰 Цена (Price)' : `🔧 ${w.featureGroupName}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Тежест:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={w.weight}
                onChange={(e) => handleWeightChange(index, e.target.value)}
                className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
            </div>
            {w.type !== 'price' && (
              <button
                type="button"
                onClick={() => handleRemoveGroup(index)}
                className="text-error-500 hover:text-error-600 text-xl font-bold px-2"
                title="Премахни"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Group Button */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="mb-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-800/30 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
      >
        + Добави група
      </button>

      {/* Calculator */}
      <div
        className={`rounded-lg p-4 ${
          totalWeight === 100
            ? 'bg-success-50 border border-success-200 dark:bg-success-900/20 dark:border-success-800'
            : totalWeight > 100
            ? 'bg-error-50 border border-error-200 dark:bg-error-900/20 dark:border-error-800'
            : 'bg-warning-50 border border-warning-200 dark:bg-warning-900/20 dark:border-warning-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Обща тежест:
          </span>
          <span className={`text-lg font-bold ${
            totalWeight === 100
              ? 'text-success-600 dark:text-success-400'
              : totalWeight > 100
              ? 'text-error-600 dark:text-error-400'
              : 'text-warning-600 dark:text-warning-400'
          }`}>
            {totalWeight}% / 100%
          </span>
        </div>

        {totalWeight === 100 && (
          <div className="text-sm text-success-700 dark:text-success-300">
            ✓ Перфектно! Тежестите са балансирани.
          </div>
        )}
        {totalWeight < 100 && (
          <div className="text-sm text-warning-700 dark:text-warning-300">
            🟡 Имате още {remaining}% за разпределяне
          </div>
        )}
        {totalWeight > 100 && (
          <div className="text-sm text-error-700 dark:text-error-300">
            ⚠️ Не може да бъде повече от 100%! Намалете с {totalWeight - 100}%
          </div>
        )}

        {weights.some(w => w.weight === 0) && (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            ℹ️ Групи с тежест 0% няма да влияят на подобни продукти, но ще бъдат налични за продуктите
          </div>
        )}
      </div>

      {/* Save Button */}
      {categoryId && (
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || saving}
          className="mt-4 w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
        >
          {saving ? "Запазване..." : "Запази групите"}
        </button>
      )}

      {/* Add Group Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Избери група характеристики
            </h3>

            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Търси..."
              className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
            />

            {/* Groups List */}
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-gray-500">Зареждане...</div>
              ) : filteredGroups.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  {searchQuery ? 'Няма намерени групи' : 'Всички групи са добавени'}
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleAddGroup(group)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-brand-50 hover:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-brand-900/20"
                  >
                    {group.name}
                  </button>
                ))
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery("");
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Отказ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
