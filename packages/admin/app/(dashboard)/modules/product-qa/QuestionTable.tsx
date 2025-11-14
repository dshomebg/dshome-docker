"use client";

import Link from "next/link";
import { QuestionWithProduct } from "@/lib/services/product-qa.service";
import { HelpCircle, CheckCircle, XCircle, MessageCircle, Trash2, Badge } from "lucide-react";

interface QuestionTableProps {
  questions: QuestionWithProduct[];
  loading: boolean;
  onApproveQuestion: (id: string) => void;
  onDeleteQuestion: (id: string, questionText: string) => void;
  onApproveAnswer: (id: string) => void;
  onDeleteAnswer: (id: string) => void;
  status: string;
  productId: string;
  withoutAnswers: boolean;
  onStatusChange: (value: string) => void;
  onProductIdChange: (value: string) => void;
  onWithoutAnswersChange: (value: boolean) => void;
}

export default function QuestionTable({
  questions,
  loading,
  onApproveQuestion,
  onDeleteQuestion,
  onApproveAnswer,
  onDeleteAnswer,
  status,
  productId,
  withoutAnswers,
  onStatusChange,
  onProductIdChange,
  onWithoutAnswersChange,
}: QuestionTableProps) {
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
    };
    const labels = {
      pending: "Чакащ",
      approved: "Одобрен",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
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
              Питащ
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Въпрос
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Отговори
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
                placeholder="Търси продукт..."
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
            </td>
            {/* Asker Name */}
            <td className="px-4 py-2">
              <input
                type="text"
                placeholder="Търси име..."
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
            </td>
            {/* Question - Empty */}
            <td className="px-4 py-2"></td>
            {/* Answers Filter */}
            <td className="px-4 py-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={withoutAnswers}
                  onChange={(e) => onWithoutAnswersChange(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Без отговори</span>
              </label>
            </td>
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
              </select>
            </td>
            {/* Date - Empty */}
            <td className="px-4 py-2"></td>
            {/* Actions - Empty */}
            <td className="px-4 py-2"></td>
          </tr>

          {/* Data Rows */}
          {questions.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">Няма намерени въпроси</p>
              </td>
            </tr>
          ) : (
            questions.map((item) => (
              <tr
                key={item.question.id}
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

                {/* Asker */}
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.question.askerName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.question.askerEmail}
                    </p>
                  </div>
                </td>

                {/* Question */}
                <td className="px-4 py-3">
                  <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {item.question.questionText}
                  </p>
                </td>

                {/* Answers */}
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.answers.length}
                      </span>
                    </div>
                    {item.answers.length > 0 && (
                      <div className="space-y-1">
                        {item.answers.slice(0, 2).map((answer) => (
                          <div key={answer.id} className="flex items-center gap-1 text-xs">
                            {answer.isStoreOfficial && (
                              <Badge className="h-3 w-3 text-indigo-600" />
                            )}
                            <span className="text-gray-600 dark:text-gray-400">
                              {answer.answererName}
                            </span>
                            {answer.status === 'pending' && (
                              <span className="text-yellow-600">(чака одобрение)</span>
                            )}
                            {answer.status === 'pending' && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => onApproveAnswer(answer.id)}
                                  className="text-green-600 hover:text-green-700"
                                  title="Одобри отговор"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => onDeleteAnswer(answer.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Изтрий отговор"
                                >
                                  <XCircle className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        {item.answers.length > 2 && (
                          <p className="text-xs text-gray-500">+{item.answers.length - 2} още</p>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {getStatusBadge(item.question.status)}
                </td>

                {/* Date */}
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(item.question.createdAt)}
                  </p>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {item.question.status === 'pending' && (
                      <button
                        onClick={() => onApproveQuestion(item.question.id)}
                        className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                        title="Одобри въпрос"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <Link
                      href={`/modules/product-qa/${item.question.id}`}
                      className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                      title="Отговори"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDeleteQuestion(item.question.id, item.question.questionText)}
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
