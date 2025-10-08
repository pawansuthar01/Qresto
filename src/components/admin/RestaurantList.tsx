"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Settings, Users, QrCode } from "lucide-react";
import { PermissionDialog } from "./PermissionDialog";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  permissions: any;
  _count: {
    categories: number;
    tables: number;
    orders: number;
  };
}

interface RestaurantListProps {
  restaurants: Restaurant[];
}

export function RestaurantList({ restaurants }: RestaurantListProps) {
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

  const handleManagePermissions = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setPermissionDialogOpen(true);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {restaurant.name}
              </CardTitle>
              <CardDescription>/{restaurant.slug}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {restaurant._count.categories}
                    </p>
                    <p className="text-muted-foreground">Categories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {restaurant._count.tables}
                    </p>
                    <p className="text-muted-foreground">Tables</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {restaurant._count.orders}
                    </p>
                    <p className="text-muted-foreground">Orders</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleManagePermissions(restaurant)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRestaurant && (
        <PermissionDialog
          restaurant={selectedRestaurant}
          open={permissionDialogOpen}
          onOpenChange={setPermissionDialogOpen}
        />
      )}
    </>
  );
}
