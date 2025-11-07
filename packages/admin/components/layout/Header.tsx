"use client";

import { Bell, Search, User } from "lucide-react";
import { ThemeToggleButton } from "../ThemeToggleButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-sm md:px-6 2xl:px-11">
        {/* Left side - Search */}
        <div className="hidden sm:block">
          <div className="relative">
            <button className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <input
              type="text"
              placeholder="Търси..."
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 xl:w-96"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggleButton />

          {/* Notifications */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4">
            <div className="hidden text-right lg:block">
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                Admin
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                Администратор
              </span>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
