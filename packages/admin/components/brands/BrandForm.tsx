"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TiptapEditor from "../editor/TiptapEditor";
import ImageUpload from "../ui/ImageUpload";
import { brandsService, Brand } from "@/lib/services/brands.service";
import { generateSlug } from "@/lib/utils/transliterate";

const brandSchema = z.object({
  name: z.string().min(1, "Името е задължително"),
  slug: z.string().min(1, "Slug е задължителен"),
  logo: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  brand?: Brand;
  mode: "create" | "edit";
}

export default function BrandForm({ brand, mode }: BrandFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: brand?.name || "",
      slug: brand?.slug || "",
      logo: brand?.logo || "",
      description: brand?.description || "",
      status: brand?.status || "active",
      metaTitle: brand?.metaTitle || "",
      metaDescription: brand?.metaDescription || "",
      canonicalUrl: brand?.canonicalUrl || "",
    },
  });

  const description = watch("description");
  const status = watch("status");
  const logo = watch("logo");
  const slug = watch("slug");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValue("name", newName);
    if (mode === "create") {
      setValue("slug", generateSlug(newName));
    }
  };

  const onSubmit = async (data: BrandFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (mode === "create") {
        await brandsService.createBrand(data);
      } else if (brand) {
        await brandsService.updateBrand(brand.id, data);
      }

      router.push("/catalog/brands");
      router.refresh();
    } catch (err: any) {
      console.error("Error saving brand:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Грешка при запазване на марка"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          {mode === "create" ? "Нова марка" : "Редакция на марка"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Попълнете данните по-долу.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error-50 p-4 text-error-700 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Име на марката <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    onChange={handleNameChange}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder="Въведете име на марка"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Статус
                  </label>
                  <button
                    type="button"
                    onClick={() => setValue("status", status === "active" ? "inactive" : "active")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      status === "active"
                        ? "bg-brand-500"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        status === "active" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {status === "active" ? "Активна" : "Неактивна"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description WYSIWYG */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Описание
              </label>
              <TiptapEditor
                content={description || ""}
                onChange={(content) => setValue("description", content)}
                placeholder="Въведете описание на марката..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Logo and SEO */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Лого на марката
              </label>
              <ImageUpload
                value={logo}
                onChange={(url) => setValue("logo", url)}
                onRemove={() => setValue("logo", "")}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Провлачете снимка тук, или разгледайте файловете
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF до 10MB
              </p>
            </div>

            {/* SEO */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                SEO
              </h3>
              <div className="space-y-4">
                {/* Meta Title */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Мета заглавие
                  </label>
                  <input
                    type="text"
                    {...register("metaTitle")}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder="SEO заглавие"
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Мета описание
                  </label>
                  <textarea
                    {...register("metaDescription")}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder="SEO описание"
                  />
                </div>

                {/* URL / Slug */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    URL адрес
                  </label>
                  <input
                    type="text"
                    {...register("slug")}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder="brand-slug"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                      {errors.slug.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/catalog/brands")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5 dark:focus:ring-gray-800"
            disabled={loading}
          >
            Отказ
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
            disabled={loading}
          >
            {loading ? "Запазва се..." : "Запази"}
          </button>
        </div>
      </form>
    </div>
  );
}
