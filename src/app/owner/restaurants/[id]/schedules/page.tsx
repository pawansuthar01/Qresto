"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { CreateScheduleDialog } from "@/components/schedule/CreateScheduleDialog";
import { SchedulePreview } from "@/components/schedule/SchedulePreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Clock, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRestaurant } from "@/hooks/useRestaurant";
import { usePermissions } from "@/hooks/usePermissions";

export default function SchedulesPage() {
  const params = useParams();
  const restaurantId = params.rid as string;
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/restaurants/${restaurantId}/schedules`);
      if (!res.ok) throw new Error("Failed to fetch schedules");
      return res.json();
    },
  });

  const canSchedule = hasPermission("menu.schedule");

  if (!canSchedule) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            You don't have permission to manage menu schedules
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Menu Schedules</h1>
            <p className="text-muted-foreground">
              Create time-based and event-driven menu schedules
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewDialogOpen(true)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Schedule
            </Button>
          </div>
        </div>

        {/* AI Suggestions Card */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                🎯 <strong>Peak Lunch Hour:</strong> 12:00 - 14:00 PM shows 42%
                higher orders. Consider extending lunch menu.
              </p>
              <p className="text-sm">
                📊 <strong>Dinner Performance:</strong> Evening menu generates
                35% more revenue. Add premium items.
              </p>
              <p className="text-sm">
                💡 <strong>Weekend Opportunity:</strong> Saturday breakfast
                orders up 28%. Create weekend brunch special.
              </p>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading schedules...</p>
          </div>
        ) : schedules?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              No schedules created yet
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first schedule
            </Button>
          </div>
        ) : (
          <ScheduleCalendar
            schedules={schedules || []}
            restaurantId={restaurantId}
          />
        )}

        <CreateScheduleDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          restaurantId={restaurantId}
        />

        <SchedulePreview
          open={previewDialogOpen}
          onOpenChange={setPreviewDialogOpen}
          restaurantId={restaurantId}
          schedules={schedules || []}
        />
      </div>
    </MainLayout>
  );
}
