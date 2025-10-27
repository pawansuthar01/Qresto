"use client";
import { useEffect, useState } from "react";
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
  editingSchedule?: any | null;
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
  editingSchedule,
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
  } = useForm({});

  // 🧩 Pre-fill form when editing
  useEffect(() => {
    if (editingSchedule) {
      setScheduleType(editingSchedule.scheduleType);
      setSelectedDays(editingSchedule.daysOfWeek || []);
      reset({
        name: editingSchedule.name,
        description: editingSchedule.description,
        startTime: editingSchedule.startTime,
        endTime: editingSchedule.endTime,
        startDate: editingSchedule.startDate?.split("T")[0],
        endDate: editingSchedule.endDate?.split("T")[0],
        eventName: editingSchedule.eventName,
        priority: editingSchedule.displayOrder ?? 0,
      });
    } else {
      reset({});
      setScheduleType("DAILY");
      setSelectedDays([]);
    }
  }, [editingSchedule, reset]);

  // 🧩 Mutation (auto-switch between POST and PATCH)
  const saveSchedule = useMutation({
    mutationFn: async (data: any) => {
      const method = editingSchedule ? "PATCH" : "POST";
      const url = editingSchedule
        ? `/api/restaurants/${restaurantId}/schedules/${editingSchedule.id}`
        : `/api/restaurants/${restaurantId}/schedules`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save schedule");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules", restaurantId] });
      toast({
        title: "Success",
        description: editingSchedule
          ? "Schedule updated successfully"
          : "Schedule created successfully",
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
    const payload = {
      name: data.name,
      description: data.description,
      scheduleType,
      daysOfWeek: scheduleType === "WEEKLY" ? selectedDays : [],
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      eventName: data.eventName || null,
      startTime: data.startTime,
      endTime: data.endTime,
      displayOrder: parseInt(data.priority) || 0,
      isActive: true,
    };
    saveSchedule.mutate(payload);
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
          <DialogTitle>
            {editingSchedule ? "Edit Schedule" : "Create Menu Schedule"}
          </DialogTitle>
          <DialogDescription>
            {editingSchedule
              ? "Modify existing menu schedule settings"
              : "Set up a new time-based schedule"}
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

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
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
                <Label>Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description..."
                  {...register("description")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    {...register("startTime", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    {...register("endTime", { required: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Input
                  type="number"
                  defaultValue={0}
                  {...register("priority")}
                />
              </div>
            </div>

            {/* WEEKLY */}
            <TabsContent value="WEEKLY" className="space-y-4">
              <Label>Active Days</Label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedDays.includes(day)}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <Label className="capitalize cursor-pointer">
                      {day.slice(0, 3)}
                    </Label>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* DATE RANGE */}
            <TabsContent value="DATE_RANGE" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" {...register("startDate")} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" {...register("endDate")} />
                </div>
              </div>
            </TabsContent>

            {/* EVENT */}
            <TabsContent value="EVENT">
              <div>
                <Label>Event Name</Label>
                <Input
                  placeholder="e.g., Happy Hour"
                  {...register("eventName")}
                />
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
            <Button type="submit" disabled={saveSchedule.isPending}>
              {saveSchedule.isPending
                ? editingSchedule
                  ? "Updating..."
                  : "Creating..."
                : editingSchedule
                ? "Save Changes"
                : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
