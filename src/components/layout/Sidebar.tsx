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
  MessageCircle,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEffect } from "react";

interface SidebarProps {
  className?: string;
  sidebarOpen: boolean;
}

export function Sidebar({ className, sidebarOpen }: SidebarProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { setSidebarOpen } = useUserStore();
  const [profileImage, setProfileImage] = useLocalStorage<string | null>(
    "profileImage",
    null
  );

  const [profileName, setProfileName] = useLocalStorage<string | null>(
    "profileName",
    null
  );

  useEffect(() => {
    try {
      const name = localStorage.getItem("profileName") || null;
      const logo = localStorage.getItem("profileImage") || null;
      const cleanLogo = logo !== null ? JSON.parse(logo) : null;
      const cleanName = name !== null ? JSON.parse(name) : null;
      setProfileName(cleanName ?? session?.user.name ?? null);
      setProfileImage(cleanLogo ?? session?.user.image ?? null);
    } catch {}
  }, [session?.user]);
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
      id: "50ddsa0",
      href: `/contact-submission-check`,
      label: "Message",
      icon: MessageCircle,
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

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  if (status === "loading" || !sidebarOpen) {
    return null;
  }

  if (session?.user.role === "OWNER" && !session?.user.restaurantId) {
    return (
      <aside className={className}>
        <nav className="flex flex-col gap-2 p-4 text-center mt-20">
          <Settings className="w-8 h-8 text-gray-400 mx-auto mb-4" />
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
    <aside className={className}>
      <nav className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
        <div className="flex items-center gap-3 pb-4 border-b">
          {profileImage ? (
            <img
              src={profileImage || ""}
              alt="Profile"
              className="border border-gray-300 rounded-full h-12 w-12 object-cover shadow-sm"
            />
          ) : (
            <span className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {(profileName || "U").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {profileName || "User"}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {session?.user.role === "ADMIN" ? "Admin" : "Owner"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.id}
                href={link.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all min-h-[44px]",
                  "hover:bg-gray-100 active:bg-gray-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium shadow-sm border border-blue-200"
                    : "text-gray-700"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-blue-700" : "text-gray-500"
                  )}
                />
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {session?.user.role === "OWNER" && session?.user.restaurantId && (
          <div className="mt-auto pt-4 border-t">
            <button
              onClick={openAnalyticsInNewTab}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all min-h-[44px] text-gray-700 hover:bg-gray-100 active:bg-gray-200"
            >
              <TrendingUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm">Analytics</span>
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}
