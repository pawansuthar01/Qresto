"use client";

import { MenuItemCard } from "./MenuItemCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Edit, Eye, EyeOff, Palette, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { notificationSound } from "@/lib/notification-sound";
import { CreateMenuItemDialog } from "./CreateMenuItemDialog";

interface MenuListProps {
  categories: any[];
  restaurantId: string;
}

export function MenuList({
  categories: initialCategories,
  restaurantId,
}: MenuListProps) {
  4;
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [categories, setCategories] = useState(initialCategories);
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    setUpdating(itemId);

    try {
      const response = await fetch(
        `/api/restaurants/${restaurant.id}/menu/${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: !currentStatus }),
        }
      );

      if (response.ok) {
        const updatedItem = await response.json();

        // Update local state
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            items: cat.items.map((item: any) =>
              item.id === itemId
                ? { ...item, isAvailable: !currentStatus }
                : item
            ),
          }))
        );

        notificationSound.playSuccess();
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
    } finally {
      setUpdating(null);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setUpdating(itemId);

    try {
      const response = await fetch(
        `/api/restaurants/${restaurant.id}/menu/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            items: cat.items.filter((item: any) => item.id !== itemId),
          }))
        );
        notificationSound.playSuccess();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setUpdating(null);
    }
  };
  const canUpdate = hasPermission("menu.update");
  const canDelete = hasPermission("menu.delete");
  const canCreate = hasPermission("menu.create");
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {category.items.length} items
                  </p>
                </div>
                {canUpdate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => console.log("update cliecked !")}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category?.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {item.imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">
                            {item.name}
                          </h4>
                          {!item.isAvailable && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              Hidden
                            </span>
                          )}
                          {item.isPopular && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                              🔥 Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-blue-600">
                            {formatCurrency(item.price)}
                          </span>
                          {item.orderCount > 0 && (
                            <span className="text-xs text-gray-500">
                              • {item.orderCount} orders
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canUpdate && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleAvailability(item.id, item.isAvailable)
                            }
                            disabled={updating === item.id}
                            title={item.isAvailable ? "Hide item" : "Show item"}
                          >
                            {item.isAvailable ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log("edit")}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                          disabled={updating === item.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {category?.items?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No items in this category yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* {categories?.length === 0 && (
          <Card className="p-12 text-center">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No categories yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first category to start adding menu items
            </p>
            {canCreate && (
              <Button onClick={() => console.log("yes")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            )}
          </Card>
        )} */}
      </div>
      {canCreate && (
        <CreateMenuItemDialog
          restaurantId={restaurantId}
          restaurantName={restaurant?.name}
          categories={categories || []}
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      )}
    </div>
  );
}
