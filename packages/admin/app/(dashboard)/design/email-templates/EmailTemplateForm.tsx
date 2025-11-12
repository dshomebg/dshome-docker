"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  emailTemplatesService,
  EmailTemplate,
  EmailVariable,
} from "@/lib/services/email-templates.service";
import { Save, X } from "lucide-react";
import TiptapEditorWithVariables from "@/components/editor/TiptapEditorWithVariables";

interface EmailTemplateFormProps {
  mode: "create" | "edit";
  template?: EmailTemplate;
}

export default function EmailTemplateForm({ mode, template }: EmailTemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<EmailVariable[]>([]);
  const [formData, setFormData] = useState({
    name: template?.name || "",
    subject: template?.subject || "",
    content: template?.content || "",
  });

  useEffect(() => {
    fetchVariables();
  }, []);

  const fetchVariables = async () => {
    try {
      const response = await emailTemplatesService.getAvailableVariables();
      setVariables(response.data);
    } catch (error) {
      console.error("Error fetching variables:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.subject.trim() || !formData.content.trim()) {
      alert("Всички полета са задължителни");
      return;
    }

    setLoading(true);

    try {
      if (mode === "create") {
        await emailTemplatesService.createEmailTemplate(formData);
      } else if (template) {
        await emailTemplatesService.updateEmailTemplate(template.id, formData);
      }
      router.push("/design/email-templates");
    } catch (error: any) {
      console.error("Error saving email template:", error);
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
              Име на шаблона <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Например: order_confirmation"
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
            />
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Уникално име за идентификация на шаблона
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Тема на имейла <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Поръчка #{order_reference} - Потвърждение"
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
            />
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Можете да използвате променливи в темата
            </p>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Съдържание на имейла
        </h2>
        <TiptapEditorWithVariables
          content={formData.content}
          onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
          placeholder="Напишете съдържанието на имейла..."
          variables={variables}
        />
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
