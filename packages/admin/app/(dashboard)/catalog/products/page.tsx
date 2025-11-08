"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { productsService, Product } from "@/lib/services/products.service";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "archived">("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Inline table filters
  const [nameFilter, setNameFilter] = useState("");
  const [skuFilter, setSkuFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFromFilter, setPriceFromFilter] = useState("");
  const [priceToFilter, setPriceToFilter] = useState("");
  const [quantityFromFilter, setQuantityFromFilter] = useState("");
  const [quantityToFilter, setQuantityToFilter] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await productsService.getProducts(params);
      setProducts(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${name}"?`)) {
      return;
    }

    try {
      await productsService.deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Грешка при изтриване на продукта");
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: "all" | "active" | "inactive" | "archived") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Name filter
      if (nameFilter && !product.name.toLowerCase().includes(nameFilter.toLowerCase())) {
        return false;
      }

      // SKU filter
      if (skuFilter && !product.sku.toLowerCase().includes(skuFilter.toLowerCase())) {
        return false;
      }

      // Category filter
      if (categoryFilter && (!product.primaryCategory || !product.primaryCategory.name.toLowerCase().includes(categoryFilter.toLowerCase()))) {
        return false;
      }

      // Price filters
      if (priceFromFilter && product.currentPrice && product.currentPrice.price < parseFloat(priceFromFilter)) {
        return false;
      }
      if (priceToFilter && product.currentPrice && product.currentPrice.price > parseFloat(priceToFilter)) {
        return false;
      }

      // Quantity filters
      if (quantityFromFilter && product.totalInventory < parseInt(quantityFromFilter)) {
        return false;
      }
      if (quantityToFilter && product.totalInventory > parseInt(quantityToFilter)) {
        return false;
      }

      return true;
    });
  }, [products, nameFilter, skuFilter, categoryFilter, priceFromFilter, priceToFilter, quantityFromFilter, quantityToFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleBulkActivate = async () => {
    if (selectedProducts.length === 0) return;

    try {
      await Promise.all(
        selectedProducts.map((id) =>
          productsService.updateProduct(id, { status: "active" })
        )
      );
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error("Error activating products:", error);
      alert("Грешка при активиране на продуктите");
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedProducts.length === 0) return;

    try {
      await Promise.all(
        selectedProducts.map((id) =>
          productsService.updateProduct(id, { status: "inactive" })
        )
      );
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error("Error deactivating products:", error);
      alert("Грешка при деактивиране на продуктите");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (!confirm(`Сигурни ли сте, че искате да изтриете ${selectedProducts.length} продукта?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map((id) => productsService.deleteProduct(id))
      );
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting products:", error);
      alert("Грешка при изтриване на продуктите");
    }
  };

  const handleBulkDuplicate = async () => {
    if (selectedProducts.length === 0) return;

    try {
      // TODO: Implement duplicate functionality in backend
      alert("Функцията за дублиране ще бъде имплементирана скоро");
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error duplicating products:", error);
      alert("Грешка при дублиране на продуктите");
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
            Продукти
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Управление на продуктите
          </p>
        </div>
        <Link
          href="/catalog/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-center font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Добави продукт
        </Link>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Filters */}
        <ProductFilters
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilter}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
        />

        {/* Bulk Actions Bar */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center justify-between border-b border-gray-200 bg-brand-50 px-6 py-3 dark:border-white/[0.05] dark:bg-brand-500/10">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Избрани {selectedProducts.length} продукта
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkActivate}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Активиране
                </button>
                <button
                  onClick={handleBulkDeactivate}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Деактивиране
                </button>
                <button
                  onClick={handleBulkDuplicate}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Дублиране
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="rounded-lg border border-error-300 bg-white px-3 py-1.5 text-sm font-medium text-error-700 hover:bg-error-50 dark:border-error-700 dark:bg-gray-800 dark:text-error-400 dark:hover:bg-error-500/10"
                >
                  Изтриване
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedProducts([])}
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Отказ
            </button>
          </div>
        )}

        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <ProductTable
            products={filteredProducts}
            loading={loading}
            onDelete={handleDelete}
            selectedProducts={selectedProducts}
            onSelectAll={handleSelectAll}
            onSelectProduct={handleSelectProduct}
            filters={{
              name: nameFilter,
              sku: skuFilter,
              category: categoryFilter,
              priceFrom: priceFromFilter,
              priceTo: priceToFilter,
              quantityFrom: quantityFromFilter,
              quantityTo: quantityToFilter,
              status: statusFilter,
            }}
            onFiltersChange={{
              onNameChange: setNameFilter,
              onSkuChange: setSkuFilter,
              onCategoryChange: setCategoryFilter,
              onPriceFromChange: setPriceFromFilter,
              onPriceToChange: setPriceToFilter,
              onQuantityFromChange: setQuantityFromFilter,
              onQuantityToChange: setQuantityToFilter,
              onStatusChange: setStatusFilter,
            }}
          />
        </div>

        {/* Pagination */}
        {!loading && filteredProducts.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 dark:border-white/[0.05]">
            <div className="flex flex-col items-center justify-between gap-4 xl:flex-row">
              {/* Results Info */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Показани {startIndex + 1} до {endIndex} от {totalItems} записа
                </p>
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  Назад
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-brand-500 text-white dark:bg-brand-600"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  Напред
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
