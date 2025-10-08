"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { MenuList } from "@/components/menu/MenuList";
import { MenuCustomizer } from "@/components/menu/MenuCustomizer";
import { CreateMenuItemDialog } from "@/components/menu/CreateMenuItemDialog";
import { Button } from "@/components/ui/button";
import { Plus, Palette } from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import { useRestaurant } from "@/hooks/useRestaurant";
import { usePermissions } from "@/hooks/usePermissions";

export default function MenuPage() {
  const params = useParams();
  const restaurantId = params.rid as string;
  const { data: restaurant } = useRestaurant(restaurantId);
  const { data: menu, isLoading } = useMenu(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const canCreate = hasPermission("menu.create");
  const canCustomize = hasPermission("menu.customize");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-muted-foreground">
              Manage your restaurant menu items
            </p>
          </div>
          <div className="flex gap-2">
            {canCustomize && (
              <Button variant="outline" onClick={() => setCustomizerOpen(true)}>
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
