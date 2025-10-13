import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

const updateScheduleSchema = z.object({
  categoryId: z.string(),
  scheduleType: z.enum([
    "always",
    "time-based",
    "date-based",
    "event-based",
    "season-based",
  ]),
  schedule: z.any(), // Can be typed more strictly if you have a MenuSchedule type
});

// GET - Fetch all menu schedules
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId: params.id },
      select: {
        id: true,
        name: true,
        scheduleType: true,
        schedule: true,
        isActive: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update menu schedule (permission: menu.update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    const { authorized, error } = await authorize(params.id, "menu.update");
    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const { categoryId, scheduleType, schedule } =
      updateScheduleSchema.parse(body);

    const updated = await prisma.menuCategory.update({
      where: { id: categoryId, restaurantId: params.id },
      data: { scheduleType, schedule },
    });

    // ✅ Push real-time update via Supabase Realtime only
    try {
      await supabaseAdmin
        .from(`menu_categories:id=eq.${categoryId}`)
        .upsert(
          { scheduleType, schedule, _realtime_event: "schedule-updated" },
          { onConflict: "id" }
        );
    } catch (supabaseError) {
      console.warn("Supabase Realtime failed:", supabaseError);
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
