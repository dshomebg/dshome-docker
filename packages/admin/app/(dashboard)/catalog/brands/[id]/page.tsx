"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BrandForm from "@/components/brands/BrandForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { brandsService, Brand } from "@/lib/services/brands.service";

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const brandId = params.id as string;

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setLoading(true);
        const response = await brandsService.getBrand(brandId);
        setBrand(response.data);
      } catch (err: any) {
        console.error("Error fetching brand:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load brand"
        );
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading brand...</p>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg bg-error-50 p-6 text-center dark:bg-error-500/10">
          <p className="text-error-700 dark:text-error-400">
            {error || "Brand not found"}
          </p>
          <Link
            href="/catalog/brands"
            className="mt-4 inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Brands
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
          href="/catalog/brands"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Brands
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          Edit Brand: {brand.name}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update brand information
        </p>
      </div>

      {/* Form */}
      <BrandForm mode="edit" brand={brand} />
    </div>
  );
}
