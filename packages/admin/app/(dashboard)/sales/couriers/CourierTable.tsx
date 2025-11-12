"use client";

import Link from "next/link";
import Image from "next/image";
import { Courier } from "@/lib/services/couriers.service";
import { Edit, Trash2, Check, X, Package } from "lucide-react";

interface CourierTableProps {
  couriers: Courier[];
  loading: boolean;
  onDelete: (id: string, name: string) => void;
}

export default function CourierTable({ couriers, loading, onDelete }: CourierTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (couriers.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8 text-center">
        <div>
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">Няма куриери</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Добавете първия куриер, за да започнете
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Куриер
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Доставка до офис
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Палетна доставка
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Статус
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-white/[0.08]">
          {couriers.map((courier) => (
            <tr key={courier.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03]">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {courier.logoUrl && (
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-white/[0.08]">
                      <Image
                        src={courier.logoUrl}
                        alt={courier.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {courier.name}
                    </div>
                    {courier.trackingUrl && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Проследяване активно
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {courier.offersOfficeDelivery ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <Check className="h-3 w-3" />
                    Да
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-white/[0.05] dark:text-gray-400">
                    <X className="h-3 w-3" />
                    Не
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {courier.palletDeliveryEnabled ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    <Check className="h-3 w-3" />
                    Да
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-white/[0.05] dark:text-gray-400">
                    <X className="h-3 w-3" />
                    Не
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {courier.isActive ? (
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    Активен
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
                    Неактивен
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/sales/couriers/${courier.id}`}
                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    title="Редактирай"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(courier.id, courier.name)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    title="Изтрий"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
