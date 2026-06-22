import { authOptions } from "@/lib/auth";
import { Permission } from "@/types";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_PERMISSIONS: Permission = {
  "menu.create": true,
  "menu.read": true,
  "menu.update": true,
  "menu.schedule": true,
  "menu.delete": true,
  "menu.customize": true,
  "table.create": true,
  "table.read": true,
  "table.update": true,
  "table.delete": true,
  "qrcode.generate": true,
  "qrcode.read": true,
  "qrcode.update": true,
  "qrcode.delete": true,
  "order.create": true,
  "order.read": true,
  "order.update": true,
  "invoice.generate": true,
  "invoice.download": true,
  "analytics.view": true,
  "staff.manage": true,
  "settings.update": true,
  "media.upload": true,
  "media.read": true,
  "media.delete": true,
};

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      session.user.role === UserRole.ADMIN ||
      session.user.role === UserRole.SUPER_ADMIN
    ) {
      return NextResponse.json({ permissions: ADMIN_PERMISSIONS });
    }

    if (!session.user.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      select: {
        permissions: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Access check
    if (
      session.user.restaurantId !== params.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
