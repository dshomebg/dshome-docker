import Link from "next/link";
import { Product } from "@/lib/services/products.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onDelete: (id: string, name: string) => void;
  selectedProducts: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectProduct: (productId: string, checked: boolean) => void;
  filters: {
    name: string;
    sku: string;
    category: string;
    priceFrom: string;
    priceTo: string;
    quantityFrom: string;
    quantityTo: string;
    status: "all" | "active" | "inactive" | "archived";
  };
  onFiltersChange: {
    onNameChange: (value: string) => void;
    onSkuChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onPriceFromChange: (value: string) => void;
    onPriceToChange: (value: string) => void;
    onQuantityFromChange: (value: string) => void;
    onQuantityToChange: (value: string) => void;
    onStatusChange: (value: "all" | "active" | "inactive" | "archived") => void;
  };
}

export default function ProductTable({
  products,
  loading,
  onDelete,
  selectedProducts,
  onSelectAll,
  onSelectProduct,
  filters,
  onFiltersChange,
}: ProductTableProps) {
  const allSelected = products.length > 0 && selectedProducts.length === products.length;
  const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
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
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = someSelected;
                }
              }}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
            />
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              ID
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Снимка
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Име
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              SKU
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Категория
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Цена
            </p>
          </TableCell>
          <TableCell
            isHeader
            className="px-6 py-3 border-r border-gray-200 dark:border-white/[0.05]"
          >
            <p className="font-semibold text-gray-700 text-sm dark:text-gray-300">
              Наличност
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

        {/* Filter Row */}
        <TableRow className="bg-gray-50 dark:bg-white/[0.02]">
          {/* Checkbox column - no filter */}
          <TableCell className="px-6 py-2 border-r border-gray-200 dark:border-white/[0.05]">{null}</TableCell>

          {/* ID column - no filter */}
          <TableCell className="px-6 py-2 border-r border-gray-200 dark:border-white/[0.05]">{null}</TableCell>

          {/* Снимка column - no filter */}
          <TableCell className="px-6 py-2 border-r border-gray-200 dark:border-white/[0.05]">{null}</TableCell>

          {/* Име filter */}
          <TableCell className="px-6 py-2 border-r border-gray-200 dark:border-white/[0.05]">
            <input
              type="text"
              placeholder="Търси по име..."
              value={filters.name}
              onChange={(e) => onFiltersChange.onNameChange(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </TableCell>

          {/* SKU filter */}
          <TableCell className="px-6 py-2 border-r border-gray-200 dark:border-white/[0.05]">
            <input
              type="text"
              placeholder="Търси по реф..."
              value={filters.sku}
              onChange={(e) => onFiltersChange.onSkuChange(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </TableCell>

          {/* Категория filter */}
          <TableCell className="px-6 py-2 border-r border-gray-200 dark:border-white/[0.05]">
            <input
              type="text"
              placeholder="Търси по категория..."
              value={filters.category}
              onChange={(e) => onFiltersChange.onCategoryChange(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </TableCell>

          {/* Цена filter (От/До) */}
          <TableCell className="px-6 py-2 border-r border-gray-200 dark:border-white/[0.05]">
            <div className="flex flex-col gap-1">
              <input
                type="number"
                placeholder="От"
                value={filters.priceFrom}
                onChange={(e) => onFiltersChange.onPriceFromChange(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
              <input
                type="number"
                placeholder="До"
                value={filters.priceTo}
                onChange={(e) => onFiltersChange.onPriceToChange(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
            </div>
          </TableCell>

          {/* Наличност filter (От/До) */}
          <TableCell className="px-6 py-2 border-r border-gray-200 dark:border-white/[0.05]">
            <div className="flex flex-col gap-1">
              <input
                type="number"
                placeholder="От"
                value={filters.quantityFrom}
                onChange={(e) => onFiltersChange.onQuantityFromChange(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
              <input
                type="number"
                placeholder="До"
                value={filters.quantityTo}
                onChange={(e) => onFiltersChange.onQuantityToChange(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
            </div>
          </TableCell>

          {/* Статус filter */}
          <TableCell className="px-6 py-2 border-r border-gray-200 dark:border-white/[0.05]">
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange.onStatusChange(e.target.value as any)}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="all">Всички</option>
              <option value="active">Активни</option>
              <option value="inactive">Неактивни</option>
              <option value="archived">Архивирани</option>
            </select>
          </TableCell>

          {/* Действия column - no filter */}
          <TableCell className="px-6 py-2">{null}</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Няма намерени продукти</p>
            </TableCell>
          </TableRow>
        ) : (
          products.map((product, index) => (
            <TableRow
              key={product.id}
              className="border-t border-gray-200 hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
            >
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={(e) => onSelectProduct(product.id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </TableCell>
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {index + 1}
              </span>
            </TableCell>
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              {product.firstImage ? (
                <img
                  src={product.firstImage.thumbnailUrl}
                  alt={product.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                  <span className="text-xs text-gray-400">No img</span>
                </div>
              )}
            </TableCell>
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <span className="font-medium text-gray-800 dark:text-white/90">
                {product.name}
              </span>
            </TableCell>
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.sku}
              </span>
            </TableCell>
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.primaryCategory?.name || '-'}
              </span>
            </TableCell>
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              {product.currentPrice ? (
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {product.currentPrice.price} {product.currentPrice.currency}
                </span>
              ) : (
                <span className="text-sm text-gray-400">-</span>
              )}
            </TableCell>
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <span className={`text-sm font-medium ${product.totalInventory > 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                {product.totalInventory}
              </span>
            </TableCell>
            <TableCell className="px-6 py-4 border-r border-gray-200 dark:border-white/[0.05]">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  product.status === "active"
                    ? "bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"
                }`}
              >
                {product.status === 'active' ? 'Активен' : product.status === 'inactive' ? 'Неактивен' : 'Архивиран'}
              </span>
            </TableCell>
            <TableCell className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/catalog/products/${product.id}`}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-brand-400"
                  title="Редактирай"
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
                  onClick={() => onDelete(product.id, product.name)}
                  className="rounded-lg p-2 text-gray-600 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                  title="Изтрий"
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
          ))
        )}
      </TableBody>
    </Table>
  );
}
