"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { couriersService, Courier } from "@/lib/services/couriers.service";
import CourierTable from "./CourierTable";
import { Truck } from "lucide-react";

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      const response = await couriersService.getCouriers();
      setCouriers(response.data);
    } catch (error) {
      console.error("Error fetching couriers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouriers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${name}"?`)) {
      return;
    }

    try {
      await couriersService.deleteCourier(id);
      fetchCouriers();
    } catch (error) {
      console.error("Error deleting courier:", error);
      alert("Неуспешно изтриване на куриер");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
            Куриери
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Управлявайте куриерите и техните цени за доставка
          </p>
        </div>
        <Link
          href="/sales/couriers/new"
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Truck className="h-4 w-4" />
          Добави куриер
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Всичко куриери</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {couriers.length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Активни</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {couriers.filter((c) => c.isActive).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <CourierTable
          couriers={couriers}
          loading={loading}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
