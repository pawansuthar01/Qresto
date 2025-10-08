"use client";

interface TopItemsChartProps {
  data: Array<{
    menuItemId: string;
    _sum: { quantity: number };
    menuItem: { name: string; price: number };
  }>;
}

export function TopItemsChart({ data }: TopItemsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No sales data yet
      </div>
    );
  }

  const maxQuantity = Math.max(...data.map((item) => item._sum.quantity));

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = (item._sum.quantity / maxQuantity) * 100;
        const revenue = item._sum.quantity * item.menuItem.price;

        return (
          <div key={item.menuItemId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {index + 1}. {item.menuItem.name}
              </span>
              <span className="text-muted-foreground">
                {item._sum.quantity} sold
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Revenue: ₹{revenue.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
