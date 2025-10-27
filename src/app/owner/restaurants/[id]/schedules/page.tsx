"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { SchedulePreview } from "@/components/schedule/SchedulePreview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Calendar, Clock, Sparkles, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRestaurant } from "@/hooks/useRestaurant";
import { usePermissions } from "@/hooks/usePermissions";
import Loading from "@/components/ui/loading";
import { AISuggestionResponse } from "@/types";

export default function SchedulesPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/restaurants/${restaurantId}/schedules`);
      if (!res.ok) throw new Error("Failed to fetch schedules");
      return res.json();
    },
    enabled: !!restaurantId, // only run if restaurantId exists
    staleTime: 1000 * 60 * 2, // cache for 2 minutes
    retry: 2, // retry twice if failed
  });

  const {
    data: suggestionData,
    isLoading: isLoadingSug,
    refetch,
  } = useQuery<AISuggestionResponse>({
    queryKey: ["ai-suggestions", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const res = await fetch(
        `/api/restaurants/${restaurantId}/ai-suggestions`
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to fetch AI suggestions");
      }
      const data = await res.json();

      return data;
    },
    enabled: !!restaurantId, // only run if restaurantId exists
    staleTime: 1000 * 60 * 2, // cache for 2 minutes
    retry: 2, // retry twice if failed
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
            <h1 className="text-3xl sm:text-2xl max-sm:text-xl font-bold">
              Menu Schedules
            </h1>
            <p className="text-muted-foreground sm:text-sm max-sm:text-xs">
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
          </div>
        </div>

        {/* AI Suggestions Card */}
        {isLoadingSug ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-blue-100 rounded-lg border border-blue-200"
              ></div>
            ))}
          </div>
        ) : suggestionData && suggestionData?.suggestions?.length > 0 ? (
          <Card className="border-blue-200 bg-gradient-to-b from-blue-50 to-white shadow-sm transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Sparkles className="w-5 h-5 max-sm:w-4 max-sm:h-4 text-blue-600" />
                <span className=" max-sm:text-xl">AI Recommendations</span>
              </CardTitle>
              <p className="text-xs  text-gray-500">
                Smart insights generated for your current data.
              </p>
            </CardHeader>

            <CardContent>
              <div className="space-y-4 max-sm:space-y-2">
                {suggestionData?.suggestions?.map(
                  (suggestion: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white p-4  rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            {suggestion.title}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5  max-sm:px-1  text-center rounded-full text-xs font-medium capitalize ${
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

                      <p className="text-sm text-gray-600 leading-relaxed">
                        {suggestion.description}
                      </p>

                      <div className="mt-3 text-xs text-blue-600 font-medium">
                        Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  )
                )}
              </div>
              <CardDescription className="text-xs">
                {suggestionData.range} (analytics Data then give suggestions)
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="text-sm text-gray-500 italic text-center py-4">
            No AI recommendations available yet.{" "}
            <span
              onClick={() => {
                refetch();
              }}
              className="text-red-500 text-xs"
            >
              again try
            </span>
          </div>
        )}

        {isLoading ? (
          <Loading h="h-full" />
        ) : schedules?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              No schedules created yet
            </p>
            <Button onClick={() => {}}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first Menu
            </Button>
          </div>
        ) : (
          <>
            <ScheduleCalendar
              schedules={schedules || []}
              restaurantId={restaurantId}
            />
          </>
        )}

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
