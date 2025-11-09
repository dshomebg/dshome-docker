"use client";

import { useEffect, useState } from "react";
import { catalogSettingsService, type CatalogSettings, type DeliveryTimeTemplate } from "@/lib/services/catalog-settings.service";

export default function CatalogSettingsPage() {
  const [settings, setSettings] = useState<CatalogSettings | null>(null);
  const [templates, setTemplates] = useState<DeliveryTimeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Form state
  const [vatPercentage, setVatPercentage] = useState("");
  const [productsPerPage, setProductsPerPage] = useState(20);
  const [newProductPeriodDays, setNewProductPeriodDays] = useState(30);
  const [defaultSorting, setDefaultSorting] = useState<CatalogSettings['defaultSorting']>("created_desc");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, templatesRes] = await Promise.all([
        catalogSettingsService.getCatalogSettings(),
        catalogSettingsService.getDeliveryTimeTemplates(),
      ]);

      setSettings(settingsRes.data);
      setTemplates(templatesRes.data);

      // Set form values
      setVatPercentage(settingsRes.data.vatPercentage);
      setProductsPerPage(settingsRes.data.productsPerPage);
      setNewProductPeriodDays(settingsRes.data.newProductPeriodDays);
      setDefaultSorting(settingsRes.data.defaultSorting);
    } catch (error) {
      console.error("Failed to load settings:", error);
      alert("Грешка при зареждане на настройките");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await catalogSettingsService.updateCatalogSettings({
        vatPercentage,
        productsPerPage,
        newProductPeriodDays,
        defaultSorting,
      });
      alert("Настройките са запазени успешно!");
      loadData();
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Грешка при запазване на настройките");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplateName.trim()) return;

    try {
      await catalogSettingsService.createDeliveryTimeTemplate({
        name: newTemplateName,
      });
      setNewTemplateName("");
      loadData();
    } catch (error) {
      console.error("Failed to add template:", error);
      alert("Грешка при добавяне на шаблон");
    }
  };

  const handleUpdateTemplate = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      await catalogSettingsService.updateDeliveryTimeTemplate(id, {
        name: editingName,
      });
      setEditingTemplate(null);
      setEditingName("");
      loadData();
    } catch (error) {
      console.error("Failed to update template:", error);
      alert("Грешка при актуализиране на шаблон");
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${name}"?`)) {
      return;
    }

    try {
      await catalogSettingsService.deleteDeliveryTimeTemplate(id);
      loadData();
    } catch (error) {
      console.error("Failed to delete template:", error);
      alert("Грешка при изтриване на шаблон");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newOrder = [...templates];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    await saveOrder(newOrder);
  };

  const handleMoveDown = async (index: number) => {
    if (index === templates.length - 1) return;
    const newOrder = [...templates];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    await saveOrder(newOrder);
  };

  const saveOrder = async (newOrder: DeliveryTimeTemplate[]) => {
    try {
      const templateIds = newOrder.map(t => t.id);
      await catalogSettingsService.reorderDeliveryTimeTemplates(templateIds);
      loadData();
    } catch (error) {
      console.error("Failed to reorder templates:", error);
      alert("Грешка при пренареждане на шаблоните");
    }
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
      <div className="grid grid-cols-1 gap-9">
        {/* Catalog Settings Form */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Основни настройки
            </h3>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className="p-6.5">
              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  ДДС (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={vatPercentage}
                  onChange={(e) => setVatPercentage(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Продукти на страница
                </label>
                <input
                  type="number"
                  value={productsPerPage}
                  onChange={(e) => setProductsPerPage(parseInt(e.target.value))}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                  min="1"
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Период &quot;Нов продукт&quot; (дни)
                </label>
                <input
                  type="number"
                  value={newProductPeriodDays}
                  onChange={(e) => setNewProductPeriodDays(parseInt(e.target.value))}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                  min="1"
                />
              </div>

              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Подразбирано сортиране
                </label>
                <select
                  value={defaultSorting}
                  onChange={(e) => setDefaultSorting(e.target.value as any)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="name_asc">Име (А-Я)</option>
                  <option value="name_desc">Име (Я-А)</option>
                  <option value="price_asc">Цена (ниска-висока)</option>
                  <option value="price_desc">Цена (висока-ниска)</option>
                  <option value="created_desc">Най-нови първо</option>
                  <option value="created_asc">Най-стари първо</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
              >
                {saving ? "Запазване..." : "Запази настройките"}
              </button>
            </div>
          </form>
        </div>

        {/* Delivery Time Templates */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Срокове на доставка
            </h3>
          </div>

          <div className="p-6.5">
            {/* Add new template */}
            <div className="mb-6 flex gap-3">
              <input
                type="text"
                placeholder="Нов срок на доставка..."
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTemplate()}
                className="flex-1 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddTemplate}
                className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
              >
                Добави
              </button>
            </div>

            {/* Templates list */}
            <div className="space-y-3">
              {templates.map((template, index) => (
                <div
                  key={template.id}
                  className="flex items-center gap-3 rounded border border-stroke p-3 dark:border-strokedark"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="text-gray-500 hover:text-gray-700 disabled:opacity-30 dark:text-gray-400"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === templates.length - 1}
                      className="text-gray-500 hover:text-gray-700 disabled:opacity-30 dark:text-gray-400"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1">
                    {editingTemplate === template.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateTemplate(template.id);
                          } else if (e.key === "Escape") {
                            setEditingTemplate(null);
                            setEditingName("");
                          }
                        }}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        autoFocus
                      />
                    ) : (
                      <div className="px-3 py-2 text-black dark:text-white">
                        {template.name}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {editingTemplate === template.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateTemplate(template.id)}
                          className="text-sm text-success hover:underline"
                        >
                          Запази
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTemplate(null);
                            setEditingName("");
                          }}
                          className="text-sm text-meta-1 hover:underline"
                        >
                          Откажи
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTemplate(template.id);
                            setEditingName(template.name);
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Редактирай
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(template.id, template.name)}
                          className="text-sm text-meta-1 hover:underline"
                        >
                          Изтрий
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {templates.length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  Няма добавени срокове на доставка
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
