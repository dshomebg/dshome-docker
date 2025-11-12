"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { customersService, Customer } from "@/lib/services/customers.service";
import CustomerTable from "./CustomerTable";
import CustomerFilters from "./CustomerFilters";
import { UserPlus } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isRegistered, setIsRegistered] = useState("");
  const [isActive, setIsActive] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (search) params.search = search;
      if (isRegistered) params.isRegistered = isRegistered === 'true';
      if (isActive) params.isActive = isActive === 'true';

      const response = await customersService.getCustomers(params);
      setCustomers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, isRegistered, isActive]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchCustomers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${name}"?`)) {
      return;
    }

    try {
      await customersService.deleteCustomer(id);
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Неуспешно изтриване на клиент");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
            Клиенти
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Управлявайте клиентите и техните данни
          </p>
        </div>
        <Link
          href="/sales/customers/new"
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Добави клиент
        </Link>
      </div>

      {/* Filters */}
      <CustomerFilters
        search={search}
        isRegistered={isRegistered}
        isActive={isActive}
        onSearchChange={setSearch}
        onIsRegisteredChange={setIsRegistered}
        onIsActiveChange={setIsActive}
      />

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Всичко клиенти</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {pagination.total}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Регистрирани</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {customers.filter((c) => c.isRegistered).length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Активни</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {customers.filter((c) => c.isActive).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <CustomerTable
          customers={customers}
          loading={loading}
          onDelete={handleDelete}
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
