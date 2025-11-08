"use client";

import { SeoFormData } from "@dshome/shared/types/seo";

interface SeoFormProps {
  data: SeoFormData;
  onChange: (data: SeoFormData) => void;
  entityName?: string; // За автоматично попълване на OG title/description
}

export default function SeoForm({ data, onChange, entityName }: SeoFormProps) {
  const handleChange = (field: keyof SeoFormData, value: string | boolean) => {
    onChange({
      ...data,
      [field]: value === "" ? null : value,
    });
  };

  const autoFillOgFromMeta = () => {
    onChange({
      ...data,
      ogTitle: data.metaTitle || entityName || "",
      ogDescription: data.metaDescription || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stroke pb-4 dark:border-strokedark">
        <h3 className="text-lg font-semibold text-black dark:text-white">
          SEO Настройки
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Оптимизирайте съдържанието за търсачки и социални мрежи
        </p>
      </div>

      {/* Meta Tags */}
      <div className="space-y-4">
        <h4 className="font-medium text-black dark:text-white">Meta Tags</h4>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Meta Title
            <span className="ml-2 text-xs text-gray-500">
              ({data.metaTitle?.length || 0}/60 символа)
            </span>
          </label>
          <input
            type="text"
            value={data.metaTitle || ""}
            onChange={(e) => handleChange("metaTitle", e.target.value)}
            placeholder="Оптимално: 50-60 символа"
            maxLength={60}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Заглавието, което ще се показва в резултатите от търсенето
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Meta Description
            <span className="ml-2 text-xs text-gray-500">
              ({data.metaDescription?.length || 0}/160 символа)
            </span>
          </label>
          <textarea
            value={data.metaDescription || ""}
            onChange={(e) => handleChange("metaDescription", e.target.value)}
            placeholder="Оптимално: 150-160 символа"
            maxLength={160}
            rows={3}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Кратко описание за резултатите от търсенето
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Meta Keywords
          </label>
          <input
            type="text"
            value={data.metaKeywords || ""}
            onChange={(e) => handleChange("metaKeywords", e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ключови думи, разделени със запетая
          </p>
        </div>
      </div>

      {/* Open Graph (Social Media) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-black dark:text-white">
            Open Graph (Социални мрежи)
          </h4>
          <button
            type="button"
            onClick={autoFillOgFromMeta}
            className="text-sm text-primary hover:underline"
          >
            Попълни от Meta Tags
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            OG Title
          </label>
          <input
            type="text"
            value={data.ogTitle || ""}
            onChange={(e) => handleChange("ogTitle", e.target.value)}
            placeholder="Заглавие за Facebook, LinkedIn, etc."
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            OG Description
          </label>
          <textarea
            value={data.ogDescription || ""}
            onChange={(e) => handleChange("ogDescription", e.target.value)}
            placeholder="Описание за социалните мрежи"
            rows={2}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            OG Image URL
          </label>
          <input
            type="url"
            value={data.ogImage || ""}
            onChange={(e) => handleChange("ogImage", e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Препоръчителен размер: 1200x630 px
          </p>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h4 className="font-medium text-black dark:text-white">
          Допълнителни настройки
        </h4>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Canonical URL
          </label>
          <input
            type="url"
            value={data.canonicalUrl || ""}
            onChange={(e) => handleChange("canonicalUrl", e.target.value)}
            placeholder="https://example.com/canonical-page"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Задайте canonical URL, ако тази страница е дубликат
          </p>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.robotsIndex !== false}
              onChange={(e) => handleChange("robotsIndex", e.target.checked)}
              className="h-5 w-5 rounded border-stroke"
            />
            <span className="text-sm font-medium text-black dark:text-white">
              Разреши индексиране (index)
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.robotsFollow !== false}
              onChange={(e) => handleChange("robotsFollow", e.target.checked)}
              className="h-5 w-5 rounded border-stroke"
            />
            <span className="text-sm font-medium text-black dark:text-white">
              Следвай връзки (follow)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
