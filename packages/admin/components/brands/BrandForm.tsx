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
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
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
  const metaTitle = watch("metaTitle");
  const metaDescription = watch("metaDescription");

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
          "An error occurred while saving the brand"
      );
    } finally {
      setLoading(false);
    }
  };

  // Character counter helpers
  const getCharCountColor = (count: number, optimal: number, max: number) => {
    if (count === 0) return "text-gray-500 dark:text-gray-400";
    if (count > max) return "text-error-600 dark:text-error-400";
    if (count >= optimal && count <= max) return "text-success-600 dark:text-success-400";
    return "text-warning-600 dark:text-warning-400";
  };

  const metaTitleLength = metaTitle?.length || 0;
  const metaDescriptionLength = metaDescription?.length || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error-50 p-4 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              onChange={handleNameChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              placeholder="Enter brand name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              {...register("slug")}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              placeholder="brand-slug"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                {errors.slug.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              URL-friendly version of the name (lowercase, hyphens only)
            </p>
          </div>

          {/* Status Toggle */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <button
              type="button"
              onClick={() => setValue("status", status === "active" ? "inactive" : "active")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                status === "active"
                  ? "bg-success-500"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  status === "active" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              {status === "active" ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Logo
            </label>
            <ImageUpload
              value={logo}
              onChange={(url) => setValue("logo", url)}
              onRemove={() => setValue("logo", "")}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <TiptapEditor
              content={description || ""}
              onChange={(content) => setValue("description", content)}
              placeholder="Enter brand description..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SEO Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          SEO Information
        </h2>

        <div className="space-y-4">
          {/* Meta Title with Character Counter */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta Title
              </label>
              <span className={`text-xs font-medium ${getCharCountColor(metaTitleLength, 50, 70)}`}>
                {metaTitleLength}/70 {metaTitleLength >= 50 && metaTitleLength <= 70 && "✓"}
              </span>
            </div>
            <input
              type="text"
              {...register("metaTitle")}
              maxLength={70}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              placeholder="SEO title for search engines (50-60 chars optimal)"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optimal: 50-60 characters, Maximum: 70 characters
            </p>
          </div>

          {/* Meta Description with Character Counter */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta Description
              </label>
              <span className={`text-xs font-medium ${getCharCountColor(metaDescriptionLength, 150, 160)}`}>
                {metaDescriptionLength}/160 {metaDescriptionLength >= 150 && metaDescriptionLength <= 160 && "✓"}
              </span>
            </div>
            <textarea
              {...register("metaDescription")}
              maxLength={160}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              placeholder="SEO description for search engines (150-160 chars optimal)"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optimal: 150-160 characters, Maximum: 160 characters
            </p>
          </div>

          {/* Canonical URL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Canonical URL
            </label>
            <input
              type="text"
              {...register("canonicalUrl")}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              placeholder="https://example.com/brands/brand-name"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/catalog/brands")}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-gray-700"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>{mode === "create" ? "Create Brand" : "Update Brand"}</>
          )}
        </button>
      </div>
    </form>
  );
}
