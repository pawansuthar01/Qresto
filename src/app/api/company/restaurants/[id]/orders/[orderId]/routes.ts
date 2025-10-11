import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

// PATCH - Update order status (permission: order.update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "order.update");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const { status } = updateOrderSchema.parse(body);

    const order = await prisma.order.update({
      where: {
        id: params.orderId,
        restaurantId: params.id,
      },
      data: { status },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating order:", error);
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
