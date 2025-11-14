"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { productQaService, ProductQaSettings } from "@/lib/services/product-qa.service";
import { ArrowLeft, Save } from "lucide-react";

export default function ProductQaSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ProductQaSettings | null>(null);
  const [formData, setFormData] = useState({
    autoApproveQuestions: false,
    autoApproveCustomerAnswers: false,
    emailTemplateId: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await productQaService.getQaSettings();
      setSettings(response.data);
      setFormData({
        autoApproveQuestions: response.data.autoApproveQuestions,
        autoApproveCustomerAnswers: response.data.autoApproveCustomerAnswers,
        emailTemplateId: response.data.emailTemplateId || "",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await productQaService.updateQaSettings({
        autoApproveQuestions: formData.autoApproveQuestions,
        autoApproveCustomerAnswers: formData.autoApproveCustomerAnswers,
        emailTemplateId: formData.emailTemplateId || undefined,
      });
      alert("Настройките са запазени успешно!");
      fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Грешка при запазване на настройките");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Настройки на Въпроси и Отговори
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Конфигурирайте модерацията и нотификациите за въпроси и отговори.
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Модерация
          </h2>

          {/* Auto-approve Questions */}
          <div className="mb-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.autoApproveQuestions}
                onChange={(e) =>
                  setFormData({ ...formData, autoApproveQuestions: e.target.checked })
                }
                className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  Автоматично одобряване на въпроси
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Когато е включено, всички нови въпроси ще бъдат автоматично одобрени и публикувани без ръчна проверка.
                </span>
              </div>
            </label>
          </div>

          {/* Auto-approve Customer Answers */}
          <div className="mb-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.autoApproveCustomerAnswers}
                onChange={(e) =>
                  setFormData({ ...formData, autoApproveCustomerAnswers: e.target.checked })
                }
                className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  Автоматично одобряване на клиентски отговори
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Когато е включено, отговорите от клиенти ще бъдат автоматично одобрени. Отговорите от магазина винаги се одобряват автоматично.
                </span>
              </div>
            </label>
          </div>

          <div className="border-t border-gray-200 pt-6 dark:border-white/[0.05]">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Нотификации
            </h2>

            {/* Email Template */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Email темплейт за отговори
              </label>
              <select
                value={formData.emailTemplateId}
                onChange={(e) =>
                  setFormData({ ...formData, emailTemplateId: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              >
                <option value="">Избери темплейт (опционално)</option>
                {/* Email templates will be loaded dynamically */}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Този темплейт ще се използва за изпращане на email нотификация когато питащият получи отговор на въпроса си.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-white/[0.05]">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.08]"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Запазване...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Запази настройки
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
