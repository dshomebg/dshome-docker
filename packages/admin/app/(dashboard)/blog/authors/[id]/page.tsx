"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { blogService } from "@/lib/services/blog.service";
import { generateSlug } from "@/lib/utils/transliterate";
import TiptapEditor from "@/components/editor/TiptapEditor";
import ImageUpload from "@/components/ui/ImageUpload";

export default function BlogAuthorFormPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const authorId = isNew ? null : params.id as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bio: "",
    image: "",
    facebookLink: "",
    instagramLink: "",
    youtubeLink: "",
    linkedinLink: "",
    websiteLink: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    if (!isNew && authorId) {
      loadAuthor();
    }
  }, []);

  const loadAuthor = async () => {
    try {
      setLoading(true);
      const response = await blogService.getAuthorById(authorId!);
      const author = response.data;
      setFormData({
        name: author.name,
        slug: author.slug,
        bio: author.bio || "",
        image: author.image || "",
        facebookLink: author.facebookLink || "",
        instagramLink: author.instagramLink || "",
        youtubeLink: author.youtubeLink || "",
        linkedinLink: author.linkedinLink || "",
        websiteLink: author.websiteLink || "",
        status: author.status,
      });
    } catch (error) {
      console.error("Error loading author:", error);
      alert("Грешка при зареждане на автора");
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
        await blogService.createAuthor(formData);
        alert("Авторът е създаден успешно!");
      } else {
        await blogService.updateAuthor(authorId!, formData);
        alert("Авторът е обновен успешно!");
      }
      router.push("/blog/authors");
    } catch (error: any) {
      console.error("Error saving author:", error);
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
          {isNew ? "Нов Автор" : "Редактиране на Автор"}
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
                Биография
              </label>
              <TiptapEditor
                content={formData.bio}
                onChange={(html) => setFormData({ ...formData, bio: html })}
                placeholder="Биография на автора..."
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

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="active">Активен</option>
                <option value="inactive">Неактивен</option>
              </select>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold">Социални мрежи</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Facebook
              </label>
              <input
                type="url"
                value={formData.facebookLink}
                onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Instagram
              </label>
              <input
                type="url"
                value={formData.instagramLink}
                onChange={(e) => setFormData({ ...formData, instagramLink: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                YouTube
              </label>
              <input
                type="url"
                value={formData.youtubeLink}
                onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                placeholder="https://youtube.com/..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.linkedinLink}
                onChange={(e) => setFormData({ ...formData, linkedinLink: e.target.value })}
                placeholder="https://linkedin.com/..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Website
              </label>
              <input
                type="url"
                value={formData.websiteLink}
                onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
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
            onClick={() => router.push("/blog/authors")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
}
