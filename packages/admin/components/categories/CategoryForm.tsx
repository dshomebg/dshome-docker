"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categoriesService, Category } from "@/lib/services/categories.service";
import CategoryTreeSelect from "./CategoryTreeSelect";
import ImageUpload from "../ui/ImageUpload";
import SeoForm from "../seo/SeoForm";
import { SeoFormData } from "@dshome/shared/types/seo";

interface CategoryFormProps {
  category?: Category;
  mode: "create" | "edit";
}

export default function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [image, setImage] = useState(category?.image || "");
  const [parentId, setParentId] = useState<string | null>(category?.parentId || null);
  const [status, setStatus] = useState<"active" | "inactive">(category?.status || "active");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // SEO data
  const [seoData, setSeoData] = useState<SeoFormData>({
    metaTitle: category?.metaTitle || "",
    metaDescription: category?.metaDescription || "",
    metaKeywords: category?.metaKeywords || "",
    ogTitle: category?.ogTitle || "",
    ogDescription: category?.ogDescription || "",
    ogImage: category?.ogImage || "",
    canonicalUrl: category?.canonicalUrl || "",
    robotsIndex: category?.robotsIndex !== false,
    robotsFollow: category?.robotsFollow !== false,
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
      const generatedSlug = generateSlug(name);
      setSlug(generatedSlug);
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
      alert("Name and slug are required");
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
        // SEO fields
        metaTitle: seoData.metaTitle || undefined,
        metaDescription: seoData.metaDescription || undefined,
        metaKeywords: seoData.metaKeywords || undefined,
        ogTitle: seoData.ogTitle || undefined,
        ogDescription: seoData.ogDescription || undefined,
        ogImage: seoData.ogImage || undefined,
        canonicalUrl: seoData.canonicalUrl || undefined,
        robotsIndex: seoData.robotsIndex,
        robotsFollow: seoData.robotsFollow,
      };

      if (mode === "create") {
        const response = await categoriesService.createCategory(data);
        alert("Category created successfully");
        router.push(`/catalog/categories/${response.data.id}`);
      } else if (mode === "edit" && category) {
        await categoriesService.updateCategory(category.id, data);
        alert("Category updated successfully");
        router.push("/catalog/categories");
      }
    } catch (error: any) {
      console.error("Error saving category:", error);
      alert(error.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          {mode === "create" ? "Create Category" : "Edit Category"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Categories help organize products in a hierarchical structure
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Electronics, Clothing"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., electronics, clothing"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL-friendly version of the name
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Category description..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Consider integrating a WYSIWYG editor here for rich text
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Image
              </label>
              <ImageUpload
                value={image}
                onChange={setImage}
                onRemove={() => setImage("")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Parent Category
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
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEO Settings using SeoForm component */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <SeoForm
            data={seoData}
            onChange={setSeoData}
            entityName={name}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            {loading ? "Saving..." : mode === "create" ? "Create Category" : "Update Category"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/catalog/categories")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
