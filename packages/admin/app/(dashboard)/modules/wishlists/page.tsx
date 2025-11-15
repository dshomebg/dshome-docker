"use client";

import { useState, useEffect, useCallback } from "react";
import { wishlistsService, AdminWishlistItem } from "@/lib/services/wishlists.service";
import WishlistTable from "./WishlistTable";

export default function WishlistsPage() {
  const [wishlists, setWishlists] = useState<AdminWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchWishlists = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (customerId) params.customerId = customerId;
      if (productId) params.productId = productId;

      const response = await wishlistsService.getAllWishlists(params);
      setWishlists(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching wishlists:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, customerId, productId]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchWishlists();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchWishlists]);

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Списъци с Желания
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Преглед на продукти добавени в списъците с желания на клиентите.
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/modules/wishlists/stats'}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          📊 Статистики
        </button>
      </div>

      {/* Table with integrated filters */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <WishlistTable
          wishlists={wishlists}
          loading={loading}
          customerId={customerId}
          productId={productId}
          onCustomerIdChange={setCustomerId}
          onProductIdChange={setProductId}
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
