"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { attributesService, AttributeGroup, AttributeValue } from "@/lib/services/attributes.service";
import AttributeValuesList from "./AttributeValuesList";

const attributeGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  displayType: z.enum(["dropdown", "radio", "color"]),
  status: z.enum(["active", "inactive"]),
});

type AttributeGroupFormData = z.infer<typeof attributeGroupSchema>;

interface AttributeFormProps {
  attributeGroup?: AttributeGroup;
  mode: "create" | "edit";
}

export default function AttributeForm({ attributeGroup, mode }: AttributeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<AttributeValue[]>(attributeGroup?.values || []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AttributeGroupFormData>({
    resolver: zodResolver(attributeGroupSchema),
    defaultValues: {
      name: attributeGroup?.name || "",
      displayType: attributeGroup?.displayType || "dropdown",
      status: attributeGroup?.status || "active",
    },
  });

  const displayType = watch("displayType");

  // Fetch values if in edit mode
  useEffect(() => {
    if (mode === "edit" && attributeGroup) {
      fetchValues();
    }
  }, [attributeGroup]);

  const fetchValues = async () => {
    if (!attributeGroup) return;
    try {
      const response = await attributesService.getAttributeValues(attributeGroup.id);
      setValues(response.data);
    } catch (err) {
      console.error("Error fetching attribute values:", err);
    }
  };

  const onSubmit = async (data: AttributeGroupFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (mode === "create") {
        await attributesService.createAttributeGroup(data);
      } else if (attributeGroup) {
        await attributesService.updateAttributeGroup(attributeGroup.id, data);
      }

      router.push("/catalog/attributes");
      router.refresh();
    } catch (err: any) {
      console.error("Error saving attribute group:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while saving the attribute group"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleValuesChange = (updatedValues: AttributeValue[]) => {
    setValues(updatedValues);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          {mode === "create" ? "Нова група атрибути" : "Редакция на група атрибути"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {mode === "create"
            ? "Създайте нова група атрибути за комбинации на продукти"
            : `Актуализирайте информацията за групата атрибути`}
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
            Основна информация
          </h2>

          <div className="space-y-4">
            {/* Name and Display Type on one row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Име на групата <span className="text-error-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder='напр. "Цвят", "RAM", "Памет"'
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Display Type */}
              <div>
                <label
                  htmlFor="displayType"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Тип на показване <span className="text-error-500">*</span>
                </label>
                <select
                  id="displayType"
                  {...register("displayType")}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="dropdown">Падащо меню</option>
                  <option value="radio">Бутон радио</option>
                  <option value="color">Цвят (с избор на цвят/текстура)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Определя как клиентите ще виждат и избират опциите на страницата на продукта
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Статус <span className="text-error-500">*</span>
              </label>
              <select
                id="status"
                {...register("status")}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="active">Активен</option>
                <option value="inactive">Неактивен</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attribute Values Card (only in edit mode) */}
        {mode === "edit" && attributeGroup && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Стойности на атрибута
            </h2>
            <AttributeValuesList
              groupId={attributeGroup.id}
              displayType={displayType}
              values={values}
              onValuesChange={handleValuesChange}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/catalog/attributes")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5 dark:focus:ring-gray-800"
            disabled={loading}
          >
            Отказ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
          >
            {loading ? "Запазва се..." : mode === "create" ? "Създай група атрибути" : "Актуализирай група"}
          </button>
        </div>
      </form>

      {mode === "create" && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          <p className="font-medium">Забележка:</p>
          <p>След създаването на групата атрибути ще можете да добавяте стойности към нея.</p>
        </div>
      )}
    </div>
  );
}
