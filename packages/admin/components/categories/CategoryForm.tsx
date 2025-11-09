"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categoriesService, Category } from "@/lib/services/categories.service";
import CategoryTreeSelect from "./CategoryTreeSelect";
import ImageUpload from "../ui/ImageUpload";
import TiptapEditor from "../editor/TiptapEditor";
import { SeoFormData } from "@dshome/shared";

interface CategoryFormProps {
  category?: Category;
  mode: "create" | "edit";
}

export default function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(category?.name || "");
  const [h1, setH1] = useState(category?.h1 || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [image, setImage] = useState(category?.image || "");
  const [parentId, setParentId] = useState<string | null>(category?.parentId || null);
  const [status, setStatus] = useState<"active" | "inactive">(category?.status || "active");
  const [style, setStyle] = useState<"navigation" | "product">(category?.style || "product");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // SEO data
  const [seoData, setSeoData] = useState<SeoFormData>({
    metaTitle: category?.metaTitle || "",
    metaDescription: category?.metaDescription || "",
    canonicalUrl: category?.canonicalUrl || "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Cyrillic to Latin transliteration map
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
    'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
    'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
    'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch',
    'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y', 'Ю': 'Yu', 'Я': 'Ya'
  };

  const generateSlug = (text: string): string => {
    // Transliterate cyrillic to latin
    let slug = text.split('').map(char => translitMap[char] || char).join('');

    // Convert to lowercase, remove special chars, replace spaces with hyphens
    slug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Remove consecutive hyphens
      .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens

    return slug;
  };

  useEffect(() => {
    if (mode === "create" && name) {
      // Auto-generate slug from name
      const generatedSlug = generateSlug(name);
      setSlug(generatedSlug);

      // Auto-generate h1 from name
      setH1(name);
    }
  }, [name, mode]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesService.getCategoryTree();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      alert("Името и slug-а са задължителни");
      return;
    }

    try {
      setLoading(true);

      const data = {
        name,
        slug,
        description: description || undefined,
        image: image || undefined,
        parentId: parentId || undefined,
        status,
        style,
        h1: h1 || undefined,
        // SEO fields
        metaTitle: seoData.metaTitle || undefined,
        metaDescription: seoData.metaDescription || undefined,
        canonicalUrl: seoData.canonicalUrl || undefined,
      };

      if (mode === "create") {
        const response = await categoriesService.createCategory(data);
        alert("Категорията е създадена успешно");
        router.push(`/catalog/categories/${response.data.id}`);
      } else if (mode === "edit" && category) {
        await categoriesService.updateCategory(category.id, data);
        alert("Категорията е актуализирана успешно");
        router.push("/catalog/categories");
      }
    } catch (error: any) {
      console.error("Error saving category:", error);
      alert(error.response?.data?.message || "Неуспешно запазване на категорията");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          {mode === "create" ? "Създаване на категория" : "Редакция на категория"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Категориите помагат за организацията на продуктите в йерархична структура
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Основна информация
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Име <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="напр. Електроника, Дрехи"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Използва се вътрешно в системата
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                H1 Заглавие
              </label>
              <input
                type="text"
                value={h1}
                onChange={(e) => setH1(e.target.value)}
                placeholder="напр. Обзавеждане за баня"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Заглавие, което ще се показва на потребителите (автоматично се попълва с името)
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Описание
              </label>
              <TiptapEditor
                content={description}
                onChange={setDescription}
                placeholder="Описание на категорията..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Изображение на категорията
              </label>
              <ImageUpload
                value={image}
                onChange={setImage}
                onRemove={() => setImage("")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Родителска категория
              </label>
              <CategoryTreeSelect
                categories={categories}
                selectedId={parentId}
                onSelect={setParentId}
                excludeId={category?.id}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="active">Активна</option>
                <option value="inactive">Неактивна</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Стил
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as "navigation" | "product")}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="product">Продуктова</option>
                <option value="navigation">Навигация</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Продуктова категория може да съдържа продукти, навигационна е само за меню
              </p>
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            SEO Настройки
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Оптимизирайте съдържанието за търсачки
          </p>

          <div className="space-y-4">
            {/* URL Slug */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL Slug <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="напр. elektronika, drehi"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL-friendly версия на името (автоматично генериран)
              </p>
            </div>

            {/* Meta Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta Заглавие
                <span className={`ml-2 text-xs font-semibold ${(seoData.metaTitle?.length || 0) <= 60 ? 'text-success-500' : 'text-error-500'}`}>
                  ({seoData.metaTitle?.length || 0}/60 символа)
                </span>
              </label>
              <input
                type="text"
                value={seoData.metaTitle || ""}
                onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value || null })}
                placeholder="Оптимално: 50-60 символа"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Заглавието, което ще се показва в резултатите от търсенето
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta Описание
                <span className={`ml-2 text-xs font-semibold ${(seoData.metaDescription?.length || 0) <= 160 ? 'text-success-500' : 'text-error-500'}`}>
                  ({seoData.metaDescription?.length || 0}/160 символа)
                </span>
              </label>
              <textarea
                value={seoData.metaDescription || ""}
                onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value || null })}
                placeholder="Оптимално: 150-160 символа"
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Кратко описание за резултатите от търсенето
              </p>
            </div>

            {/* Canonical URL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Каноничен URL
              </label>
              <input
                type="url"
                value={seoData.canonicalUrl || ""}
                onChange={(e) => setSeoData({ ...seoData, canonicalUrl: e.target.value || null })}
                placeholder="https://example.com/canonical-page"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Задайте каноничен URL, ако тази страница е дубликат
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            {loading ? "Запазване..." : mode === "create" ? "Създай категория" : "Актуализирай категория"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/catalog/categories")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
}
