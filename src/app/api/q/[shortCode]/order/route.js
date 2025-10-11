import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';
import { z } from 'zod';

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

// POST - Guest order placement
export async function POST(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode: params.shortCode },
      include: {
        table: true,
        restaurant: {
          select: {
            id: true,
            permissions: true,
          },
        },
      },
    });

    if (!qrCode || !qrCode.isActive) {
      return NextResponse.json(
        { error: 'QR code not found or inactive' },
        { status: 404 }
      );
    }

    const permissions = qrCode.restaurant.permissions as any;
    if (permissions['order.create'] !== true) {
      return NextResponse.json(
        { error: 'Ordering is not enabled for this restaurant' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createGuestOrderSchema.parse(body);

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: validatedData.items.map((item) => item.menuItemId) },
        restaurantId: qrCode.restaurant.id,
        isAvailable: true,
      },
    });

    if (menuItems.length !== validatedData.items.length) {
      return NextResponse.json(
        { error: 'Some menu items not found or unavailable' },
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
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Emit real-time event to restaurant owner and table
    if (global.io) {
      global.io.to(`restaurant:${qrCode.restaurant.id}`).emit('new-order', order);
      global.io.to(`table:${qrCode.table.id}`).emit('order-created', order);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating guest order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}