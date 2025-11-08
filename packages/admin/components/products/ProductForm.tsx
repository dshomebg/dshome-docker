"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { productsService, Product, ProductFormData } from "@/lib/services/products.service";
import { brandsService } from "@/lib/services/brands.service";
import { suppliersService } from "@/lib/services/suppliers.service";
import { categoriesService, Category } from "@/lib/services/categories.service";
import { featuresService } from "@/lib/services/features.service";
import { warehousesService } from "@/lib/services/warehouses.service";
import TiptapEditor from "../editor/TiptapEditor";
import ProductImagesUpload from "./ProductImagesUpload";
import AddCharacteristicModal from "./AddCharacteristicModal";
import ProductCombinationsGenerator from "./ProductCombinationsGenerator";
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
  const [showCharacteristicModal, setShowCharacteristicModal] = useState(false);

  // Basic Info
  const [sku, setSku] = useState(product?.sku || "");
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!product?.slug); // Auto-generate slug only for new products
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || "");
  const [description, setDescription] = useState(product?.description || "");
  const [productType, setProductType] = useState<"simple" | "combination">(product?.productType || "simple");
  const [weight, setWeight] = useState(product?.weight || "");
  const [width, setWidth] = useState(product?.width || "");
  const [height, setHeight] = useState(product?.height || "");
  const [depth, setDepth] = useState(product?.depth || "");
  const [status, setStatus] = useState<"active" | "inactive" | "archived">(product?.status || "inactive");

  // Prices
  const [price, setPrice] = useState(product?.currentPrice?.price || "");
  const [compareAtPrice, setCompareAtPrice] = useState(product?.currentPrice?.compareAtPrice || "");

  // Simple quantity for basic tab
  const [quantity, setQuantity] = useState(product?.totalInventory?.toString() || "0");

  // Images
  const [images, setImages] = useState<Array<{ url: string; position: number; isPrimary: boolean }>>(product?.images || []);

  // Combinations
  const [combinations, setCombinations] = useState<Array<{
    id?: string;
    sku: string;
    name: string;
    priceImpact: string;
    weightImpact: string;
    quantity: string;
    isDefault: boolean;
    attributeValueIds: string[];
  }>>(product?.combinations || []);

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

  // Transliteration map for Cyrillic to Latin
  const transliterate = (text: string): string => {
    const cyrillicToLatin: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
      'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
      'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts',
      'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
    };

    return text.split('').map(char => cyrillicToLatin[char] || char).join('');
  };

  useEffect(() => {
    if (autoSlug && name) {
      const transliterated = transliterate(name);
      const generatedSlug = transliterated
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
      setSlug(generatedSlug);
    }
  }, [name, autoSlug]);

  // Update combination SKUs when base SKU changes
  useEffect(() => {
    if (combinations.length > 0 && sku) {
      const updatedCombinations = combinations.map((combo, index) => ({
        ...combo,
        sku: `${sku}-${index + 1}`
      }));
      setCombinations(updatedCombinations);
    }
  }, [sku]);

  // Reset active tab if switching away from combinations when productType changes
  useEffect(() => {
    if (activeTab === 'combinations' && productType === 'simple') {
      setActiveTab('basic');
    }
  }, [productType, activeTab]);

  // Calculate total quantity from combinations for combination products
  useEffect(() => {
    if (productType === 'combination' && combinations.length > 0) {
      const totalQty = combinations.reduce((sum, combo) => {
        return sum + (parseInt(combo.quantity) || 0);
      }, 0);
      setQuantity(String(totalQty));
    }
  }, [combinations, productType]);

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

  const refreshFeatureGroups = async () => {
    try {
      const featuresRes = await featuresService.getFeatureGroups({ limit: 1000, status: 'active' });
      setFeatureGroups(featuresRes.data);
    } catch (error) {
      console.error("Error refreshing feature groups:", error);
    }
  };

  const handleAddCharacteristic = (featureValueId: string) => {
    // Check if already added
    if (selectedFeatures.some(f => f.featureValueId === featureValueId)) {
      return;
    }
    setSelectedFeatures([...selectedFeatures, { featureValueId }]);
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
        images: images.length > 0 ? images : undefined,
        features: selectedFeatures.length > 0 ? selectedFeatures : undefined,
        combinations: productType === 'combination' && combinations.length > 0 ? combinations : undefined,
        quantity: quantity ? parseInt(quantity) : undefined,
        warehouseId: warehouses.length > 0 ? warehouses[0].id : undefined,
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


  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Wide Column - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Заглавие <span className="text-error-500">*</span>
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

              {/* Multi-Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Снимки на продукта
                </label>
                <ProductImagesUpload
                  images={images}
                  productName={name}
                  onChange={setImages}
                />
              </div>

              {/* Short Description - WYSIWYG */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Кратко описание
                </label>
                <TiptapEditor
                  content={shortDescription || ""}
                  onChange={setShortDescription}
                  placeholder="Въведете кратко описание на продукта..."
                />
              </div>

              {/* Long Description - WYSIWYG */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Дълго описание
                </label>
                <TiptapEditor
                  content={description || ""}
                  onChange={setDescription}
                  placeholder="Въведете пълно описание на продукта..."
                />
              </div>

              {/* Characteristics / Features */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Характеристики
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCharacteristicModal(true)}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700"
                  >
                    Добави характеристика
                  </button>
                </div>

                {/* Selected Features Display */}
                {selectedFeatures.length > 0 ? (
                  <div className="space-y-3">
                    {selectedFeatures.map((feature) => {
                      // Find the feature value details
                      let featureValue: any = null;
                      let groupName = "";

                      for (const group of featureGroups) {
                        const value = group.values?.find((v: any) => v.id === feature.featureValueId);
                        if (value) {
                          featureValue = value;
                          groupName = group.name;
                          break;
                        }
                      }

                      if (!featureValue) return null;

                      return (
                        <div
                          key={feature.featureValueId}
                          className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {groupName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {featureValue.name}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFeatures(
                                selectedFeatures.filter((f) => f.featureValueId !== feature.featureValueId)
                              );
                            }}
                            className="rounded bg-error-500 p-1 text-white hover:bg-error-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Няма добавени характеристики. Натиснете бутона &quot;Добави характеристика&quot; за да добавите.
                    </p>
                  </div>
                )}
              </div>

              {/* Brand Selection */}
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
            </div>

            {/* Narrow Column - Right Side */}
            <div className="space-y-6">
              {/* Product Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Тип продукт
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="productType"
                      value="simple"
                      checked={productType === "simple"}
                      onChange={(e) => setProductType(e.target.value as "simple" | "combination")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-800 dark:text-white/90">Обикновен продукт</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="productType"
                      value="combination"
                      checked={productType === "combination"}
                      onChange={(e) => setProductType(e.target.value as "simple" | "combination")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-800 dark:text-white/90">С Комбинации</span>
                  </label>
                </div>
              </div>

              {/* Reference Number (SKU) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Референция <span className="text-error-500">*</span>
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

              {/* Quantity */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Количество
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  disabled={productType === 'combination'}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                />
                {productType === 'combination' && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Автоматично изчислено от комбинациите
                  </p>
                )}
              </div>

              {/* Price (with VAT) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Цена <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
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
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Продажна цена с ДДС
                </p>
              </div>

              {/* Categories Selection with Badges */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Категории <span className="text-error-500">*</span>
                </label>

                {/* Category Tree with Checkboxes */}
                <div className="mb-3 max-h-64 overflow-y-auto rounded-lg border border-gray-300 p-3 dark:border-gray-700">
                  {categories.length > 0 ? (
                    categories.map((category) => {
                      const isSelected = selectedCategories.some(c => c.categoryId === category.id);
                      const isPrimary = selectedCategories.find(c => c.categoryId === category.id)?.isPrimary || false;

                      return (
                        <div key={category.id} className="mb-2 flex items-center gap-2">
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
                              title="По подразбиране"
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Няма налични категории</p>
                  )}
                </div>

                {/* Selected Categories Badges */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((sc) => {
                      const category = categories.find(c => c.id === sc.categoryId);
                      if (!category) return null;

                      return (
                        <span
                          key={sc.categoryId}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            sc.isPrimary
                              ? "bg-brand-500 text-white dark:bg-brand-600"
                              : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {category.name}
                          {sc.isPrimary && <span className="text-xs">(по подразбиране)</span>}
                        </span>
                      );
                    })}
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Изберете категории и маркирайте една като по подразбиране (с радио бутон)
                </p>
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL (slug) <span className="text-error-500">*</span>
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

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Статус
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                  <option value="archived">Архивиран</option>
                </select>
              </div>
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
            <ProductImagesUpload
              images={images}
              productName={name || "Продукт"}
              onChange={setImages}
            />
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
              <ProductCombinationsGenerator
                baseSku={sku}
                combinations={combinations}
                onChange={setCombinations}
              />
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
            {tabs
              .filter(tab => tab.id !== 'combinations' || productType === 'combination')
              .map((tab) => (
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

      {/* Add Characteristic Modal */}
      {showCharacteristicModal && (
        <AddCharacteristicModal
          featureGroups={featureGroups}
          selectedFeatures={selectedFeatures}
          onAdd={handleAddCharacteristic}
          onClose={() => setShowCharacteristicModal(false)}
          onRefresh={refreshFeatureGroups}
        />
      )}
    </div>
  );
}
