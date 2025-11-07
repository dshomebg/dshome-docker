"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Box,
  ShoppingCart,
  Settings,
  Wrench,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  title: string;
  path?: string;
  icon: any;
  children?: {
    title: string;
    path: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: Home,
  },
  {
    title: "Каталог",
    icon: Box,
    children: [
      { title: "Продукти", path: "/catalog/products" },
      { title: "Категории", path: "/catalog/categories" },
      { title: "Атрибути", path: "/catalog/attributes" },
      { title: "Характеристики", path: "/catalog/features" },
      { title: "Марки", path: "/catalog/brands" },
      { title: "Доставчици", path: "/catalog/suppliers" },
      { title: "Складове", path: "/catalog/warehouses" },
    ],
  },
  {
    title: "Продажби",
    icon: ShoppingCart,
    children: [
      { title: "Поръчки", path: "/sales/orders" },
      { title: "Клиенти", path: "/sales/customers" },
      { title: "Куриери", path: "/sales/couriers" },
      { title: "Статуси", path: "/sales/statuses" },
    ],
  },
  {
    title: "Инструменти",
    icon: Wrench,
    children: [
      { title: "Обновяване на стоки", path: "/tools/stock-update" },
      { title: "Калкулатор доставки", path: "/tools/shipping-calc" },
    ],
  },
  {
    title: "Настройки",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["Каталог"]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          DSHome Admin
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                    {openMenus.includes(item.title) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {openMenus.includes(item.title) && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <Link
                            href={child.path}
                            className={`block rounded-lg px-3 py-2 text-sm ${
                              pathname === child.path
                                ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            }`}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.path!}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                    pathname === item.path
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
