"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { productsService, Product, ProductFormData } from "@/lib/services/products.service";
import { brandsService } from "@/lib/services/brands.service";
import { suppliersService } from "@/lib/services/suppliers.service";
import { categoriesService, Category } from "@/lib/services/categories.service";
import { featuresService } from "@/lib/services/features.service";
import { warehousesService } from "@/lib/services/warehouses.service";
import ImageUpload from "../ui/ImageUpload";
import SeoForm from "../seo/SeoForm";
import { SeoFormData } from "@dshome/shared";

interface ProductFormProps {
  product?: any; // Full product with details
  mode: "create" | "edit";
}

type TabId = "basic" | "prices" | "images" | "combinations" | "associations" | "seo";

interface Tab {
  id: TabId;
  label: string;
  icon?: string;
}

const tabs: Tab[] = [
  { id: "basic", label: "Основна информация" },
  { id: "prices", label: "Цени" },
  { id: "images", label: "Снимки" },
  { id: "combinations", label: "Комбинации" },
  { id: "associations", label: "Асоциации" },
  { id: "seo", label: "SEO" },
];

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [loading, setLoading] = useState(false);

  // Basic Info
  const [sku, setSku] = useState(product?.sku || "");
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || "");
  const [description, setDescription] = useState(product?.description || "");
  const [productType, setProductType] = useState<"simple" | "combination">(product?.productType || "simple");
  const [weight, setWeight] = useState(product?.weight || "");
  const [width, setWidth] = useState(product?.width || "");
  const [height, setHeight] = useState(product?.height || "");
  const [depth, setDepth] = useState(product?.depth || "");
  const [status, setStatus] = useState<"active" | "inactive" | "draft" | "archived">(product?.status || "draft");

  // Prices
  const [price, setPrice] = useState(product?.currentPrice?.price || "");
  const [compareAtPrice, setCompareAtPrice] = useState(product?.currentPrice?.compareAtPrice || "");

  // Images
  const [images, setImages] = useState<Array<{ url: string; position: number; isPrimary: boolean }>>(product?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Associations
  const [brandId, setBrandId] = useState(product?.brandId || "");
  const [supplierId, setSupplierId] = useState(product?.supplierId || "");
  const [selectedCategories, setSelectedCategories] = useState<Array<{ categoryId: string; isPrimary: boolean }>>(
    product?.categories?.map((c: any) => ({ categoryId: c.categoryId, isPrimary: c.isPrimary })) || []
  );

  // Features
  const [selectedFeatures, setSelectedFeatures] = useState<Array<{ featureValueId: string }>>(
    product?.features?.map((f: any) => ({ featureValueId: f.featureValueId })) || []
  );

  // Inventory
  const [inventoryData, setInventoryData] = useState<Array<{ warehouseId: string; quantity: number }>>(
    product?.inventory?.map((inv: any) => ({ warehouseId: inv.warehouseId, quantity: inv.quantity })) || []
  );

  // SEO data
  const [seoData, setSeoData] = useState<SeoFormData>({
    metaTitle: product?.metaTitle || "",
    metaDescription: product?.metaDescription || "",
    metaKeywords: product?.metaKeywords || "",
    ogTitle: product?.ogTitle || "",
    ogDescription: product?.ogDescription || "",
    ogImage: product?.ogImage || "",
    canonicalUrl: product?.canonicalUrl || "",
    robotsIndex: product?.robotsIndex !== false,
    robotsFollow: product?.robotsFollow !== false,
  });

  // Reference data
  const [brands, setBrands] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featureGroups, setFeatureGroups] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (mode === "create" && name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      setSlug(generatedSlug);
    }
  }, [name, mode, slug]);

  const fetchReferenceData = async () => {
    try {
      const [brandsRes, suppliersRes, categoriesRes, featuresRes, warehousesRes] = await Promise.all([
        brandsService.getBrands({ limit: 1000 }),
        suppliersService.getSuppliers({ limit: 1000 }),
        categoriesService.getCategoryTree(),
        featuresService.getFeatureGroups({ limit: 1000, status: 'active' }),
        warehousesService.getWarehouses({ limit: 1000, status: 'active' }),
      ]);
      setBrands(brandsRes.data);
      setSuppliers(suppliersRes.data);
      setCategories(categoriesRes.data);
      setFeatureGroups(featuresRes.data);
      setWarehouses(warehousesRes.data);
    } catch (error) {
      console.error("Error fetching reference data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!sku.trim() || !name.trim() || !slug.trim()) {
      alert("SKU, име и slug са задължителни");
      return;
    }

    if (!price || parseFloat(price) < 0) {
      alert("Моля въведете валидна цена");
      return;
    }

    if (selectedCategories.length === 0) {
      alert("Моля изберете поне една категория");
      return;
    }

    const primaryCategories = selectedCategories.filter(c => c.isPrimary);
    if (primaryCategories.length !== 1) {
      alert("Трябва да има точно една основна категория");
      return;
    }

    try {
      setLoading(true);

      const data: ProductFormData = {
        sku,
        name,
        slug,
        shortDescription: shortDescription || undefined,
        description: description || undefined,
        productType,
        brandId: brandId || undefined,
        supplierId: supplierId || undefined,
        categories: selectedCategories,
        weight: weight ? parseFloat(weight) : undefined,
        width: width ? parseFloat(width) : undefined,
        height: height ? parseFloat(height) : undefined,
        depth: depth ? parseFloat(depth) : undefined,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        status,
        metaTitle: seoData.metaTitle || undefined,
        metaDescription: seoData.metaDescription || undefined,
        metaKeywords: seoData.metaKeywords || undefined,
        ogTitle: seoData.ogTitle || undefined,
        ogDescription: seoData.ogDescription || undefined,
        ogImage: seoData.ogImage || undefined,
        canonicalUrl: seoData.canonicalUrl || undefined,
        robotsIndex: seoData.robotsIndex,
        robotsFollow: seoData.robotsFollow,
      };

      if (mode === "create") {
        const response = await productsService.createProduct(data);
        alert("Продуктът е създаден успешно");
        router.push(`/catalog/products/${response.data.id}`);
      } else if (mode === "edit" && product) {
        await productsService.updateProduct(product.id, data);
        alert("Продуктът е актуализиран успешно");
        router.push("/catalog/products");
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert(error.response?.data?.message || "Грешка при записване на продукта");
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;

    const newPosition = images.length;
    const isPrimary = images.length === 0; // First image is primary by default

    setImages([...images, { url: newImageUrl, position: newPosition, isPrimary }]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Reorder positions
    setImages(newImages.map((img, i) => ({ ...img, position: i })));
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  SKU <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="напр. PROD-001"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Тип продукт
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as "simple" | "combination")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="simple">Прост продукт</option>
                  <option value="combination">Продукт с комбинации</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Име <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="напр. Смарт часовник"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="напр. smart-watch"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL-friendly версия на името
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Кратко описание
              </label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Кратко описание..."
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Пълно описание на продукта..."
                rows={6}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Можете да интегрирате WYSIWYG редактор тук
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Физически характеристики
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Тегло (kg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.000"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ширина (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Височина (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Дълбочина (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="draft">Чернова</option>
                <option value="active">Активен</option>
                <option value="inactive">Неактивен</option>
                <option value="archived">Архивиран</option>
              </select>
            </div>
          </div>
        );

      case "prices":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Цена <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                    EUR
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Цена за сравнение
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                    EUR
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Използва се за показване на отстъпка
                </p>
              </div>
            </div>

            {productType === "simple" && (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-500/10">
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  <strong>Забележка:</strong> Това са цените за простия продукт. За продукти с комбинации, цените се задават за всяка комбинация отделно.
                </p>
              </div>
            )}
          </div>
        );

      case "images":
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Добави снимка
              </label>
              <div className="flex gap-3">
                <ImageUpload
                  value={newImageUrl}
                  onChange={setNewImageUrl}
                  onRemove={() => setNewImageUrl("")}
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={!newImageUrl}
                  className="self-start rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
                >
                  Добави
                </button>
              </div>
            </div>

            {images.length > 0 && (
              <div>
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                  Снимки на продукта ({images.length})
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-700"
                    >
                      <img
                        src={image.url}
                        alt={`Product image ${index + 1}`}
                        className="h-40 w-full object-cover"
                      />
                      {image.isPrimary && (
                        <div className="absolute left-2 top-2 rounded bg-brand-500 px-2 py-1 text-xs font-medium text-white">
                          Главна
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        {!image.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(index)}
                            className="rounded bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100"
                          >
                            Задай главна
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="rounded bg-error-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-error-600"
                        >
                          Изтрий
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Няма добавени снимки. Добавете поне една снимка за продукта.
                </p>
              </div>
            )}
          </div>
        );

      case "combinations":
        return (
          <div className="space-y-6">
            {productType === "simple" ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
                <svg
                  className="mx-auto mb-4 h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
                  Комбинациите не са налични
                </h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Този продукт е от тип &quot;Прост продукт&quot;. За да използвате комбинации (варианти като размер, цвят и т.н.), променете типа на продукта на &quot;Продукт с комбинации&quot; в раздел &quot;Основна информация&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setProductType("combination");
                    setActiveTab("basic");
                  }}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700"
                >
                  Промени на продукт с комбинации
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-500/10">
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <h4 className="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
                        Управление на комбинации
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-400">
                        Комбинациите позволяват да създадете варианти на продукта (напр. различни размери, цветове).
                        Всяка комбинация има собствен SKU, цена и наличност.
                      </p>
                      <p className="mt-2 text-sm text-blue-800 dark:text-blue-400">
                        <strong>Важно:</strong> Първо запазете основната информация на продукта, след което можете да управлявате комбинациите от страницата за редакция.
                      </p>
                    </div>
                  </div>
                </div>

                {mode === "edit" ? (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
                    <svg
                      className="mx-auto mb-4 h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
                      Управлението на комбинации ще бъде достъпно скоро
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Функционалността за създаване и редакция на комбинации е в процес на разработка.
                      <br />
                      Ще можете да създавате комбинации базирани на атрибути (размер, цвят и др.) и да управлявате
                      техните цени и наличности.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700/50 dark:bg-yellow-500/10">
                    <div className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-yellow-800 dark:text-yellow-400">
                        Първо запазете продукта, след което можете да добавите комбинации от страницата за редакция.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "associations":
        return (
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Категории <span className="text-error-500">*</span>
              </label>
              <div className="space-y-3">
                {categories.length > 0 ? (
                  categories.map((category) => {
                    const isSelected = selectedCategories.some(c => c.categoryId === category.id);
                    const isPrimary = selectedCategories.find(c => c.categoryId === category.id)?.isPrimary || false;

                    return (
                      <div key={category.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([
                                ...selectedCategories,
                                { categoryId: category.id, isPrimary: selectedCategories.length === 0 }
                              ]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c.categoryId !== category.id));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label className="flex-1 text-sm text-gray-800 dark:text-white/90">
                          {category.name}
                        </label>
                        {isSelected && (
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="primaryCategory"
                              checked={isPrimary}
                              onChange={() => {
                                setSelectedCategories(
                                  selectedCategories.map(c => ({
                                    ...c,
                                    isPrimary: c.categoryId === category.id
                                  }))
                                );
                              }}
                              className="h-4 w-4"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Главна</span>
                          </label>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Няма налични категории</p>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Изберете поне една категория. Точно една трябва да бъде маркирана като главна.
              </p>
            </div>

            {/* Brand */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Марка
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Без марка</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Доставчик
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Без доставчик</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Features */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Характеристики
              </label>
              <div className="space-y-4">
                {featureGroups.length > 0 ? (
                  featureGroups.map((group) => (
                    <div key={group.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {group.name}
                      </h4>
                      {group.values && group.values.length > 0 ? (
                        <div className="space-y-2">
                          {group.values.map((value: any) => {
                            const isSelected = selectedFeatures.some(f => f.featureValueId === value.id);
                            return (
                              <label key={value.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedFeatures([...selectedFeatures, { featureValueId: value.id }]);
                                    } else {
                                      setSelectedFeatures(selectedFeatures.filter(f => f.featureValueId !== value.id));
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-800 dark:text-white/90">{value.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Няма стойности</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Няма налични характеристики
                  </p>
                )}
              </div>
            </div>

            {/* Inventory - Only for simple products */}
            {productType === "simple" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Наличности по складове
                </label>
                <div className="space-y-3">
                  {warehouses.length > 0 ? (
                    warehouses.map((warehouse) => {
                      const inventoryItem = inventoryData.find(inv => inv.warehouseId === warehouse.id);
                      return (
                        <div key={warehouse.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                          <label className="flex-1 text-sm text-gray-800 dark:text-white/90">
                            {warehouse.name}
                          </label>
                          <div className="w-32">
                            <input
                              type="number"
                              min="0"
                              value={inventoryItem?.quantity || 0}
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 0;
                                const existing = inventoryData.find(inv => inv.warehouseId === warehouse.id);
                                if (existing) {
                                  setInventoryData(
                                    inventoryData.map(inv =>
                                      inv.warehouseId === warehouse.id
                                        ? { ...inv, quantity }
                                        : inv
                                    )
                                  );
                                } else {
                                  setInventoryData([...inventoryData, { warehouseId: warehouse.id, quantity }]);
                                }
                              }}
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Няма налични складове
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  За продукти с комбинации, наличностите се управляват отделно за всяка комбинация.
                </p>
              </div>
            )}
          </div>
        );

      case "seo":
        return <SeoForm data={seoData} onChange={setSeoData} entityName={name} />;

      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          {mode === "create" ? "Създай продукт" : "Редактирай продукт"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {mode === "create" ? "Добави нов продукт в каталога" : "Актуализирай информацията за продукта"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tabs Navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          {renderTabContent()}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            {loading ? "Записване..." : mode === "create" ? "Създай продукт" : "Актуализирай продукт"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/catalog/products")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
}
