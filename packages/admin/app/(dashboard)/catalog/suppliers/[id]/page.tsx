"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { suppliersService, Supplier } from "@/lib/services/suppliers.service";

export default function EditSupplierPage() {
  const params = useParams();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const response = await suppliersService.getSupplier(params.id as string);
        setSupplier(response.data);
      } catch (err: any) {
        console.error("Error fetching supplier:", err);
        setError("Failed to load supplier");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSupplier();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg bg-error-50 p-4 text-error-700 dark:bg-error-500/10 dark:text-error-400">
          {error || "Supplier not found"}
        </div>
      </div>
    );
  }

  return <SupplierForm supplier={supplier} mode="edit" />;
}
