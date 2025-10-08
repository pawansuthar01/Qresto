import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { authorize } from "@/lib/permissions";
import { orderSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const permissions = restaurant.permissions as any;
    authorize(session.user.role, permissions, "order.read");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: params.id,
        ...(status && { status: status as any }),
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    if (error.message?.includes("Permission denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validatedData = orderSchema.parse(body);

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const permissions = restaurant.permissions as any;

    // Check if ordering is allowed
    if (!permissions["order.create"]) {
      return NextResponse.json(
        { error: "Ordering is not enabled for this restaurant" },
        { status: 403 }
      );
    }

    // Calculate total
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: validatedData.items.map((item) => item.menuItemId),
        },
      },
    });

    const total = validatedData.items.reduce((sum, item) => {
      const menuItem = menuItems.find((mi: any) => mi.id === item.menuItemId);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let existing = await prisma.order.findUnique({ where: { orderNumber } });

    while (existing) {
      orderNumber = generateOrderNumber();
      existing = await prisma.order.findUnique({ where: { orderNumber } });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        restaurantId: params.id,
        tableId: validatedData.tableId,
        customerName: validatedData.customerName,
        notes: validatedData.notes,
        total,
        items: {
          create: validatedData.items.map((item) => {
            const menuItem = menuItems.find(
              (mi: any) => mi.id === item.menuItemId
            );
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: menuItem?.price || 0,
              notes: item.notes,
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
