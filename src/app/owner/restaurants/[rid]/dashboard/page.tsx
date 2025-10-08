"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  UtensilsCrossed,
  Table,
  QrCode,
  ShoppingCart,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useRestaurant } from "@/hooks/useRestaurant";
import Link from "next/link";
import { CreateMenuItemDialog } from "@/components/menu/CreateMenuItemDialog";

export default function OwnerDashboardPage() {
  const { data: session, status } = useSession();
  const [restaurant, setRestaurant] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createMenuItemDialog, SetCreateMenuItemDialog] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated" && session?.user?.restaurantId) {
      fetch(`/api/restaurants/${session.user.restaurantId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch restaurant");
          return res.json();
        })
        .then((data) => setRestaurant(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
      fetch(`/api/restaurants/${session.user.restaurantId}/menu`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch categories");
          return res.json();
        })
        .then((data) => setCategories(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    } else {
      setLoading(false);
    }
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!session?.user?.restaurantId) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="mt-4 text-3xl font-bold">No Restaurant Assigned</h1>
            <p className="mt-2 text-muted-foreground">
              Please contact the admin to assign a restaurant to your account.
            </p>
          </div>

          {/* Welcome Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <UtensilsCrossed className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Digital Menu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create and manage your restaurant menu with categories and
                  items.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <QrCode className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">QR Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate QR codes for tables and let customers view menu
                  instantly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShoppingCart className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track and manage customer orders in real-time.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Waiting for Restaurant Access
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Once the admin assigns a restaurant to your account, you'll
                    be able to access all features.
                  </p>
                </div>
                <Clock className="h-12 w-12 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{restaurant.name} Dashboard</h1>
          <Button onClick={() => SetCreateMenuItemDialog(true)}>
            Create / Edit Menu
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <UtensilsCrossed className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {restaurant.menuItems?.length ?? 0} items available.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Table className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {restaurant.tables?.length ?? 0} tables registered.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <QrCode className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {restaurant.qrCodes?.length ?? 0} QR codes generated.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShoppingCart className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {restaurant.orders?.length ?? 0} total orders.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href={`/owner/restaurants/${restaurant.id}/menu`}>
            <Button variant="outline">Manage Menu</Button>
          </Link>
          <Link href={`/owner/restaurants/${restaurant.id}/tables`}>
            <Button variant="outline">Manage Tables</Button>
          </Link>
          <Link href={`/owner/restaurants/${restaurant.id}/qrcodes`}>
            <Button variant="outline">Generate QR Codes</Button>
          </Link>
        </div>
        <CreateMenuItemDialog
          restaurantId={restaurant.id}
          categories={categories}
          onOpenChange={SetCreateMenuItemDialog}
          open={createMenuItemDialog}
        />
      </div>
    </MainLayout>
  );
}
