"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { productQaService } from "@/lib/services/product-qa.service";
import { productsService } from "@/lib/services/products.service";
import { ArrowLeft, Save } from "lucide-react";

export default function NewQuestionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    askerName: "",
    askerEmail: "",
    questionText: "",
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
    if (!formData.askerName) {
      alert("Моля, въведете име на питащ");
      return;
    }
    if (!formData.askerEmail || !formData.askerEmail.includes('@')) {
      alert("Моля, въведете валиден email");
      return;
    }
    if (formData.questionText.length < 10) {
      alert("Въпросът трябва да е поне 10 символа");
      return;
    }

    try {
      setSaving(true);
      await productQaService.askQuestion(formData);
      alert("Въпросът е създаден успешно!");
      router.push("/modules/product-qa");
    } catch (error) {
      console.error("Error creating question:", error);
      alert("Грешка при създаване на въпрос");
    } finally {
      setSaving(false);
    }
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
          Добави нов въпрос
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Създаване на въпрос от страна на администратор
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

          {/* Asker Name */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Име на питащ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.askerName}
              onChange={(e) => setFormData({ ...formData, askerName: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
            />
          </div>

          {/* Asker Email */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.askerEmail}
              onChange={(e) => setFormData({ ...formData, askerEmail: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              placeholder="За нотификации при отговор"
            />
          </div>

          {/* Question Text */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Въпрос <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              required
              minLength={10}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              placeholder="Минимум 10 символа..."
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.questionText.length} / 10 минимум символа
            </p>
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
                  Създай въпрос
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
