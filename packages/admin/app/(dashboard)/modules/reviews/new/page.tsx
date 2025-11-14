"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { reviewsService } from "@/lib/services/reviews.service";
import { productsService } from "@/lib/services/products.service";
import { ArrowLeft, Save, Star } from "lucide-react";

export default function NewReviewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    reviewerName: "",
    reviewerEmail: "",
    rating: 5,
    title: "",
    content: "",
    isVerifiedPurchase: false,
    images: [] as string[],
  });

  useEffect(() => {
    // Search products when user types
    if (productSearch.length >= 2) {
      productsService.getProducts({ search: productSearch, limit: 20 }).then((response) => {
        setProducts(response.data);
        setShowProductDropdown(true);
      }).catch((error) => {
        console.error("Error loading products:", error);
      });
    } else {
      setProducts([]);
      setShowProductDropdown(false);
    }
  }, [productSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.productId) {
      alert("Моля, изберете продукт");
      return;
    }
    if (!formData.reviewerName) {
      alert("Моля, въведете име на рецензент");
      return;
    }
    if (formData.content.length < 50) {
      alert("Съдържанието трябва да е поне 50 символа");
      return;
    }

    try {
      setSaving(true);
      await reviewsService.createReview(formData);
      alert("Отзивът е създаден успешно!");
      router.push("/modules/reviews");
    } catch (error) {
      console.error("Error creating review:", error);
      alert("Грешка при създаване на отзив");
    } finally {
      setSaving(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= formData.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Добави нов отзив
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Създаване на отзив от страна на администратор
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          {/* Product Search */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Продукт <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setSelectedProduct(null);
                  setFormData({ ...formData, productId: "" });
                }}
                onFocus={() => productSearch.length >= 2 && setShowProductDropdown(true)}
                placeholder="Търсене по име или SKU..."
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
              {showProductDropdown && products.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white/[0.08] dark:bg-gray-800">
                  <ul className="max-h-60 overflow-auto py-1">
                    {products.map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(product);
                            setFormData({ ...formData, productId: product.id });
                            setShowProductDropdown(false);
                            setProductSearch("");
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {selectedProduct && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                ✓ Избран: {selectedProduct.name}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Въведете поне 2 символа за търсене
            </p>
          </div>

          {/* Reviewer Name */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Име на рецензент <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.reviewerName}
              onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
            />
          </div>

          {/* Reviewer Email */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Email (опционално)
            </label>
            <input
              type="email"
              value={formData.reviewerEmail}
              onChange={(e) => setFormData({ ...formData, reviewerEmail: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
            />
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Оценка <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              {renderStars()}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formData.rating} от 5 звезди
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Заглавие (опционално)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Съдържание <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              minLength={50}
              rows={6}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              placeholder="Минимум 50 символа..."
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.content.length} / 50 минимум символа
            </p>
          </div>

          {/* Checkboxes */}
          <div className="mb-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.isVerifiedPurchase}
                onChange={(e) =>
                  setFormData({ ...formData, isVerifiedPurchase: e.target.checked })
                }
                className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  Верифицирана покупка
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Отзивът ще получи badge "Верифицирана покупка" (името винаги се показва)
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-white/[0.05]">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.08]"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Запазване...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Създай отзив
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
