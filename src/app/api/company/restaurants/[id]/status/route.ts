import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { getServerSession } from "next-auth";

const updateStatusSchema = z.object({
  status: z.enum(["active", "suspended", "blocked"]),
  reason: z.string().optional(),
});

// PATCH - Update restaurant status (Company Owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, reason } = updateStatusSchema.parse(body);

    const restaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: {
        status,
        suspendedAt: status !== "active" ? new Date() : null,
        suspendedReason: status !== "active" ? reason : null,
      },
    });

    // ✅ Emit real-time status change safely
    if (typeof global !== "undefined" && global.io) {
      global?.io
        .to(`restaurant:${params.id}`)
        .emit("restaurant-status-changed", { status, reason });

      const tables = await prisma.table.findMany({
        where: { restaurantId: params.id },
        select: { id: true },
      });

      tables.forEach((table: any) => {
        global?.io
          ?.to(`table:${table.id}`)
          .emit("restaurant-status-changed", { status, reason });
      });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating restaurant status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
