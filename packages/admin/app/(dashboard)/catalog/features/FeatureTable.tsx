import Link from "next/link";
import { FeatureGroup } from "@/lib/services/features.service";

interface FeatureTableProps {
  features: FeatureGroup[];
  loading: boolean;
  onDelete: (id: string, name: string) => void;
}

export default function FeatureTable({
  features,
  loading,
  onDelete,
}: FeatureTableProps) {
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <svg
          className="mb-4 h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">No features found</p>
      </div>
    );
  }

  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-white/[0.05] dark:bg-white/[0.02]">
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Name
          </th>
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Status
          </th>
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Values
          </th>
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Created
          </th>
          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
        {features.map((feature) => (
          <tr
            key={feature.id}
            className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
          >
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {feature.name}
              </div>
            </td>
            <td className="px-6 py-4">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  feature.status === "active"
                    ? "bg-success-100 text-success-800 dark:bg-success-500/10 dark:text-success-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400"
                }`}
              >
                {feature.status}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {feature.values?.length || 0} values
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(feature.createdAt).toLocaleDateString()}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <Link
                  href={`/catalog/features/${feature.id}`}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(feature.id, feature.name)}
                  className="text-sm font-medium text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
