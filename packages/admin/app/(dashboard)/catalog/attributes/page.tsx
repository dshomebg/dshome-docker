"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { attributesService, AttributeGroup } from "@/lib/services/attributes.service";

export default function AttributesPage() {
  const router = useRouter();
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAttributeGroups = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
        include: 'values', // Include values in the response
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await attributesService.getAttributeGroups(params);
      setAttributeGroups(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error("Error fetching attribute groups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributeGroups();
  }, [currentPage, searchTerm, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази група атрибути? Всички свързани стойности също ще бъдат изтрити.")) {
      return;
    }

    try {
      await attributesService.deleteAttributeGroup(id);
      fetchAttributeGroups();
    } catch (error) {
      console.error("Error deleting attribute group:", error);
      alert("Неуспешно изтриване на група атрибути");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAttributeGroups();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400";
      case "inactive":
        return "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400";
    }
  };

  const getDisplayTypeLabel = (displayType: string) => {
    switch (displayType) {
      case "dropdown":
        return "Падащо меню";
      case "radio":
        return "Бутон радио";
      case "color":
        return "Цвят";
      default:
        return displayType;
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
            Атрибути
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Управлявайте атрибутите на продуктите за създаване на комбинации
          </p>
        </div>
        <Link
          href="/catalog/attributes/new"
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
        >
          Добави група атрибути
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Търсене на групи атрибути..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="all">Всички статуси</option>
            <option value="active">Активен</option>
            <option value="inactive">Неактивен</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
          >
            Търси
          </button>
        </form>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Показани {attributeGroups.length} от {total} групи атрибути
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Зареждане на групи атрибути...
          </div>
        ) : attributeGroups.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Няма намерени групи атрибути
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
                    Тип
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Стойности
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
                {attributeGroups.map((group) => (
                  <tr
                    key={group.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {group.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {getDisplayTypeLabel(group.displayType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex flex-wrap gap-2">
                        {group.values && group.values.length > 0 ? (
                          group.values.slice(0, 3).map((val) => (
                            <span
                              key={val.id}
                              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-500/10 dark:text-gray-300"
                            >
                              {group.displayType === 'color' && (val.textureImage || val.colorHex) && (
                                val.textureImage ? (
                                  <img src={val.textureImage} alt="" className="h-3 w-3 rounded-full" />
                                ) : (
                                  <div
                                    className="h-3 w-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: val.colorHex }}
                                  />
                                )
                              )}
                              {val.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            Няма стойности
                          </span>
                        )}
                        {group.values && group.values.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{group.values.length - 3} още
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                          group.status
                        )}`}
                      >
                        {group.status === 'active' ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/catalog/attributes/${group.id}`}
                          className="text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
                          title="Редактирай"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(group.id)}
                          className="text-gray-600 hover:text-error-600 dark:text-gray-400 dark:hover:text-error-400"
                          title="Изтрий"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Предишна
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Страница {currentPage} от {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Следваща
          </button>
        </div>
      )}
    </div>
  );
}
