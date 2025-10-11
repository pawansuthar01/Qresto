import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; orderId: string } }
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
    authorize(session.user.role, permissions, "invoice.generate");

    // Fetch order with all details
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
        restaurant: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate invoice data
    const invoice = {
      invoiceNumber: `INV-${order.orderNumber}`,
      invoiceDate: new Date().toISOString(),
      orderDate: order.createdAt,
      restaurant: {
        name: order.restaurant.name,
        address: order.restaurant.address,
        phone: order.restaurant.phone,
      },
      customer: {
        name: order.customerName || "Guest",
        table: order.table?.number || "N/A",
      },
      items: order.items.map((item) => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
      subtotal: order.total,
      tax: order.total * 0.05, // 5% tax
      total: order.total * 1.05,
      status: order.status,
      notes: order.notes,
    };

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error("Error generating invoice:", error);
    if (error.message?.includes("Permission denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
