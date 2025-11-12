"use client";

import { Search } from "lucide-react";

interface CustomerFiltersProps {
  search: string;
  isRegistered: string;
  isActive: string;
  onSearchChange: (value: string) => void;
  onIsRegisteredChange: (value: string) => void;
  onIsActiveChange: (value: string) => void;
}

export default function CustomerFilters({
  search,
  isRegistered,
  isActive,
  onSearchChange,
  onIsRegisteredChange,
  onIsActiveChange,
}: CustomerFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Търси по име, имейл, телефон или фирма..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white dark:placeholder-gray-500"
        />
      </div>

      {/* Registration Filter */}
      <select
        value={isRegistered}
        onChange={(e) => onIsRegisteredChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
      >
        <option value="">Всички регистрации</option>
        <option value="true">Регистрирани</option>
        <option value="false">Гости</option>
      </select>

      {/* Active Filter */}
      <select
        value={isActive}
        onChange={(e) => onIsActiveChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
      >
        <option value="">Всички статуси</option>
        <option value="true">Активни</option>
        <option value="false">Неактивни</option>
      </select>
    </div>
  );
}
