"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { RestaurantList } from "@/components/admin/RestaurantList";
import { CreateRestaurantDialog } from "@/components/admin/CreateRestaurantDialog";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, TrendingUp, Users, Activity } from "lucide-react";
import { useRestaurants } from "@/hooks/useRestaurant";

export default function AdminDashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: restaurants, isLoading } = useRestaurants();

  const totalRestaurants = restaurants?.length || 0;
  const totalTables =
    restaurants?.reduce((sum: number, r: any) => sum + r._count.tables, 0) || 0;
  const totalOrders =
    restaurants?.reduce((sum: number, r: any) => sum + r._count.orders, 0) || 0;
  const totalCategories =
    restaurants?.reduce(
      (sum: number, r: any) => sum + r._count.categories,
      0
    ) || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Company Dashboard</h1>
            <p className="text-muted-foreground">
              Manage all restaurants and monitor platform performance
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Restaurant
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Restaurants
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRestaurants}</div>
              <p className="text-xs text-muted-foreground">
                Active on platform
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tables
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTables}</div>
              <p className="text-xs text-muted-foreground">
                Across all restaurants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">All-time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Menu Categories
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategories}</div>
              <p className="text-xs text-muted-foreground">Platform-wide</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Restaurants and Analytics */}
        <Tabs defaultValue="restaurants" className="space-y-4">
          <TabsList>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading restaurants...</p>
              </div>
            ) : restaurants?.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">No restaurants yet</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first restaurant
                </Button>
              </div>
            ) : (
              <RestaurantList restaurants={restaurants || []} />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AdminAnalytics restaurants={restaurants || []} />
          </TabsContent>
        </Tabs>

        <CreateRestaurantDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </MainLayout>
  );
}
