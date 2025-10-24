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
  TrendingUp,
  Calendar,
  Settings,
  ImagePlus,
  User,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { sidebarOpen } = useUserStore();

  const adminLinks = [
    {
      id: "5500",
      href: `/company/dashboard`,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "500",
      href: `/company/analytics`,
      label: "Analytics",
      icon: TrendingUp,
    },
    {
      id: "550asssscsca2",
      href: `/account/profile`,
      label: "Profile",
      icon: User,
    },
  ];

  const ownerLinks = session?.user.restaurantId
    ? [
        {
          id: "5505d0",
          href: `/owner/restaurants/${session.user.restaurantId}/dashboard`,
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          id: "55s00",
          href: `/owner/restaurants/${session.user.restaurantId}/menu`,
          label: "Menu",
          icon: UtensilsCrossed,
        },
        {
          id: "550sas0",
          href: `/owner/restaurants/${session.user.restaurantId}/schedules`,
          label: "Schedules",
          icon: Calendar,
        },
        {
          id: "550casa0",
          href: `/owner/restaurants/${session.user.restaurantId}/tables`,
          label: "Tables",
          icon: Table,
        },
        {
          id: "5500scasca",
          href: `/owner/restaurants/${session.user.restaurantId}/qrcodes`,
          label: "QR Codes",
          icon: QrCode,
        },
        {
          id: "550ascsca1",
          href: `/owner/restaurants/${session.user.restaurantId}/orders`,
          label: "Orders",
          icon: ShoppingCart,
        },
        {
          id: "550ascsca2",
          href: `/owner/restaurants/${session.user.restaurantId}/media`,
          label: "Gallery",
          icon: ImagePlus,
        },
        {
          id: "550assscsca2",
          href: `/account/profile`,
          label: "Profile",
          icon: User,
        },
      ]
    : [];

  const links = session?.user.role === "ADMIN" ? adminLinks : ownerLinks;

  const openAnalyticsInNewTab = () => {
    if (session?.user?.restaurantId) {
      const url = `/owner/restaurants/${session.user.restaurantId}/analytics`;
      window.open(url, "_blank");
    } else {
      console.warn("Restaurant ID not found in session");
    }
  };

  if (status === "loading" || !sidebarOpen) {
    return (
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform md:sticky md:top-16 md:h-[calc(100vh-4rem)] ${className}`}
      >
        <nav className="flex flex-col gap-2 p-4 mt-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors bg-white text-black hover:bg-accent hover:text-accent-foreground"
              )}
            ></div>
          ))}
        </nav>
      </aside>
    );
  }

  if (session?.user.role === "OWNER" && !session?.user.restaurantId) {
    return (
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform md:sticky md:top-16 md:h-[calc(100vh-4rem)] ${className}`}
      >
        <nav className="flex flex-col gap-2 p-4 text-center mt-20">
          <Settings className="w-4 h-4 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            No restaurant assigned
          </h3>
          <p className="text-gray-600 text-xs">
            Contact your administrator to get access to features
          </p>
        </nav>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform md:sticky md:top-16 md:h-[calc(100vh-4rem)] ${className}`}
    >
      <nav className="flex flex-col gap-2 p-4 mt-10">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.id}
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

        {links.length > 0 && session?.user.role === "OWNER" && (
          <button
            key="analytics-button"
            type="button"
            onClick={openAnalyticsInNewTab}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <TrendingUp className="h-5 w-5" />
            Analytics
          </button>
        )}
      </nav>
    </aside>
  );
}
