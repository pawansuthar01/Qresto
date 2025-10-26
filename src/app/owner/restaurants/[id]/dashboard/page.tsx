"use client";

import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UtensilsCrossed,
  Table,
  QrCode,
  ShoppingCart,
  Settings,
} from "lucide-react";
import Loading from "@/components/ui/loading";
import { useSession } from "next-auth/react";

export default function OwnerDashboardPage() {
  const params = useParams();
  const { data: session } = useSession();
  const restaurantId = params.id as string;
  if (!session?.user.restaurantId) {
    return (
      <MainLayout>
        <Card className="p-12 text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No restaurant assigned
          </h3>
          <p className="text-gray-600">
            Administrator contact you 1 hours please wait
          </p>
        </Card>
      </MainLayout>
    );
  }
  const { data: restaurant, isLoading } = useRestaurant(restaurantId);
  if (isLoading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  const stats = [
    {
      title: "Menu Categories",
      value: restaurant?.categories?.length || 0,
      icon: UtensilsCrossed,
    },
    {
      title: "Menu Items",
      value:
        restaurant?.categories?.reduce(
          (sum: number, cat: any) => sum + (cat.items?.length || 0),
          0
        ) || 0,
      icon: UtensilsCrossed,
    },
    {
      title: "Tables",
      value: restaurant?.tables?.length || 0,
      icon: Table,
    },
    {
      title: "QR Codes",
      value: restaurant?.tables?.filter((t: any) => t.qrCode).length || 0,
      icon: QrCode,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{restaurant?.name}</h1>
          <p className="text-muted-foreground">Restaurant Owner Dashboard</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <a
                href={`/owner/restaurants/${restaurantId}/menu`}
                className="flex flex-col items-center justify-center rounded-lg border p-6 hover:bg-accent"
              >
                <UtensilsCrossed className="mb-2 h-8 w-8" />
                <p className="text-sm font-medium">Manage Menu</p>
              </a>
              <a
                href={`/owner/restaurants/${restaurantId}/tables`}
                className="flex flex-col items-center justify-center rounded-lg border p-6 hover:bg-accent"
              >
                <Table className="mb-2 h-8 w-8" />
                <p className="text-sm font-medium">Manage Tables</p>
              </a>
              <a
                href={`/owner/restaurants/${restaurantId}/qrcodes`}
                className="flex flex-col items-center justify-center rounded-lg border p-6 hover:bg-accent"
              >
                <QrCode className="mb-2 h-8 w-8" />
                <p className="text-sm font-medium">QR Codes</p>
              </a>
              <a
                href={`/owner/restaurants/${restaurantId}/orders`}
                className="flex flex-col items-center justify-center rounded-lg border p-6 hover:bg-accent"
              >
                <ShoppingCart className="mb-2 h-8 w-8" />
                <p className="text-sm font-medium">View Orders</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
