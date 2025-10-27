"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Utensils,
  Users,
  QrCode,
  ShoppingBag,
  BarChart3,
  Settings,
  Clock,
  Bell,
  Volume2,
  VolumeX,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Permission } from "@/types";
import { supabaseClient } from "@/lib/supabase";
import { notificationSound } from "@/lib/notification-sound";

interface OwnerDashboardProps {
  restaurant: any;
  permissions: Permission | null;
  recentOrders: any[];
  user: any;
}

export default function OwnerDashboard({
  restaurant,
  permissions,
  recentOrders: initialOrders,
  user,
}: OwnerDashboardProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  // Connect to restaurant socket
  useEffect(() => {
    const channel = supabaseClient
      .channel(`public:orders:restaurant_id=eq.${restaurant.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          const order = payload.new;
          console.log("🔔 New order received:", order);
          setOrders((prev) => [order, ...prev]);

          // Play sound alert
          if (soundEnabled) {
            notificationSound.playOrderAlert();
          }

          // Show visual alert
          setNewOrderAlert(true);
          setTimeout(() => setNewOrderAlert(false), 3000);

          // Browser notification
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("New Order!", {
              body: `Order ${order.orderNumber} from Table ${order.tableNumber}`,
              icon: "/icon-192x192.png",
              badge: "/icon-192x192.png",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [restaurant.id, soundEnabled]);

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Enable audio on first interaction
  useEffect(() => {
    const enableAudio = () => {
      notificationSound.requestPermission();
      notificationSound.setEnabled(soundEnabled);
      document.removeEventListener("click", enableAudio);
    };
    document.addEventListener("click", enableAudio);
    return () => document.removeEventListener("click", enableAudio);
  }, [soundEnabled]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    notificationSound.setEnabled(newState);
  };

  const features = [
    {
      title: "Menu Management",
      description: "Manage categories and items",
      icon: <Utensils className="w-6 h-6" />,
      href: `/owner/restaurants/${restaurant.id}/menu`,
      permission: permissions?.["menu.read"],
      count: restaurant._count.items,
    },
    {
      title: "Tables",
      description: "Manage restaurant tables",
      icon: <Users className="w-6 h-6" />,
      href: `/owner/restaurants/${restaurant.id}/tables`,
      permission: permissions?.["table.read"],
      count: restaurant._count.tables,
    },
    {
      title: "QR Codes",
      description: "Generate and manage QR codes",
      icon: <QrCode className="w-6 h-6" />,
      href: `/owner/restaurants/${restaurant.id}/qrcodes`,
      permission: permissions?.["qrcode.read"],
      count: restaurant._count.qrCodes,
    },
    {
      title: "Orders",
      description: "View and manage orders",
      icon: <ShoppingBag className="w-6 h-6" />,
      href: `/owner/restaurants/${restaurant.id}/orders`,
      permission: permissions?.["order.read"],
      count: restaurant._count.orders,
    },
    {
      title: "Analytics",
      description: "View restaurant analytics",
      icon: <BarChart3 className="w-6 h-6" />,
      href: `/owner/restaurants/${restaurant.id}/analytics`,
      permission: permissions?.["analytics.view"],
    },
    {
      title: "Settings",
      description: "Restaurant settings",
      icon: <Settings className="w-6 h-6" />,
      href: `/owner/restaurants/${restaurant.id}/settings`,
      permission: permissions?.["settings.update"],
    },
  ];

  const allowedFeatures = features.filter((f) => f.permission);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 animate-pulse",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PREPARING: "bg-orange-100 text-orange-800",
      READY: "bg-green-100 text-green-800",
      SERVED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} title={restaurant.name} />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                {restaurant.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 flex flex-wrap items-center gap-2">
                <span>Welcome back! Here's your overview.</span>
                <span className="inline-flex items-center gap-1 text-green-600 text-xs sm:text-sm">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  Live
                </span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
              className="flex items-center gap-2 min-h-[44px] w-full sm:w-auto"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm">Sound On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="text-sm">Sound Off</span>
                </>
              )}
            </Button>
          </div>

          {newOrderAlert && (
            <div className="mt-4 bg-green-500 text-white p-3 sm:p-4 rounded-lg flex items-center gap-3 animate-bounce shadow-lg">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base">
                New Order Received!
              </span>
            </div>
          )}
        </div>

        {allowedFeatures.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center shadow-md">
            <Settings className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No permissions assigned
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Contact your administrator to get access to features
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {allowedFeatures.map((feature, idx) => (
                <Link key={idx} href={feature.href}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full border shadow-sm">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-sm sm:text-base">
                          {feature.title}
                        </span>
                        <div className="text-blue-600 flex-shrink-0">
                          {feature.icon}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {feature.description}
                      </p>
                      {feature.count !== undefined && (
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">
                          {feature.count}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {permissions?.["order.read"] && orders.length > 0 && (
              <Card className="shadow-md">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Recent Orders</span>
                    <span className="text-xs sm:text-sm font-normal text-gray-500">
                      (Live Updates)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    {orders.slice(0, 10).map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <span className="font-semibold text-sm sm:text-base text-gray-900">
                              {order.orderNumber}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Table {order.table.number} • {order.items.length}{" "}
                            items • {formatRelativeTime(order.createdAt)}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="font-bold text-base sm:text-lg text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href={`/owner/restaurants/${restaurant.id}/orders`}>
                      <Button variant="outline" className="w-full min-h-[44px]">
                        View All Orders
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
