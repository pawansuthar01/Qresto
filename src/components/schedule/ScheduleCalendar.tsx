"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { CreateScheduleDialog } from "./CreateScheduleDialog";
import { useState } from "react";

interface ScheduleCalendarProps {
  schedules: any[];
  restaurantId: string;
}

const SCHEDULE_TYPE_COLORS: Record<string, string> = {
  DAILY: "bg-blue-500",
  always: "bg-green-700",
  WEEKLY: "bg-green-500",
  DATE_RANGE: "bg-purple-500",
  EVENT: "bg-orange-500",
  SEASONAL: "bg-cyan-500",
};

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  DAILY: "Daily",
  always: "Always",
  WEEKLY: "Weekly",
  DATE_RANGE: "Date Range",
  EVENT: "Event",
  SEASONAL: "Seasonal",
};

export function ScheduleCalendar({
  schedules,
  restaurantId,
}: ScheduleCalendarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);

  // 🔄 Toggle schedule active/inactive
  const toggleSchedule = useMutation({
    mutationFn: async ({
      scheduleId,
      isActive,
    }: {
      scheduleId: string;
      isActive: boolean;
    }) => {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/schedules/${scheduleId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        }
      );
      if (!res.ok) throw new Error("Failed to toggle schedule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules", restaurantId] });
      toast({
        title: "Success",
        description: "Schedule status updated successfully",
      });
    },
  });

  // 🗑️ Delete schedule
  const deleteSchedule = useMutation({
    mutationFn: async (scheduleId: string) => {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/schedules/${scheduleId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete schedule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules", restaurantId] });
      toast({ title: "Deleted", description: "Schedule deleted successfully" });
    },
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schedules.map((schedule) => (
          <Card
            key={schedule.id}
            className={schedule.isActive ? "border-primary" : "opacity-60"}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {schedule.name}
                    <Badge
                      className={SCHEDULE_TYPE_COLORS[schedule.scheduleType]}
                    >
                      {SCHEDULE_TYPE_LABELS[schedule.scheduleType]}
                    </Badge>
                  </CardTitle>
                  {schedule.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {schedule.description}
                    </p>
                  )}
                </div>

                {/* Power toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    toggleSchedule.mutate({
                      scheduleId: schedule.id,
                      isActive: !schedule.isActive,
                    })
                  }
                >
                  {schedule.isActive ? (
                    <Power className="h-4 w-4 text-green-500" />
                  ) : (
                    <PowerOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {schedule.scheduleType !== "always" && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {schedule.startTime || "00:00"} -{" "}
                    {schedule.endTime || "23:59"}
                  </span>
                </div>
              )}

              {/* Extra info */}
              {schedule.scheduleType === "WEEKLY" &&
                schedule.daysOfWeek?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {schedule.daysOfWeek.map((day: string) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {day.slice(0, 3).toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                )}

              {schedule.scheduleType === "DATE_RANGE" && (
                <div className="text-sm text-muted-foreground">
                  {schedule.startDate &&
                    new Date(schedule.startDate).toLocaleDateString()}{" "}
                  →{" "}
                  {schedule.endDate &&
                    new Date(schedule.endDate).toLocaleDateString()}
                </div>
              )}

              {schedule.scheduleType === "EVENT" && (
                <div className="text-sm text-muted-foreground">
                  Event:{" "}
                  <strong>{schedule.eventName || "Unnamed Event"}</strong>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Order: {schedule.displayOrder ?? 0}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingSchedule(schedule);
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Delete this schedule?"))
                        deleteSchedule.mutate(schedule.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {schedules.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No schedules created yet.
          </div>
        )}
      </div>

      <CreateScheduleDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditingSchedule(null);
          setCreateDialogOpen(open);
        }}
        restaurantId={restaurantId}
        editingSchedule={editingSchedule}
      />
    </>
  );
}
