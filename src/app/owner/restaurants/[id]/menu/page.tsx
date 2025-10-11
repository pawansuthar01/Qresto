"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { MenuList } from "@/components/menu/MenuList";
import { MenuCustomizer } from "@/components/menu/MenuCustomizer";
import { CreateMenuItemDialog } from "@/components/menu/CreateMenuItemDialog";
import { Button } from "@/components/ui/button";
import { Plus, Palette, TrendingUp, DollarSign } from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import { useRestaurant } from "@/hooks/useRestaurant";
import { usePermissions } from "@/hooks/usePermissions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function MenuPage() {
  const params = useParams();
  const router = useRouter();

  const restaurantId = params.id as string;
  const { data: restaurant } = useRestaurant(restaurantId);
  const { data: menu, isLoading } = useMenu(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const canCreate = hasPermission("menu.create");
  const canCustomize = hasPermission("menu.customize");

  const totalItems = restaurant?.categories?.reduce(
    (sum: any, cat: any) => sum + cat.items.length,
    0
  );
  const availableItems = restaurant?.categories?.reduce(
    (sum: any, cat: any) =>
      sum + cat.items.filter((item: any) => item.isAvailable).length,
    0
  );
  const totalValue = restaurant?.categories?.reduce(
    (sum: any, cat: any) =>
      sum + cat.items.reduce((s: number, item: any) => s + item.price, 0),
    0
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Menu Management
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time updates • All changes sync instantly
            </p>
          </div>
          <div className="flex gap-3">
            {canCustomize && (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/owner/restaurants/${restaurant.id}/menu/theme`)
                }
              >
                <Palette className="w-4 h-4 mr-2" />
                Customize Theme
              </Button>
            )}
            {canCreate && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Items
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalItems}</div>
              <p className="text-sm text-gray-600 mt-1">
                {availableItems} available • {totalItems - availableItems}{" "}
                hidden
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Price
              </CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(totalItems > 0 ? totalValue / totalItems : 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Categories
              </CardTitle>
              <Palette className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {restaurant?.categories?.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-muted-foreground">
              Manage your restaurant menu items
            </p>
          </div>
          <div className="flex gap-2">
            {canCustomize && (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/owner/restaurants/${restaurant.id}/menu/theme`)
                }
              >
                <Palette className="mr-2 h-4 w-4" />
                Customize Design
              </Button>
            )}
            {canCreate && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading menu...</p>
          </div>
        ) : menu?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <p className="mb-4 text-muted-foreground">No menu items yet</p>
            {canCreate && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first category
              </Button>
            )}
          </div>
        ) : (
          <MenuList categories={menu || []} restaurantId={restaurantId} />
        )}

        {canCreate && (
          <CreateMenuItemDialog
            restaurantId={restaurantId}
            restaurantName={restaurant?.name}
            categories={menu || []}
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
        )}

        {canCustomize && (
          <MenuCustomizer
            restaurant={restaurant}
            open={customizerOpen}
            onOpenChange={setCustomizerOpen}
          />
        )}
      </div>
    </MainLayout>
  );
}
