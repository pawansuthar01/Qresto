import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";

const updateScheduleSchema = z.object({
  categoryId: z.string(),
  scheduleType: z.enum([
    "always",
    "DAILY",
    "WEEKLY",
    "DATE_RANGE",
    "EVENT",
    "SEASONAL",
  ]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  daysOfWeek: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  eventName: z.string().optional(),
  eventActive: z.boolean().optional(),
  startMonth: z.number().optional(),
  endMonth: z.number().optional(),
  isActive: z.boolean().optional(),
});
// GET - Fetch all menu schedules
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: {
        restaurantId: params.id,

        status: "active",
      },
      select: {
        id: true,
        name: true,
        scheduleType: true,
        isActive: true,
        startTime: true,
        endTime: true,
        daysOfWeek: true,
        startDate: true,
        endDate: true,
        eventName: true,
        eventActive: true,
        startMonth: true,
        displayOrder: true,
        endMonth: true,
        _count: {
          select: { items: true },
        },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Check permission
    const { authorized, error } = await authorize(params.id, "menu.update");
    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    if (!body.categoryId) {
      return NextResponse.json(
        { error: "Category ID does not found" },
        { status: 400 }
      );
    }
    const {
      categoryId,
      scheduleType,
      startTime,
      endTime,
      daysOfWeek,
      startDate,
      endDate,
      eventName,
      eventActive,
      startMonth,
      endMonth,
      isActive,
    } = updateScheduleSchema.parse(body);

    // Build update data object dynamically
    const updateData: any = { scheduleType };
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (daysOfWeek !== undefined) updateData.daysOfWeek = daysOfWeek;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (eventName !== undefined) updateData.eventName = eventName;
    if (eventActive !== undefined) updateData.eventActive = eventActive;
    if (startMonth !== undefined) updateData.startMonth = startMonth;
    if (endMonth !== undefined) updateData.endMonth = endMonth;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update the category in Prisma
    const updated = await prisma.menuCategory.update({
      where: { id: categoryId },
      data: updateData,
    });

    // Push real-time update via Supabase Realtime
    try {
      await supabaseAdmin
        .from(`menu_categories:id=eq.${categoryId}`)
        .upsert(
          { ...updateData, _realtime_event: "schedule-updated" },
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
