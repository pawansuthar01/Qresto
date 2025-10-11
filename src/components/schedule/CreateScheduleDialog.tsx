"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
}

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function CreateScheduleDialog({
  open,
  onOpenChange,
  restaurantId,
}: CreateScheduleDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scheduleType, setScheduleType] = useState("DAILY");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const createSchedule = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/restaurants/${restaurantId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create schedule");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules", restaurantId] });
      toast({
        title: "Success",
        description: "Schedule created successfully",
      });
      reset();
      setSelectedDays([]);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const scheduleData = {
      name: data.name,
      description: data.description,
      type: scheduleType,
      daysOfWeek: data.daysOfWeek,
      startDate: data.startDate,
      eventName: data.eventName,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      priority: parseInt(data.priority) || 0,
      isActive: true,
    };

    if (scheduleType === "WEEKLY") {
      scheduleData.daysOfWeek = selectedDays;
    } else if (scheduleType === "DATE_RANGE") {
      scheduleData.startDate = data.startDate;
      scheduleData.endDate = data.endDate;
    } else if (scheduleType === "EVENT") {
      scheduleData.eventName = data.eventName;
    }

    createSchedule.mutate(scheduleData);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Menu Schedule</DialogTitle>
          <DialogDescription>
            Set up time-based or event-driven menu availability
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={scheduleType} onValueChange={setScheduleType}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="DAILY">Daily</TabsTrigger>
              <TabsTrigger value="WEEKLY">Weekly</TabsTrigger>
              <TabsTrigger value="DATE_RANGE">Date Range</TabsTrigger>
              <TabsTrigger value="EVENT">Event</TabsTrigger>
              <TabsTrigger value="SEASONAL">Seasonal</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Schedule Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Breakfast Menu"
                  {...register("name", { required: true })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">Name is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description..."
                  {...register("description")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register("startTime", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    {...register("endTime", { required: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">
                  Priority (higher = more important)
                </Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="0"
                  defaultValue={0}
                  {...register("priority")}
                />
              </div>
            </div>

            {/* WEEKLY Specific */}
            <TabsContent value="WEEKLY" className="space-y-4">
              <div className="space-y-2">
                <Label>Active Days</Label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={selectedDays.includes(day)}
                        onCheckedChange={() => toggleDay(day)}
                      />
                      <Label
                        htmlFor={day}
                        className="capitalize cursor-pointer"
                      >
                        {day.slice(0, 3)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* DATE_RANGE Specific */}
            <TabsContent value="DATE_RANGE" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" {...register("endDate")} />
                </div>
              </div>
            </TabsContent>

            {/* EVENT Specific */}
            <TabsContent value="EVENT" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  placeholder="e.g., Live Music Night, Happy Hour"
                  {...register("eventName")}
                />
              </div>
            </TabsContent>

            {/* SEASONAL Specific */}
            <TabsContent value="SEASONAL" className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Seasonal schedules automatically activate based on months. Set
                  the start and end times for your seasonal menu.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSchedule.isPending}>
              {createSchedule.isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
