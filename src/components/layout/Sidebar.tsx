"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Table,
  QrCode,
  ShoppingCart,
  Settings,
  Building2,
  TrendingUp,
  Calendar,
} from "lucide-react";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { sidebarOpen } = useUserStore();

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const ownerLinks = session?.user.restaurantId
    ? [
        {
          href: `/owner/restaurants/${session.user.restaurantId}/dashboard`,
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: `/owner/restaurants/${session.user.restaurantId}/menu`,
          label: "Menu",
          icon: UtensilsCrossed,
        },
        {
          href: `/owner/restaurants/${session.user.restaurantId}/schedules`,
          label: "Schedules",
          icon: Calendar,
        },
        {
          href: `/owner/restaurants/${session.user.restaurantId}/tables`,
          label: "Tables",
          icon: Table,
        },
        {
          href: `/owner/restaurants/${session.user.restaurantId}/qrcodes`,
          label: "QR Codes",
          icon: QrCode,
        },
        {
          href: `/owner/restaurants/${session.user.restaurantId}/orders`,
          label: "Orders",
          icon: ShoppingCart,
        },
        {
          href: `/owner/restaurants/${session.user.restaurantId}/analytics`,
          label: "Analytics",
          icon: TrendingUp,
        },
      ]
    : [];

  const links = session?.user.role === "ADMIN" ? adminLinks : ownerLinks;

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
      <nav className="flex flex-col gap-2 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
