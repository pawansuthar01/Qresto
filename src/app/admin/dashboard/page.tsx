"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { RestaurantList } from "@/components/admin/RestaurantList";
import { CreateRestaurantDialog } from "@/components/admin/CreateRestaurantDialog";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { UserManagement } from "@/components/admin/UserManagement";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, TrendingUp, Users, Activity } from "lucide-react";
import { useRestaurants } from "@/hooks/useRestaurant";

export default function AdminDashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserEmail, setSelectedEmail] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const { data: restaurants, isLoading } = useRestaurants();

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .finally(() => setUsersLoading(false));
  }, []);

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

  const usersWithoutRestaurant = users?.filter((u) => !u.restaurantId);

  const handleCreateForUser = (userId: string) => {
    setSelectedEmail(userId);
    setDialogOpen(true);
  };

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
          <Button
            onClick={() => {
              setSelectedEmail(null);
              setDialogOpen(true);
            }}
          >
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

        {/* Tabs */}
        <Tabs defaultValue="restaurants" className="space-y-4">
          <TabsList>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="space-y-4">
            {isLoading || usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading data...</p>
              </div>
            ) : (
              <>
                <RestaurantList restaurants={restaurants || []} />

                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">
                    Users without Restaurant
                  </h2>
                  {usersWithoutRestaurant.map((user) => (
                    <Card key={user.id} className="mb-2">
                      <CardHeader>
                        <CardTitle>{user.name}</CardTitle>
                        <CardDescription>{user?.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => handleCreateForUser(user.email)}>
                          <Plus className="mr-2 h-4 w-4" /> Create Restaurant
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AdminAnalytics restaurants={restaurants || []} />
          </TabsContent>
        </Tabs>

        <CreateRestaurantDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          ownerData={selectedUserEmail}
        />
      </div>
    </MainLayout>
  );
}
