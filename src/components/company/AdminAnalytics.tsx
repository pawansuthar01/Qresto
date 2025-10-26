"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Package, Award } from "lucide-react";
import { MainLayout } from "../layout/MainLayout";

import Loading from "../ui/loading";

export function AdminAnalytics() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getRestaurants = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/restaurants", {
          method: "GET",
        });

        setIsLoading(false);
        if (res?.ok) {
          const data = await res?.json();
          setRestaurants(data);
        }
      } catch (error) {
        setIsLoading(false);
        console.error(error);
      }
    };
    getRestaurants();
  }, []);

  const analytics = useMemo(() => {
    if (!restaurants || restaurants.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        topRestaurants: [],
        recentActivity: [],
        restaurantPerformance: [],
      };
    }

    const totalOrders = restaurants.reduce(
      (sum, r) => sum + r._count.orders,
      0
    );

    // Calculate restaurant performance
    const restaurantPerformance = restaurants
      .map((r) => ({
        id: r.id,
        name: r.name,
        orders: r._count.orders,
        tables: r._count.tables,
        categories: r._count.categories,
        utilizationRate:
          r._count.tables > 0
            ? ((r._count.orders / r._count.tables) * 100).toFixed(1)
            : 0,
      }))
      .sort((a, b) => b.orders - a.orders);

    return {
      totalOrders,
      topRestaurants: restaurantPerformance.slice(0, 5),
      restaurantPerformance,
    };
  }, [restaurants]);

  if (isLoading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }
  if (!restaurants || restaurants.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No analytics data available. Add restaurants to see insights.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Platform Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Across all restaurants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Restaurants
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{restaurants.length}</div>
              <p className="text-xs text-muted-foreground">On the platform</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Orders per Restaurant
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {restaurants.length > 0
                  ? (analytics.totalOrders / restaurants.length).toFixed(1)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Platform average</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Restaurants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performing Restaurants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topRestaurants.map((restaurant, index) => (
                <div key={restaurant.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{restaurant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {restaurant.tables} tables • {restaurant.categories}{" "}
                          categories
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{restaurant.orders}</p>
                      <p className="text-xs text-muted-foreground">orders</p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(
                          (restaurant.orders / analytics.totalOrders) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Restaurant Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-4 border-b pb-2 text-sm font-medium text-muted-foreground">
                <div>Restaurant</div>
                <div className="text-center">Tables</div>
                <div className="text-center">Categories</div>
                <div className="text-center">Orders</div>
                <div className="text-center">Utilization</div>
              </div>
              {analytics.restaurantPerformance.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="grid grid-cols-5 gap-4 rounded-lg border p-3 hover:bg-accent"
                >
                  <div className="font-medium">{restaurant.name}</div>
                  <div className="text-center">{restaurant.tables}</div>
                  <div className="text-center">{restaurant.categories}</div>
                  <div className="text-center font-semibold">
                    {restaurant.orders}
                  </div>
                  <div className="text-center">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {restaurant.utilizationRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Distribution */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Size Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    label: "Small (1-5 tables)",
                    count: restaurants.filter((r) => r._count.tables <= 5)
                      .length,
                  },
                  {
                    label: "Medium (6-15 tables)",
                    count: restaurants.filter(
                      (r) => r._count.tables > 5 && r._count.tables <= 15
                    ).length,
                  },
                  {
                    label: "Large (16+ tables)",
                    count: restaurants.filter((r) => r._count.tables > 15)
                      .length,
                  },
                ].map((category) => {
                  const percentage =
                    restaurants.length > 0
                      ? (category.count / restaurants.length) * 100
                      : 0;

                  return (
                    <div key={category.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{category.label}</span>
                        <span className="font-medium">
                          {category.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Menu Complexity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    label: "Simple (1-3 categories)",
                    count: restaurants.filter((r) => r._count.categories <= 3)
                      .length,
                  },
                  {
                    label: "Standard (4-8 categories)",
                    count: restaurants.filter(
                      (r) => r._count.categories > 3 && r._count.categories <= 8
                    ).length,
                  },
                  {
                    label: "Complex (9+ categories)",
                    count: restaurants.filter((r) => r._count.categories > 8)
                      .length,
                  },
                ].map((category) => {
                  const percentage =
                    restaurants.length > 0
                      ? (category.count / restaurants.length) * 100
                      : 0;

                  return (
                    <div key={category.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{category.label}</span>
                        <span className="font-medium">
                          {category.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-secondary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
