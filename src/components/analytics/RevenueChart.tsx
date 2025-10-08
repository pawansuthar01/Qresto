"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
  orders: any[];
}

export function RevenueChart({ orders }: RevenueChartProps) {
  const chartData = useMemo(() => {
    // Group orders by date
    const dataByDate: Record<string, number> = {};

    orders.forEach((order) => {
      if (order.status !== "CANCELLED") {
        const date = new Date(order.createdAt).toLocaleDateString();
        dataByDate[date] = (dataByDate[date] || 0) + order.total;
      }
    });

    // Convert to array and sort by date
    return Object.entries(dataByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  }, [orders]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No revenue data yet
      </div>
    );
  }

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  return (
    <div className="space-y-4">
      <div className="flex h-48 items-end justify-between gap-2">
        {chartData.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100;
          return (
            <div
              key={index}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative w-full">
                <div
                  className="w-full rounded-t-md bg-primary transition-all hover:opacity-80"
                  style={{ height: `${height * 1.6}px` }}
                  title={formatCurrency(item.revenue)}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
        <div>
          <div className="text-xs text-muted-foreground">Today</div>
          <div className="text-lg font-bold">
            {formatCurrency(chartData[chartData.length - 1]?.revenue || 0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">7-Day Total</div>
          <div className="text-lg font-bold">
            {formatCurrency(chartData.reduce((sum, d) => sum + d.revenue, 0))}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">7-Day Avg</div>
          <div className="text-lg font-bold">
            {formatCurrency(
              chartData.reduce((sum, d) => sum + d.revenue, 0) /
                chartData.length
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
