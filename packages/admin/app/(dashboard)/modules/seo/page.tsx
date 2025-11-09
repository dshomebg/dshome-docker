"use client";

import { useState, useEffect } from "react";
import { Save, Link as LinkIcon, FileText, Sparkles, Wand2 } from "lucide-react";
import { seoSettingsService } from "@/lib/services/seo-settings.service";
import { generalSettingsService } from "@/lib/services/general-settings.service";
import { richSnippetsSettingsService } from "@/lib/services/rich-snippets-settings.service";

type TabKey = "url-settings" | "meta-tags" | "rich-snippets";

interface TabItem {
  key: TabKey;
  label: string;
  icon: any;
}

const tabs: TabItem[] = [
  { key: "url-settings", label: "URL настройки", icon: LinkIcon },
  { key: "meta-tags", label: "Meta Tags", icon: FileText },
  { key: "rich-snippets", label: "Rich Snippets", icon: Sparkles },
];

export default function SeoModulePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("url-settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingProductMeta, setGeneratingProductMeta] = useState(false);
  const [generatingCategoryMeta, setGeneratingCategoryMeta] = useState(false);
  const [baseUrl, setBaseUrl] = useState("www.yourshop.com");

  // URL Settings State
  const [productUrlFormat, setProductUrlFormat] = useState("/{def-category-slug}/{product-slug}");
  const [productUrlSuffix, setProductUrlSuffix] = useState("");
  const [categoryUrlFormat, setCategoryUrlFormat] = useState("/{category-slug}");
  const [categoryUrlSuffix, setCategoryUrlSuffix] = useState("");
  const [brandUrlFormat, setBrandUrlFormat] = useState("/{brand-slug}");
  const [brandUrlSuffix, setBrandUrlSuffix] = useState("");
  const [cmsUrlFormat, setCmsUrlFormat] = useState("/pages/{cms-category}/{cms-page-slug}");
  const [cmsUrlSuffix, setCmsUrlSuffix] = useState("");
  const [cmsCategoryUrlFormat, setCmsCategoryUrlFormat] = useState("/pages/{cms-category}");
  const [cmsCategoryUrlSuffix, setCmsCategoryUrlSuffix] = useState("");
  const [blogUrlFormat, setBlogUrlFormat] = useState("/blog/{blog-category}/{blog-page-slug}");
  const [blogUrlSuffix, setBlogUrlSuffix] = useState("");
  const [blogCategoryUrlFormat, setBlogCategoryUrlFormat] = useState("/blog/{blog-category}");
  const [blogCategoryUrlSuffix, setBlogCategoryUrlSuffix] = useState("");
  const [canonicalEnabled, setCanonicalEnabled] = useState(true);

  // Meta Tags State
  const [productMetaTitleTemplate, setProductMetaTitleTemplate] = useState("{name} - {shop_name}");
  const [productMetaDescriptionTemplate, setProductMetaDescriptionTemplate] = useState("Купете {name} на страхотна цена от {shop_name}. {description}");
  const [categoryMetaTitleTemplate, setCategoryMetaTitleTemplate] = useState("{name} - {shop_name}");
  const [categoryMetaDescriptionTemplate, setCategoryMetaDescriptionTemplate] = useState("Разгледайте нашата категория {name} в {shop_name}. {description}");

  // Rich Snippets State - Organization
  const [organizationEnabled, setOrganizationEnabled] = useState(true);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationLogo, setOrganizationLogo] = useState("");
  const [organizationType, setOrganizationType] = useState("OnlineStore");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  const [addressCountry, setAddressCountry] = useState("BG");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");

  // Rich Snippets State - Product
  const [productSnippetsEnabled, setProductSnippetsEnabled] = useState(true);
  const [productDescriptionType, setProductDescriptionType] = useState<'short' | 'full'>('short');
  const [productIncludeSpecifications, setProductIncludeSpecifications] = useState(true);
  const [productIncludePrice, setProductIncludePrice] = useState(true);
  const [productIncludeAvailability, setProductIncludeAvailability] = useState(true);
  const [productIncludeSku, setProductIncludeSku] = useState(true);
  const [productIncludeImages, setProductIncludeImages] = useState(true);
  const [productIncludeBrand, setProductIncludeBrand] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState("BGN");

  // Rich Snippets State - Other
  const [breadcrumbsEnabled, setBreadcrumbsEnabled] = useState(true);
  const [websiteSearchEnabled, setWebsiteSearchEnabled] = useState(true);
  const [searchUrlPattern, setSearchUrlPattern] = useState("/search?q={search_term_string}");
  const [blogSnippetsEnabled, setBlogSnippetsEnabled] = useState(true);
  const [defaultAuthorName, setDefaultAuthorName] = useState("");
  const [defaultAuthorImage, setDefaultAuthorImage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      // Fetch SEO settings
      const seoResponse = await seoSettingsService.getSeoSettings();
      const settings = seoResponse.data;

      setProductUrlFormat(settings.productUrlFormat);
      setProductUrlSuffix(settings.productUrlSuffix);
      setCategoryUrlFormat(settings.categoryUrlFormat);
      setCategoryUrlSuffix(settings.categoryUrlSuffix);
      setBrandUrlFormat(settings.brandUrlFormat);
      setBrandUrlSuffix(settings.brandUrlSuffix);
      setCmsUrlFormat(settings.cmsUrlFormat);
      setCmsUrlSuffix(settings.cmsUrlSuffix);
      setCmsCategoryUrlFormat(settings.cmsCategoryUrlFormat);
      setCmsCategoryUrlSuffix(settings.cmsCategoryUrlSuffix);
      setBlogUrlFormat(settings.blogUrlFormat);
      setBlogUrlSuffix(settings.blogUrlSuffix);
      setBlogCategoryUrlFormat(settings.blogCategoryUrlFormat);
      setBlogCategoryUrlSuffix(settings.blogCategoryUrlSuffix);
      setCanonicalEnabled(settings.canonicalEnabled);
      setProductMetaTitleTemplate(settings.productMetaTitleTemplate);
      setProductMetaDescriptionTemplate(settings.productMetaDescriptionTemplate);
      setCategoryMetaTitleTemplate(settings.categoryMetaTitleTemplate);
      setCategoryMetaDescriptionTemplate(settings.categoryMetaDescriptionTemplate);

      // Fetch base URL from general settings
      try {
        const generalResponse = await generalSettingsService.getGeneralSettings();
        const cleanBaseUrl = generalResponse.data.baseUrl.replace(/^https?:\/\//, '');
        setBaseUrl(cleanBaseUrl);
      } catch (error) {
        console.error("Error fetching base URL:", error);
      }

      // Fetch Rich Snippets settings
      try {
        const richResponse = await richSnippetsSettingsService.getRichSnippetsSettings();
        const richSettings = richResponse.data;

        setOrganizationEnabled(richSettings.organizationEnabled);
        setOrganizationName(richSettings.organizationName);
        setOrganizationLogo(richSettings.organizationLogo);
        setOrganizationType(richSettings.organizationType);
        setTelephone(richSettings.telephone);
        setEmail(richSettings.email);
        setAddressStreet(richSettings.addressStreet);
        setAddressCity(richSettings.addressCity);
        setAddressPostalCode(richSettings.addressPostalCode);
        setAddressCountry(richSettings.addressCountry);
        setSocialFacebook(richSettings.socialFacebook);
        setSocialInstagram(richSettings.socialInstagram);
        setSocialTwitter(richSettings.socialTwitter);
        setProductSnippetsEnabled(richSettings.productSnippetsEnabled);
        setProductDescriptionType(richSettings.productDescriptionType);
        setProductIncludeSpecifications(richSettings.productIncludeSpecifications);
        setProductIncludePrice(richSettings.productIncludePrice);
        setProductIncludeAvailability(richSettings.productIncludeAvailability);
        setProductIncludeSku(richSettings.productIncludeSku);
        setProductIncludeImages(richSettings.productIncludeImages);
        setProductIncludeBrand(richSettings.productIncludeBrand);
        setDefaultCurrency(richSettings.defaultCurrency);
        setBreadcrumbsEnabled(richSettings.breadcrumbsEnabled);
        setWebsiteSearchEnabled(richSettings.websiteSearchEnabled);
        setSearchUrlPattern(richSettings.searchUrlPattern);
        setBlogSnippetsEnabled(richSettings.blogSnippetsEnabled);
        setDefaultAuthorName(richSettings.defaultAuthorName);
        setDefaultAuthorImage(richSettings.defaultAuthorImage);
      } catch (error) {
        console.error("Error fetching Rich Snippets settings:", error);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      alert("Грешка при зареждане на настройките");
    } finally {
      setLoading(false);
    }
  };

  const generateExampleUrl = (format: string, suffix: string, examples: Record<string, string>) => {
    let url = format;

    // Replace all placeholders with example values
    Object.entries(examples).forEach(([placeholder, value]) => {
      url = url.replace(`{${placeholder}}`, value);
    });

    // Add suffix
    url += suffix;

    // Add base URL
    return `${baseUrl}${url}`;
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Save SEO settings
      await seoSettingsService.updateSeoSettings({
        productUrlFormat,
        productUrlSuffix,
        categoryUrlFormat,
        categoryUrlSuffix,
        brandUrlFormat,
        brandUrlSuffix,
        cmsUrlFormat,
        cmsUrlSuffix,
        cmsCategoryUrlFormat,
        cmsCategoryUrlSuffix,
        blogUrlFormat,
        blogUrlSuffix,
        blogCategoryUrlFormat,
        blogCategoryUrlSuffix,
        canonicalEnabled,
        productMetaTitleTemplate,
        productMetaDescriptionTemplate,
        categoryMetaTitleTemplate,
        categoryMetaDescriptionTemplate
      });

      // Save Rich Snippets settings if on that tab
      if (activeTab === "rich-snippets") {
        await richSnippetsSettingsService.updateRichSnippetsSettings({
          organizationEnabled,
          organizationName,
          organizationLogo,
          organizationType,
          telephone,
          email,
          addressStreet,
          addressCity,
          addressPostalCode,
          addressCountry,
          socialFacebook,
          socialInstagram,
          socialTwitter,
          productSnippetsEnabled,
          productDescriptionType,
          productIncludeSpecifications,
          productIncludePrice,
          productIncludeAvailability,
          productIncludeSku,
          productIncludeImages,
          productIncludeBrand,
          defaultCurrency,
          breadcrumbsEnabled,
          websiteSearchEnabled,
          searchUrlPattern,
          blogSnippetsEnabled,
          defaultAuthorName,
          defaultAuthorImage
        });
      }

      alert("Настройките са запазени успешно");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Грешка при записване на настройките");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateProductMeta = async () => {
    if (!confirm("Сигурни ли сте, че искате да генерирате мета тагове за всички продукти? Това ще презапише съществуващите мета тагове за продукти, които нямат активиран чекбокса 'Не презаписвай мета'.")) {
      return;
    }

    try {
      setGeneratingProductMeta(true);
      const response = await seoSettingsService.generateProductMeta();
      alert(`Успешно генерирани мета тагове!\n\nГенерирани: ${response.data.generated}\nПрескочени: ${response.data.skipped}\nОбщо: ${response.data.total}`);
    } catch (error) {
      console.error("Error generating product meta:", error);
      alert("Грешка при генериране на мета тагове");
    } finally {
      setGeneratingProductMeta(false);
    }
  };

  const handleGenerateCategoryMeta = async () => {
    if (!confirm("Сигурни ли сте, че искате да генерирате мета тагове за всички категории? Това ще презапише съществуващите мета тагове за категории, които нямат активиран чекбокса 'Не презаписвай мета'.")) {
      return;
    }

    try {
      setGeneratingCategoryMeta(true);
      const response = await seoSettingsService.generateCategoryMeta();
      alert(`Успешно генерирани мета тагове!\n\nГенерирани: ${response.data.generated}\nПрескочени: ${response.data.skipped}\nОбщо: ${response.data.total}`);
    } catch (error) {
      console.error("Error generating category meta:", error);
      alert("Грешка при генериране на мета тагове");
    } finally {
      setGeneratingCategoryMeta(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "url-settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                URL настройки
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Настройте формата на URL адресите за различните типове съдържание
              </p>
            </div>

            {/* URL Formats */}
            <div className="space-y-6">
              {/* Products */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Продукти</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Формат
                    </label>
                    <input
                      type="text"
                      value={productUrlFormat}
                      onChange={(e) => setProductUrlFormat(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder="/{def-category-slug}/{product-slug}"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Използвайте <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{"{def-category-slug}"}</code> и <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{"{product-slug}"}</code>
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={productUrlSuffix}
                      onChange={(e) => setProductUrlSuffix(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder=".html"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Например: .html, .htm или оставете празно
                    </p>
                  </div>
                  <div className="mt-3 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Примерен URL:</p>
                    <p className="text-sm font-mono text-blue-700 dark:text-blue-400">
                      {generateExampleUrl(productUrlFormat, productUrlSuffix, {
                        'def-category-slug': 'gradina',
                        'product-slug': 'kofa-10-l'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Категории</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Формат
                    </label>
                    <input
                      type="text"
                      value={categoryUrlFormat}
                      onChange={(e) => setCategoryUrlFormat(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder="/{category-slug}"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Използвайте <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{"{category-slug}"}</code>
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={categoryUrlSuffix}
                      onChange={(e) => setCategoryUrlSuffix(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder=".html"
                    />
                  </div>
                  <div className="mt-3 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Примерен URL:</p>
                    <p className="text-sm font-mono text-blue-700 dark:text-blue-400">
                      {generateExampleUrl(categoryUrlFormat, categoryUrlSuffix, {
                        'category-slug': 'gradina'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Марки</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Формат
                    </label>
                    <input
                      type="text"
                      value={brandUrlFormat}
                      onChange={(e) => setBrandUrlFormat(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder="/{brand-slug}"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Използвайте <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{"{brand-slug}"}</code>
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={brandUrlSuffix}
                      onChange={(e) => setBrandUrlSuffix(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder=".html"
                    />
                  </div>
                  <div className="mt-3 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Примерен URL:</p>
                    <p className="text-sm font-mono text-blue-700 dark:text-blue-400">
                      {generateExampleUrl(brandUrlFormat, brandUrlSuffix, {
                        'brand-slug': 'gardena'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* CMS Pages */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-3 font-medium text-gray-900 dark:text-white">CMS Страници</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Формат
                    </label>
                    <input
                      type="text"
                      value={cmsUrlFormat}
                      onChange={(e) => setCmsUrlFormat(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder="/pages/{cms-category}/{cms-page-slug}"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Използвайте <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{"{cms-category}"}</code> и <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{"{cms-page-slug}"}</code>
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={cmsUrlSuffix}
                      onChange={(e) => setCmsUrlSuffix(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder=".html"
                    />
                  </div>
                  <div className="mt-3 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Примерен URL:</p>
                    <p className="text-sm font-mono text-blue-700 dark:text-blue-400">
                      {generateExampleUrl(cmsUrlFormat, cmsUrlSuffix, {
                        'cms-category': 'informaciya',
                        'cms-page-slug': 'za-nas'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* CMS Categories */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-3 font-medium text-gray-900 dark:text-white">CMS Категории</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Формат
                    </label>
                    <input
                      type="text"
                      value={cmsCategoryUrlFormat}
                      onChange={(e) => setCmsCategoryUrlFormat(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder="/pages/{cms-category}"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Използвайте <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{"{cms-category}"}</code>
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={cmsCategoryUrlSuffix}
                      onChange={(e) => setCmsCategoryUrlSuffix(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder=".html"
                    />
                  </div>
                  <div className="mt-3 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Примерен URL:</p>
                    <p className="text-sm font-mono text-blue-700 dark:text-blue-400">
                      {generateExampleUrl(cmsCategoryUrlFormat, cmsCategoryUrlSuffix, {
                        'cms-category': 'informaciya'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blog Pages */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Блог Страници</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Формат
                    </label>
                    <input
                      type="text"
                      value={blogUrlFormat}
                      onChange={(e) => setBlogUrlFormat(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder="/blog/{blog-category}/{blog-page-slug}"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Използвайте <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{"{blog-category}"}</code> и <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{"{blog-page-slug}"}</code>
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={blogUrlSuffix}
                      onChange={(e) => setBlogUrlSuffix(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder=".html"
                    />
                  </div>
                  <div className="mt-3 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Примерен URL:</p>
                    <p className="text-sm font-mono text-blue-700 dark:text-blue-400">
                      {generateExampleUrl(blogUrlFormat, blogUrlSuffix, {
                        'blog-category': 'saveti',
                        'blog-page-slug': 'kak-da-izberem-instrumenti'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blog Categories */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Блог Категории</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Формат
                    </label>
                    <input
                      type="text"
                      value={blogCategoryUrlFormat}
                      onChange={(e) => setBlogCategoryUrlFormat(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder="/blog/{blog-category}"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Използвайте <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{"{blog-category}"}</code>
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={blogCategoryUrlSuffix}
                      onChange={(e) => setBlogCategoryUrlSuffix(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder=".html"
                    />
                  </div>
                  <div className="mt-3 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Примерен URL:</p>
                    <p className="text-sm font-mono text-blue-700 dark:text-blue-400">
                      {generateExampleUrl(blogCategoryUrlFormat, blogCategoryUrlSuffix, {
                        'blog-category': 'saveti'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Canonical URL Settings */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="canonicalEnabled"
                  checked={canonicalEnabled}
                  onChange={(e) => setCanonicalEnabled(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-gray-300"
                />
                <div className="flex-1">
                  <label htmlFor="canonicalEnabled" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Активирай Canonical URLs
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Автоматично добавяне на canonical link tags за да се избегне дублирано съдържание
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
              >
                <Save className="h-4 w-4" />
                {saving ? "Записване..." : "Запази промените"}
              </button>
            </div>
          </div>
        );

      case "meta-tags":
        const generateMetaPreview = (template: string, examples: Record<string, string>) => {
          let result = template;
          Object.entries(examples).forEach(([key, value]) => {
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
          });
          return result;
        };

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Meta Tags
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Конфигурирайте шаблони за мета тагове, които се генерират автоматично
              </p>
            </div>

            {/* Product Meta Tags */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Мета тагове за Продукти</h3>

              {/* Available Variables */}
              <div className="mb-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Налични променливи:</p>
                <div className="flex flex-wrap gap-2">
                  {['{name}', '{price}', '{description}', '{category}', '{brand}', '{shop_name}'].map((variable) => (
                    <code key={variable} className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      {variable}
                    </code>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {/* Meta Title */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Шаблон за Мета Заглавие
                  </label>
                  <input
                    type="text"
                    value={productMetaTitleTemplate}
                    onChange={(e) => setProductMetaTitleTemplate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    placeholder="{name} - {shop_name}"
                  />
                  <div className="mt-2 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Преглед:</p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {generateMetaPreview(productMetaTitleTemplate, {
                        'name': 'Кофа 10л',
                        'price': '15.99',
                        'description': 'Удобна пластмасова кофа с дръжка',
                        'category': 'Градина',
                        'brand': 'Gardena',
                        'shop_name': 'YourShop.com'
                      })}
                    </p>
                  </div>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Шаблон за Мета Описание
                  </label>
                  <textarea
                    value={productMetaDescriptionTemplate}
                    onChange={(e) => setProductMetaDescriptionTemplate(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    placeholder="Купете {name} на страхотна цена от {shop_name}. {description}"
                  />
                  <div className="mt-2 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Преглед:</p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {generateMetaPreview(productMetaDescriptionTemplate, {
                        'name': 'Кофа 10л',
                        'price': '15.99',
                        'description': 'Удобна пластмасова кофа с дръжка',
                        'category': 'Градина',
                        'brand': 'Gardena',
                        'shop_name': 'YourShop.com'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate Button for Products */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleGenerateProductMeta}
                  disabled={generatingProductMeta}
                  className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 dark:bg-purple-600 dark:hover:bg-purple-700"
                >
                  <Wand2 className="h-4 w-4" />
                  {generatingProductMeta ? "Генериране..." : "Генерирай мета тагове за всички продукти"}
                </button>
              </div>
            </div>

            {/* Category Meta Tags */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Мета тагове за Категории</h3>

              {/* Available Variables */}
              <div className="mb-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Налични променливи:</p>
                <div className="flex flex-wrap gap-2">
                  {['{name}', '{description}', '{product_count}', '{shop_name}'].map((variable) => (
                    <code key={variable} className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      {variable}
                    </code>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {/* Meta Title */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Шаблон за Мета Заглавие
                  </label>
                  <input
                    type="text"
                    value={categoryMetaTitleTemplate}
                    onChange={(e) => setCategoryMetaTitleTemplate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    placeholder="{name} - {shop_name}"
                  />
                  <div className="mt-2 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Преглед:</p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {generateMetaPreview(categoryMetaTitleTemplate, {
                        'name': 'Градина',
                        'description': 'Всичко за вашата градина',
                        'product_count': '150',
                        'shop_name': 'YourShop.com'
                      })}
                    </p>
                  </div>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Шаблон за Мета Описание
                  </label>
                  <textarea
                    value={categoryMetaDescriptionTemplate}
                    onChange={(e) => setCategoryMetaDescriptionTemplate(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    placeholder="Разгледайте нашата категория {name} в {shop_name}. {description}"
                  />
                  <div className="mt-2 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Преглед:</p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {generateMetaPreview(categoryMetaDescriptionTemplate, {
                        'name': 'Градина',
                        'description': 'Всичко за вашата градина',
                        'product_count': '150',
                        'shop_name': 'YourShop.com'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate Button for Categories */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleGenerateCategoryMeta}
                  disabled={generatingCategoryMeta}
                  className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 dark:bg-purple-600 dark:hover:bg-purple-700"
                >
                  <Wand2 className="h-4 w-4" />
                  {generatingCategoryMeta ? "Генериране..." : "Генерирай мета тагове за всички категории"}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
              >
                <Save className="h-4 w-4" />
                {saving ? "Записване..." : "Запази промените"}
              </button>
            </div>
          </div>
        );

      case "rich-snippets":
        const generateJsonLd = () => {
          if (!organizationEnabled) return null;

          const organization: any = {
            "@context": "https://schema.org",
            "@type": organizationType,
            "name": organizationName || "Example Shop",
            "url": `https://${baseUrl}`,
          };

          if (organizationLogo) {
            organization.logo = organizationLogo;
          }

          if (telephone || email) {
            organization.contactPoint = {
              "@type": "ContactPoint",
              "telephone": telephone,
              "email": email,
              "contactType": "customer service"
            };
          }

          if (addressStreet || addressCity) {
            organization.address = {
              "@type": "PostalAddress",
              "streetAddress": addressStreet,
              "addressLocality": addressCity,
              "postalCode": addressPostalCode,
              "addressCountry": addressCountry
            };
          }

          const socials = [];
          if (socialFacebook) socials.push(socialFacebook);
          if (socialInstagram) socials.push(socialInstagram);
          if (socialTwitter) socials.push(socialTwitter);

          if (socials.length > 0) {
            organization.sameAs = socials;
          }

          return JSON.stringify(organization, null, 2);
        };

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Rich Snippets (JSON-LD)
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Конфигурирайте структурирани данни за подобрено SEO и представяне в търсачките
              </p>
            </div>

            {/* Organization Settings */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Organization (Организация)</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={organizationEnabled}
                    onChange={(e) => setOrganizationEnabled(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Активирано</span>
                </label>
              </div>

              {organizationEnabled && (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Име на организацията
                        </label>
                        <input
                          type="text"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                          placeholder="DSHome"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Тип организация
                        </label>
                        <select
                          value={organizationType}
                          onChange={(e) => setOrganizationType(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                          <option value="OnlineStore">Online Store</option>
                          <option value="LocalBusiness">Local Business</option>
                          <option value="Store">Store</option>
                          <option value="Organization">Organization</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        URL на лого
                      </label>
                      <input
                        type="url"
                        value={organizationLogo}
                        onChange={(e) => setOrganizationLogo(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Телефон
                        </label>
                        <input
                          type="tel"
                          value={telephone}
                          onChange={(e) => setTelephone(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                          placeholder="+359 XXX XXX XXX"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                          placeholder="info@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Адрес - Улица
                      </label>
                      <input
                        type="text"
                        value={addressStreet}
                        onChange={(e) => setAddressStreet(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="ул. Примерна 123"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Град
                        </label>
                        <input
                          type="text"
                          value={addressCity}
                          onChange={(e) => setAddressCity(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                          placeholder="София"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Пощенски код
                        </label>
                        <input
                          type="text"
                          value={addressPostalCode}
                          onChange={(e) => setAddressPostalCode(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                          placeholder="1000"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Държава (код)
                        </label>
                        <input
                          type="text"
                          value={addressCountry}
                          onChange={(e) => setAddressCountry(e.target.value)}
                          maxLength={2}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                          placeholder="BG"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={socialFacebook}
                        onChange={(e) => setSocialFacebook(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="https://facebook.com/yourshop"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={socialInstagram}
                        onChange={(e) => setSocialInstagram(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="https://instagram.com/yourshop"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Twitter URL
                      </label>
                      <input
                        type="url"
                        value={socialTwitter}
                        onChange={(e) => setSocialTwitter(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        placeholder="https://twitter.com/yourshop"
                      />
                    </div>
                  </div>

                  {/* JSON-LD Preview */}
                  <div className="mt-6 rounded-lg bg-gray-900 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">JSON-LD Preview:</p>
                      <button
                        onClick={() => {
                          const jsonLd = generateJsonLd();
                          if (jsonLd) {
                            navigator.clipboard.writeText(jsonLd);
                            alert("JSON-LD копиран в клипборда!");
                          }
                        }}
                        className="text-xs text-brand-400 hover:text-brand-300"
                      >
                        Копирай
                      </button>
                    </div>
                    <pre className="text-xs text-green-400 overflow-x-auto">
                      {generateJsonLd()}
                    </pre>
                  </div>
                </>
              )}
            </div>

            {/* Product Snippets */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Snippets</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productSnippetsEnabled}
                    onChange={(e) => setProductSnippetsEnabled(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Активирано</span>
                </label>
              </div>

              {productSnippetsEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Тип описание
                    </label>
                    <select
                      value={productDescriptionType}
                      onChange={(e) => setProductDescriptionType(e.target.value as 'short' | 'full')}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    >
                      <option value="short">Кратко описание</option>
                      <option value="full">Пълно описание</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Изберете кое описание да се използва в JSON-LD
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Валута по подразбиране
                    </label>
                    <input
                      type="text"
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      maxLength={3}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder="BGN"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Включи в JSON-LD:</p>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productIncludePrice}
                        onChange={(e) => setProductIncludePrice(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Цена</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productIncludeAvailability}
                        onChange={(e) => setProductIncludeAvailability(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Наличност</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productIncludeSku}
                        onChange={(e) => setProductIncludeSku(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">SKU</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productIncludeImages}
                        onChange={(e) => setProductIncludeImages(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Снимки</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productIncludeBrand}
                        onChange={(e) => setProductIncludeBrand(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Марка</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productIncludeSpecifications}
                        onChange={(e) => setProductIncludeSpecifications(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Характеристики</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Breadcrumbs */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Breadcrumb List</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Структурирани данни за навигационна пътека
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={breadcrumbsEnabled}
                    onChange={(e) => setBreadcrumbsEnabled(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Активирано</span>
                </label>
              </div>
            </div>

            {/* Website Search */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Website Search</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Search box в Google резултатите
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={websiteSearchEnabled}
                    onChange={(e) => setWebsiteSearchEnabled(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Активирано</span>
                </label>
              </div>

              {websiteSearchEnabled && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Search URL Pattern
                  </label>
                  <input
                    type="text"
                    value={searchUrlPattern}
                    onChange={(e) => setSearchUrlPattern(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    placeholder="/search?q={search_term_string}"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Използвайте <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{"{search_term_string}"}</code> за търсения термин
                  </p>
                </div>
              )}
            </div>

            {/* Blog Snippets */}
            <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Blog Post Snippets</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Структурирани данни за блог статии
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blogSnippetsEnabled}
                    onChange={(e) => setBlogSnippetsEnabled(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Активирано</span>
                </label>
              </div>

              {blogSnippetsEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Автор по подразбиране
                    </label>
                    <input
                      type="text"
                      value={defaultAuthorName}
                      onChange={(e) => setDefaultAuthorName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder="Име на автор"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Снимка на автор (URL)
                    </label>
                    <input
                      type="url"
                      value={defaultAuthorImage}
                      onChange={(e) => setDefaultAuthorImage(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder="https://example.com/author.jpg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
              >
                <Save className="h-4 w-4" />
                {saving ? "Записване..." : "Запази промените"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 dark:text-white">Зареждане...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          Модул: SEO
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Управление на SEO настройки и оптимизации
        </p>
      </div>

      {/* Vertical Tabs Layout */}
      <div className="flex gap-6">
        {/* Vertical Tabs Sidebar */}
        <div className="w-64 shrink-0">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <nav className="flex flex-col p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
