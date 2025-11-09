"use client";

import { SeoFormData } from "@dshome/shared";
import { ExternalLink, Copy } from "lucide-react";
import { useState } from "react";

interface SeoFormProps {
  data: SeoFormData;
  onChange: (data: SeoFormData) => void;
  entityName?: string;
  productUrl?: string;
}

export default function SeoForm({ data, onChange, entityName, productUrl }: SeoFormProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleChange = (field: keyof SeoFormData, value: string | boolean) => {
    onChange({
      ...data,
      [field]: value === "" ? null : value,
    });
  };

  const handleCopyUrl = async () => {
    if (!productUrl) return;
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  const handleOpenUrl = () => {
    if (!productUrl) return;
    window.open(productUrl, '_blank');
  };

  // Определяне на цвета на брояча за Meta Title
  const getMetaTitleCounterColor = () => {
    const length = data.metaTitle?.length || 0;
    if (length <= 60) return "text-success-500"; // Зелен
    return "text-error-500"; // Червен
  };

  // Определяне на цвета на брояча за Meta Description
  const getMetaDescCounterColor = () => {
    const length = data.metaDescription?.length || 0;
    if (length <= 160) return "text-success-500"; // Зелен
    return "text-error-500"; // Червен
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stroke pb-4 dark:border-strokedark">
        <h3 className="text-lg font-semibold text-black dark:text-white">
          SEO Настройки
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Оптимизирайте съдържанието за търсачки
        </p>
      </div>

      {/* Meta Tags */}
      <div className="space-y-4">
        <h4 className="font-medium text-black dark:text-white">Meta Тагове</h4>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Meta Заглавие
            <span className={`ml-2 text-xs font-semibold ${getMetaTitleCounterColor()}`}>
              ({data.metaTitle?.length || 0}/60 символа)
            </span>
          </label>
          <input
            type="text"
            value={data.metaTitle || ""}
            onChange={(e) => handleChange("metaTitle", e.target.value)}
            placeholder="Оптимално: 50-60 символа"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Заглавието, което ще се показва в резултатите от търсенето
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Meta Описание
            <span className={`ml-2 text-xs font-semibold ${getMetaDescCounterColor()}`}>
              ({data.metaDescription?.length || 0}/160 символа)
            </span>
          </label>
          <textarea
            value={data.metaDescription || ""}
            onChange={(e) => handleChange("metaDescription", e.target.value)}
            placeholder="Оптимално: 150-160 символа"
            rows={3}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Кратко описание за резултатите от търсенето
          </p>
        </div>

      </div>

      {/* Canonical URL */}
      <div className="space-y-4">
        <h4 className="font-medium text-black dark:text-white">
          Допълнителни настройки
        </h4>

        {/* Product URL Display */}
        {productUrl && (
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Реален URL адрес
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded border-[1.5px] border-stroke bg-gray-50 px-5 py-3 text-black dark:border-form-strokedark dark:bg-gray-800 dark:text-white">
                <span className="text-sm break-all">{productUrl}</span>
              </div>
              <button
                type="button"
                onClick={handleOpenUrl}
                className="rounded border-[1.5px] border-stroke p-3 hover:bg-gray-100 dark:border-form-strokedark dark:hover:bg-gray-800"
                title="Отвори в нов таб"
              >
                <ExternalLink className="h-5 w-5 text-black dark:text-white" />
              </button>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="rounded border-[1.5px] border-stroke p-3 hover:bg-gray-100 dark:border-form-strokedark dark:hover:bg-gray-800"
                title={copiedUrl ? "Копирано!" : "Копирай URL"}
              >
                <Copy className={`h-5 w-5 ${copiedUrl ? 'text-success-500' : 'text-black dark:text-white'}`} />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Това е реалният адрес, на който ще бъде достъпен продукта
            </p>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Каноничен URL
          </label>
          <input
            type="url"
            value={data.canonicalUrl || ""}
            onChange={(e) => handleChange("canonicalUrl", e.target.value)}
            placeholder="https://example.com/canonical-page"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Задайте каноничен URL, ако тази страница е дубликат
          </p>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.skipMetaGeneration || false}
              onChange={(e) => handleChange("skipMetaGeneration", e.target.checked)}
              className="h-5 w-5 rounded border-gray-300"
            />
            <div>
              <span className="text-sm font-medium text-black dark:text-white">
                Не презаписвай мета при автоматично генериране
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ако е активно, мета таговете няма да бъдат презаписани при масово генериране
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
