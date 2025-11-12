"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  orderStatusesService,
  OrderStatus,
} from "@/lib/services/order-statuses.service";
import { emailTemplatesService, EmailTemplate } from "@/lib/services/email-templates.service";
import { Save, X } from "lucide-react";

interface OrderStatusFormProps {
  mode: "create" | "edit";
  status?: OrderStatus;
}

export default function OrderStatusForm({ mode, status }: OrderStatusFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [formData, setFormData] = useState({
    name: status?.name || "",
    color: status?.color || "#3B82F6",
    visibleToCustomer: status?.visibleToCustomer ?? true,
    sendEmail: status?.sendEmail ?? false,
    emailTemplateId: status?.emailTemplateId || "",
  });

  useEffect(() => {
    fetchEmailTemplates();
  }, []);

  const fetchEmailTemplates = async () => {
    try {
      const response = await emailTemplatesService.getEmailTemplates();
      setEmailTemplates(response.data);
    } catch (error) {
      console.error("Error fetching email templates:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // Clear email template if sendEmail is disabled
        ...(name === "sendEmail" && !checked ? { emailTemplateId: "" } : {})
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.color.trim()) {
      alert("Името и цветът са задължителни");
      return;
    }

    if (formData.sendEmail && !formData.emailTemplateId) {
      alert("Изберете email шаблон, когато изпращането на имейл е активирано");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        color: formData.color,
        visibleToCustomer: formData.visibleToCustomer,
        sendEmail: formData.sendEmail,
        emailTemplateId: formData.sendEmail ? formData.emailTemplateId : null,
      };

      if (mode === "create") {
        await orderStatusesService.createOrderStatus(submitData);
      } else if (status) {
        await orderStatusesService.updateOrderStatus(status.id, submitData);
      }
      router.push("/sales/order-statuses");
    } catch (error: any) {
      console.error("Error saving order status:", error);
      alert(error.response?.data?.message || "Неуспешно запазване");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Основна информация
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Име на статуса <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Например: В обработка"
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Цвят <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              {/* Visual color display */}
              <div
                className="h-10 w-20 rounded border-2 border-gray-300 dark:border-gray-700"
                style={{ backgroundColor: formData.color }}
                title={formData.color}
              />
              {/* Color picker input */}
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="h-10 w-24 cursor-pointer rounded border border-gray-300 dark:border-gray-700"
              />
              {/* HEX value display */}
              <input
                type="text"
                value={formData.color}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    setFormData((prev) => ({ ...prev, color: value }));
                  }
                }}
                placeholder="#3B82F6"
                className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
              />
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Изберете цвят, който да представлява статуса
            </p>
          </div>
        </div>
      </div>

      {/* Visibility & Email Settings */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Настройки
        </h2>
        <div className="space-y-3">
          {/* Visible to Customer Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Видим за клиента
              </label>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Клиентите ще виждат този статус в техния профил
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  visibleToCustomer: !prev.visibleToCustomer,
                }))
              }
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                formData.visibleToCustomer
                  ? "bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  formData.visibleToCustomer ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Send Email Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Изпрати имейл
              </label>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Автоматично изпращай имейл при задаване на този статус
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  sendEmail: !prev.sendEmail,
                  emailTemplateId: !prev.sendEmail ? prev.emailTemplateId : "",
                }))
              }
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                formData.sendEmail
                  ? "bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  formData.sendEmail ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Email Template Dropdown - Conditional */}
          {formData.sendEmail && (
            <div className="mt-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-500/10">
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Email шаблон <span className="text-red-500">*</span>
              </label>
              <select
                name="emailTemplateId"
                value={formData.emailTemplateId}
                onChange={handleChange}
                required={formData.sendEmail}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
              >
                <option value="">Изберете шаблон</option>
                {emailTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Изберете кой email шаблон да се изпраща при този статус
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.08]"
        >
          <X className="h-3.5 w-3.5" />
          Отказ
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 rounded bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {loading ? "Запазване..." : "Запази"}
        </button>
      </div>
    </form>
  );
}
