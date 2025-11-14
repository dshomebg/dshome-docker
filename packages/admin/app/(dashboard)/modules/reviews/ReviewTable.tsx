"use client";

import Link from "next/link";
import { ReviewWithProduct } from "@/lib/services/reviews.service";
import { Star, Eye, Trash2, MessageSquare, CheckCircle, XCircle } from "lucide-react";

interface ReviewTableProps {
  reviews: ReviewWithProduct[];
  loading: boolean;
  onApprove: (id: string, isVerifiedPurchase: boolean) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, productName: string) => void;
  status: string;
  rating: string;
  productId: string;
  search: string;
  onStatusChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onProductIdChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function ReviewTable({
  reviews,
  loading,
  onApprove,
  onReject,
  onDelete,
  status,
  rating,
  productId,
  search,
  onStatusChange,
  onRatingChange,
  onProductIdChange,
  onSearchChange,
}: ReviewTableProps) {
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

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    const labels = {
      pending: "Чакащ",
      approved: "Одобрен",
      rejected: "Отхвърлен",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        ))}
      </div>
    );
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
              Продукт
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Клиент
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Оценка
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Отзив
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Статус
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
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Търси продукт..."
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
            </td>
            {/* Client Name */}
            <td className="px-4 py-2">
              <input
                type="text"
                placeholder="Търси клиент..."
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
            </td>
            {/* Rating Filter */}
            <td className="px-4 py-2">
              <select
                value={rating}
                onChange={(e) => onRatingChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              >
                <option value="">Всички</option>
                <option value="5">5 звезди</option>
                <option value="4">4 звезди</option>
                <option value="3">3 звезди</option>
                <option value="2">2 звезди</option>
                <option value="1">1 звезда</option>
              </select>
            </td>
            {/* Review Content - Empty */}
            <td className="px-4 py-2"></td>
            {/* Status Filter */}
            <td className="px-4 py-2">
              <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              >
                <option value="">Всички</option>
                <option value="pending">Чакащи</option>
                <option value="approved">Одобрени</option>
                <option value="rejected">Отхвърлени</option>
              </select>
            </td>
            {/* Date - Empty */}
            <td className="px-4 py-2"></td>
            {/* Actions - Empty */}
            <td className="px-4 py-2"></td>
          </tr>

          {/* Data Rows */}
          {reviews.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">Няма намерени отзиви</p>
              </td>
            </tr>
          ) : (
            reviews.map((item) => (
              <tr
                key={item.review.id}
                className="border-b border-gray-200 hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
              >
                {/* Product */}
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.product.slug}
                    </p>
                  </div>
                </td>

                {/* Customer */}
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.review.reviewerName}
                      </p>
                      {item.review.isVerifiedPurchase && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          ✓ Верифицирана
                        </span>
                      )}
                    </div>
                    {item.review.reviewerEmail && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.review.reviewerEmail}
                      </p>
                    )}
                  </div>
                </td>

                {/* Rating */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {renderStars(item.review.rating)}
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span>👍 {item.review.helpfulCount}</span>
                      <span>👎 {item.review.notHelpfulCount}</span>
                    </div>
                  </div>
                </td>

                {/* Review Content */}
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {item.review.title && (
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.review.title}
                      </p>
                    )}
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {item.review.content}
                    </p>
                    {item.review.images.length > 0 && (
                      <p className="text-xs text-gray-500">
                        📷 {item.review.images.length} снимки
                      </p>
                    )}
                    {item.review.storeReply && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">
                        ✓ Има отговор от магазина
                      </p>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {getStatusBadge(item.review.status)}
                </td>

                {/* Date */}
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(item.review.createdAt)}
                  </p>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {item.review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(item.review.id, false)}
                          className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                          title="Одобри"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onReject(item.review.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          title="Отхвърли"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <Link
                      href={`/modules/reviews/${item.review.id}`}
                      className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                      title="Преглед"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(item.review.id, item.product.name)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Изтриване"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
