"use client";

import { useMemo } from "react";

interface OrderStatusChartProps {
  data: Array<{ status: string; _count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#eab308",
  CONFIRMED: "#3b82f6",
  PREPARING: "#f97316",
  READY: "#22c55e",
  SERVED: "#6b7280",
  CANCELLED: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
  CANCELLED: "Cancelled",
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item._count, 0);
  }, [data]);

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No orders yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex h-8 overflow-hidden rounded-lg">
        {data.map((item) => {
          const percentage = (item._count / total) * 100;
          return (
            <div
              key={item.status}
              style={{
                width: `${percentage}%`,
                backgroundColor: STATUS_COLORS[item.status],
              }}
              className="transition-all hover:opacity-80"
              title={`${STATUS_LABELS[item.status]}: ${item._count}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {data.map((item) => {
          const percentage = ((item._count / total) * 100).toFixed(1);
          return (
            <div key={item.status} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[item.status] }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {STATUS_LABELS[item.status]}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item._count} ({percentage}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
