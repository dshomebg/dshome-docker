"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { facetedNavigationService, type FilterTemplate, type TemplateType } from "@/lib/services/faceted-navigation.service";

export default function FacetedNavigationPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FilterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FilterTemplate | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<TemplateType>("category");
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await facetedNavigationService.getFilterTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error("Failed to load templates:", error);
      alert("Грешка при зареждане на шаблоните");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormName("");
    setFormType("category");
    setFormDescription("");
    setEditingTemplate(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (template: FilterTemplate) => {
    setFormName(template.name);
    setFormType(template.type);
    setFormDescription(template.description || "");
    setEditingTemplate(template);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTemplate(null);
    setFormName("");
    setFormType("category");
    setFormDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      alert("Моля въведете име на шаблона");
      return;
    }

    try {
      if (editingTemplate) {
        await facetedNavigationService.updateFilterTemplate(editingTemplate.id, {
          name: formName,
          type: formType,
          description: formDescription || null,
        });
      } else {
        await facetedNavigationService.createFilterTemplate({
          name: formName,
          type: formType,
          description: formDescription || null,
        });
      }

      handleCloseModal();
      loadTemplates();
    } catch (error) {
      console.error("Failed to save template:", error);
      alert("Грешка при запазване на шаблона");
    }
  };

  const handleDelete = async (template: FilterTemplate) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${template.name}"?`)) {
      return;
    }

    try {
      await facetedNavigationService.deleteFilterTemplate(template.id);
      loadTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      alert("Грешка при изтриване на шаблона");
    }
  };

  const handleConfigureTemplate = (templateId: string) => {
    router.push(`/catalog/faceted-navigation/${templateId}`);
  };

  const getTypeLabel = (type: TemplateType) => {
    return type === "category" ? "Категория" : "Търсене";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Зареждане...</div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex justify-between items-center">
          <h3 className="font-medium text-black dark:text-white">
            Шаблони за филтри
          </h3>
          <button
            onClick={handleOpenAddModal}
            className="rounded bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90"
          >
            Добави шаблон
          </button>
        </div>

        <div className="p-6.5">
          {templates.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              Няма създадени шаблони за филтри
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Име
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Тип
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Описание
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id} className="border-b border-[#eee] dark:border-strokedark">
                      <td className="px-4 py-5 text-black dark:text-white">
                        {template.name}
                      </td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                          template.type === 'category'
                            ? 'bg-success text-success'
                            : 'bg-warning text-warning'
                        }`}>
                          {getTypeLabel(template.type)}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-black dark:text-white">
                        {template.description || "-"}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleConfigureTemplate(template.id)}
                            className="text-sm text-primary hover:underline"
                          >
                            Конфигурирай
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(template)}
                            className="text-sm text-primary hover:underline"
                          >
                            Редактирай
                          </button>
                          <button
                            onClick={() => handleDelete(template)}
                            className="text-sm text-meta-1 hover:underline"
                          >
                            Изтрий
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-4 text-xl font-medium text-black dark:text-white">
              {editingTemplate ? "Редактирай шаблон" : "Добави нов шаблон"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Име на шаблона
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Напр: Филтри за категории"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Тип
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as TemplateType)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="category">Категория</option>
                  <option value="search">Търсене</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Описание (по избор)
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Кратко описание на шаблона..."
                  rows={3}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
                >
                  {editingTemplate ? "Запази промените" : "Създай шаблон"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded border border-stroke p-3 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  Откажи
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
