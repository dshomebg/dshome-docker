"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WarehouseForm from "@/components/warehouses/WarehouseForm";
import { warehousesService, Warehouse } from "@/lib/services/warehouses.service";

export default function EditWarehousePage() {
  const params = useParams();
  const id = params.id as string;
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const response = await warehousesService.getWarehouse(id);
        setWarehouse(response.data);
      } catch (err) {
        console.error("Error fetching warehouse:", err);
        setError("Failed to load warehouse");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWarehouse();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading warehouse...
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg bg-error-50 p-4 text-error-700 dark:bg-error-500/10 dark:text-error-400">
          {error || "Warehouse not found"}
        </div>
      </div>
    );
  }

  return <WarehouseForm warehouse={warehouse} mode="edit" />;
}
