"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { suppliersService, Supplier } from "@/lib/services/suppliers.service";
import { generateSlug } from "@/lib/utils/transliterate";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  vat: z.string().optional(),
  contactPerson: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
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
    watch,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name || "",
      slug: supplier?.slug || "",
      email: supplier?.email || "",
      phone: supplier?.phone || "",
      address: supplier?.address || "",
      vat: supplier?.vat || "",
      contactPerson: supplier?.contactPerson || "",
      description: supplier?.description || "",
      status: supplier?.status || "active",
      isDefault: supplier?.isDefault || false,
    },
  });

  const status = watch("status");

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

      if (mode === "create") {
        await suppliersService.createSupplier(data);
      } else if (supplier) {
        await suppliersService.updateSupplier(supplier.id, data);
      }

      router.push("/catalog/suppliers");
      router.refresh();
    } catch (err: any) {
      console.error("Error saving supplier:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while saving the supplier"
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
          {mode === "create" ? "Add New Supplier" : "Edit Supplier"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {mode === "create"
            ? "Create a new supplier"
            : `Update supplier information`}
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
        {/* Basic Information Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Supplier Name <span className="text-error-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                onChange={handleNameChange}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Enter supplier name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Slug <span className="text-error-500">*</span>
              </label>
              <input
                id="slug"
                type="text"
                {...register("slug")}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="supplier-slug"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.slug.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL-friendly version of the name. Only lowercase letters, numbers, and hyphens.
              </p>
            </div>

            {/* Contact Person */}
            <div>
              <label
                htmlFor="contactPerson"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Contact Person
              </label>
              <input
                id="contactPerson"
                type="text"
                {...register("contactPerson")}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Enter contact person name"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status <span className="text-error-500">*</span>
              </label>
              <select
                id="status"
                {...register("status")}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Set as Default */}
            <div className="flex items-center gap-3">
              <input
                id="isDefault"
                type="checkbox"
                {...register("isDefault")}
                className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
              />
              <label
                htmlFor="isDefault"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Set as default supplier
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The default supplier will be automatically selected when creating new products
            </p>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Enter supplier description"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Contact Information
          </h2>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="supplier@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone
              </label>
              <input
                id="phone"
                type="text"
                {...register("phone")}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="+359 888 123 456"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Address
              </label>
              <textarea
                id="address"
                {...register("address")}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Enter supplier address"
              />
            </div>

            {/* VAT */}
            <div>
              <label
                htmlFor="vat"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                VAT Number
              </label>
              <input
                id="vat"
                type="text"
                {...register("vat")}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="BG123456789"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/catalog/suppliers")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5 dark:focus:ring-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
          >
            {loading ? "Saving..." : mode === "create" ? "Create Supplier" : "Update Supplier"}
          </button>
        </div>
      </form>
    </div>
  );
}
