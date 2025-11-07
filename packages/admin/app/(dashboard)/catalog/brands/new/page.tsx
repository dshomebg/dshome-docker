import BrandForm from "@/components/brands/BrandForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewBrandPage() {
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
          Create New Brand
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add a new brand to your catalog
        </p>
      </div>

      {/* Form */}
      <BrandForm mode="create" />
    </div>
  );
}
