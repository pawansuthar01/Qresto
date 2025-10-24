"use client";

import { useEffect, useState } from "react";
import { Plus, Store, Users, ShoppingBag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateRestaurantDialog from "./CreateRestaurantDialog";
import RestaurantCard from "./RestaurantCard";
import { MainLayout } from "../layout/MainLayout";

import { UserManagement } from "./UserManagement";
import { useRestaurants } from "@/hooks/useRestaurant";
import Loading from "../ui/loading";

export default function CompanyDashboard() {
  const [selectedType, setSelectedType] = useState("users");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: restaurants, isLoading } = useRestaurants();
  const [restaurantsData, setRestaurantsData] = useState<any[]>(
    restaurants || []
  );

  useEffect(() => {
    if (restaurants) setRestaurantsData(restaurants);
  }, [restaurants?.length]);

  if (isLoading) {
    return <Loading />;
  }

  const stats = [
    {
      title: "Total Restaurants",
      value: restaurantsData.length,
      icon: <Store className="w-5 h-5" />,
      color: "text-blue-600",
    },
    {
      title: "Total Menu Items",
      value: restaurantsData.reduce(
        (sum, r) => sum + (r?._count?.items || 0),
        0
      ),
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      title: "Total Tables",
      value: restaurantsData.reduce(
        (sum, r) => sum + (r?._count?.tables || 0),
        0
      ),
      icon: <Users className="w-5 h-5" />,
      color: "text-purple-600",
    },
    {
      title: "Total Orders",
      value: restaurantsData.reduce(
        (sum, r) => sum + (r?._count?.orders || 0),
        0
      ),
      icon: <Settings className="w-5 h-5" />,
      color: "text-orange-600",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
              <p className="text-gray-600 mt-1">Manage all your restaurants</p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Restaurant
            </Button>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={stat.color}>{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mb-2 flex gap-2 max-w-4xl">
            <Button
              variant={selectedType === "users" ? "default" : "outline"}
              onClick={() => setSelectedType("users")}
              className="flex-1"
            >
              Users Management
            </Button>
            <Button
              variant={selectedType === "Resto" ? "default" : "outline"}
              onClick={() => setSelectedType("Resto")}
              className="flex-1"
            >
              Restaurants Management
            </Button>
          </div>

          {selectedType === "users" && <UserManagement />}
          {selectedType === "Resto" && (
            <div>
              {restaurantsData.length === 0 ? (
                <Card className="p-12 text-center">
                  <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No restaurants yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first restaurant to get started
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Restaurant
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurantsData?.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        <CreateRestaurantDialog
          open={createDialogOpen}
          onRestaurant={(data) => {
            setRestaurantsData((prev) => {
              const exists = prev.some((r) => r.id === data.id);
              return exists
                ? prev.map((r) => (r.id === data.id ? data : r))
                : [...prev, data];
            });
          }}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </MainLayout>
  );
}
