"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProductForm from "@/components/products/ProductForm";
import { productsService } from "@/lib/services/products.service";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsService.getProduct(productId);
      setProduct(response.data);
    } catch (err: any) {
      console.error("Error fetching product:", err);
      setError(err.response?.data?.message || "Грешка при зареждане на продукта");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <Link
            href="/catalog/products"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад към продукти
          </Link>
        </div>
        <div className="rounded-lg border border-error-200 bg-error-50 p-6 dark:border-error-800 dark:bg-error-900/20">
          <h2 className="mb-2 text-lg font-semibold text-error-800 dark:text-error-400">
            Грешка при зареждане
          </h2>
          <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 p-4 md:p-6">
        <Link
          href="/catalog/products"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад към продукти
        </Link>
      </div>

      {/* Form */}
      {product && <ProductForm mode="edit" product={product} />}
    </div>
  );
}
