"use client";

import { MenuItemCard } from "./MenuItemCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { useRestaurant } from "@/hooks/useRestaurant";

interface MenuListProps {
  categories: any[];
  restaurantId: string;
}

export function MenuList({ categories, restaurantId }: MenuListProps) {
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);

  const canUpdate = hasPermission("menu.update");
  const canDelete = hasPermission("menu.delete");

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle>{category.name}</CardTitle>
            {category.description && (
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {category.items?.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No items in this category
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.items?.map((item: any) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    restaurantId={restaurantId}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
