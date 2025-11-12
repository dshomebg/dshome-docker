"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  couriersService,
  Courier,
  CourierFormData,
  CourierPricingRange,
  DeliveryType,
} from "@/lib/services/couriers.service";
import { Save, X, Plus, Trash2 } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface CourierFormProps {
  mode: "create" | "edit";
  courier?: Courier;
}

export default function CourierForm({ mode, courier }: CourierFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<DeliveryType>("address");

  const [formData, setFormData] = useState<CourierFormData>({
    name: courier?.name || "",
    isActive: courier?.isActive ?? true,
    trackingUrl: courier?.trackingUrl || "",
    logoUrl: courier?.logoUrl || "",
    offersOfficeDelivery: courier?.offersOfficeDelivery ?? false,
    palletDeliveryEnabled: courier?.palletDeliveryEnabled ?? false,
    palletWeightThreshold: courier?.palletWeightThreshold || "",
    palletMaxWeight: courier?.palletMaxWeight || "",
    palletPrice: courier?.palletPrice || "",
  });

  const [addressRanges, setAddressRanges] = useState<CourierPricingRange[]>(
    courier?.pricingRanges?.filter((r) => r.deliveryType === "address") || [
      { deliveryType: "address", weightFrom: "0", weightTo: "1", price: "0" },
    ]
  );

  const [officeRanges, setOfficeRanges] = useState<CourierPricingRange[]>(
    courier?.pricingRanges?.filter((r) => r.deliveryType === "office") || [
      { deliveryType: "office", weightFrom: "0", weightTo: "1", price: "0" },
    ]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleToggle = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name as keyof CourierFormData],
    }));
  };

  const addRange = (type: DeliveryType) => {
    const ranges = type === "address" ? addressRanges : officeRanges;
    const lastRange = ranges[ranges.length - 1];
    const nextWeightFrom = lastRange ? (parseFloat(lastRange.weightTo) + 0.01).toFixed(2) : "0";

    const newRange: CourierPricingRange = {
      deliveryType: type,
      weightFrom: nextWeightFrom,
      weightTo: (parseFloat(nextWeightFrom) + 1).toFixed(2),
      price: "0",
    };

    if (type === "address") {
      setAddressRanges([...ranges, newRange]);
    } else {
      setOfficeRanges([...ranges, newRange]);
    }
  };

  const removeRange = (type: DeliveryType, index: number) => {
    if (type === "address") {
      setAddressRanges(addressRanges.filter((_, i) => i !== index));
    } else {
      setOfficeRanges(officeRanges.filter((_, i) => i !== index));
    }
  };

  const updateRange = (
    type: DeliveryType,
    index: number,
    field: keyof CourierPricingRange,
    value: string
  ) => {
    if (type === "address") {
      const updated = [...addressRanges];
      updated[index] = { ...updated[index], [field]: value };
      setAddressRanges(updated);
    } else {
      const updated = [...officeRanges];
      updated[index] = { ...updated[index], [field]: value };
      setOfficeRanges(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const allRanges = [...addressRanges];
      if (formData.offersOfficeDelivery) {
        allRanges.push(...officeRanges);
      }

      const dataToSend: CourierFormData = {
        ...formData,
        pricingRanges: allRanges,
      };

      if (mode === "create") {
        await couriersService.createCourier(dataToSend);
      } else if (courier) {
        await couriersService.updateCourier(courier.id, dataToSend);
      }

      router.push("/sales/couriers");
    } catch (error: any) {
      console.error("Error saving courier:", error);
      alert(error.response?.data?.message || "Неуспешно запазване");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Основна информация
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Име на куриер <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Например: Еконт"
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                URL за проследяване
              </label>
              <input
                type="text"
                name="trackingUrl"
                value={formData.trackingUrl}
                onChange={handleChange}
                placeholder="https://example.com/track/@nomer-tovaritelnica"
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
              />
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Използвайте @nomer-tovaritelnica като placeholder
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle("isActive")}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    formData.isActive ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Активен
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle("offersOfficeDelivery")}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    formData.offersOfficeDelivery ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      formData.offersOfficeDelivery ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Доставка до офис
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Logo */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Лого на куриера
            </label>
            <ImageUpload
              value={formData.logoUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, logoUrl: url }))}
              onRemove={() => setFormData((prev) => ({ ...prev, logoUrl: "" }))}
            />
          </div>
        </div>
      </div>

      {/* Pricing Ranges */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Стандартна доставка
        </h2>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Ценообразуване на база тегло (EUR)
        </p>

        {formData.offersOfficeDelivery && (
          <div className="mb-3 flex gap-1 border-b border-gray-200 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => setActiveTab("address")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "address"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              До адрес
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("office")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "office"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              До офис
            </button>
          </div>
        )}

        <div className="space-y-2">
          {(activeTab === "address" ? addressRanges : officeRanges).map((range, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div>
                  {index === 0 && (
                    <label className="mb-0.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      От (кг)
                    </label>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    value={range.weightFrom}
                    onChange={(e) =>
                      updateRange(activeTab, index, "weightFrom", e.target.value)
                    }
                    required
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
                <div>
                  {index === 0 && (
                    <label className="mb-0.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      До (кг)
                    </label>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    value={range.weightTo}
                    onChange={(e) =>
                      updateRange(activeTab, index, "weightTo", e.target.value)
                    }
                    required
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
                <div>
                  {index === 0 && (
                    <label className="mb-0.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Цена (EUR)
                    </label>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    value={range.price}
                    onChange={(e) =>
                      updateRange(activeTab, index, "price", e.target.value)
                    }
                    required
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRange(activeTab, index)}
                disabled={(activeTab === "address" ? addressRanges : officeRanges).length === 1}
                className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addRange(activeTab)}
          className="mt-2 flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.08]"
        >
          <Plus className="h-3.5 w-3.5" />
          Добави диапазон
        </button>
      </div>

      {/* Pallet Delivery */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Палетна доставка
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              За пратки над определено тегло
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle("palletDeliveryEnabled")}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              formData.palletDeliveryEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                formData.palletDeliveryEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {formData.palletDeliveryEnabled && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Праг (кг) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="palletWeightThreshold"
                value={formData.palletWeightThreshold}
                onChange={handleChange}
                required={formData.palletDeliveryEnabled}
                placeholder="50"
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
              />
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                От колко кг се активира
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Макс. кг/палет <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="palletMaxWeight"
                value={formData.palletMaxWeight}
                onChange={handleChange}
                required={formData.palletDeliveryEnabled}
                placeholder="700"
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
              />
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Макс. тегло на 1 палет
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Цена (EUR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="palletPrice"
                value={formData.palletPrice}
                onChange={handleChange}
                required={formData.palletDeliveryEnabled}
                placeholder="70"
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
              />
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Цена за 1 палет
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.08]"
        >
          <X className="h-3.5 w-3.5" />
          Отказ
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 rounded bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {loading ? "Запазване..." : "Запази"}
        </button>
      </div>
    </form>
  );
}
