"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { imageSizesService, ImageSizeTemplate } from "@/lib/services/image-sizes.service";
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function ImageSizesPage() {
  const router = useRouter();
  const [imageSizes, setImageSizes] = useState<ImageSizeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEntityType, setFilterEntityType] = useState<string>("all");

  useEffect(() => {
    fetchImageSizes();
  }, [filterEntityType]);

  const fetchImageSizes = async () => {
    try {
      setLoading(true);
      const response = await imageSizesService.getImageSizes({
        entityType: filterEntityType !== "all" ? (filterEntityType as any) : undefined,
        page: 1,
        limit: 100,
      });
      setImageSizes(response.data);
    } catch (error) {
      console.error("Error fetching image sizes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await imageSizesService.toggleActive(id);
      fetchImageSizes();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Неуспешна промяна на статус");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${name}"?`)) {
      return;
    }

    try {
      await imageSizesService.deleteImageSize(id);
      fetchImageSizes();
    } catch (error) {
      console.error("Error deleting image size:", error);
      alert("Неуспешно изтриване");
    }
  };

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      product: "Продукт",
      category: "Категория",
      brand: "Марка",
      blog: "Блог",
    };
    return labels[type] || type;
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
            Размери на изображения
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Конфигурирайте размерите на изображенията за различни секции
          </p>
        </div>
        <Link
          href="/design/image-sizes/new"
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
        >
          <span>+</span>
          Добави размер
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <select
          value={filterEntityType}
          onChange={(e) => setFilterEntityType(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="all">Всички типове</option>
          <option value="product">Продукти</option>
          <option value="category">Категории</option>
          <option value="brand">Марки</option>
          <option value="blog">Блог</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Зареждане...
          </div>
        ) : imageSizes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Няма намерени размери
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Име
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Показвано име
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Тип
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Размери
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Качество
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Статус
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                {imageSizes.map((size) => (
                  <tr
                    key={size.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">
                      {size.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {size.displayName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {getEntityTypeLabel(size.entityType)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {size.width} × {size.height}px
                      <span className="ml-2 text-xs text-gray-400">
                        ({size.fitMode})
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {size.quality}% {size.format}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(size.id, size.isActive)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          size.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {size.isActive ? (
                          <>
                            <ToggleRight className="h-3.5 w-3.5" />
                            Активен
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-3.5 w-3.5" />
                            Неактивен
                          </>
                        )}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/design/image-sizes/${size.id}`)}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          title="Редактирай"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(size.id, size.name)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                          title="Изтрий"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
