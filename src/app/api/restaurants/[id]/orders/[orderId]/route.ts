import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

// PATCH - Update order status (permission: order.update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { authorized, error } = await authorize(params.id, "order.update");
    if (!authorized) return NextResponse.json({ error }, { status: 403 });

    const body = await request.json();
    const { status } = updateOrderSchema.parse(body);

    const order = await prisma.order.update({
      where: { id: params.orderId, restaurantId: params.id },
      data: { status },
      include: {
        table: true,
        items: { include: { menuItem: true } },
      },
    });

    // Broadcast order update via Supabase Realtime
    await supabaseAdmin
      .from(`orders:restaurantId=eq.${params.id}`)
      .upsert(order, { onConflict: "id" });

    return NextResponse.json(order);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: err.errors },
        { status: 400 }
      );
    }
    console.error("Error updating order:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get single order
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "order.read");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: params.orderId,
        restaurantId: params.id,
      },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
