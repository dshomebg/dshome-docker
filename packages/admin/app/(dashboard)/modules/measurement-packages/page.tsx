"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { measurementRulesService, MeasurementRule } from "@/lib/services/measurement-rules.service";

export default function MeasurementPackagesPage() {
  const [rules, setRules] = useState<MeasurementRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<MeasurementRule | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    calculationType: "package_based" as "package_based" | "minimum_quantity" | "step_quantity",
    status: "active" as "active" | "inactive"
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await measurementRulesService.getMeasurementRules({ limit: 1000 });
      setRules(response.data);
    } catch (error) {
      console.error("Error fetching rules:", error);
      alert("Грешка при зареждане на правилата");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRule(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      calculationType: "package_based",
      status: "active"
    });
    setShowForm(true);
  };

  const handleEdit = (rule: MeasurementRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      slug: rule.slug,
      description: rule.description || "",
      calculationType: rule.calculationType,
      status: rule.status
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      alert("Име и slug са задължителни");
      return;
    }

    try {
      if (editingRule) {
        await measurementRulesService.updateMeasurementRule(editingRule.id, formData);
        alert("Правилото е актуализирано успешно");
      } else {
        await measurementRulesService.createMeasurementRule(formData);
        alert("Правилото е създадено успешно");
      }
      setShowForm(false);
      fetchRules();
    } catch (error: any) {
      console.error("Error saving rule:", error);
      alert(error.response?.data?.message || "Грешка при записване на правилото");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете правилото "${name}"?`)) {
      return;
    }

    try {
      await measurementRulesService.deleteMeasurementRule(id);
      alert("Правилото е изтрито успешно");
      fetchRules();
    } catch (error: any) {
      console.error("Error deleting rule:", error);
      alert(error.response?.data?.message || "Грешка при изтриване на правилото");
    }
  };

  const getCalculationTypeName = (type: string) => {
    switch (type) {
      case "package_based": return "Продажба на пакет";
      case "minimum_quantity": return "Минимално количество";
      case "step_quantity": return "Стъпка на увеличение";
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 dark:text-white">Зареждане...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
            Модул: Пакети/м²
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Управление на правилата за продажба по пакети и мерни единици
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Ново правило
        </button>
      </div>

      {/* Rules List */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Име
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Тип изчисление
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Описание
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Статус
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Няма създадени правила. Натиснете бутона &quot;Ново правило&quot; за да създадете.
                    </div>
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {rule.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {rule.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {getCalculationTypeName(rule.calculationType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {rule.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          rule.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {rule.status === "active" ? "Активно" : "Неактивно"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          title="Редактирай"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id, rule.name)}
                          className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          title="Изтрий"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingRule ? "Редактиране на правило" : "Ново правило"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Име <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  placeholder="Пакети м²"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  placeholder="paketi-m2"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  placeholder="Продукти, които се продават в пакети, но цената е на квадратен метър"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Тип изчисление <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.calculationType}
                  onChange={(e) => setFormData({ ...formData, calculationType: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  required
                >
                  <option value="package_based">Продажба на пакет</option>
                  <option value="minimum_quantity">Минимално количество</option>
                  <option value="step_quantity">Стъпка на увеличение</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="active">Активно</option>
                  <option value="inactive">Неактивно</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700"
                >
                  <Save className="h-4 w-4" />
                  {editingRule ? "Актуализирай" : "Създай"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
