"use client";

import Link from "next/link";
import { AdminWishlistItem } from "@/lib/services/wishlists.service";
import { Heart, User, Package } from "lucide-react";

interface WishlistTableProps {
  wishlists: AdminWishlistItem[];
  loading: boolean;
  customerId: string;
  productId: string;
  onCustomerIdChange: (value: string) => void;
  onProductIdChange: (value: string) => void;
}

export default function WishlistTable({
  wishlists,
  loading,
  customerId,
  productId,
  onCustomerIdChange,
  onProductIdChange,
}: WishlistTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ' г.,');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        {/* Header Row */}
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Продукт
              </div>
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Клиент
              </div>
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              SKU
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Тип Потребител
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Дата
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Действия
            </th>
          </tr>
        </thead>

        {/* Filters Row */}
        <tbody>
          <tr className="border-b border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {/* Product Search */}
            <td className="px-4 py-2">
              <input
                type="text"
                value={productId}
                onChange={(e) => onProductIdChange(e.target.value)}
                placeholder="Търси продукт ID..."
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
            </td>
            {/* Customer Search */}
            <td className="px-4 py-2">
              <input
                type="text"
                value={customerId}
                onChange={(e) => onCustomerIdChange(e.target.value)}
                placeholder="Търси клиент ID..."
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
            </td>
            <td className="px-4 py-2" colSpan={4}>
              {/* Empty cells for alignment */}
            </td>
          </tr>

          {/* Data Rows */}
          {wishlists.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p>Няма намерени продукти в списъци с желания</p>
                </div>
              </td>
            </tr>
          ) : (
            wishlists.map((item) => (
              <tr
                key={item.wishlist.id}
                className="border-b border-gray-200 hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
              >
                {/* Product */}
                <td className="px-4 py-3">
                  {item.product ? (
                    <Link
                      href={`/catalog/products/${item.product.id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      {item.product.name}
                    </Link>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">
                      Продуктът е изтрит
                    </span>
                  )}
                </td>

                {/* Customer */}
                <td className="px-4 py-3">
                  {item.customer ? (
                    <div className="flex flex-col">
                      <Link
                        href={`/sales/customers/${item.customer.id}`}
                        className="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                      >
                        {item.customer.firstName} {item.customer.lastName}
                      </Link>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.customer.email}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span className="text-xs">Неregистриран</span>
                      {item.wishlist.sessionId && (
                        <span className="text-xs font-mono text-gray-400">
                          ({item.wishlist.sessionId.substring(0, 8)}...)
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* SKU */}
                <td className="px-4 py-3">
                  {item.product && (
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                      {item.product.sku}
                    </span>
                  )}
                </td>

                {/* User Type */}
                <td className="px-4 py-3">
                  {item.customer ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Регистриран
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                      Гост
                    </span>
                  )}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(item.wishlist.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {item.product && (
                      <Link
                        href={`/catalog/products/${item.product.id}`}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Виж продукт"
                      >
                        <Package className="h-4 w-4" />
                      </Link>
                    )}
                    {item.customer && (
                      <Link
                        href={`/sales/customers/${item.customer.id}`}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        title="Виж клиент"
                      >
                        <User className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
