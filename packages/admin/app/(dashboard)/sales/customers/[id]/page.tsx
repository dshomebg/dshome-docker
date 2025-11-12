"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CustomerForm from "../CustomerForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { customersService, Customer } from "@/lib/services/customers.service";

export default function EditCustomerPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customerId = params.id as string;

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const response = await customersService.getCustomer(customerId);
        setCustomer(response.data);
      } catch (err: any) {
        console.error("Error fetching customer:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Неуспешно зареждане на клиент"
        );
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Зареждане на клиент...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-500/10">
          <p className="text-red-700 dark:text-red-400">
            {error || "Клиентът не е намерен"}
          </p>
          <Link
            href="/sales/customers"
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад към клиенти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/sales/customers"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад към клиенти
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          Редакция: {customer.firstName} {customer.lastName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Редактирайте информацията за клиента
        </p>
      </div>

      {/* Form */}
      <CustomerForm mode="edit" customer={customer} />
    </div>
  );
}
