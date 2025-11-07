export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Добре дошли в админ панела на DSHome
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards */}
        <div className="rounded-lg bg-white p-6 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">Продукти</div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">0</div>
        </div>

        <div className="rounded-lg bg-white p-6 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">Поръчки</div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">0</div>
        </div>

        <div className="rounded-lg bg-white p-6 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">Клиенти</div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">0</div>
        </div>

        <div className="rounded-lg bg-white p-6 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">Приходи</div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">0 €</div>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-white p-6 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Състояние на системата
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Backend API</span>
            <span className="text-green-600 dark:text-green-400">✓ Работи</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Database</span>
            <span className="text-green-600 dark:text-green-400">✓ Свързана</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Meilisearch</span>
            <span className="text-green-600 dark:text-green-400">✓ Работи</span>
          </div>
        </div>
      </div>
    </div>
  );
}
