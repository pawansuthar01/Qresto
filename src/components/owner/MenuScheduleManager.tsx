"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Sparkles,
  Save,
  Eye,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { MenuSchedule, DaySchedule, getMenuStatus } from "@/lib/menu-schedule";
import { notificationSound } from "@/lib/notification-sound";

interface MenuScheduleManagerProps {
  restaurant: any;
  categories: any[];
  onClose: () => void;
}

export default function MenuScheduleManager({
  restaurant,
  categories,
  onClose,
}: MenuScheduleManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id);
  const [scheduleType, setScheduleType] = useState<string>("always");
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([
    { day: 0, enabled: false, timeRanges: [] },
    {
      day: 1,
      enabled: true,
      timeRanges: [{ startTime: "09:00", endTime: "22:00" }],
    },
    {
      day: 2,
      enabled: true,
      timeRanges: [{ startTime: "09:00", endTime: "22:00" }],
    },
    {
      day: 3,
      enabled: true,
      timeRanges: [{ startTime: "09:00", endTime: "22:00" }],
    },
    {
      day: 4,
      enabled: true,
      timeRanges: [{ startTime: "09:00", endTime: "22:00" }],
    },
    {
      day: 5,
      enabled: true,
      timeRanges: [{ startTime: "09:00", endTime: "22:00" }],
    },
    { day: 6, enabled: false, timeRanges: [] },
  ]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    loadAISuggestions();
  }, []);

  const loadAISuggestions = async () => {
    try {
      const response = await fetch(
        `/api/restaurants/${restaurant.id}/ai-suggestions`
      );
      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error loading AI suggestions:", error);
    }
  };

  const toggleDayEnabled = (dayIndex: number) => {
    setDaySchedules((prev) =>
      prev.map((ds) =>
        ds.day === dayIndex ? { ...ds, enabled: !ds.enabled } : ds
      )
    );
  };

  const updateTimeRange = (
    dayIndex: number,
    rangeIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setDaySchedules((prev) =>
      prev.map((ds) => {
        if (ds.day === dayIndex) {
          const newRanges = [...ds.timeRanges];
          newRanges[rangeIndex] = { ...newRanges[rangeIndex], [field]: value };
          return { ...ds, timeRanges: newRanges };
        }
        return ds;
      })
    );
  };

  const addTimeRange = (dayIndex: number) => {
    setDaySchedules((prev) =>
      prev.map((ds) => {
        if (ds.day === dayIndex) {
          return {
            ...ds,
            timeRanges: [
              ...ds.timeRanges,
              { startTime: "09:00", endTime: "17:00" },
            ],
          };
        }
        return ds;
      })
    );
  };

  const removeTimeRange = (dayIndex: number, rangeIndex: number) => {
    setDaySchedules((prev) =>
      prev.map((ds) => {
        if (ds.day === dayIndex) {
          return {
            ...ds,
            timeRanges: ds.timeRanges.filter((_, i) => i !== rangeIndex),
          };
        }
        return ds;
      })
    );
  };

  const saveSchedule = async () => {
    setLoading(true);

    try {
      const schedule: MenuSchedule = {
        type: scheduleType as any,
        daySchedules: scheduleType === "time-based" ? daySchedules : undefined,
        autoSwitch: true,
        preOpenMinutes: 10,
        preCloseMinutes: 15,
      };

      const response = await fetch(
        `/api/restaurants/${restaurant.id}/schedule`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: selectedCategory,
            scheduleType,
            schedule,
          }),
        }
      );

      if (response.ok) {
        notificationSound.playSuccess();
        alert("Schedule saved successfully! Changes are now live.");
      } else {
        throw new Error("Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const previewSchedule = () => {
    const schedule: MenuSchedule = {
      type: scheduleType as any,
      daySchedules: scheduleType === "time-based" ? daySchedules : undefined,
    };

    const status = getMenuStatus(schedule);
    alert(`Preview:\nStatus: ${status.status}\nMessage: ${status.message}`);
  };

  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategory
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Menu Schedule Manager
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure when menus are available • Real-time sync enabled
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Menu Category</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.items?.length || 0} items)
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-gray-900">
                            {suggestion.title}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            suggestion.impact === "high"
                              ? "bg-red-100 text-red-700"
                              : suggestion.impact === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {suggestion.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {suggestion.description}
                      </p>
                      <div className="mt-2 text-xs text-purple-600">
                        Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schedule Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: "always", label: "Always Available", icon: "🟢" },
                  { value: "time-based", label: "Time-Based", icon: "⏰" },
                  { value: "date-based", label: "Date-Based", icon: "📅" },
                  { value: "event-based", label: "Event-Based", icon: "🎉" },
                  { value: "season-based", label: "Season-Based", icon: "🌸" },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setScheduleType(type.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      scheduleType === type.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-semibold text-sm">{type.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time-Based Configuration */}
          {scheduleType === "time-based" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {daySchedules.map((daySchedule) => (
                    <div
                      key={daySchedule.day}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={daySchedule.enabled}
                            onChange={() => toggleDayEnabled(daySchedule.day)}
                            className="w-5 h-5 rounded"
                          />
                          <span className="font-semibold text-gray-900">
                            {days[daySchedule.day]}
                          </span>
                        </label>
                        {daySchedule.enabled && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addTimeRange(daySchedule.day)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Time
                          </Button>
                        )}
                      </div>

                      {daySchedule.enabled && (
                        <div className="space-y-2 ml-8">
                          {daySchedule.timeRanges.map((range, rangeIdx) => (
                            <div
                              key={rangeIdx}
                              className="flex items-center gap-3"
                            >
                              <Input
                                type="time"
                                value={range.startTime}
                                onChange={(e) =>
                                  updateTimeRange(
                                    daySchedule.day,
                                    rangeIdx,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                                className="w-32"
                              />
                              <span className="text-gray-500">to</span>
                              <Input
                                type="time"
                                value={range.endTime}
                                onChange={(e) =>
                                  updateTimeRange(
                                    daySchedule.day,
                                    rangeIdx,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                                className="w-32"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  removeTimeRange(daySchedule.day, rangeIdx)
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={previewSchedule}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={saveSchedule} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save & Go Live"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
