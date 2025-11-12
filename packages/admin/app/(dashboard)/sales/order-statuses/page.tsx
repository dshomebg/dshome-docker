"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { orderStatusesService, OrderStatus } from "@/lib/services/order-statuses.service";
import { Edit, Trash2, Plus, CheckCircle2, XCircle, Mail } from "lucide-react";

export default function OrderStatusesPage() {
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const response = await orderStatusesService.getOrderStatuses();
      setStatuses(response.data);
    } catch (error) {
      console.error("Error fetching order statuses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${name}"?`)) {
      return;
    }

    try {
      await orderStatusesService.deleteOrderStatus(id);
      fetchStatuses();
    } catch (error) {
      console.error("Error deleting order status:", error);
      alert("Неуспешно изтриване на статус");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Зареждане...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
            Статуси на поръчки
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Управлявайте статусите на поръчките
          </p>
        </div>
        <Link
          href="/sales/order-statuses/new"
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          Добави статус
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Всичко статуси</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {statuses.length}
          </p>
        </div>
      </div>

      {/* Statuses Table */}
      {statuses.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800">
              <CheckCircle2 className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">Няма статуси</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Добавете първия статус на поръчка
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-white/[0.05]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Име
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Цвят
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    Видим за клиента
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    Изпраща имейл
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                {statuses.map((status) => (
                  <tr
                    key={status.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded border border-gray-300 dark:border-gray-700"
                          style={{ backgroundColor: status.color }}
                          title={status.color}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {status.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {status.color}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {status.visibleToCustomer ? (
                        <CheckCircle2 className="inline-block h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="inline-block h-4 w-4 text-gray-400" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {status.sendEmail ? (
                        <Mail className="inline-block h-4 w-4 text-blue-500" />
                      ) : (
                        <XCircle className="inline-block h-4 w-4 text-gray-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/sales/order-statuses/${status.id}`}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                          title="Редактирай"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(status.id, status.name)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
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
        </div>
      )}
    </div>
  );
}
