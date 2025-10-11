import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

const createOrderSchema = z.object({
  tableId: z.string(),
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

const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

// GET - List orders (permission: order.read)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "order.read");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as OrderStatus | null;
    const limit = parseInt(searchParams.get("limit") || "50");

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: params.id,
        ...(status && { status }),
      },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create order (permission: order.create)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "order.create");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    const table = await prisma.table.findFirst({
      where: {
        id: validatedData.tableId,
        restaurantId: params.id,
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: validatedData.items.map((item) => item.menuItemId) },
        restaurantId: params.id,
      },
    });

    if (menuItems.length !== validatedData.items.length) {
      return NextResponse.json(
        { error: "Some menu items not found" },
        { status: 400 }
      );
    }

    const totalAmount = validatedData.items.reduce((sum, item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);

    let orderNumber = generateOrderNumber();
    let exists = await prisma.order.findUnique({ where: { orderNumber } });

    while (exists) {
      orderNumber = generateOrderNumber();
      exists = await prisma.order.findUnique({ where: { orderNumber } });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        tableId: validatedData.tableId,
        restaurantId: params.id,
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
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Emit real-time event
    if (global.io) {
      global.io.to(`restaurant:${params.id}`).emit("new-order", order);
      global.io
        .to(`table:${validatedData.tableId}`)
        .emit("order-created", order);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
