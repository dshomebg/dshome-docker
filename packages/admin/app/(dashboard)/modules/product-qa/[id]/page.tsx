"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { productQaService, QuestionWithProduct, ProductAnswer } from "@/lib/services/product-qa.service";
import { ArrowLeft, Save, CheckCircle, Trash2 } from "lucide-react";

export default function QuestionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionWithProduct | null>(null);
  const [formData, setFormData] = useState({
    answerText: "",
    answererName: "",
    answererEmail: "",
    isStoreOfficial: true,
  });

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await productQaService.getQuestion(questionId);
      setQuestionData(response.data);
    } catch (error) {
      console.error("Error fetching question:", error);
      alert("Грешка при зареждане на въпрос");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.answererName) {
      alert("Моля, въведете име на отговарящ");
      return;
    }
    if (formData.answerText.length < 10) {
      alert("Отговорът трябва да е поне 10 символа");
      return;
    }

    try {
      setSaving(true);
      await productQaService.addAnswer(questionId, formData);
      alert("Отговорът е добавен успешно!");
      setFormData({
        answerText: "",
        answererName: "",
        answererEmail: "",
        isStoreOfficial: true,
      });
      fetchQuestion();
    } catch (error) {
      console.error("Error adding answer:", error);
      alert("Грешка при добавяне на отговор");
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAnswer = async (answerId: string) => {
    try {
      await productQaService.approveAnswer(answerId);
      fetchQuestion();
    } catch (error) {
      console.error("Error approving answer:", error);
      alert("Неуспешно одобряване на отговор");
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този отговор?")) {
      return;
    }

    try {
      await productQaService.deleteAnswer(answerId);
      fetchQuestion();
    } catch (error) {
      console.error("Error deleting answer:", error);
      alert("Неуспешно изтриване на отговор");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!questionData) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-red-600">Въпросът не е намерен</p>
      </div>
    );
  }

  const { question, product, answers } = questionData;

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Детайли на въпрос
        </h1>
      </div>

      {/* Question Details */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {question.questionText}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              За продукт: <span className="font-medium text-gray-700 dark:text-gray-300">{product?.name}</span>
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              question.status === "approved"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {question.status === "approved" ? "Одобрен" : "Чакащ"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 dark:border-white/[0.05]">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Питащ</p>
            <p className="font-medium text-gray-900 dark:text-white">{question.askerName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{question.askerEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Дата</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(question.createdAt).toLocaleDateString("bg-BG")}
            </p>
          </div>
        </div>
      </div>

      {/* Answers List */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Отговори ({answers.length})
        </h3>

        {answers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Все още няма отговори на този въпрос.</p>
        ) : (
          <div className="space-y-4">
            {answers.map((answer) => (
              <div
                key={answer.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {answer.answererName}
                    </p>
                    {answer.isStoreOfficial && (
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                        Официален отговор
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        answer.status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {answer.status === "approved" ? "Одобрен" : "Чакащ"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {answer.status === "pending" && (
                      <button
                        onClick={() => handleApproveAnswer(answer.id)}
                        className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Одобри
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAnswer(answer.id)}
                      className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Изтрий
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{answer.answerText}</p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(answer.createdAt).toLocaleDateString("bg-BG")} в{" "}
                  {new Date(answer.createdAt).toLocaleTimeString("bg-BG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Answer Form */}
      <form onSubmit={handleSubmitAnswer} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Добави отговор
        </h3>

        {/* Answerer Name */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Име на отговарящ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.answererName}
            onChange={(e) => setFormData({ ...formData, answererName: e.target.value })}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
          />
        </div>

        {/* Answerer Email */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Email (опционално)
          </label>
          <input
            type="email"
            value={formData.answererEmail}
            onChange={(e) => setFormData({ ...formData, answererEmail: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
          />
        </div>

        {/* Answer Text */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Отговор <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.answerText}
            onChange={(e) => setFormData({ ...formData, answerText: e.target.value })}
            required
            minLength={10}
            rows={4}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
            placeholder="Минимум 10 символа..."
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.answerText.length} / 10 минимум символа
          </p>
        </div>

        {/* Store Official Checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.isStoreOfficial}
              onChange={(e) =>
                setFormData({ ...formData, isStoreOfficial: e.target.checked })
              }
              className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                Официален отговор от магазина
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Отговорът ще бъде маркиран като официален и автоматично одобрен
              </span>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-white/[0.05]">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.08]"
          >
            Отказ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Запазване...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Добави отговор
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
