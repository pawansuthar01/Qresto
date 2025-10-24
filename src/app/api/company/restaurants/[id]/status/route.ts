import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

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
    const supabaseAdmin = await getSupabaseAdmin();
    const body = await request.json();
    const { status, reason } = updateStatusSchema.parse(body);

    const restaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: {
        status,
        suspendedAt: status !== "active" ? new Date() : null,
        reason: status !== "active" ? reason : null,
      },
    });

    // ✅ Emit real-time status change via Supabase Realtime
    await supabaseAdmin
      .from(`restaurants:id=eq.${params.id}`)
      .upsert(
        { ...restaurant, _realtime_event: "status-changed" },
        { onConflict: "id" }
      );

    // Optional: also update all tables in this restaurant (if you have a tables table in Supabase)
    const tables = await prisma.table.findMany({
      where: { restaurantId: params.id },
      select: { id: true },
    });

    for (const table of tables) {
      await supabaseAdmin.from(`tables:id=eq.${table.id}`).upsert({
        restaurantStatus: status,
        _realtime_event: "restaurant-status-changed",
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
