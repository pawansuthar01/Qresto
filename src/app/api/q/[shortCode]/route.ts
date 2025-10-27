import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

// GET - Public access to menu via QR code
export async function GET(
  _: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    // 1️⃣ Find QR code and restaurant
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

    // 2️⃣ Increment scan count asynchronously (don’t block response)
    prisma.qRCode
      .update({
        where: { id: qrCode.id },
        data: { scans: { increment: 1 } },
      })
      .catch(() => {});

    // 3️⃣ Prepare time/date info
    const now = dayjs();
    const currentTime = now.format("HH:mm");
    const currentDay = now.format("dddd").toLowerCase();
    const currentMonth = now.month() + 1; // 1–12

    // 4️⃣ Fetch all active categories for restaurant
    const allCategories = await prisma.menuCategory.findMany({
      where: {
        restaurantId: qrCode.restaurant.id,
        isActive: true,
        status: "active",
      },
      include: {
        items: {
          where: { isAvailable: true, status: "active" },
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    // 5️⃣ Filter categories by schedule logic
    const activeCategories = allCategories.filter((cat) => {
      const type = (cat.scheduleType || "ALWAYS").toUpperCase();
      const startTime = cat.startTime || "00:00";
      const endTime = cat.endTime || "23:59";
      const inTime =
        startTime < endTime
          ? currentTime >= startTime && currentTime <= endTime
          : currentTime >= startTime || currentTime <= endTime; // handles overnight time

      switch (type) {
        case "ALWAYS":
          return true;

        case "DAILY":
          return inTime;

        case "WEEKLY":
          return cat.daysOfWeek?.includes(currentDay) && inTime;

        case "DATE_RANGE":
          if (!cat.startDate || !cat.endDate) return false;
          const inRange = now.isBetween(
            dayjs(cat.startDate),
            dayjs(cat.endDate),
            "day",
            "[]"
          );
          return inRange && inTime;

        case "EVENT":
          return cat.eventActive === true;

        case "SEASONAL":
          if (!cat.startMonth || !cat.endMonth) return false;
          // Handles wrapping seasons (e.g., Nov → Feb)
          if (cat.startMonth <= cat.endMonth) {
            return (
              currentMonth >= cat.startMonth &&
              currentMonth <= cat.endMonth &&
              inTime
            );
          } else {
            return (
              (currentMonth >= cat.startMonth ||
                currentMonth <= cat.endMonth) &&
              inTime
            );
          }

        default:
          return false;
      }
    });

    // 6️⃣ Check restaurant permission for ordering
    const permissions = qrCode.restaurant.permissions as any;
    const canOrder = permissions?.["order.create"] === true;

    // 7️⃣ Send filtered categories
    return NextResponse.json({
      restaurant: qrCode.restaurant,
      table: qrCode.table,
      categories: activeCategories,
      canOrder,
      time: currentTime,
      day: currentDay,
      month: currentMonth,
    });
  } catch (error) {
    console.error("Error fetching guest menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
