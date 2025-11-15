"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { blogService } from "@/lib/services/blog.service";
import { BlogCategory, BlogAuthor } from "@dshome/shared";
import { generateSlug } from "@/lib/utils/transliterate";
import TiptapEditor from "@/components/editor/TiptapEditor";
import ImageUpload from "@/components/ui/ImageUpload";

export default function BlogPostFormPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const postId = isNew ? null : params.id as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    categoryId: "",
    authorId: "",
    status: "draft" as "draft" | "published" | "archived",
    publishedAt: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    robotsIndex: true,
    robotsFollow: true,
  });

  useEffect(() => {
    loadCategories();
    loadAuthors();
    if (!isNew && postId) {
      loadPost();
    }
  }, []);

  const loadCategories = async () => {
    try {
      const response = await blogService.getCategories({ limit: 100, status: "active" });
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadAuthors = async () => {
    try {
      const response = await blogService.getAuthors({ limit: 100, status: "active" });
      setAuthors(response.data);
    } catch (error) {
      console.error("Error loading authors:", error);
    }
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await blogService.getPostById(postId!);
      const post = response.data.post;
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        featuredImage: post.featuredImage || "",
        categoryId: post.categoryId || "",
        authorId: post.authorId || "",
        status: post.status,
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : "",
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        canonicalUrl: post.canonicalUrl || "",
        robotsIndex: post.robotsIndex,
        robotsFollow: post.robotsFollow,
      });
    } catch (error) {
      console.error("Error loading post:", error);
      alert("Грешка при зареждане на поста");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.content) {
      alert("Моля попълнете заглавие, slug и съдържание");
      return;
    }

    try {
      setSaving(true);
      const data = {
        ...formData,
        categoryId: formData.categoryId || undefined,
        authorId: formData.authorId || undefined,
        publishedAt: formData.publishedAt || undefined,
      };

      if (isNew) {
        await blogService.createPost(data);
        alert("Постът е създаден успешно!");
      } else {
        await blogService.updatePost(postId!, data);
        alert("Постът е обновен успешно!");
      }
      router.push("/blog/posts");
    } catch (error: any) {
      console.error("Error saving post:", error);
      alert(error.response?.data?.message || "Грешка при запазване");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSlug = () => {
    const slug = generateSlug(formData.title);
    setFormData({ ...formData, slug });
  };

  if (loading) {
    return <div className="p-6">Зареждане...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isNew ? "Нов Пост" : "Редактиране на Пост"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold">Основна информация</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Заглавие *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                Кратко описание
              </label>
              <TiptapEditor
                content={formData.excerpt}
                onChange={(html) => setFormData({ ...formData, excerpt: html })}
                placeholder="Кратко описание на поста..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Съдържание *
              </label>
              <TiptapEditor
                content={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="Пълно съдържание на поста..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Главно изображение
              </label>
              <ImageUpload
                value={formData.featuredImage}
                onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                onRemove={() => setFormData({ ...formData, featuredImage: "" })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Категория
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Изберете категория</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Автор
                </label>
                <select
                  value={formData.authorId}
                  onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Изберете автор</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="draft">Чернова</option>
                  <option value="published">Публикуван</option>
                  <option value="archived">Архивиран</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Дата на публикуване
                </label>
                <input
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
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
            onClick={() => router.push("/blog/posts")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
}
