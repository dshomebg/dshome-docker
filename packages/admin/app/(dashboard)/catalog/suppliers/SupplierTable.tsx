import Link from "next/link";
import { Supplier } from "@/lib/services/suppliers.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SupplierTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onDelete: (id: string, name: string) => void;
}

export default function SupplierTable({
  suppliers,
  loading,
  onDelete,
}: SupplierTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No suppliers found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="border-t border-gray-200 dark:border-white/[0.05]">
        <TableRow>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Name
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Email
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Phone
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Status
            </p>
          </TableCell>
          <TableCell isHeader className="px-6 py-3 text-right">
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Actions
            </p>
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => (
          <TableRow
            key={supplier.id}
            className="border-t border-gray-200 hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
          >
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <div className="flex flex-col">
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {supplier.name}
                </span>
                {supplier.contactPerson && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {supplier.contactPerson}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              {supplier.email ? (
                <a
                  href={`mailto:${supplier.email}`}
                  className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                >
                  {supplier.email}
                </a>
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </TableCell>
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              {supplier.phone ? (
                <a
                  href={`tel:${supplier.phone}`}
                  className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                >
                  {supplier.phone}
                </a>
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </TableCell>
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    supplier.status === "active"
                      ? "bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"
                  }`}
                >
                  {supplier.status}
                </span>
                {supplier.isDefault && (
                  <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                    Default
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/catalog/suppliers/${supplier.id}`}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-brand-400"
                  title="Edit"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Link>
                <button
                  onClick={() => onDelete(supplier.id, supplier.name)}
                  className="rounded-lg p-2 text-gray-600 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                  title="Delete"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
