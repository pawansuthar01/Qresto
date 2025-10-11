"use client";

import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { useQuery } from "@tanstack/react-query";
import { useRestaurant } from "@/hooks/useRestaurant";
import { usePermissions } from "@/hooks/usePermissions";
import { TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const params = useParams();
  const restaurantId = params.rid as string;
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/${restaurantId}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: hasPermission("analytics.view"),
  });

  const canView = hasPermission("analytics.view");

  if (!canView) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            You don't have permission to view analytics
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your restaurant's performance and insights
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : (
          <AnalyticsDashboard data={analytics} restaurantId={restaurantId} />
        )}
      </div>
    </MainLayout>
  );
}
