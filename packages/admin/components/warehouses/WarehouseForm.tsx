"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { warehousesService, Warehouse } from "@/lib/services/warehouses.service";

const warehouseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  workingHours: z.string().optional(),
  url: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  isPhysicalStore: z.boolean().optional(),
  status: z.enum(["active", "inactive"]),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
  warehouse?: Warehouse;
  mode: "create" | "edit";
}

export default function WarehouseForm({ warehouse, mode }: WarehouseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: warehouse?.name || "",
      address: warehouse?.address || "",
      phone: warehouse?.phone || "",
      workingHours: warehouse?.workingHours || "",
      url: warehouse?.url || "",
      latitude: warehouse?.latitude || "",
      longitude: warehouse?.longitude || "",
      isPhysicalStore: warehouse?.isPhysicalStore || false,
      status: warehouse?.status || "active",
    },
  });

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (mode === "create") {
        await warehousesService.createWarehouse(data);
      } else if (warehouse) {
        await warehousesService.updateWarehouse(warehouse.id, data);
      }

      router.push("/catalog/warehouses");
      router.refresh();
    } catch (err: any) {
      console.error("Error saving warehouse:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while saving the warehouse"
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
          {mode === "create" ? "Add New Warehouse" : "Edit Warehouse"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {mode === "create"
            ? "Create a new warehouse or physical store"
            : `Update warehouse information`}
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
                Warehouse Name <span className="text-error-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Enter warehouse name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.name.message}
                </p>
              )}
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
                placeholder="Enter warehouse address"
              />
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

            {/* Working Hours */}
            <div>
              <label
                htmlFor="workingHours"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Working Hours
              </label>
              <textarea
                id="workingHours"
                {...register("workingHours")}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Mon-Fri: 9:00-18:00"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the working hours for this location
              </p>
            </div>

            {/* URL */}
            <div>
              <label
                htmlFor="url"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Warehouse/Store URL
              </label>
              <input
                id="url"
                type="text"
                {...register("url")}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="https://example.com/store/sofia"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Link to the dedicated page for this warehouse/store
              </p>
            </div>

            {/* Physical Store Checkbox */}
            <div className="flex items-center gap-3">
              <input
                id="isPhysicalStore"
                type="checkbox"
                {...register("isPhysicalStore")}
                className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
              />
              <label
                htmlFor="isPhysicalStore"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Physical Store (Customers can pick up products from this location)
              </label>
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
          </div>
        </div>

        {/* Geographic Coordinates Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Geographic Coordinates
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Latitude */}
              <div>
                <label
                  htmlFor="latitude"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Latitude
                </label>
                <input
                  id="latitude"
                  type="text"
                  {...register("latitude")}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="42.6977"
                />
              </div>

              {/* Longitude */}
              <div>
                <label
                  htmlFor="longitude"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Longitude
                </label>
                <input
                  id="longitude"
                  type="text"
                  {...register("longitude")}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="23.3219"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter coordinates to show this location on a map
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/catalog/warehouses")}
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
            {loading ? "Saving..." : mode === "create" ? "Create Warehouse" : "Update Warehouse"}
          </button>
        </div>
      </form>
    </div>
  );
}
