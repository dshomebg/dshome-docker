"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { wishlistsService, PopularWishlistProduct } from "@/lib/services/wishlists.service";
import { Heart, TrendingUp, Package, BarChart3 } from "lucide-react";

export default function WishlistStatsPage() {
  const [popularProducts, setPopularProducts] = useState<PopularWishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    fetchPopularProducts();
  }, [limit]);

  const fetchPopularProducts = async () => {
    try {
      setLoading(true);
      const response = await wishlistsService.getPopularWishlistProducts(limit);
      setPopularProducts(response.data);
    } catch (error) {
      console.error("Error fetching popular wishlist products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalWishlistCount = () => {
    return popularProducts.reduce((sum, item) => sum + Number(item.wishlistCount), 0);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Статистики - Списъци с Желания
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Анализ на най-желаните продукти от клиентите.
          </p>
        </div>
        <Link
          href="/modules/wishlists"
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.08]"
        >
          ← Всички Wishlists
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pink-100 p-3 dark:bg-pink-900/30">
              <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Общо Продукти</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {popularProducts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
              <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Общо Записи</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTotalWishlistCount()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Среден на Продукт</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {popularProducts.length > 0
                  ? Math.round(getTotalWishlistCount() / popularProducts.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Products Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Най-Желани Продукти
            </h2>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
            >
              <option value="10">Топ 10</option>
              <option value="20">Топ 20</option>
              <option value="50">Топ 50</option>
              <option value="100">Топ 100</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
            </div>
          ) : popularProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-gray-500 dark:text-gray-400">
              <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p>Няма данни за популярни продукти</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Позиция
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Продукт
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Брой Желания
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    % от Общо
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {popularProducts.map((item, index) => {
                  const percentage = ((Number(item.wishlistCount) / getTotalWishlistCount()) * 100).toFixed(1);
                  return (
                    <tr
                      key={item.productId}
                      className="border-b border-gray-200 hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
                    >
                      {/* Position */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : index === 1
                                ? "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                : index === 2
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-6 py-4">
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

                      {/* SKU */}
                      <td className="px-6 py-4">
                        {item.product && (
                          <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                            {item.product.sku}
                          </span>
                        )}
                      </td>

                      {/* Wishlist Count */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-pink-500" />
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.wishlistCount}
                          </span>
                        </div>
                      </td>

                      {/* Percentage */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-full bg-indigo-600 dark:bg-indigo-400"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {percentage}%
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        {item.product && (
                          <Link
                            href={`/catalog/products/${item.product.id}`}
                            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            <Package className="h-4 w-4" />
                            Виж продукт
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
