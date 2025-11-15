"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { blogService } from "@/lib/services/blog.service";
import { BlogCategory } from "@dshome/shared";
import { generateSlug } from "@/lib/utils/transliterate";
import TiptapEditor from "@/components/editor/TiptapEditor";
import ImageUpload from "@/components/ui/ImageUpload";

export default function BlogCategoryFormPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const categoryId = isNew ? null : params.id as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    parentId: "",
    position: 0,
    status: "active" as "active" | "inactive",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    robotsIndex: true,
    robotsFollow: true,
  });

  useEffect(() => {
    loadCategories();
    if (!isNew && categoryId) {
      loadCategory();
    }
  }, []);

  const loadCategories = async () => {
    try {
      const response = await blogService.getCategories({ limit: 100 });
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadCategory = async () => {
    try {
      setLoading(true);
      const response = await blogService.getCategoryById(categoryId!);
      const cat = response.data;
      setFormData({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
        image: cat.image || "",
        parentId: cat.parentId || "",
        position: cat.position,
        status: cat.status,
        metaTitle: cat.metaTitle || "",
        metaDescription: cat.metaDescription || "",
        canonicalUrl: cat.canonicalUrl || "",
        robotsIndex: cat.robotsIndex,
        robotsFollow: cat.robotsFollow,
      });
    } catch (error) {
      console.error("Error loading category:", error);
      alert("Грешка при зареждане на категорията");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      alert("Моля попълнете име и slug");
      return;
    }

    try {
      setSaving(true);
      if (isNew) {
        await blogService.createCategory({
          ...formData,
          parentId: formData.parentId || undefined,
        });
        alert("Категорията е създадена успешно!");
      } else {
        await blogService.updateCategory(categoryId!, {
          ...formData,
          parentId: formData.parentId || undefined,
        });
        alert("Категорията е обновена успешно!");
      }
      router.push("/blog/categories");
    } catch (error: any) {
      console.error("Error saving category:", error);
      alert(error.response?.data?.message || "Грешка при запазване");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSlug = () => {
    const slug = generateSlug(formData.name);
    setFormData({ ...formData, slug });
  };

  if (loading) {
    return <div className="p-6">Зареждане...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isNew ? "Нова Категория" : "Редактиране на Категория"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold">Основна информация</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Име *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Генерирай
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Описание
              </label>
              <TiptapEditor
                content={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Описание на категорията..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Изображение
              </label>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                onRemove={() => setFormData({ ...formData, image: "" })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Родителска категория
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Няма</option>
                  {categories
                    .filter(cat => cat.id !== categoryId)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Позиция
                </label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="active">Активна</option>
                <option value="inactive">Неактивна</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold">SEO</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.robotsIndex}
                  onChange={(e) => setFormData({ ...formData, robotsIndex: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Robots Index</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.robotsFollow}
                  onChange={(e) => setFormData({ ...formData, robotsFollow: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Robots Follow</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Запазване..." : "Запази"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/blog/categories")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
}
