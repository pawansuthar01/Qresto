// src/app/owner/restaurants/[id]/orders/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { EnhancedOrderBoard } from "@/components/order/EnhancedOrderBoard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Bell,
  Wifi,
  WifiOff,
  Filter,
  Download,
  Search,
  ChevronDown,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface FilterState {
  status: string;
  dateRange: string;
  customStartDate: string;
  customEndDate: string;
  searchQuery: string;
  timeRange: string;
}

export default function OrdersPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const { data: restaurant } = useRestaurant(restaurantId);
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1,
  });
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const { isConnected, newOrderCount, resetNewOrderCount } =
    useRealtimeOrders(restaurantId);
  const [isLoading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    status: "ALL",
    dateRange: "today",
    customStartDate: "",
    customEndDate: "",
    searchQuery: "",
    timeRange: "all",
  });

  // Fetch orders with filters and pagination
  async function fetchOrders(page = 1, filterOverrides?: Partial<FilterState>) {
    setLoading(true);
    const currentFilters = { ...filters, ...filterOverrides };

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: pagination.limit.toString(),
      ...(currentFilters.status !== "ALL" && { status: currentFilters.status }),
      dateRange: currentFilters.dateRange,
      ...(currentFilters.customStartDate && {
        startDate: currentFilters.customStartDate,
      }),
      ...(currentFilters.customEndDate && {
        endDate: currentFilters.customEndDate,
      }),
      ...(currentFilters.searchQuery && { search: currentFilters.searchQuery }),
      timeRange: currentFilters.timeRange,
    });

    try {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/orders?${queryParams}`
      );

      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        });
        return;
      }

      const data = await res.json();

      setOrders(data.data || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch
  useEffect(() => {
    if (restaurantId) {
      fetchOrders(1);
    }
  }, [restaurantId]);

  // Refetch when filters change
  useEffect(() => {
    if (restaurantId) {
      fetchOrders(1);
    }
  }, [
    filters.status,
    filters.dateRange,
    filters.customStartDate,
    filters.customEndDate,
    filters.searchQuery,
    filters.timeRange,
  ]);

  // Update orders when new order arrives
  useEffect(() => {
    if (newOrderCount > 0) {
      fetchOrders(pagination.page);
      resetNewOrderCount();
    }
  }, [newOrderCount]);

  // Page title update
  useEffect(() => {
    document.title =
      newOrderCount > 0
        ? `(${newOrderCount}) New Orders - QResto`
        : "Orders - QResto";
  }, [newOrderCount]);

  const canRead = hasPermission("order.read");

  // Export to CSV
  const exportToCSV = async () => {
    try {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/orders?limit=10000&${new URLSearchParams(
          {
            status: filters.status !== "ALL" ? filters.status : "",
            dateRange: filters.dateRange,
            startDate: filters.customStartDate,
            endDate: filters.customEndDate,
            search: filters.searchQuery,
            timeRange: filters.timeRange,
          }
        )}`
      );

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      const allOrders = data.orders || [];

      const headers = [
        "Order Number",
        "Customer",
        "Phone",
        "Table",
        "Status",
        "Amount",
        "Date",
        "Time",
      ];
      const rows = allOrders.map((order: any) => [
        order.orderNumber,
        order.customerName || "N/A",
        order.customerPhone || "N/A",
        order.table?.number || "N/A",
        order.status,
        order.totalAmount,
        new Date(order.createdAt).toLocaleDateString(),
        new Date(order.createdAt).toLocaleTimeString(),
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Orders exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export orders",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage);
  };

  const clearFilters = () => {
    setFilters({
      status: "ALL",
      dateRange: "today",
      customStartDate: "",
      customEndDate: "",
      searchQuery: "",
      timeRange: "all",
    });
  };

  if (!canRead) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            You don't have permission to view orders
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Orders
              {newOrderCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  <Bell className="mr-1 h-3 w-3" />
                  {newOrderCount} New
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Total: {pagination.total} orders
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="default" className="bg-green-500">
                <Wifi className="mr-1 h-3 w-3" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary">
                <WifiOff className="mr-1 h-3 w-3" />
                Connecting...
              </Badge>
            )}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by order number, customer name, or phone..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown
                className={`w-4 h-4 ml-2 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
            <Button variant="default" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <Label className="mb-2">Status</Label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="SERVED">Served</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <Label className="mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Date Range
                  </Label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      setFilters({ ...filters, dateRange: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {/* Time Range Filter */}
                <div>
                  <Label className="mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Time Range
                  </Label>
                  <select
                    value={filters.timeRange}
                    onChange={(e) =>
                      setFilters({ ...filters, timeRange: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Day</option>
                    <option value="morning">Morning (6AM-12PM)</option>
                    <option value="afternoon">Afternoon (12PM-5PM)</option>
                    <option value="evening">Evening (5PM-9PM)</option>
                    <option value="night">Night (9PM-6AM)</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Custom Date Range */}
              {filters.dateRange === "custom" && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="mb-2">Start Date</Label>
                    <Input
                      type="date"
                      value={filters.customStartDate}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          customStartDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-2">End Date</Label>
                    <Input
                      type="date"
                      value={filters.customEndDate}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          customEndDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Orders */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <EnhancedOrderBoard
            orders={orders}
            restaurantId={restaurantId}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </MainLayout>
  );
}
