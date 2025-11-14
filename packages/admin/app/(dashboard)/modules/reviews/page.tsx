"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { reviewsService, ReviewWithProduct } from "@/lib/services/reviews.service";
import ReviewTable from "./ReviewTable";

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");
  const [productId, setProductId] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (status) params.status = status;
      if (rating) params.rating = parseInt(rating);
      if (productId) params.productId = productId;
      if (search) params.search = search;

      const response = await reviewsService.getAllReviews(params);
      setReviews(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, status, rating, productId, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchReviews();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchReviews]);

  const handleApprove = async (id: string, isVerifiedPurchase: boolean = false) => {
    try {
      await reviewsService.approveReview(id, isVerifiedPurchase);
      fetchReviews();
    } catch (error) {
      console.error("Error approving review:", error);
      alert("Неуспешно одобряване на отзив");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Сигурни ли сте, че искате да отхвърлите този отзив?")) {
      return;
    }

    try {
      await reviewsService.rejectReview(id);
      fetchReviews();
    } catch (error) {
      console.error("Error rejecting review:", error);
      alert("Неуспешно отхвърляне на отзив");
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете отзив за "${productName}"?`)) {
      return;
    }

    try {
      await reviewsService.deleteReview(id);
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Неуспешно изтриване на отзив");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Оценки и Отзиви
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Преглед и управление на клиентски отзиви за продукти.
          </p>
        </div>
        <button
          onClick={() => router.push('/modules/reviews/new')}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <span className="text-lg">+</span>
          Добави отзив
        </button>
      </div>

      {/* Table with integrated filters */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <ReviewTable
          reviews={reviews}
          loading={loading}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          status={status}
          rating={rating}
          productId={productId}
          search={search}
          onStatusChange={setStatus}
          onRatingChange={setRating}
          onProductIdChange={setProductId}
          onSearchChange={setSearch}
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
