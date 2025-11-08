"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { suppliersService, Supplier } from "@/lib/services/suppliers.service";
import { generateSlug } from "@/lib/utils/transliterate";

const supplierSchema = z.object({
  name: z.string().min(1, "Името е задължително"),
  slug: z.string().min(1, "Slug е задължителен"),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  supplier?: Supplier;
  mode: "create" | "edit";
}

export default function SupplierForm({ supplier, mode }: SupplierFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name || "",
      slug: supplier?.slug || "",
      description: supplier?.description || "",
      isDefault: supplier?.isDefault || false,
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValue("name", newName);
    if (mode === "create") {
      setValue("slug", generateSlug(newName));
    }
  };

  const onSubmit = async (data: SupplierFormData) => {
    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...data,
        status: "active" as const,
      };

      if (mode === "create") {
        await suppliersService.createSupplier(submitData);
      } else if (supplier) {
        await suppliersService.updateSupplier(supplier.id, submitData);
      }

      router.push("/catalog/suppliers");
      router.refresh();
    } catch (err: any) {
      console.error("Error saving supplier:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Грешка при запазване на доставчик"
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
          {mode === "create" ? "Нов доставчик" : "Редакция на доставчик"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {mode === "create"
            ? "Добавяне на нов доставчик"
            : "Актуализация на информация за доставчик"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-error-50 p-4 text-error-700 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Information Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Име <span className="text-error-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                onChange={handleNameChange}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                placeholder="Въведете име на доставчик"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Hidden Slug - auto-generated */}
            <input type="hidden" {...register("slug")} />

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Информация
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                placeholder="Допълнителна информация за доставчика"
              />
            </div>

            {/* Set as Default */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  id="isDefault"
                  type="checkbox"
                  {...register("isDefault")}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Доставчик по подразбиране
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Доставчикът по подразбиране ще бъде автоматично избран при създаване на нови продукти
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
          >
            {loading ? "Запазва се..." : "Запази"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/catalog/suppliers")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5 dark:focus:ring-gray-800"
            disabled={loading}
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
}
