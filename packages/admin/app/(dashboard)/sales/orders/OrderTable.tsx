"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Order } from "@/lib/services/orders.service";
import { orderStatusesService } from "@/lib/services/order-statuses.service";
import { couriersService } from "@/lib/services/couriers.service";
import { Calendar, Package, Eye, Trash2 } from "lucide-react";

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onDelete: (id: string, orderNumber: string) => void;
  onStatusChange: (id: string, status: string) => void;
  search: string;
  status: string;
  courierId: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (value: string) => void;
  onStatusChange2: (value: string) => void;
  onCourierChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export default function OrderTable({
  orders,
  loading,
  onDelete,
  onStatusChange,
  search,
  status,
  courierId,
  dateFrom,
  dateTo,
  onSearchChange,
  onStatusChange2,
  onCourierChange,
  onDateFromChange,
  onDateToChange,
}: OrderTableProps) {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch order statuses and couriers for filters
    orderStatusesService.getOrderStatuses().then((response) => {
      setStatuses(response.data);
    }).catch((error) => {
      console.error("Error fetching order statuses:", error);
    });

    couriersService.getCouriers().then((response) => {
      setCouriers(response.data);
    }).catch((error) => {
      console.error("Error fetching couriers:", error);
    });
  }, []);

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

  const getStatusStyle = (statusName: string) => {
    const status = statuses.find(s => s.name === statusName);
    if (status && status.bgColor && status.textColor) {
      return {
        backgroundColor: status.bgColor,
        color: status.textColor
      };
    }
    // Fallback colors if not found
    return {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    };
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
              Номер поръчка
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Клиент
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Куриер
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Име на продукт
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Реф. номер
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Общо
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
            {/* Search - Order Number */}
            <td className="px-4 py-2">
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Търси..."
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
            </td>
            {/* Search - Client */}
            <td className="px-4 py-2">
              <input
                type="text"
                placeholder="Търси..."
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
            </td>
            {/* Select - Courier */}
            <td className="px-4 py-2">
              <select
                value={courierId}
                onChange={(e) => onCourierChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              >
                <option value="">Търси...</option>
                {couriers.map((courier) => (
                  <option key={courier.id} value={courier.id}>
                    {courier.name}
                  </option>
                ))}
              </select>
            </td>
            {/* Search - Product Name */}
            <td className="px-4 py-2">
              <input
                type="text"
                placeholder="Търси..."
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
            </td>
            {/* Search - Ref Number */}
            <td className="px-4 py-2">
              <input
                type="text"
                placeholder="Търси..."
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
            </td>
            {/* Total Range - От/До */}
            <td className="px-4 py-2">
              <div className="flex flex-col gap-1">
                <input
                  type="number"
                  placeholder="От"
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                />
                <input
                  type="number"
                  placeholder="До"
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                />
              </div>
            </td>
            {/* Status Select */}
            <td className="px-4 py-2">
              <select
                value={status}
                onChange={(e) => onStatusChange2(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              >
                <option value="">Всички</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </td>
            {/* Date Range */}
            <td className="px-4 py-2">
              <div className="flex flex-col gap-1">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  placeholder="От"
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  placeholder="До"
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                />
              </div>
            </td>
            {/* Actions - Empty filter cell */}
            <td className="px-4 py-2"></td>
          </tr>

          {/* Data Rows */}
          {orders.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">Няма намерени поръчки</p>
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-200 hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
              >
                {/* Order Number */}
                <td className="px-4 py-3">
                  <Link
                    href={`/sales/orders/${order.id}`}
                    className="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                  >
                    {order.orderNumber}
                  </Link>
                </td>

                {/* Customer */}
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.customerFirstName && order.customerLastName
                        ? `${order.customerFirstName} ${order.customerLastName}`
                        : order.customerEmail}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.customerPhone}
                    </p>
                  </div>
                </td>

                {/* Courier */}
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.courierName || "—"}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.trackingNumber}
                      </p>
                    )}
                  </div>
                </td>

                {/* Product Name */}
                <td className="px-4 py-3">
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-0.5">
                      {order.items.slice(0, 2).map((item, index) => (
                        <p key={item.id} className="text-sm text-gray-900 dark:text-white">
                          {item.quantity > 1 && `${item.quantity}x `}{item.productName}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-gray-500">+{order.items.length - 2} още</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">—</p>
                  )}
                </td>

                {/* Reference Number */}
                <td className="px-4 py-3">
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-0.5">
                      {order.items.slice(0, 2).map((item) => (
                        <p key={item.id} className="text-sm text-gray-600 dark:text-gray-400">
                          {item.quantity > 1 && `${item.quantity}x`}{item.productSku || item.referenceNumber || "—"}
                        </p>
                      ))}
                      {order.items.length > 2 && <p className="text-xs">&nbsp;</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">—</p>
                  )}
                </td>

                {/* Total */}
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {parseFloat(order.total).toFixed(2)} €
                  </p>
                </td>

                {/* Status Dropdown */}
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    style={getStatusStyle(order.status)}
                    className="w-full rounded-full px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Date */}
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.createdAt ? formatDate(order.createdAt) : '—'}
                  </p>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/sales/orders/${order.id}`}
                      className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                      title="Преглед"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(order.id, order.orderNumber)}
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
