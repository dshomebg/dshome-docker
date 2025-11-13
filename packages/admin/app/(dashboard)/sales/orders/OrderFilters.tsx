"use client";

import { useEffect, useState } from "react";
import { Search, Calendar } from "lucide-react";
import { couriersService } from "@/lib/services/couriers.service";
import { orderStatusesService } from "@/lib/services/order-statuses.service";

interface OrderFiltersProps {
  search: string;
  status: string;
  courierId: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCourierChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export default function OrderFilters({
  search,
  status,
  courierId,
  dateFrom,
  dateTo,
  onSearchChange,
  onStatusChange,
  onCourierChange,
  onDateFromChange,
  onDateToChange,
}: OrderFiltersProps) {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);

  useEffect(() => {
    // Fetch couriers
    couriersService.getCouriers().then((response) => {
      setCouriers(response.data);
    }).catch((error) => {
      console.error("Error fetching couriers:", error);
    });

    // Fetch order statuses
    orderStatusesService.getOrderStatuses().then((response) => {
      setStatuses(response.data);
    }).catch((error) => {
      console.error("Error fetching order statuses:", error);
    });
  }, []);

  return (
    <div className="mb-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Търси по номер на поръчка, клиент, имейл или телефон..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white dark:placeholder-gray-500"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
        >
          <option value="">Всички статуси</option>
          {statuses.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Courier Filter */}
        <select
          value={courierId}
          onChange={(e) => onCourierChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
        >
          <option value="">Всички куриери</option>
          {couriers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Date From */}
        <div className="relative flex-1">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
            placeholder="От дата"
          />
        </div>

        {/* Date To */}
        <div className="relative flex-1">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
            placeholder="До дата"
          />
        </div>
      </div>
    </div>
  );
}
