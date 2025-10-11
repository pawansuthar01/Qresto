import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Public access to menu via QR code
export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    // Find QR code and increment scan count
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

    // Get menu with categories
    const categories = await prisma.menuCategory.findMany({
      where: {
        restaurantId: qrCode.restaurant.id,
        isActive: true,
      },
      include: {
        items: {
          where: { isAvailable: true },
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
