import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const scheduleSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
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
  displayOrder: z.number().optional(),
});

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId: params.id, status: "active" },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
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
        endMonth: true,
        displayOrder: true,
        _count: { select: { items: true } },
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

// 🆕 CREATE new schedule
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "menu.schedule");
    if (!authorized) return NextResponse.json({ error }, { status: 403 });

    const body = await request.json();
    const data = scheduleSchema.parse(body);

    const created = await prisma.menuCategory.create({
      data: {
        name: data.name,
        description: data.description,
        restaurantId: params.id,
        scheduleType: data.scheduleType,
        startTime: data.startTime,
        endTime: data.endTime,
        daysOfWeek: data.daysOfWeek || [],
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        eventName: data.eventName,
        eventActive: data.eventActive,
        startMonth: data.startMonth,
        endMonth: data.endMonth,
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder ?? 0,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );

    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 🛠️ UPDATE schedule
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "menu.schedule");
    if (!authorized) return NextResponse.json({ error }, { status: 403 });

    const body = await request.json();
    const data = scheduleSchema.partial().parse(body);

    if (!data.categoryId)
      return NextResponse.json(
        { error: "Category ID is required for update" },
        { status: 400 }
      );

    const updated = await prisma.menuCategory.update({
      where: { id: data.categoryId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );

    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
