"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="mt-16 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
