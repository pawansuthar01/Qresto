"use client";

import { useState, useEffect, useRef } from "react";
import { QrCode, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Example role-based redirect
  const userRole = session?.user?.role;

  const dashboardRoute =
    userRole === "SUPER_ADMIN"
      ? "/admin/dashboard"
      : userRole === "ADMIN"
      ? "/company/dashboard"
      : userRole === "OWNER"
      ? `/owner/restaurants/${
          session?.user.restaurantId || "padding"
        }/dashboard`
      : "/dashboard";

  const navLinks = [
    { id: "/", label: "Home" },
    { id: "/about", label: "About" },
    { id: "/contact", label: "Contact" },
    { id: "/privacy-police", label: "Privacy" },
    { id: "/terms-conditions", label: "Terms" },
  ];

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <QrCode className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">QResto</span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => router.push(link.id)}
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === link.id ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {link.label}
            </button>
          ))}

          {session ? (
            <Button onClick={() => router.push(dashboardRoute)}>
              Dashboard
            </Button>
          ) : (
            <Button onClick={() => router.push("/signin")}>Sign In</Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "visible bg-black/40" : "invisible bg-transparent"
        }`}
      >
        <div
          ref={drawerRef}
          className={`fixed top-0 right-0 h-full w-1/2 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <span className="text-lg font-bold text-gray-900">QResto Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col  justify-center px-6 py-6 space-y-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  router.push(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-base font-medium transition-colors hover:text-blue-600 ${
                  pathname === link.id ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {link.label}
              </button>
            ))}

            {session ? (
              <button
                onClick={() => {
                  router.push(dashboardRoute);
                  setMobileMenuOpen(false);
                }}
                className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <Button
                onClick={() => {
                  router.push("/signin");
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
