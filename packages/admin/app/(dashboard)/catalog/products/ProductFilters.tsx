interface ProductFiltersProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  statusFilter: "all" | "active" | "inactive" | "draft" | "archived";
  onStatusFilterChange: (status: "all" | "active" | "inactive" | "draft" | "archived") => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function ProductFilters({
  itemsPerPage,
  onItemsPerPageChange,
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 p-6 xl:flex-row xl:items-center xl:justify-between dark:border-white/[0.05]">
      {/* Left side - Items per page */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Покажи:
        </label>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-gray-600 dark:text-gray-400">записа</span>
      </div>

      {/* Right side - Filters */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Статус:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="all">Всички</option>
            <option value="active">Активни</option>
            <option value="draft">Чернови</option>
            <option value="inactive">Неактивни</option>
            <option value="archived">Архивирани</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Търси продукт..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:placeholder:text-gray-600 xl:w-64"
          />
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
