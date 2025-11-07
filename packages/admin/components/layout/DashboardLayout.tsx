"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden ml-64">
        <Header />
        <main className="mt-16 flex-grow p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
