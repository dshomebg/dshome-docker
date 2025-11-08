import ProductForm from "@/components/products/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewProductPage() {
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
      <ProductForm mode="create" />
    </div>
  );
}
