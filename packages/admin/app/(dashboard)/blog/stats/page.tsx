"use client";

import { useState, useEffect } from "react";
import { blogService } from "@/lib/services/blog.service";
import { BlogStatistics } from "@dshome/shared";
import Link from "next/link";

export default function BlogStatsPage() {
  const [stats, setStats] = useState<BlogStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await blogService.getStatistics();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching blog statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Зареждане на статистики...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">Грешка при зареждане на статистики</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Blog Статистики
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Преглед на статистиката за blog модула.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Общо Постове
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalPosts}
          </div>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="text-green-600 dark:text-green-400">
              {stats.publishedPosts} публикувани
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">
              {stats.draftPosts} чернови
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Общо Категории
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalCategories}
          </div>
          <Link
            href="/blog/categories"
            className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Управление →
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Общо Автори
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalAuthors}
          </div>
          <Link
            href="/blog/authors"
            className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Управление →
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] sm:col-span-2 lg:col-span-1">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Общо Преглеждания
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalViews.toLocaleString()}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Всички постове
          </div>
        </div>
      </div>

      {/* Popular Posts */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Най-Популярни Постове
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          {stats.popularPosts.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              Няма публикувани постове.
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Заглавие
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Категория
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Автор
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    Преглеждания
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                {stats.popularPosts.map(({ post, viewsCount }) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      <Link
                        href={`/blog/posts/${post.id}`}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {post.category?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {post.author?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {viewsCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Последни Постове
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          {stats.recentPosts.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              Няма създадени постове.
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Заглавие
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Категория
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Автор
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    Създаден
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                {stats.recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      <Link
                        href={`/blog/posts/${post.id}`}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {post.category?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {post.author?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : post.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {post.status === 'published' ? 'Публикуван' : post.status === 'draft' ? 'Чернова' : 'Архивиран'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString('bg-BG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
