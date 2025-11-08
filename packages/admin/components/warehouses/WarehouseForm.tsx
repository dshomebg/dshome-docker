"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { warehousesService, Warehouse } from "@/lib/services/warehouses.service";

const warehouseSchema = z.object({
  name: z.string().min(1, "Името е задължително"),
  address: z.string().optional(),
  phone: z.string().optional(),
  workingHours: z.string().optional(),
  url: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  isPhysicalStore: z.boolean().optional(),
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
          "Грешка при запазване на склада"
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
          {mode === "create" ? "Нов склад" : "Редакция на склад"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Попълнете данните по-долу.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-error-50 p-4 text-error-700 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Име на склада/магазина <span className="text-error-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder="Магазин София - Център"
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
                    Адрес
                  </label>
                  <textarea
                    id="address"
                    {...register("address")}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder='бул. "Витоша" 100, 1000 София'
                  />
                </div>

                {/* Working Hours */}
                <div>
                  <label
                    htmlFor="workingHours"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Работно време
                  </label>
                  <textarea
                    id="workingHours"
                    {...register("workingHours")}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder="Пон-Съб: 09:00 - 20:00&#10;Нед: 10:00 - 18:00"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Телефон
                  </label>
                  <input
                    id="phone"
                    type="text"
                    {...register("phone")}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder="+359888123456"
                  />
                </div>

                {/* URL */}
                <div>
                  <label
                    htmlFor="url"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    URL за повече информация
                  </label>
                  <input
                    id="url"
                    type="text"
                    {...register("url")}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder="https://dshome.com/stores/sofia-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Location and Physical Store */}
          <div className="space-y-6">
            {/* Location */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="mb-4 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Локация
                </h3>
              </div>
              <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                Въведете координати за показване на карта.
              </p>

              <div className="space-y-4">
                {/* Latitude */}
                <div>
                  <label
                    htmlFor="latitude"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Географска ширина (Latitude)
                  </label>
                  <input
                    id="latitude"
                    type="text"
                    {...register("latitude")}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder="42.6977"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label
                    htmlFor="longitude"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Географска дължина (Longitude)
                  </label>
                  <input
                    id="longitude"
                    type="text"
                    {...register("longitude")}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    placeholder="23.3219"
                  />
                </div>
              </div>
            </div>

            {/* Physical Store */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Физически магазин
              </label>
              <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                Ако е активно, ще се показва като опция &quot;Вземи от магазин&quot;.
              </p>
              <div className="flex items-center">
                <input
                  id="isPhysicalStore"
                  type="checkbox"
                  {...register("isPhysicalStore")}
                  className="h-10 w-10 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/catalog/warehouses")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            disabled={loading}
          >
            Отказ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            {loading ? "Запазване..." : "Запази"}
          </button>
        </div>
      </form>
    </div>
  );
}
