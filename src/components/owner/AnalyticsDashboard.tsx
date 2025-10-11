"use client";

import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  Award,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsDashboardProps {
  restaurant: any;
  orders: any[];
  menuItems: any[];
  user: any;
}

export default function AnalyticsDashboard({
  restaurant,
  orders,
  menuItems,
  user,
}: AnalyticsDashboardProps) {
  // Calculate metrics
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Orders by status
  const ordersByStatus = orders.reduce((acc: any, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // Top selling items
  const topItems = menuItems
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5);

  // Revenue by day
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  }).reverse();

  const revenueByDay = last7Days.map((day) => {
    const dayOrders = orders.filter(
      (order) => order.createdAt.toISOString().split("T")[0] === day
    );
    return {
      date: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
      revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      orders: dayOrders.length,
    };
  });

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Average Order",
      value: formatCurrency(avgOrderValue),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Unique Customers",
      value: new Set(
        orders.map((o) => o.customerPhone || o.tableId)
      ).size.toString(),
      icon: <Users className="w-5 h-5" />,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} title="Analytics" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {restaurant.name} Analytics
          </h1>
          <p className="text-gray-600 mt-1">Last 30 days performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueByDay.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-gray-700">
                        {day.date}
                      </div>
                      <div className="text-sm text-gray-500">
                        {day.orders} orders
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">
                      {formatCurrency(day.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(ordersByStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700 capitalize">
                        {status.toLowerCase()}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {count as number}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {item.orderCount}
                    </div>
                    <div className="text-sm text-gray-600">orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
