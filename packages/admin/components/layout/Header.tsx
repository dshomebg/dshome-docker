"use client";

import { Bell, Search, User, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-between grow xl:flex-row xl:px-6">
        {/* Left side - Search and mobile */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 xl:justify-normal xl:border-b-0 xl:px-0 xl:py-4">
          <div className="hidden xl:block">
            <form>
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Търси..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800 xl:w-[430px]"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center justify-between w-full gap-4 px-5 py-4 xl:justify-end xl:px-0 shadow-sm xl:shadow-none">
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:h-11 lg:w-11"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:h-11 lg:w-11">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>
          </div>

          {/* User Dropdown */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                Admin
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                Администратор
              </span>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 lg:h-11 lg:w-11">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
