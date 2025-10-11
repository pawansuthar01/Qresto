import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateScheduleSchema = z.object({
  categoryId: z.string(),
  scheduleType: z.enum([
    "always",
    "time-based",
    "date-based",
    "event-based",
    "season-based",
  ]),
  schedule: z.any(), // MenuSchedule type
});

// GET - Get all menu schedules
export async function GET(
  request: NextRequest,
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

// PATCH - Update menu schedule (permission: menu.schedule)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check for special schedule permission
    const session = await authorize(params.id, "menu.update");

    if (!session.authorized) {
      return NextResponse.json({ error: session.error }, { status: 403 });
    }

    const body = await request.json();
    const { categoryId, scheduleType, schedule } =
      updateScheduleSchema.parse(body);

    const updated = await prisma.menuCategory.update({
      where: {
        id: categoryId,
        restaurantId: params.id,
      },
      data: {
        scheduleType,
        schedule,
      },
    });

    // Emit real-time schedule update
    if (global.io) {
      global.io.to(`restaurant:${params.id}`).emit("schedule-updated", {
        categoryId,
        scheduleType,
        schedule,
      });

      // Notify all tables
      const tables = await prisma.table.findMany({
        where: { restaurantId: params.id },
        select: { id: true },
      });

      tables.forEach((table) => {
        global?.io?.to(`table:${table.id}`).emit("schedule-updated", {
          categoryId,
          scheduleType,
          schedule,
        });
      });
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
