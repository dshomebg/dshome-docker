"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { attributesService, AttributeGroup, AttributeValue } from "@/lib/services/attributes.service";

interface ProductCombination {
  id?: string;
  sku: string;
  name: string;
  priceImpact: string;
  weightImpact: string;
  quantity: string;
  isDefault: boolean;
  attributeValueIds: string[];
}

interface ProductCombinationsGeneratorProps {
  baseSku: string;
  combinations: ProductCombination[];
  onChange: (combinations: ProductCombination[]) => void;
}

export default function ProductCombinationsGenerator({
  baseSku,
  combinations,
  onChange,
}: ProductCombinationsGeneratorProps) {
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState<Record<string, string[]>>({});
  const [showGenerator, setShowGenerator] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState("");

  useEffect(() => {
    fetchAttributeGroups();
  }, []);

  const fetchAttributeGroups = async () => {
    try {
      setLoading(true);
      const response = await attributesService.getAttributeGroups({
        limit: 100,
        status: 'active',
        include: 'values',
      });
      setAttributeGroups(response.data);
    } catch (error) {
      console.error("Error fetching attribute groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupValueToggle = (groupId: string, valueId: string) => {
    setSelectedGroups(prev => {
      const currentValues = prev[groupId] || [];
      const newValues = currentValues.includes(valueId)
        ? currentValues.filter(id => id !== valueId)
        : [...currentValues, valueId];

      if (newValues.length === 0) {
        const { [groupId]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [groupId]: newValues };
    });
  };

  const generateCombinations = () => {
    const selectedGroupIds = Object.keys(selectedGroups);
    if (selectedGroupIds.length === 0) {
      alert("Моля изберете поне една група и стойност");
      return;
    }

    // Get arrays of selected values for each group
    const valueArrays = selectedGroupIds.map(groupId =>
      selectedGroups[groupId].map(valueId => ({
        groupId,
        valueId,
        group: attributeGroups.find(g => g.id === groupId)!,
        value: attributeGroups
          .find(g => g.id === groupId)!
          .values!.find(v => v.id === valueId)!,
      }))
    );

    // Generate cartesian product
    const cartesianProduct = (arrays: any[][]): any[][] => {
      if (arrays.length === 0) return [[]];
      const [first, ...rest] = arrays;
      const restProduct = cartesianProduct(rest);
      return first.flatMap(item => restProduct.map(rest => [item, ...rest]));
    };

    const combinations = cartesianProduct(valueArrays);

    const newCombinations: ProductCombination[] = combinations.map((combo, index) => {
      const attributeValueIds = combo.map((item: any) => item.valueId);
      const name = combo.map((item: any) => item.value.name).join(" - ");
      const sku = `${baseSku}-${index + 1}`;

      return {
        sku,
        name,
        priceImpact: "0",
        weightImpact: "0",
        quantity: "0",
        isDefault: index === 0,
        attributeValueIds,
      };
    });

    onChange(newCombinations);
    setShowGenerator(false);
  };

  const handleCombinationChange = (index: number, field: keyof ProductCombination, value: any) => {
    const updated = [...combinations];
    updated[index] = { ...updated[index], [field]: value };

    // If setting a new default, unset others
    if (field === "isDefault" && value === true) {
      updated.forEach((c, i) => {
        if (i !== index) c.isDefault = false;
      });
    }

    onChange(updated);
  };

  const handleRemoveCombination = (index: number) => {
    const updated = combinations.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleBulkQuantitySet = () => {
    if (!bulkQuantity || isNaN(Number(bulkQuantity))) {
      alert("Моля въведете валидно количество");
      return;
    }

    const updated = combinations.map(combo => ({
      ...combo,
      quantity: bulkQuantity
    }));
    onChange(updated);
    setBulkQuantity("");
  };

  const getAttributeValueName = (valueId: string): string => {
    for (const group of attributeGroups) {
      const value = group.values?.find(v => v.id === valueId);
      if (value) return value.name;
    }
    return "";
  };

  return (
    <div className="space-y-6">
      {/* Generator Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Комбинации ({combinations.length})
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Генерирайте комбинации на базата на атрибути
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowGenerator(!showGenerator)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700"
        >
          <RefreshCw className="h-4 w-4" />
          {showGenerator ? "Скрий генератора" : "Генерирай комбинации"}
        </button>
      </div>

      {/* Generator Panel */}
      {showGenerator && (
        <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
            Избери атрибути за генериране
          </h4>

          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Зареждане...</p>
          ) : attributeGroups.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Няма налични атрибутни групи. Създайте атрибути първо.
            </p>
          ) : (
            <div className="space-y-4">
              {attributeGroups.map(group => (
                <div key={group.id} className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <h5 className="mb-3 font-medium text-gray-900 dark:text-white">
                    {group.name}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {group.values?.map(value => {
                      const isSelected = selectedGroups[group.id]?.includes(value.id);
                      return (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() => handleGroupValueToggle(group.id, value.id)}
                          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                            isSelected
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          {value.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={generateCombinations}
                className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700"
              >
                Генерирай комбинации
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bulk Quantity Actions */}
      {combinations.length > 0 && (
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Задай количество за всички:
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={bulkQuantity}
              onChange={(e) => setBulkQuantity(e.target.value)}
              placeholder="Количество"
              className="w-32 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleBulkQuantitySet}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700"
            >
              Приложи
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({combinations.length} комбинации)
            </span>
          </div>
        </div>
      )}

      {/* Combinations Table */}
      {combinations.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Атрибути
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Доп. цена
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Доп. тегло (kg)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Количество
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  По подразбиране
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {combinations.map((combination, index) => (
                <tr key={index} className={combination.isDefault ? "bg-brand-50 dark:bg-brand-500/10" : ""}>
                  <td className="whitespace-nowrap px-4 py-3">
                    <input
                      type="text"
                      value={combination.sku}
                      onChange={(e) => handleCombinationChange(index, "sku", e.target.value)}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {combination.attributeValueIds.map(valueId => (
                        <span
                          key={valueId}
                          className="inline-flex rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {getAttributeValueName(valueId)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      value={combination.priceImpact}
                      onChange={(e) => handleCombinationChange(index, "priceImpact", e.target.value)}
                      className="w-24 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <input
                      type="number"
                      step="0.001"
                      value={combination.weightImpact}
                      onChange={(e) => handleCombinationChange(index, "weightImpact", e.target.value)}
                      className="w-24 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <input
                      type="number"
                      step="1"
                      value={combination.quantity}
                      onChange={(e) => handleCombinationChange(index, "quantity", e.target.value)}
                      className="w-24 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={combination.isDefault}
                      onChange={(e) => handleCombinationChange(index, "isDefault", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveCombination(index)}
                      className="rounded p-1 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
                      title="Изтрий"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Няма генерирани комбинации. Използвайте генератора по-горе.
          </p>
        </div>
      )}
    </div>
  );
}
