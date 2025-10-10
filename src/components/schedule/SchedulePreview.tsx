"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, RefreshCw } from "lucide-react";

interface SchedulePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  schedules: any[];
}

export function SchedulePreview({
  open,
  onOpenChange,
  schedules,
}: SchedulePreviewProps) {
  const [previewDate, setPreviewDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [previewTime, setPreviewTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );

  const getActiveSchedules = () => {
    const testDate = new Date(`${previewDate}T${previewTime}`);
    const testTime = previewTime;
    const testDay = testDate.toLocaleDateString("en-US", { weekday: "long" });

    return schedules.filter((schedule) => {
      if (!schedule.isActive) return false;

      switch (schedule.type) {
        case "DAILY":
          return testTime >= schedule.startTime && testTime <= schedule.endTime;

        case "WEEKLY":
          if (!schedule.daysOfWeek?.includes(testDay)) return false;
          return testTime >= schedule.startTime && testTime <= schedule.endTime;

        case "DATE_RANGE":
          const start = new Date(schedule.startDate);
          const end = new Date(schedule.endDate);
          if (testDate < start || testDate > end) return false;
          return testTime >= schedule.startTime && testTime <= schedule.endTime;

        default:
          return true;
      }
    });
  };

  const activeSchedules = getActiveSchedules();

  const setCurrentTime = () => {
    const now = new Date();
    setPreviewDate(now.toISOString().split("T")[0]);
    setPreviewTime(now.toTimeString().slice(0, 5));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Schedule Preview & Simulator</DialogTitle>
          <DialogDescription>
            Test how your menu will look at different times
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Selector */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="previewDate">Date</Label>
              <Input
                id="previewDate"
                type="date"
                value={previewDate}
                onChange={(e) => setPreviewDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previewTime">Time</Label>
              <Input
                id="previewTime"
                type="time"
                value={previewTime}
                onChange={(e) => setPreviewTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={setCurrentTime}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Now
              </Button>
            </div>
          </div>

          {/* Active Schedules Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Active Menus at {previewTime}
              </h3>
              <Badge
                variant={activeSchedules.length > 0 ? "default" : "secondary"}
              >
                {activeSchedules.length} active
              </Badge>
            </div>

            {activeSchedules.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Kitchen Closed</h3>
                  <p className="text-sm text-muted-foreground">
                    No menus scheduled for this time
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeSchedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{schedule.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {schedule.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {schedule.categories?.length || 0} categories
                            </span>
                          </div>
                        </div>
                        <Badge>Priority {schedule.priority}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Time Tests */}
          <div className="space-y-2">
            <Label>Quick Time Tests</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Breakfast (9 AM)", time: "09:00" },
                { label: "Lunch (12 PM)", time: "12:00" },
                { label: "Afternoon (3 PM)", time: "15:00" },
                { label: "Dinner (7 PM)", time: "19:00" },
                { label: "Late Night (11 PM)", time: "23:00" },
              ].map(({ label, time }) => (
                <Button
                  key={time}
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTime(time)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-semibold text-sm">How it works</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                • Schedules automatically activate/deactivate based on time
              </li>
              <li>• Multiple schedules can be active simultaneously</li>
              <li>• Higher priority schedules appear first</li>
              <li>• Customers see only active menus when scanning QR</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
