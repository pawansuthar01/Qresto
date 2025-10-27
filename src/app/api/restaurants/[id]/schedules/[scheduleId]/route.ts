import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { authorize } from "@/lib/permissions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; scheduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    });
    if (!restaurant)
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );

    authorize(restaurant.permissions as any, "menu.schedule");

    const body = await req.json();
    const updateData: any = {};

    for (const field of [
      "scheduleType",
      "startTime",
      "endTime",
      "daysOfWeek",
      "startDate",
      "endDate",
      "eventName",
      "eventActive",
      "startMonth",
      "endMonth",
      "isActive",
    ]) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const schedule = await prisma.menuCategory.update({
      where: { id: params.scheduleId },
      data: updateData,
    });

    return NextResponse.json(schedule);
  } catch (error: any) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; scheduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    });
    if (!restaurant)
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );

    authorize(restaurant.permissions as any, "menu.schedule");

    await prisma.menuCategory.update({
      where: { id: params.scheduleId },
      data: { status: "deleted" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
