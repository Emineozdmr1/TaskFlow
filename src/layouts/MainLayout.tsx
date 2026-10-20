import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar (Hem masaüstü hem mobil çekmeceyi yönetir) */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden bg-background">
        {/* Navbar'a menü açma fonksiyonu iletiliyor */}
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background text-foreground">
          <Outlet />
        </main>
      </div>
    </div>
  );
}