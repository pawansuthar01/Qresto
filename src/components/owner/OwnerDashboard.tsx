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
import { useRestaurantSocket } from "@/hooks/useSocket";
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
  const { socket, connected } = useRestaurantSocket(restaurant.id);

  // Listen for real-time order updates
  useEffect(() => {
    if (!socket) return;

    // New order received
    socket.on("new-order", (order) => {
      console.log("🔔 New order received:", order);

      // Add to orders list
      setOrders((prev) => [order, ...prev]);

      // Play sound alert
      if (soundEnabled) {
        notificationSound.playOrderAlert();
      }

      // Show visual alert
      setNewOrderAlert(true);
      setTimeout(() => setNewOrderAlert(false), 3000);

      // Show browser notification if permitted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("New Order!", {
          body: `Order ${order.orderNumber} from Table ${order.table.number}`,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
        });
      }
    });

    // Order updated
    socket.on("order-updated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    });

    return () => {
      socket.off("new-order");
      socket.off("order-updated");
    };
  }, [socket, soundEnabled]);

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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {restaurant.name}
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                Welcome back! Here's your overview.
                {connected && (
                  <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    Live
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
              className="flex items-center gap-2"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  Sound On
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  Sound Off
                </>
              )}
            </Button>
          </div>

          {/* New Order Alert */}
          {newOrderAlert && (
            <div className="mt-4 bg-green-500 text-white p-4 rounded-lg flex items-center gap-3 animate-bounce">
              <Bell className="w-6 h-6" />
              <span className="font-semibold">New Order Received!</span>
            </div>
          )}
        </div>

        {allowedFeatures.length === 0 ? (
          <Card className="p-12 text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No permissions assigned
            </h3>
            <p className="text-gray-600">
              Contact your administrator to get access to features
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {allowedFeatures.map((feature, idx) => (
                <Link key={idx} href={feature.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-base">{feature.title}</span>
                        <div className="text-blue-600">{feature.icon}</div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">
                        {feature.description}
                      </p>
                      {feature.count !== undefined && (
                        <p className="text-2xl font-bold text-blue-600">
                          {feature.count}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {permissions?.["order.read"] && orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Orders
                    <span className="text-sm font-normal text-gray-500">
                      (Live Updates)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 10).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">
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
                          <div className="text-sm text-gray-600">
                            Table {order.table.number} • {order.items.length}{" "}
                            items • {formatRelativeTime(order.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href={`/owner/restaurants/${restaurant.id}/orders`}>
                      <Button variant="outline" className="w-full">
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
