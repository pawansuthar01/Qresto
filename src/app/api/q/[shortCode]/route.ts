import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

// GET - Public access to menu via QR code
export async function GET(
  _: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    // Find QR code and include restaurant
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode: params.shortCode },
      include: {
        table: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logoUrl: true,
            coverUrl: true,
            customization: true,
            permissions: true,
          },
        },
      },
    });

    if (!qrCode || !qrCode.isActive) {
      return NextResponse.json(
        { error: "QR code not found or inactive" },
        { status: 404 }
      );
    }

    // Increment scan count
    await prisma.qRCode.update({
      where: { id: qrCode.id },
      data: { scans: { increment: 1 } },
    });

    // Get current date/time info
    const now = dayjs();
    const currentTime = now.format("HH:mm");
    const currentDay = now.format("dddd").toLowerCase(); // monday, tuesday, ...
    const currentMonth = now.month() + 1; // 1-12

    const categories = await prisma.menuCategory.findMany({
      where: {
        restaurantId: qrCode.restaurant.id,
        isActive: true,
        status: "active",

        OR: [
          { scheduleType: "always" },
          {
            scheduleType: "DAILY",
            startTime: { lte: currentTime },
            endTime: { gte: currentTime },
          },
          {
            scheduleType: "WEEKLY",
            daysOfWeek: { has: currentDay },
            startTime: { lte: currentTime },
            endTime: { gte: currentTime },
          },
          {
            scheduleType: "DATE_RANGE",
            startDate: { lte: now.toDate() },
            endDate: { gte: now.toDate() },
            startTime: { lte: currentTime },
            endTime: { gte: currentTime },
          },
          {
            scheduleType: "EVENT",
            eventActive: true,
          },
          {
            scheduleType: "SEASONAL",
            startMonth: { lte: currentMonth },
            endMonth: { gte: currentMonth },
            startTime: { lte: currentTime },
            endTime: { gte: currentTime },
          },
        ],
      },
      include: {
        items: {
          where: { isAvailable: true, status: "active" },
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    // Check if ordering is allowed
    const permissions = qrCode.restaurant.permissions as any;
    const canOrder = permissions["order.create"] === true;

    return NextResponse.json({
      restaurant: qrCode.restaurant,
      table: qrCode.table,
      categories,
      canOrder,
    });
  } catch (error) {
    console.error("Error fetching guest menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
