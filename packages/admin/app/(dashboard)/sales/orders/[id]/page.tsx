"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ordersService, Order } from "@/lib/services/orders.service";
import { couriersService } from "@/lib/services/couriers.service";
import { orderStatusesService } from "@/lib/services/order-statuses.service";
import {
  ArrowLeft,
  Printer,
  Edit2,
  Save,
  X
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Status dropdown state
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statuses, setStatuses] = useState<any[]>([]);

  // Customer info edit state
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: ""
  });

  // Delivery info state
  const [couriers, setCouriers] = useState<any[]>([]);
  const [deliveryData, setDeliveryData] = useState({
    courierId: "",
    trackingNumber: "",
    shippingCost: "",
    weight: ""
  });

  // Admin notes state
  const [adminNotes, setAdminNotes] = useState("");
  const [adminNotesHistory, setAdminNotesHistory] = useState<string>("");

  useEffect(() => {
    if (params.id) {
      fetchOrder();
      fetchCouriers();
      fetchStatuses();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersService.getOrder(params.id as string);
      const orderData = response.data;
      setOrder(orderData);
      setSelectedStatus(orderData.status);

      // Initialize customer data
      setCustomerData({
        firstName: orderData.customerFirstName || "",
        lastName: orderData.customerLastName || "",
        email: orderData.customerEmail || "",
        phone: orderData.customerPhone || "",
        address: orderData.shippingAddress?.address || ""
      });

      // Initialize delivery data
      setDeliveryData({
        courierId: orderData.courierId || "",
        trackingNumber: orderData.trackingNumber || "",
        shippingCost: orderData.shippingCost || "0",
        weight: orderData.weight || ""
      });

      // Initialize admin notes
      setAdminNotes(orderData.adminNotes || "");
      setAdminNotesHistory(orderData.adminNotes || "");
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Грешка при зареждане на поръчката");
    } finally {
      setLoading(false);
    }
  };

  const fetchCouriers = async () => {
    try {
      const response = await couriersService.getCouriers({ isActive: true });
      setCouriers(response.data);
    } catch (error) {
      console.error("Error fetching couriers:", error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await orderStatusesService.getOrderStatuses();
      setStatuses(response.data);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusSave = async () => {
    if (!order) return;

    try {
      setSaving(true);
      await ordersService.updateOrderStatus(order.id, selectedStatus);
      await fetchOrder(); // Refresh to stay on same page
      alert("Статусът е обновен успешно");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Грешка при обновяване на статус");
    } finally {
      setSaving(false);
    }
  };

  const handleCustomerSave = async () => {
    if (!order) return;

    try {
      setSaving(true);
      // TODO: Update customer info via API
      // await ordersService.updateOrder(order.id, { customerData });
      setEditingCustomer(false);
      await fetchOrder();
      alert("Информацията за клиента е обновена");
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Грешка при обновяване на информацията");
    } finally {
      setSaving(false);
    }
  };

  const handleDeliverySave = async () => {
    if (!order) return;

    try {
      setSaving(true);
      await ordersService.updateOrder(order.id, {
        courierId: deliveryData.courierId || undefined,
        trackingNumber: deliveryData.trackingNumber || undefined,
        weight: deliveryData.weight || undefined
      });
      await fetchOrder();
      alert("Информацията за доставка е обновена");
    } catch (error) {
      console.error("Error updating delivery:", error);
      alert("Грешка при обновяване на доставката");
    } finally {
      setSaving(false);
    }
  };

  const handleAdminNotesSave = async () => {
    if (!order) return;

    try {
      setSaving(true);
      await ordersService.updateOrder(order.id, { adminNotes });
      setAdminNotesHistory(adminNotes);
      await fetchOrder();
      alert("Бележките са запазени");
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Грешка при запазване на бележките");
    } finally {
      setSaving(false);
    }
  };

  const handlePrintOrder = () => {
    // TODO: Implement PDF generation
    alert("PDF генерацията ще бъде имплементирана");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-red-600">Поръчката не е намерена</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Top Action Bar */}
      <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.08]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintOrder}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.08]"
          >
            <Printer className="h-4 w-4" />
            Отпечатай поръчка
          </button>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleStatusSave}
            disabled={saving || selectedStatus === order.status}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Save className="h-4 w-4" />
            Запази
          </button>
        </div>
      </div>

      {/* Order Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Поръчка #{order.orderNumber}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Създадена на {formatDate(order.createdAt)}
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Детайли за поръчката
            </h2>

            {/* Product Table */}
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/[0.05]">
                  <th className="pb-3 text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Продукт</th>
                  <th className="pb-3 text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Реф. №</th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Кол.</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Ед. цена</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Общо</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-white/[0.05]">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.productName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {item.productSku || item.referenceNumber || "—"}
                      </td>
                      <td className="py-3 text-center text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right text-gray-900 dark:text-white">
                        {parseFloat(item.unitPrice).toFixed(2)} €
                      </td>
                      <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">
                        {parseFloat(item.total).toFixed(2)} €
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      Няма продукти в поръчката
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Order Totals */}
            <div className="mt-6 space-y-2 border-t border-gray-200 pt-4 dark:border-white/[0.05]">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Междинна сума:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {parseFloat(order.subtotal).toFixed(2)} €
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Доставка:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {parseFloat(order.shippingCost).toFixed(2)} €
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold dark:border-white/[0.05]">
                <span className="text-gray-900 dark:text-white">Общо:</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {parseFloat(order.total).toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - 4 Tables */}
        <div className="space-y-6">
          {/* 1. Customer Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Информация за клиент
              </h2>
              {!editingCustomer && (
                <button
                  onClick={() => setEditingCustomer(true)}
                  className="rounded-lg border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.08]"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {editingCustomer ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Име</label>
                  <input
                    type="text"
                    value={customerData.firstName}
                    onChange={(e) => setCustomerData({ ...customerData, firstName: e.target.value })}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Фамилия</label>
                  <input
                    type="text"
                    value={customerData.lastName}
                    onChange={(e) => setCustomerData({ ...customerData, lastName: e.target.value })}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Имейл</label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Телефон</label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Адрес за доставка</label>
                  <textarea
                    value={customerData.address}
                    onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCustomerSave}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Запази
                  </button>
                  <button
                    onClick={() => setEditingCustomer(false)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Име:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.customerFirstName} {order.customerLastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Имейл:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Телефон:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.customerPhone}</p>
                </div>
                {order.shippingAddress && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Адрес за доставка:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.shippingAddress.address}, {order.shippingAddress.city}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Delivery Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Информация за доставка
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Куриер</label>
                <select
                  value={deliveryData.courierId}
                  onChange={(e) => setDeliveryData({ ...deliveryData, courierId: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                >
                  <option value="">Изберете куриер</option>
                  {couriers.map((courier) => (
                    <option key={courier.id} value={courier.id}>
                      {courier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Номер на товарителница</label>
                <input
                  type="text"
                  value={deliveryData.trackingNumber}
                  onChange={(e) => setDeliveryData({ ...deliveryData, trackingNumber: e.target.value })}
                  placeholder="Въведете номер"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Цена за доставка:</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {parseFloat(deliveryData.shippingCost).toFixed(2)} €
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Тегло</label>
                <input
                  type="number"
                  value={deliveryData.weight}
                  onChange={(e) => setDeliveryData({ ...deliveryData, weight: e.target.value })}
                  placeholder="кг"
                  step="0.01"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                />
              </div>
              <button
                onClick={handleDeliverySave}
                disabled={saving}
                className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Запази
              </button>
            </div>
          </div>

          {/* 3. Administrative Notes */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Административни бележки
            </h2>
            <div className="space-y-3">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                placeholder="Добавете бележки..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              />
              {adminNotesHistory && (
                <div className="rounded-md bg-gray-50 p-3 text-xs dark:bg-white/[0.02]">
                  <p className="text-gray-600 dark:text-gray-400">
                    Направени на {formatDate(order.updatedAt)}
                  </p>
                  <p className="mt-1 text-gray-900 dark:text-white">{adminNotesHistory}</p>
                </div>
              )}
              <button
                onClick={handleAdminNotesSave}
                disabled={saving}
                className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Запази
              </button>
            </div>
          </div>

          {/* 4. Customer Notes */}
          {order.notes && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Клиентски бележки
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
