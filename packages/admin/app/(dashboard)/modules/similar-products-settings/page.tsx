"use client";

import { useState, useEffect } from "react";
import { similarProductsSettingsService, SimilarProductsSettings } from "@/lib/services/similar-products-settings.service";

export default function SimilarProductsSettingsPage() {
  const [settings, setSettings] = useState<SimilarProductsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await similarProductsSettingsService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await similarProductsSettingsService.updateSettings(settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all settings to defaults?")) return;

    try {
      setSaving(true);
      const response = await similarProductsSettingsService.resetSettings();
      setSettings(response.data);
      alert("Settings reset successfully!");
    } catch (error) {
      console.error("Error resetting settings:", error);
      alert("Failed to reset settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Зареждане...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Настройките не са намерени</div>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "Общи" },
    { id: "same_category", label: "Същата категория" },
    { id: "similar_features", label: "Подобни характеристики" },
    { id: "related", label: "Свързани продукти" },
    { id: "display", label: "Изглед" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Similar Products Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Конфигурирай как да се показват подобни продукти във frontend
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Общи настройки
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Активен модул
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enable/disable целия Similar Products модул
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.moduleEnabled}
                onChange={(e) => setSettings({ ...settings, moduleEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default лимит продукти
              </label>
              <input
                type="number"
                value={settings.defaultLimit}
                onChange={(e) => setSettings({ ...settings, defaultLimit: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                min="1"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cache duration (seconds)
              </label>
              <input
                type="number"
                value={settings.cacheDuration}
                onChange={(e) => setSettings({ ...settings, cacheDuration: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                min="0"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exclude out of stock products
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Не показвай продукти без наличност
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.excludeOutOfStock}
                onChange={(e) => setSettings({ ...settings, excludeOutOfStock: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          </div>
        )}

        {/* Same Category Tab */}
        {activeTab === "same_category" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Продукти от същата категория
            </h2>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Активен
              </label>
              <input
                type="checkbox"
                checked={settings.sameCategoryEnabled}
                onChange={(e) => setSettings({ ...settings, sameCategoryEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Заглавие
              </label>
              <input
                type="text"
                value={settings.sameCategoryTitle}
                onChange={(e) => setSettings({ ...settings, sameCategoryTitle: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Лимит продукти
              </label>
              <input
                type="number"
                value={settings.sameCategoryLimit}
                onChange={(e) => setSettings({ ...settings, sameCategoryLimit: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                min="1"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Сортиране
              </label>
              <select
                value={settings.sameCategorySort}
                onChange={(e) => setSettings({ ...settings, sameCategorySort: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="popularity">Популярност</option>
                <option value="price_asc">Цена (ниска-висока)</option>
                <option value="price_desc">Цена (висока-ниска)</option>
                <option value="newest">Най-нови</option>
                <option value="random">Случайни</option>
              </select>
            </div>
          </div>
        )}

        {/* Similar Features Tab */}
        {activeTab === "similar_features" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Продукти с подобни характеристики
            </h2>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Активен
              </label>
              <input
                type="checkbox"
                checked={settings.similarFeaturesEnabled}
                onChange={(e) => setSettings({ ...settings, similarFeaturesEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Заглавие
              </label>
              <input
                type="text"
                value={settings.similarFeaturesTitle}
                onChange={(e) => setSettings({ ...settings, similarFeaturesTitle: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Лимит продукти
              </label>
              <input
                type="number"
                value={settings.similarFeaturesLimit}
                onChange={(e) => setSettings({ ...settings, similarFeaturesLimit: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                min="1"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Минимална прилика (%)
              </label>
              <input
                type="number"
                value={settings.similarFeaturesMinSimilarity}
                onChange={(e) => setSettings({ ...settings, similarFeaturesMinSimilarity: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Продукти с по-ниска прилика няма да се показват
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Показвай резултат от прилика
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Показвай процента на съвпадение
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.similarFeaturesShowScore}
                onChange={(e) => setSettings({ ...settings, similarFeaturesShowScore: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fallback поведение
              </label>
              <select
                value={settings.similarFeaturesFallback}
                onChange={(e) => setSettings({ ...settings, similarFeaturesFallback: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="same_category">Покажи от същата категория</option>
                <option value="hide">Скрий секцията</option>
                <option value="show_all">Покажи всички налични</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Какво да се случи ако няма достатъчно подобни продукти
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Комбинирай с продукти от същата категория
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Допълни с продукти от същата категория ако няма достатъчно
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.similarFeaturesCombineWithSameCategory}
                onChange={(e) => setSettings({ ...settings, similarFeaturesCombineWithSameCategory: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Изглед на карта
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Показвай снимка
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.similarFeaturesShowImage}
                    onChange={(e) => setSettings({ ...settings, similarFeaturesShowImage: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Показвай цена
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.similarFeaturesShowPrice}
                    onChange={(e) => setSettings({ ...settings, similarFeaturesShowPrice: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Показвай бутон &quot;Добави в количка&quot;
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.similarFeaturesShowAddToCart}
                    onChange={(e) => setSettings({ ...settings, similarFeaturesShowAddToCart: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Products Tab */}
        {activeTab === "related" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Свързани продукти
            </h2>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Активен
              </label>
              <input
                type="checkbox"
                checked={settings.relatedEnabled}
                onChange={(e) => setSettings({ ...settings, relatedEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Заглавие
              </label>
              <input
                type="text"
                value={settings.relatedTitle}
                onChange={(e) => setSettings({ ...settings, relatedTitle: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Лимит продукти
              </label>
              <input
                type="number"
                value={settings.relatedLimit}
                onChange={(e) => setSettings({ ...settings, relatedLimit: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                min="1"
                max="50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Двупосочна връзка
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ако А е свързан с Б, автоматично и Б да е свързан с А
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.relatedBidirectional}
                onChange={(e) => setSettings({ ...settings, relatedBidirectional: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Приоритет
              </label>
              <select
                value={settings.relatedPriority}
                onChange={(e) => setSettings({ ...settings, relatedPriority: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="high">Висок - покажи първи</option>
                <option value="medium">Среден</option>
                <option value="low">Нисък - покажи последни</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ред на показване спрямо другите модули
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Изглед на карта
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Показвай снимка
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.relatedShowImage}
                    onChange={(e) => setSettings({ ...settings, relatedShowImage: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Показвай цена
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.relatedShowPrice}
                    onChange={(e) => setSettings({ ...settings, relatedShowPrice: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Показвай бутон &quot;Добави в количка&quot;
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.relatedShowAddToCart}
                    onChange={(e) => setSettings({ ...settings, relatedShowAddToCart: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Забележка:</strong> Свързаните продукти се добавят ръчно от страницата на всеки продукт. Модулът за ръчно свързване ще бъде добавен скоро.
              </p>
            </div>
          </div>
        )}

        {/* Display Tab */}
        {activeTab === "display" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Настройки за изглед
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Тип оформление
              </label>
              <select
                value={settings.layoutType}
                onChange={(e) => setSettings({ ...settings, layoutType: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="grid">Мрежа (Grid)</option>
                <option value="carousel">Карусел</option>
                <option value="list">Списък</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Колони в мрежа
              </label>
              <select
                value={settings.gridColumns}
                onChange={(e) => setSettings({ ...settings, gridColumns: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="2">2 колони</option>
                <option value="3">3 колони</option>
                <option value="4">4 колони</option>
                <option value="6">6 колони</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Стил на картите
              </label>
              <select
                value={settings.cardStyle}
                onChange={(e) => setSettings({ ...settings, cardStyle: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="compact">Компактен</option>
                <option value="standard">Стандартен</option>
                <option value="detailed">Детайлен</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Показвай разделители между секции
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Визуално разделение между различните модули
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.showSectionDividers}
                onChange={(e) => setSettings({ ...settings, showSectionDividers: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Анимация
              </label>
              <select
                value={settings.animation}
                onChange={(e) => setSettings({ ...settings, animation: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="fade">Fade (избледняване)</option>
                <option value="slide">Slide (плъзгане)</option>
                <option value="none">Без анимация</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Мобилен изглед
              </label>
              <select
                value={settings.mobileLayout}
                onChange={(e) => setSettings({ ...settings, mobileLayout: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="carousel">Карусел</option>
                <option value="stack">Вертикален списък</option>
                <option value="grid">Мрежа 2 колони</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Как да се показват продуктите на мобилни устройства
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleReset}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
        >
          {saving ? "Запазване..." : "Запази промените"}
        </button>
      </div>
    </div>
  );
}
