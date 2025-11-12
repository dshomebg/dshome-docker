"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { orderStatusesService, OrderStatus } from "@/lib/services/order-statuses.service";
import OrderStatusForm from "../OrderStatusForm";

export default function EditOrderStatusPage() {
  const params = useParams();
  const statusId = params.id as string;
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await orderStatusesService.getOrderStatus(statusId);
        setStatus(response.data);
      } catch (error) {
        console.error("Error fetching order status:", error);
      } finally {
        setLoading(false);
      }
    };

    if (statusId) {
      fetchStatus();
    }
  }, [statusId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Статусът не е намерен
          </p>
        </div>
      </div>
    );
  }

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
          Редактирай статус
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Редактирайте информацията за статуса
        </p>
      </div>

      {/* Form */}
      <OrderStatusForm mode="edit" status={status} />
    </div>
  );
}
