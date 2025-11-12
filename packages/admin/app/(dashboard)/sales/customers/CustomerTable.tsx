import Link from "next/link";
import { Customer } from "@/lib/services/customers.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Mail, Phone, MapPin, Building } from "lucide-react";

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  onDelete: (id: string, name: string) => void;
}

export default function CustomerTable({
  customers,
  loading,
  onDelete,
}: CustomerTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Няма намерени клиенти</p>
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
              Клиент
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Контакти
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Адрес
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Регистрация
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Статус
            </p>
          </TableCell>
          <TableCell isHeader className="px-6 py-3 text-right">
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Действия
            </p>
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow
            key={customer.id}
            className="border-t border-gray-200 hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
          >
            {/* Customer Name & Company */}
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <Link
                    href={`/sales/customers/${customer.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                  >
                    {customer.firstName} {customer.lastName}
                  </Link>
                  {customer.companyName && (
                    <div className="flex items-center gap-1 mt-1">
                      <Building className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {customer.companyName}
                      </p>
                    </div>
                  )}
                  {customer.vatNumber && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      ДДС: {customer.vatNumber}
                    </p>
                  )}
                </div>
              </div>
            </TableCell>

            {/* Contacts */}
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    {customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    {customer.phone}
                  </a>
                </div>
              </div>
            </TableCell>

            {/* Address */}
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>{customer.address}</p>
                  <p>
                    {customer.city}
                    {customer.postalCode && `, ${customer.postalCode}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {customer.country}
                  </p>
                </div>
              </div>
            </TableCell>

            {/* Registration Status */}
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              {customer.isRegistered ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                  Регистриран
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                  Гост
                </span>
              )}
            </TableCell>

            {/* Active Status */}
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              {customer.isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                  Активен
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400"></span>
                  Неактивен
                </span>
              )}
            </TableCell>

            {/* Actions */}
            <TableCell className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/sales/customers/${customer.id}`}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.08]"
                >
                  Редакция
                </Link>
                <button
                  onClick={() => onDelete(customer.id, `${customer.firstName} ${customer.lastName}`)}
                  className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 dark:border-red-800 dark:bg-white/[0.03] dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Изтрий
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
