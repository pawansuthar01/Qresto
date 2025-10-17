// src/app/api/q/[shortCode]/order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase"; // add this

const createGuestOrderSchema = z.object({
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().int().positive(),
      notes: z.string().optional(),
    })
  ),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    // Find QR code with related data
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode: params.shortCode },
      include: {
        table: true,
        restaurant: {
          select: { id: true, permissions: true },
        },
      },
    });

    if (!qrCode || !qrCode.isActive) {
      return NextResponse.json(
        { error: "QR code not found or inactive" },
        { status: 404 }
      );
    }

    // Check ordering permission
    const permissions = qrCode.restaurant?.permissions as any;
    if (!permissions?.["order.create"]) {
      return NextResponse.json(
        { error: "Ordering is not enabled for this restaurant" },
        { status: 403 }
      );
    }

    // Validate request
    const body = await request.json();
    const validatedData = createGuestOrderSchema.parse(body);

    // Fetch menu items
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: validatedData.items.map((item) => item.menuItemId) },
        restaurantId: qrCode.restaurant.id,
        isAvailable: true,
      },
    });

    if (menuItems.length !== validatedData.items.length) {
      return NextResponse.json(
        { error: "Some menu items not found or unavailable" },
        { status: 400 }
      );
    }

    // Calculate total
    const totalAmount = validatedData.items.reduce((sum, item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    while (await prisma.order.findUnique({ where: { orderNumber } })) {
      orderNumber = generateOrderNumber();
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        tableId: qrCode.table.id,
        restaurantId: qrCode.restaurant.id,
        totalAmount,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        notes: validatedData.notes,
        items: {
          create: validatedData.items.map((item) => {
            const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)!;
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: menuItem.price,
              notes: item.notes,
            };
          }),
        },
      },
      include: {
        table: true,
        items: { include: { menuItem: true } },
      },
    });

    // Broadcast order via Supabase Realtime
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.channel(`orders:${qrCode.restaurant.id}`).send({
        type: "broadcast",
        event: "new_order",
        payload: order,
      });
      console.log(
        `✅ Order broadcast sent for restaurant ${qrCode.restaurant.id}`
      );
    } catch (broadcastError) {
      console.error("❌ Supabase broadcast failed:", broadcastError);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating guest order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
