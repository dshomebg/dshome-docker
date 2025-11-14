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
  Puzzle,
  Palette,
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
      { title: "Настройки", path: "/catalog/settings" },
    ],
  },
  {
    title: "Продажби",
    icon: ShoppingCart,
    children: [
      { title: "Поръчки", path: "/sales/orders" },
      { title: "Клиенти", path: "/sales/customers" },
      { title: "Куриери", path: "/sales/couriers" },
      { title: "Статуси", path: "/sales/order-statuses" },
    ],
  },
  {
    title: "Дизайн",
    icon: Palette,
    children: [
      { title: "Изображения", path: "/design/image-sizes" },
      { title: "Email шаблони", path: "/design/email-templates" },
    ],
  },
  {
    title: "Модули",
    icon: Puzzle,
    children: [
      { title: "Оценки и Отзиви", path: "/modules/reviews" },
      { title: "Въпроси и Отговори", path: "/modules/product-qa" },
      { title: "Пакети/м²", path: "/modules/measurement-packages" },
      { title: "SEO", path: "/modules/seo" },
      { title: "Количества - Update", path: "/modules/quantity-update" },
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
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          DSHome
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          MENU
        </div>
        <ul className="space-y-1.5">
          {menuItems.map((item) => (
            <li key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
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
                    <ul className="ml-9 mt-1.5 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <Link
                            href={child.path}
                            className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                              pathname === child.path
                                ? "bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            }`}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.path!}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
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
