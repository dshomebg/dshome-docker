"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import OrderStatusForm from "../OrderStatusForm";

export default function NewOrderStatusPage() {
  return (
    <div className="p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/sales/order-statuses"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад към Статуси
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          Добави статус
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Създайте нов статус на поръчка
        </p>
      </div>

      {/* Form */}
      <OrderStatusForm mode="create" />
    </div>
  );
}
