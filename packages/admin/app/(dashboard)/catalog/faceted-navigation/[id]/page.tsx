"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  facetedNavigationService,
  type FilterTemplateWithItems,
  type FilterTemplateItem,
  type FilterType
} from "@/lib/services/faceted-navigation.service";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<FilterTemplateWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FilterTemplateItem | null>(null);

  // Form state
  const [formFilterType, setFormFilterType] = useState<FilterType>("price");
  const [formLabel, setFormLabel] = useState("");
  const [formConfig, setFormConfig] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const response = await facetedNavigationService.getFilterTemplate(templateId);
      setTemplate(response.data);
    } catch (error) {
      console.error("Failed to load template:", error);
      alert("Грешка при зареждане на шаблона");
      router.push("/catalog/faceted-navigation");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormFilterType("price");
    setFormLabel("");
    setFormConfig("");
    setFormIsActive(true);
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item: FilterTemplateItem) => {
    setFormFilterType(item.filterType);
    setFormLabel(item.label);
    setFormConfig(item.config ? JSON.stringify(item.config, null, 2) : "");
    setFormIsActive(item.isActive);
    setEditingItem(item);
    setShowItemModal(true);
  };

  const handleCloseModal = () => {
    setShowItemModal(false);
    setEditingItem(null);
    setFormFilterType("price");
    setFormLabel("");
    setFormConfig("");
    setFormIsActive(true);
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formLabel.trim()) {
      alert("Моля въведете етикет");
      return;
    }

    // Parse config JSON
    let configObj = null;
    if (formConfig.trim()) {
      try {
        configObj = JSON.parse(formConfig);
      } catch (error) {
        alert("Невалиден JSON формат за конфигурация");
        return;
      }
    }

    try {
      if (editingItem) {
        await facetedNavigationService.updateFilterTemplateItem(editingItem.id, {
          filterType: formFilterType,
          label: formLabel,
          config: configObj,
          isActive: formIsActive,
        });
      } else {
        await facetedNavigationService.createFilterTemplateItem(templateId, {
          filterType: formFilterType,
          label: formLabel,
          config: configObj,
          isActive: formIsActive,
        });
      }

      handleCloseModal();
      loadTemplate();
    } catch (error) {
      console.error("Failed to save item:", error);
      alert("Грешка при запазване на филтъра");
    }
  };

  const handleDeleteItem = async (item: FilterTemplateItem) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${item.label}"?`)) {
      return;
    }

    try {
      await facetedNavigationService.deleteFilterTemplateItem(item.id);
      loadTemplate();
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Грешка при изтриване на филтъра");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!template || index === 0) return;

    const items = [...template.items];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    await saveOrder(items);
  };

  const handleMoveDown = async (index: number) => {
    if (!template || index === template.items.length - 1) return;

    const items = [...template.items];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    await saveOrder(items);
  };

  const saveOrder = async (items: FilterTemplateItem[]) => {
    try {
      const itemIds = items.map(item => item.id);
      await facetedNavigationService.reorderFilterTemplateItems(templateId, itemIds);
      loadTemplate();
    } catch (error) {
      console.error("Failed to reorder items:", error);
      alert("Грешка при пренареждане на филтрите");
    }
  };

  const getFilterTypeLabel = (type: FilterType) => {
    const labels: Record<FilterType, string> = {
      price: "Цена",
      brand: "Марка",
      feature_group: "Група характеристики",
      attribute_group: "Група атрибути",
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Зареждане...</div>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <>
      <Breadcrumb
        pageName={`Конфигуриране: ${template.name}`}
        links={[
          { name: "Филтри", href: "/catalog/faceted-navigation" },
        ]}
      />

      <div className="grid grid-cols-1 gap-9">
        {/* Template Info */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Информация за шаблона
            </h3>
          </div>
          <div className="p-6.5">
            <div className="mb-3">
              <span className="font-medium text-black dark:text-white">Име: </span>
              <span className="text-black dark:text-white">{template.name}</span>
            </div>
            <div className="mb-3">
              <span className="font-medium text-black dark:text-white">Тип: </span>
              <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                template.type === 'category'
                  ? 'bg-success text-success'
                  : 'bg-warning text-warning'
              }`}>
                {template.type === 'category' ? 'Категория' : 'Търсене'}
              </span>
            </div>
            {template.description && (
              <div className="mb-3">
                <span className="font-medium text-black dark:text-white">Описание: </span>
                <span className="text-black dark:text-white">{template.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Items */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex justify-between items-center">
            <h3 className="font-medium text-black dark:text-white">
              Филтри в шаблона
            </h3>
            <button
              onClick={handleOpenAddModal}
              className="rounded bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90"
            >
              Добави филтър
            </button>
          </div>

          <div className="p-6.5">
            {template.items.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                Няма добавени филтри към този шаблон
              </div>
            ) : (
              <div className="space-y-3">
                {template.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded border border-stroke p-3 dark:border-strokedark"
                  >
                    {/* Reorder buttons */}
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
                        disabled={index === template.items.length - 1}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-30 dark:text-gray-400"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Item info */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Етикет</div>
                        <div className="font-medium text-black dark:text-white">{item.label}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Тип филтър</div>
                        <div className="text-black dark:text-white">{getFilterTypeLabel(item.filterType)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Статус</div>
                        <div>
                          {item.isActive ? (
                            <span className="inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">
                              Активен
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-danger">
                              Неактивен
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="text-sm text-primary hover:underline"
                      >
                        Редактирай
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item)}
                        className="text-sm text-meta-1 hover:underline"
                      >
                        Изтрий
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
          <div className="w-full max-w-2xl rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark my-8">
            <h3 className="mb-4 text-xl font-medium text-black dark:text-white">
              {editingItem ? "Редактирай филтър" : "Добави нов филтър"}
            </h3>

            <form onSubmit={handleSubmitItem}>
              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Тип филтър
                </label>
                <select
                  value={formFilterType}
                  onChange={(e) => setFormFilterType(e.target.value as FilterType)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="price">Цена</option>
                  <option value="brand">Марка</option>
                  <option value="feature_group">Група характеристики</option>
                  <option value="attribute_group">Група атрибути</option>
                </select>
              </div>

              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Етикет (видимо име)
                </label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="Напр: Цена, Марка, Производител..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Конфигурация (JSON) - по избор
                </label>
                <textarea
                  value={formConfig}
                  onChange={(e) => setFormConfig(e.target.value)}
                  placeholder='{"priceDisplayType": "slider", "min": 0, "max": 10000}'
                  rows={6}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-mono text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Примери за конфигурация:
                  <br />• Цена: {"{"}"priceDisplayType": "slider"{"}"}
                  <br />• Характеристики: {"{"}"featureGroupIds": ["uuid1", "uuid2"]{"}"}
                  <br />• Атрибути: {"{"}"attributeGroupIds": ["uuid1"]{"}"}
                </p>
              </div>

              <div className="mb-6">
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only"
                  />
                  <div className="relative">
                    <div className={`block h-8 w-14 rounded-full ${formIsActive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${formIsActive ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-black dark:text-white">
                    Активен филтър
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
                >
                  {editingItem ? "Запази промените" : "Добави филтър"}
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
