"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Award,
  Users,
  Clock,
} from "lucide-react";
import { RevenueChart } from "./RevenueChart";
import { TopItemsChart } from "./TopItemsChart";
import { OrderStatusChart } from "./OrderStatusChart";
import { RecentOrdersList } from "./RecentOrdersList";

interface AnalyticsDashboardProps {
  data: any;
  restaurantId: string;
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const { summary, topItems, recentOrders, ordersByStatus } = data;

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      icon: DollarSign,
      description: "All-time earnings",
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: summary.totalOrders.toString(),
      icon: ShoppingCart,
      description: "Orders placed",
      color: "text-blue-600",
    },
    {
      title: "Average Order",
      value: formatCurrency(summary.avgOrderValue),
      icon: TrendingUp,
      description: "Per order value",
      color: "text-purple-600",
    },
    {
      title: "Top Item",
      value: topItems[0]?.menuItem?.name || "N/A",
      icon: Award,
      description: `${topItems[0]?._sum?.quantity || 0} sold`,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={ordersByStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <TopItemsChart data={topItems.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentOrdersList orders={recentOrders} />
        </CardContent>
      </Card>
    </div>
  );
}
