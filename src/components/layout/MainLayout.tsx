"use client";

import { useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUserStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="md:hidden sticky top-16 z-30 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="gap-2 min-h-[44px]"
          >
            {sidebarOpen ? (
              <>
                <X className="h-4 w-4" />
                <span className="text-sm">Close Menu</span>
              </>
            ) : (
              <>
                <Menu className="h-4 w-4" />
                <span className="text-sm">Open Menu</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 relative">
        <Sidebar
          sidebarOpen={sidebarOpen}
          className={`
            fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 
            bg-white border-r shadow-lg md:shadow-none
            transform transition-transform duration-300 ease-in-out z-40
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }
          `}
        />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden w-full">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
