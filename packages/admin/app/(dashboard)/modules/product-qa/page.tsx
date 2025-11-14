"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { productQaService, QuestionWithProduct } from "@/lib/services/product-qa.service";
import QuestionTable from "./QuestionTable";

export default function ProductQaPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [productId, setProductId] = useState("");
  const [withoutAnswers, setWithoutAnswers] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (status) params.status = status;
      if (productId) params.productId = productId;
      if (withoutAnswers) params.withoutAnswers = true;

      const response = await productQaService.getAllQuestions(params);
      setQuestions(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, status, productId, withoutAnswers]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchQuestions();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchQuestions]);

  const handleApproveQuestion = async (id: string) => {
    try {
      await productQaService.approveQuestion(id);
      fetchQuestions();
    } catch (error) {
      console.error("Error approving question:", error);
      alert("Неуспешно одобряване на въпрос");
    }
  };

  const handleDeleteQuestion = async (id: string, questionText: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете въпроса: "${questionText.substring(0, 50)}..."?`)) {
      return;
    }

    try {
      await productQaService.deleteQuestion(id);
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Неуспешно изтриване на въпрос");
    }
  };

  const handleApproveAnswer = async (id: string) => {
    try {
      await productQaService.approveAnswer(id);
      fetchQuestions();
    } catch (error) {
      console.error("Error approving answer:", error);
      alert("Неуспешно одобряване на отговор");
    }
  };

  const handleDeleteAnswer = async (id: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този отговор?")) {
      return;
    }

    try {
      await productQaService.deleteAnswer(id);
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting answer:", error);
      alert("Неуспешно изтриване на отговор");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Въпроси и Отговори
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Преглед и управление на клиентски въпроси за продукти.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/modules/product-qa/new')}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <span className="text-lg">+</span>
            Добави въпрос
          </button>
          <button
            onClick={() => router.push('/modules/product-qa/settings')}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.08]"
          >
            Настройки
          </button>
        </div>
      </div>

      {/* Table with integrated filters */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <QuestionTable
          questions={questions}
          loading={loading}
          onApproveQuestion={handleApproveQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onApproveAnswer={handleApproveAnswer}
          onDeleteAnswer={handleDeleteAnswer}
          status={status}
          productId={productId}
          withoutAnswers={withoutAnswers}
          onStatusChange={setStatus}
          onProductIdChange={setProductId}
          onWithoutAnswersChange={setWithoutAnswers}
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
