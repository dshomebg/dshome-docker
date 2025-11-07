"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen xl:flex">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ease-in-out ml-0 xl:ml-64">
        <Header />
        <main className="p-4 mx-auto md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
