"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { emailTemplatesService, EmailTemplate } from "@/lib/services/email-templates.service";
import { Mail, Edit, Trash2, Plus } from "lucide-react";

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await emailTemplatesService.getEmailTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching email templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${name}"?`)) {
      return;
    }

    try {
      await emailTemplatesService.deleteEmailTemplate(id);
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting email template:", error);
      alert("Неуспешно изтриване на шаблон");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Зареждане...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
            Email шаблони
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Управлявайте шаблоните за имейли
          </p>
        </div>
        <Link
          href="/design/email-templates/new"
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          Добави шаблон
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Всичко шаблони</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {templates.length}
          </p>
        </div>
      </div>

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div>
            <Mail className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">Няма шаблони</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Добавете първия email шаблон
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:hover:border-blue-500"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <Link
                    href={`/design/email-templates/${template.id}`}
                    className="rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    title="Редактирай"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(template.id, template.name)}
                    className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    title="Изтрий"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Тема:</p>
                  <p className="text-sm text-gray-900 dark:text-white">{template.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Създаден: {new Date(template.createdAt).toLocaleDateString('bg-BG')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
