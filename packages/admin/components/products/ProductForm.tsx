"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronRight, ChevronDown, Search } from "lucide-react";
import { productsService, Product, ProductFormData } from "@/lib/services/products.service";
import { brandsService } from "@/lib/services/brands.service";
import { suppliersService } from "@/lib/services/suppliers.service";
import { categoriesService, Category } from "@/lib/services/categories.service";
import { featuresService } from "@/lib/services/features.service";
import { warehousesService } from "@/lib/services/warehouses.service";
import { catalogSettingsService } from "@/lib/services/catalog-settings.service";
import { measurementRulesService, MeasurementRule } from "@/lib/services/measurement-rules.service";
import { generalSettingsService } from "@/lib/services/general-settings.service";
import { seoSettingsService } from "@/lib/services/seo-settings.service";
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

type TabId = "basic" | "prices" | "delivery" | "combinations" | "measurement" | "seo";

interface Tab {
  id: TabId;
  label: string;
  icon?: string;
}

const tabs: Tab[] = [
  { id: "basic", label: "Основна информация" },
  { id: "prices", label: "Цени" },
  { id: "delivery", label: "Доставка" },
  { id: "combinations", label: "Комбинации" },
  { id: "measurement", label: "Пакети/м²" },
  { id: "seo", label: "SEO" },
];

// Helper function to flatten category tree into a flat array
const flattenCategories = (categories: Category[]): Category[] => {
  const result: Category[] = [];

  const flatten = (cats: Category[]) => {
    cats.forEach(cat => {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        flatten(cat.children);
      }
    });
  };

  flatten(categories);
  return result;
};

// Recursive component to render category tree with expand/collapse
interface CategoryTreeItemProps {
  category: Category;
  level: number;
  selectedCategories: Array<{ categoryId: string; isPrimary: boolean }>;
  onToggle: (categoryId: string, checked: boolean) => void;
  onSetPrimary: (categoryId: string) => void;
  searchTerm: string;
}

const CategoryTreeItem = ({
  category,
  level,
  selectedCategories,
  onToggle,
  onSetPrimary,
  searchTerm
}: CategoryTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedCategories.some(c => c.categoryId === category.id);
  const isPrimary = selectedCategories.find(c => c.categoryId === category.id)?.isPrimary || false;
  const hasChildren = category.children && category.children.length > 0;

  // Auto-expand if search term matches this category or any child
  const categoryMatchesSearch = (cat: Category, term: string): boolean => {
    if (cat.name.toLowerCase().includes(term.toLowerCase())) return true;
    if (cat.children) {
      return cat.children.some(child => categoryMatchesSearch(child, term));
    }
    return false;
  };

  useEffect(() => {
    if (searchTerm && hasChildren) {
      // Expand if this category or any child matches search
      setIsExpanded(categoryMatchesSearch(category, searchTerm));
    } else if (!searchTerm) {
      // Collapse all when search is cleared
      setIsExpanded(false);
    }
  }, [searchTerm, category, hasChildren]);

  // Hide if doesn't match search
  const matchesSearch = !searchTerm || category.name.toLowerCase().includes(searchTerm.toLowerCase());
  if (!matchesSearch && !hasChildren) return null;

  return (
    <>
      <div
        className="mb-1 flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1 py-0.5"
        style={{ paddingLeft: `${level * 20}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onToggle(category.id, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />

        {/* Category Name */}
        <label
          className={`flex-1 text-sm cursor-pointer ${
            matchesSearch
              ? "text-gray-800 dark:text-white/90"
              : "text-gray-500 dark:text-gray-500"
          }`}
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          {category.name}
          {hasChildren && (
            <span className="ml-1 text-xs text-gray-400">
              ({category.children?.length})
            </span>
          )}
        </label>

        {/* Primary Radio */}
        {isSelected && (
          <input
            type="radio"
            name="primaryCategory"
            checked={isPrimary}
            onChange={() => onSetPrimary(category.id)}
            className="h-4 w-4"
            title="По подразбиране"
          />
        )}
      </div>

      {/* Children - Only show if expanded */}
      {hasChildren && isExpanded && (
        <>
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              selectedCategories={selectedCategories}
              onToggle={onToggle}
              onSetPrimary={onSetPrimary}
              searchTerm={searchTerm}
            />
          ))}
        </>
      )}
    </>
  );
};

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [loading, setLoading] = useState(false);
  const [showCharacteristicModal, setShowCharacteristicModal] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

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
  const [priceWithoutVat, setPriceWithoutVat] = useState(product?.priceWithoutVat || "");
  const [supplierPrice, setSupplierPrice] = useState(product?.supplierPrice || "");
  const [vatPercentage, setVatPercentage] = useState(20); // Default 20%, will be loaded from settings

  // Discount
  const [hasDiscount, setHasDiscount] = useState(!!product?.currentPrice?.discountType);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage' | ''>(product?.currentPrice?.discountType || 'fixed');
  const [discountValue, setDiscountValue] = useState(product?.currentPrice?.discountValue || "");
  const [discountStartDate, setDiscountStartDate] = useState(product?.currentPrice?.discountStartDate || "");
  const [discountEndDate, setDiscountEndDate] = useState(product?.currentPrice?.discountEndDate || "");
  const [promotionalPrice, setPromotionalPrice] = useState(product?.currentPrice?.promotionalPrice || "");

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

  // Delivery
  const [deliveryTimeId, setDeliveryTimeId] = useState(product?.deliveryTimeId || "");
  const [deliveryTimeTemplates, setDeliveryTimeTemplates] = useState<any[]>([]);

  // SEO data
  const [seoData, setSeoData] = useState<SeoFormData>({
    metaTitle: product?.metaTitle || "",
    metaDescription: product?.metaDescription || "",
    canonicalUrl: product?.canonicalUrl || "",
    skipMetaGeneration: product?.skipMetaGeneration || false,
  });

  // Product URL generation
  const [baseUrl, setBaseUrl] = useState("https://example.com");
  const [productUrlFormat, setProductUrlFormat] = useState("/{def-category-slug}/{product-slug}");
  const [productUrlSuffix, setProductUrlSuffix] = useState(".html");
  const [productUrl, setProductUrl] = useState("");

  // Measurement config
  const [measurementEnabled, setMeasurementEnabled] = useState(!!product?.measurementConfig);
  const [selectedRuleId, setSelectedRuleId] = useState(product?.measurementConfig?.measurementRuleId || "");
  const [pricingUnit, setPricingUnit] = useState(product?.measurementConfig?.pricingUnit || "м²");
  const [sellingUnit, setSellingUnit] = useState(product?.measurementConfig?.sellingUnit || "пакет");
  const [unitsPerPackage, setUnitsPerPackage] = useState(product?.measurementConfig?.unitsPerPackage || "");
  const [minimumQuantity, setMinimumQuantity] = useState(product?.measurementConfig?.minimumQuantity || "");
  const [stepQuantity, setStepQuantity] = useState(product?.measurementConfig?.stepQuantity || "");
  const [displayBothUnits, setDisplayBothUnits] = useState(product?.measurementConfig?.displayBothUnits ?? true);
  const [calculatorEnabled, setCalculatorEnabled] = useState(product?.measurementConfig?.calculatorEnabled ?? true);

  // Reference data
  const [brands, setBrands] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featureGroups, setFeatureGroups] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [measurementRules, setMeasurementRules] = useState<MeasurementRule[]>([]);

  useEffect(() => {
    fetchReferenceData();
    fetchVatPercentage();
    fetchBaseUrl();
    fetchSeoSettings();
  }, []);

  const fetchBaseUrl = async () => {
    try {
      const response = await generalSettingsService.getGeneralSettings();
      if (response.data.baseUrl) {
        setBaseUrl(response.data.baseUrl);
      }
    } catch (error) {
      console.error("Error fetching base URL:", error);
    }
  };

  const fetchSeoSettings = async () => {
    try {
      const response = await seoSettingsService.getSeoSettings();
      if (response.data.productUrlFormat) {
        setProductUrlFormat(response.data.productUrlFormat);
      }
      if (response.data.productUrlSuffix) {
        setProductUrlSuffix(response.data.productUrlSuffix);
      }
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
    }
  };

  const fetchVatPercentage = async () => {
    try {
      const response = await catalogSettingsService.getCatalogSettings();
      setVatPercentage(parseFloat(response.data.vatPercentage));
    } catch (error) {
      console.error("Error fetching VAT percentage:", error);
    }
  };

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

  // Generate product URL based on SEO settings
  useEffect(() => {
    if (!slug || !productUrlFormat) {
      setProductUrl("");
      return;
    }

    // Find primary category
    const primaryCategory = selectedCategories.find(c => c.isPrimary);
    let categorySlug = "uncategorized";

    if (primaryCategory) {
      // Find category in the flattened categories array
      const flatCategories = flattenCategories(categories);
      const category = flatCategories.find(c => c.id === primaryCategory.categoryId);
      if (category?.slug) {
        categorySlug = category.slug;
      }
    }

    // Generate URL by replacing placeholders
    let url = productUrlFormat
      .replace(/{product-slug}/g, slug)
      .replace(/{def-category-slug}/g, categorySlug);

    const fullUrl = `${baseUrl}${url}${productUrlSuffix}`;
    setProductUrl(fullUrl);

    // Auto-populate canonical URL with the real URL
    setSeoData(prev => ({
      ...prev,
      canonicalUrl: fullUrl
    }));
  }, [slug, productUrlFormat, productUrlSuffix, baseUrl, selectedCategories, categories]);

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

  // Auto-calculate priceWithoutVat when price changes
  useEffect(() => {
    if (price && vatPercentage > 0) {
      const priceNum = parseFloat(price);
      if (!isNaN(priceNum)) {
        const calculatedPriceWithoutVat = priceNum / (1 + vatPercentage / 100);
        setPriceWithoutVat(calculatedPriceWithoutVat.toFixed(2));
      }
    }
  }, [price, vatPercentage]);

  // Auto-calculate price when priceWithoutVat changes manually
  const handlePriceWithoutVatChange = (value: string) => {
    setPriceWithoutVat(value);
    if (value && vatPercentage > 0) {
      const priceWithoutVatNum = parseFloat(value);
      if (!isNaN(priceWithoutVatNum)) {
        const calculatedPrice = priceWithoutVatNum * (1 + vatPercentage / 100);
        setPrice(calculatedPrice.toFixed(2));
      }
    }
  };

  // Auto-calculate promotional price when discount changes
  useEffect(() => {
    if (hasDiscount && discountType && discountValue && price) {
      const priceNum = parseFloat(price);
      const discountValueNum = parseFloat(discountValue);

      if (!isNaN(priceNum) && !isNaN(discountValueNum)) {
        let calculatedPromotionalPrice = 0;

        if (discountType === 'fixed') {
          calculatedPromotionalPrice = priceNum - discountValueNum;
        } else if (discountType === 'percentage') {
          calculatedPromotionalPrice = priceNum - (priceNum * discountValueNum / 100);
        }

        setPromotionalPrice(calculatedPromotionalPrice.toFixed(2));
      }
    } else {
      setPromotionalPrice("");
    }
  }, [hasDiscount, discountType, discountValue, price]);

  // Calculate margin as computed value
  const calculateMargin = (): number | null => {
    const priceWithoutVatNum = parseFloat(priceWithoutVat);
    const supplierPriceNum = parseFloat(supplierPrice);

    if (!isNaN(priceWithoutVatNum) && !isNaN(supplierPriceNum) && priceWithoutVatNum > 0) {
      return ((priceWithoutVatNum - supplierPriceNum) / priceWithoutVatNum) * 100;
    }
    return null;
  };

  const margin = calculateMargin();

  // Calculate margin after discount
  const calculateMarginAfterDiscount = (): number | null => {
    if (!hasDiscount || !promotionalPrice || !priceWithoutVat || !supplierPrice) {
      return null;
    }

    const promotionalPriceNum = parseFloat(promotionalPrice);
    const supplierPriceNum = parseFloat(supplierPrice);

    if (!isNaN(promotionalPriceNum) && !isNaN(supplierPriceNum) && promotionalPriceNum > 0) {
      // Calculate price without VAT for promotional price
      const promotionalPriceWithoutVat = promotionalPriceNum / (1 + vatPercentage / 100);

      return ((promotionalPriceWithoutVat - supplierPriceNum) / promotionalPriceWithoutVat) * 100;
    }
    return null;
  };

  const marginAfterDiscount = calculateMarginAfterDiscount();

  // Get margin color based on value
  const getMarginColor = (marginValue: number | null): string => {
    if (marginValue === null) return "text-gray-500";
    if (marginValue > 20) return "text-green-600 dark:text-green-400";
    if (marginValue > 0) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const fetchReferenceData = async () => {
    try {
      const [brandsRes, suppliersRes, categoriesRes, featuresRes, warehousesRes, rulesRes, deliveryRes] = await Promise.all([
        brandsService.getBrands({ limit: 1000 }),
        suppliersService.getSuppliers({ limit: 1000 }),
        categoriesService.getCategoryTree(),
        featuresService.getFeatureGroups({ limit: 1000, status: 'active' }),
        warehousesService.getWarehouses({ limit: 1000, status: 'active' }),
        measurementRulesService.getMeasurementRules({ limit: 1000, status: 'active' }),
        catalogSettingsService.getDeliveryTimeTemplates(),
      ]);
      setBrands(brandsRes.data);
      setSuppliers(suppliersRes.data);
      setCategories(categoriesRes.data);
      setFeatureGroups(featuresRes.data);
      setWarehouses(warehousesRes.data);
      setMeasurementRules(rulesRes.data);
      setDeliveryTimeTemplates(deliveryRes.data);

      // Set default delivery time to the first one if creating new product
      if (!product && deliveryRes.data.length > 0) {
        setDeliveryTimeId(deliveryRes.data[0].id);
      }
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
        priceWithoutVat: priceWithoutVat ? parseFloat(priceWithoutVat) : undefined,
        supplierPrice: supplierPrice ? parseFloat(supplierPrice) : undefined,
        discountType: hasDiscount && discountType ? discountType : undefined,
        discountValue: hasDiscount && discountValue ? parseFloat(discountValue) : undefined,
        discountStartDate: hasDiscount && discountStartDate ? discountStartDate : undefined,
        discountEndDate: hasDiscount && discountEndDate ? discountEndDate : undefined,
        promotionalPrice: hasDiscount && promotionalPrice ? parseFloat(promotionalPrice) : undefined,
        measurementConfig: measurementEnabled && selectedRuleId ? {
          measurementRuleId: selectedRuleId,
          pricingUnit,
          sellingUnit,
          unitsPerPackage: unitsPerPackage || undefined,
          minimumQuantity: minimumQuantity || undefined,
          stepQuantity: stepQuantity || undefined,
          displayBothUnits,
          calculatorEnabled,
        } : undefined,
        status,
        deliveryTimeId: deliveryTimeId || undefined,
        metaTitle: seoData.metaTitle || undefined,
        metaDescription: seoData.metaDescription || undefined,
        canonicalUrl: seoData.canonicalUrl || undefined,
        skipMetaGeneration: seoData.skipMetaGeneration,
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

                {/* Category Search */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Търсене на категория..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                </div>

                {/* Category Tree with Checkboxes */}
                <div className="mb-3 max-h-64 overflow-y-auto rounded-lg border border-gray-300 p-3 dark:border-gray-700">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <CategoryTreeItem
                        key={category.id}
                        category={category}
                        level={0}
                        selectedCategories={selectedCategories}
                        searchTerm={categorySearchTerm}
                        onToggle={(categoryId, checked) => {
                          if (checked) {
                            setSelectedCategories([
                              ...selectedCategories,
                              { categoryId, isPrimary: selectedCategories.length === 0 }
                            ]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c.categoryId !== categoryId));
                          }
                        }}
                        onSetPrimary={(categoryId) => {
                          setSelectedCategories(
                            selectedCategories.map(c => ({
                              ...c,
                              isPrimary: c.categoryId === categoryId
                            }))
                          );
                        }}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Няма налични категории</p>
                  )}
                </div>

                {/* Selected Categories Badges */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((sc) => {
                      // Use flattened categories to find category at any level
                      const allCategories = flattenCategories(categories);
                      const category = allCategories.find(c => c.id === sc.categoryId);
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
            {/* Default Pricing Section */}
            <div>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Ценообразуване по подразбиране
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Price Without VAT */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Цена без ДДС
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={priceWithoutVat}
                      onChange={(e) => handlePriceWithoutVatChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                      EUR
                    </span>
                  </div>
                </div>

                {/* Price With VAT */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Цена с ДДС <span className="text-error-500">*</span>
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
                    ДДС: {vatPercentage}%
                  </p>
                </div>

                {/* Supplier Price */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Доставна цена
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={supplierPrice}
                      onChange={(e) => setSupplierPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                      EUR
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Цена от доставчик
                  </p>
                </div>

                {/* Margin (Read-only, Computed) */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Марж
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={margin !== null ? `${margin.toFixed(2)}%` : "N/A"}
                      readOnly
                      className={`w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 pr-12 text-sm font-medium ${getMarginColor(margin)} placeholder:text-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Автоматично изчислен
                  </p>
                </div>
              </div>
            </div>

            {/* Discount Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Намаление
                </h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasDiscount}
                    onChange={(e) => {
                      setHasDiscount(e.target.checked);
                      if (!e.target.checked) {
                        setDiscountType('');
                        setDiscountValue('');
                        setDiscountStartDate('');
                        setDiscountEndDate('');
                        setPromotionalPrice('');
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Активирай намаление</span>
                </label>
              </div>

              {hasDiscount && (
                <div className="space-y-4">
                  {/* Discount Type */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Тип намаление
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="discountType"
                          value="fixed"
                          checked={discountType === 'fixed'}
                          onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percentage')}
                          className="h-4 w-4"
                        />
                        <span className="text-sm text-gray-800 dark:text-white/90">Фиксирана сума</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="discountType"
                          value="percentage"
                          checked={discountType === 'percentage'}
                          onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percentage')}
                          className="h-4 w-4"
                        />
                        <span className="text-sm text-gray-800 dark:text-white/90">Процент</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Discount Value */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Стойност на намалението
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                          {discountType === 'percentage' ? '%' : 'EUR'}
                        </span>
                      </div>
                    </div>

                    {/* Promotional Price (Read-only) */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Промоционална цена
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={promotionalPrice ? `${parseFloat(promotionalPrice).toFixed(2)}` : "0.00"}
                          readOnly
                          className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 pr-12 text-sm font-medium text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                          EUR
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Автоматично изчислена
                      </p>
                    </div>

                    {/* Discount Start Date */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Начална дата
                      </label>
                      <input
                        type="date"
                        value={discountStartDate}
                        onChange={(e) => setDiscountStartDate(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    </div>

                    {/* Discount End Date */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Крайна дата
                      </label>
                      <input
                        type="date"
                        value={discountEndDate}
                        onChange={(e) => setDiscountEndDate(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    </div>

                    {/* Margin After Discount */}
                    {marginAfterDiscount !== null && (
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Марж след намаление
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={`${marginAfterDiscount.toFixed(2)}%`}
                            readOnly
                            className={`w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 pr-12 text-sm font-medium ${getMarginColor(marginAfterDiscount)} placeholder:text-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800`}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Автоматично изчислен
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

      case "delivery":
        return (
          <div className="space-y-6">
            {/* Package Dimensions and Weight */}
            <div>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Размери и тегло на пратката
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Weight */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Тегло <span className="text-error-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                      кг
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Тегло на пратката в килограми
                  </p>
                </div>

                {/* Width */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ширина
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                      см
                    </span>
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Височина
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                      см
                    </span>
                  </div>
                </div>

                {/* Depth */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Дължина
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={depth}
                      onChange={(e) => setDepth(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                      см
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warehouse Inventory */}
            <div>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Наличност по складове
              </h3>
              <div className="space-y-3">
                {warehouses.map((warehouse: any) => {
                  const inventoryItem = inventoryData.find(inv => inv.warehouseId === warehouse.id);
                  const quantity = inventoryItem?.quantity || 0;

                  return (
                    <div key={warehouse.id} className="flex items-center gap-4 rounded-lg border border-gray-300 p-4 dark:border-gray-700">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{warehouse.name}</p>
                        {warehouse.location && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{warehouse.location}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {quantity} бр.
                        </span>
                      </div>
                    </div>
                  );
                })}
                {warehouses.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Няма налични складове</p>
                )}
              </div>
            </div>

            {/* Delivery Time */}
            <div>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Срок на доставка
              </h3>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Изберете срок на доставка
                </label>
                <select
                  value={deliveryTimeId}
                  onChange={(e) => setDeliveryTimeId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">-- Изберете срок --</option>
                  {deliveryTimeTemplates.map((template: any) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Сроковете се управляват от Каталог → Настройки
                </p>
              </div>
            </div>

            {/* Couriers Placeholder */}
            <div>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Куриери
              </h3>
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
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Модулът "Куриери" предстои
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Тук ще можете да изберете кои куриери да предлагате за този продукт
                </p>
              </div>
            </div>
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

      case "measurement":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Модул: Пакети/м²
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Активирай специален модул за продажба по пакети и мерни единици
                  </p>
                </div>
              </div>

              {/* Enable Measurement */}
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                <input
                  type="checkbox"
                  id="measurementEnabled"
                  checked={measurementEnabled}
                  onChange={(e) => setMeasurementEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300"
                />
                <label htmlFor="measurementEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Активирай модула за този продукт
                </label>
              </div>

              {measurementEnabled && (
                <div className="space-y-4">
                  {/* Rule Selection */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Изберете правило за изчисление <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedRuleId}
                      onChange={(e) => {
                        const ruleId = e.target.value;
                        setSelectedRuleId(ruleId);

                        // Find the selected rule and set defaults
                        const rule = measurementRules.find(r => r.id === ruleId);
                        if (rule) {
                          if (rule.calculationType === 'package_based') {
                            setPricingUnit("м²");
                            setSellingUnit("пакет");
                          } else if (rule.calculationType === 'minimum_quantity') {
                            setPricingUnit("м");
                            setSellingUnit("м");
                          } else if (rule.calculationType === 'step_quantity') {
                            setPricingUnit("м");
                            setSellingUnit("м");
                          }
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    >
                      <option value="">-- Изберете правило --</option>
                      {measurementRules.map((rule) => (
                        <option key={rule.id} value={rule.id}>
                          {rule.name}
                        </option>
                      ))}
                    </select>
                    {selectedRuleId && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {measurementRules.find(r => r.id === selectedRuleId)?.description}
                      </p>
                    )}
                    {measurementRules.length === 0 && (
                      <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                        Няма създадени правила. Моля създайте правило от секция{" "}
                        <a href="/modules/measurement-packages" className="font-medium underline">
                          Модули &gt; Пакети/м²
                        </a>
                      </p>
                    )}
                  </div>

                  {selectedRuleId && (
                    <>
                      {/* Unit Labels */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Мерна единица за ценообразуване <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={pricingUnit}
                            onChange={(e) => setPricingUnit(e.target.value)}
                            placeholder="м², м, кг..."
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Например: м², м, кг
                          </p>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Единица за продажба <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={sellingUnit}
                            onChange={(e) => setSellingUnit(e.target.value)}
                            placeholder="пакет, опаковка, ролка..."
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Например: пакет, опаковка, ролка
                          </p>
                        </div>
                      </div>

                      {/* Type-specific fields */}
                      {measurementRules.find(r => r.id === selectedRuleId)?.calculationType === 'package_based' && (
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Мерни единици в един пакет <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            value={unitsPerPackage}
                            onChange={(e) => setUnitsPerPackage(e.target.value)}
                            placeholder="1.44"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Например: 1.44 м² за плочки
                          </p>
                        </div>
                      )}

                      {measurementRules.find(r => r.id === selectedRuleId)?.calculationType === 'minimum_quantity' && (
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Минимално количество за поръчка <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            value={minimumQuantity}
                            onChange={(e) => setMinimumQuantity(e.target.value)}
                            placeholder="3"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Минимално количество, което може да бъде поръчано
                          </p>
                        </div>
                      )}

                      {measurementRules.find(r => r.id === selectedRuleId)?.calculationType === 'step_quantity' && (
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Стъпка на увеличение <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            value={stepQuantity}
                            onChange={(e) => setStepQuantity(e.target.value)}
                            placeholder="0.5"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Например: 0.5м, 1м (продажба само на стъпки)
                          </p>
                        </div>
                      )}

                      {/* Display Options */}
                      <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Опции за показване
                        </h4>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="displayBothUnits"
                            checked={displayBothUnits}
                            onChange={(e) => setDisplayBothUnits(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label htmlFor="displayBothUnits" className="text-sm text-gray-700 dark:text-gray-300">
                            Покажи и двете мерни единици
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="calculatorEnabled"
                            checked={calculatorEnabled}
                            onChange={(e) => setCalculatorEnabled(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label htmlFor="calculatorEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                            Активирай калкулатор
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case "seo":
        return <SeoForm data={seoData} onChange={setSeoData} entityName={name} productUrl={productUrl} />;

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
