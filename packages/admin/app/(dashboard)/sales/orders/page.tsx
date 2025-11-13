"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ordersService, Order } from "@/lib/services/orders.service";
import OrderTable from "./OrderTable";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [courierId, setCourierId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (search) params.search = search;
      if (status) params.status = status;
      if (courierId) params.courierId = courierId;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await ordersService.getOrders(params);
      setOrders(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, status, courierId, dateFrom, dateTo]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchOrders]);

  const handleDelete = async (id: string, orderNumber: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете поръчка "${orderNumber}"?`)) {
      return;
    }

    try {
      await ordersService.deleteOrder(id);
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Неуспешно изтриване на поръчка");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await ordersService.updateOrderStatus(id, newStatus);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Неуспешна промяна на статус");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Поръчки
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Преглед и управление на клиентски поръчки.
          </p>
        </div>
        <button
          onClick={() => router.push('/sales/orders/new')}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <span className="text-lg">+</span>
          Направи поръчка
        </button>
      </div>

      {/* Table with integrated filters */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <OrderTable
          orders={orders}
          loading={loading}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          search={search}
          status={status}
          courierId={courierId}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onSearchChange={setSearch}
          onStatusChange2={setStatus}
          onCourierChange={setCourierId}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Страница {pagination.page} от {pagination.totalPages} ({pagination.total} общо)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
              }
              disabled={pagination.page === 1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.08]"
            >
              Предишна
            </button>
            <button
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.min(p.totalPages, p.page + 1),
                }))
              }
              disabled={pagination.page === pagination.totalPages}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.08]"
            >
              Следваща
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
