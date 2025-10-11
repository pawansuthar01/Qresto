"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { Button } from "../ui/button";
interface SidebarProps {
  className?: string;
}
export function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen } = useUserStore();

  const adminLinks = [
    {
      href: `/company/dashboard`,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: `/company/analytics`,
      label: "Analytics",
      icon: TrendingUp,
    },
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
      ]
    : [];

  const links = session?.user.role === "ADMIN" ? adminLinks : ownerLinks;
  console.log(links);
  if (!sidebarOpen) return null;
  // On click or action
  const openAnalyticsInNewTab = () => {
    if (session?.user?.restaurantId) {
      const url = `/owner/restaurants/${session.user.restaurantId}/analytics`;
      window.open(url, "_blank"); // "_blank" = new tab
    } else {
      console.warn("Restaurant ID not found in session");
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform md:sticky md:top-16 md:h-[calc(100vh-4rem)] ${className}`}
    >
      <nav className="flex flex-col gap-2 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          console.log({ pathname, href: link.href, isActive });
          return (
            <>
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
            </>
          );
        })}
        {links.length !== 0 && session?.user.role === "OWNER" && (
          <button
            type="reset"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",

              "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => openAnalyticsInNewTab()}
          >
            <TrendingUp className="h-5 w-5" />
            Analytics
          </button>
        )}
      </nav>
    </aside>
  );
}
