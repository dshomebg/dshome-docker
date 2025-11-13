"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ordersService, CreateOrderData } from "@/lib/services/orders.service";
import { productsService } from "@/lib/services/products.service";
import { customersService, Customer } from "@/lib/services/customers.service";
import { couriersService } from "@/lib/services/couriers.service";
import { Autocomplete } from "@/components/ui/Autocomplete";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface OrderItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: string;
  weight: string; // Weight per unit in kg
}

export default function NewOrderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Selected customer
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Customer info
  const [customerData, setCustomerData] = useState({
    customerId: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    companyName: "",
    vatNumber: ""
  });

  // Shipping address
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Bulgaria"
  });

  // Delivery info
  const [deliveryData, setDeliveryData] = useState({
    courierId: "",
    trackingNumber: "",
    shippingCost: "0",
    weight: ""
  });

  // Order items
  const [items, setItems] = useState<OrderItem[]>([]);

  // Notes
  const [notes, setNotes] = useState(""); // Client notes
  const [adminNotes, setAdminNotes] = useState(""); // Admin notes

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([
      fetchProducts(""),
      fetchCustomers(""),
      fetchCouriers()
    ]);
  };

  const fetchProducts = async (query: string) => {
    try {
      setLoadingProducts(true);
      const response = await productsService.getProducts({
        search: query || undefined,
        limit: query ? 50 : 100
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCustomers = async (query: string) => {
    try {
      setLoadingCustomers(true);
      const response = await customersService.getCustomers({
        search: query || undefined,
        limit: 50
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoadingCustomers(false);
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

  // Handle customer selection
  const handleCustomerSelect = (customerId: string, option?: any) => {
    if (!option || !option.data) {
      setSelectedCustomer(null);
      setCustomerData({
        customerId: "",
        email: "",
        phone: "",
        firstName: "",
        lastName: "",
        companyName: "",
        vatNumber: ""
      });
      setShippingAddress({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Bulgaria"
      });
      return;
    }

    const customer: Customer = option.data;
    setSelectedCustomer(customer);

    // Auto-fill customer data
    setCustomerData({
      customerId: customer.id,
      email: customer.email,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      companyName: customer.companyName || "",
      vatNumber: customer.vatNumber || ""
    });

    // Auto-fill shipping address
    setShippingAddress({
      fullName: `${customer.firstName} ${customer.lastName}`,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postalCode: customer.postalCode || "",
      country: customer.country
    });
  };

  // Handle courier selection - auto-calculate shipping cost
  const handleCourierSelect = (courierId: string) => {
    setDeliveryData(prev => ({ ...prev, courierId }));

    // Calculate shipping if we have weight
    if (courierId) {
      // Use timeout to ensure state is updated
      setTimeout(() => {
        calculateShippingCost(courierId);
      }, 0);
    }
  };

  // Calculate shipping cost based on courier and products
  const calculateShippingCost = async (courierId: string, weight?: string) => {
    const courier = couriers.find(c => c.id === courierId);
    if (!courier) return;

    const totalWeight = parseFloat(weight || deliveryData.weight || "0");
    if (!totalWeight || totalWeight <= 0) {
      return; // Cannot calculate without weight
    }

    try {
      // Use 'address' as default delivery type (можете да добавите поле за избор на тип доставка)
      const response = await couriersService.calculateDeliveryPrice(
        courierId,
        totalWeight,
        'address'
      );

      // Use functional setState to get the latest state
      setDeliveryData(prev => ({
        ...prev,
        shippingCost: response.data.price.toFixed(2)
      }));
    } catch (error) {
      console.error("Error calculating shipping cost:", error);
      // Keep manual entry if calculation fails
    }
  };

  // Recalculate shipping when weight changes
  useEffect(() => {
    if (deliveryData.courierId && deliveryData.weight) {
      calculateShippingCost(deliveryData.courierId);
    }
  }, [deliveryData.weight]);

  // Auto-calculate total weight based on items
  useEffect(() => {
    const totalWeight = items.reduce((sum, item) => {
      const itemWeight = parseFloat(item.weight || "0");
      return sum + (itemWeight * item.quantity);
    }, 0);

    // Update delivery weight if items have weight
    if (totalWeight > 0) {
      setDeliveryData(prev => ({
        ...prev,
        weight: totalWeight.toFixed(3)
      }));
    }
  }, [items]);

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        productSku: "",
        quantity: 1,
        unitPrice: "0",
        weight: "0"
      }
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleProductSelect = (index: number, productId: string, option?: any) => {
    if (!option || !option.data) {
      updateItem(index, "productId", "");
      updateItem(index, "productName", "");
      updateItem(index, "productSku", "");
      updateItem(index, "unitPrice", "0");
      updateItem(index, "weight", "0");
      return;
    }

    const product = option.data;
    // Get price from currentPrice object
    const price = product.currentPrice?.price || "0";
    // Get weight from product
    const weight = product.weight || "0";

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      unitPrice: price, // Auto-fill price from currentPrice
      weight: weight // Auto-fill weight from product
    };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      return sum + parseFloat(item.unitPrice) * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + parseFloat(deliveryData.shippingCost || "0");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerData.email || !customerData.phone) {
      alert("Email и телефон са задължителни");
      return;
    }

    if (items.length === 0) {
      alert("Добавете поне един продукт");
      return;
    }

    // Validate that all items have products selected
    const invalidItems = items.filter(item => !item.productId);
    if (invalidItems.length > 0) {
      alert("Моля изберете продукт за всички артикули");
      return;
    }

    try {
      setSaving(true);

      const orderData: CreateOrderData = {
        customerEmail: customerData.email,
        customerPhone: customerData.phone,
        customerFirstName: customerData.firstName || undefined,
        customerLastName: customerData.lastName || undefined,
        customerCompanyName: customerData.companyName || undefined,
        customerVatNumber: customerData.vatNumber || undefined,
        courierId: deliveryData.courierId || undefined,
        trackingNumber: deliveryData.trackingNumber || undefined,
        shippingCost: deliveryData.shippingCost,
        weight: deliveryData.weight || undefined,
        notes: notes || undefined,
        adminNotes: adminNotes || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        shippingAddress: shippingAddress.fullName
          ? {
              fullName: shippingAddress.fullName,
              phone: shippingAddress.phone,
              address: shippingAddress.address,
              city: shippingAddress.city,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country
            }
          : undefined
      };

      const response = await ordersService.createOrder(orderData);
      alert(response.message);
      router.push(`/sales/orders/${response.data.id}`);
    } catch (error: any) {
      console.error("Error creating order:", error);
      alert(error.response?.data?.message || "Грешка при създаване на поръчката");
    } finally {
      setSaving(false);
    }
  };

  // Prepare autocomplete options
  const customerOptions = customers.map(customer => ({
    value: customer.id,
    label: `${customer.firstName} ${customer.lastName}`,
    subLabel: `${customer.email} • ${customer.phone}`,
    data: customer
  }));

  const productOptions = products.map(product => ({
    value: product.id,
    label: product.name,
    subLabel: `SKU: ${product.sku} • ${product.currentPrice?.price || "0"} €`,
    data: product
  }));

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.08]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Нова поръчка
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Създайте нова поръчка
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Продукти
                </h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Добави продукт
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 rounded-lg border border-gray-200 p-4 dark:border-white/[0.05]"
                  >
                    <div className="col-span-6">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Продукт *
                      </label>
                      <Autocomplete
                        options={productOptions}
                        value={item.productId}
                        onChange={(value, option) => handleProductSelect(index, value, option)}
                        onSearch={fetchProducts}
                        placeholder="Търсене на продукт..."
                        displayValue={item.productName}
                        required
                        loading={loadingProducts}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Количество
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Цена (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="rounded-lg border border-red-300 bg-white p-2 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:bg-red-900/10 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="col-span-12 text-right text-sm text-gray-600 dark:text-gray-400">
                      Сума: <span className="font-medium text-gray-900 dark:text-white">
                        {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Няма добавени продукти
                  </p>
                )}
              </div>

              {/* Totals */}
              {items.length > 0 && (
                <div className="mt-6 space-y-2 border-t border-gray-200 pt-4 dark:border-white/[0.05]">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Междинна сума:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {calculateSubtotal().toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Доставка:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {parseFloat(deliveryData.shippingCost).toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold dark:border-white/[0.05]">
                    <span className="text-gray-900 dark:text-white">Общо:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {calculateTotal().toFixed(2)} €
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Адрес за доставка
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Име
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Адрес
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.address}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, address: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Град
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Пощенски код
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        postalCode: e.target.value
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Бележки
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Клиентски бележки
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Бележки видими за клиента..."
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Административни бележки
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    placeholder="Вътрешни бележки (невидими за клиента)..."
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Customer & Delivery Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Информация за клиент
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Избери клиент
                  </label>
                  <Autocomplete
                    options={customerOptions}
                    value={customerData.customerId}
                    onChange={handleCustomerSelect}
                    onSearch={fetchCustomers}
                    placeholder="Търсене на клиент..."
                    loading={loadingCustomers}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Или попълнете данните ръчно
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3 dark:border-white/[0.05]">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, email: e.target.value })
                        }
                        required
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, phone: e.target.value })
                        }
                        required
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Име
                      </label>
                      <input
                        type="text"
                        value={customerData.firstName}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, firstName: e.target.value })
                        }
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Фамилия
                      </label>
                      <input
                        type="text"
                        value={customerData.lastName}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, lastName: e.target.value })
                        }
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Фирма
                      </label>
                      <input
                        type="text"
                        value={customerData.companyName}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, companyName: e.target.value })
                        }
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        ДДС номер
                      </label>
                      <input
                        type="text"
                        value={customerData.vatNumber}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, vatNumber: e.target.value })
                        }
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Информация за доставка
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Куриер
                  </label>
                  <select
                    value={deliveryData.courierId}
                    onChange={(e) => handleCourierSelect(e.target.value)}
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Тегло (кг)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={deliveryData.weight}
                    onChange={(e) =>
                      setDeliveryData(prev => ({ ...prev, weight: e.target.value }))
                    }
                    placeholder="0.00"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Автоматично изчислено на базата на продуктите
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Цена на доставка (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={deliveryData.shippingCost}
                    onChange={(e) =>
                      setDeliveryData(prev => ({ ...prev, shippingCost: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {deliveryData.courierId && deliveryData.weight
                      ? "Автоматично изчислена (можете да промените ръчно)"
                      : "Изберете куриер и въведете тегло за автоматично изчисление"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Товарителница
                  </label>
                  <input
                    type="text"
                    value={deliveryData.trackingNumber}
                    onChange={(e) =>
                      setDeliveryData(prev => ({ ...prev, trackingNumber: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Създаване..." : "Създай поръчка"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
