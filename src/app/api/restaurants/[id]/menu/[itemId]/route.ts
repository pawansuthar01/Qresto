import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateMenuItemSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  spiceLevel: z.number().min(0).max(5).optional(),
  displayOrder: z.number().optional(),
});

// PATCH - Update menu item (permission: menu.update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "menu.update");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateMenuItemSchema.parse(body);

    const menuItem = await prisma.menuItem.update({
      where: {
        id: params.itemId,
        restaurantId: params.id,
      },
      data: validatedData,
      include: {
        category: true,
      },
    });

    // Emit real-time update to all connected clients
    if (global.io) {
      global.io
        .to(`restaurant:${params.id}`)
        .emit("menu-item-updated", menuItem);

      // Notify all tables in restaurant
      const tables = await prisma.table.findMany({
        where: { restaurantId: params.id },
        select: { id: true },
      });

      if (global.io) {
        const io = global.io;
        tables.forEach((table) => {
          io.to(`table:${table.id}`).emit("menu-item-updated", menuItem);
        });
      }
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu item (permission: menu.delete)
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "menu.delete");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    await prisma.menuItem.delete({
      where: {
        id: params.itemId,
        restaurantId: params.id,
      },
    });

    // Emit real-time deletion
    if (global.io) {
      global.io.to(`restaurant:${params.id}`).emit("menu-item-deleted", {
        itemId: params.itemId,
      });

      const tables = await prisma.table.findMany({
        where: { restaurantId: params.id },
        select: { id: true },
      });
      if (global.io) {
        const io = global.io;
        tables.forEach((table) => {
          io.to(`table:${table.id}`).emit("menu-item-deleted", {
            itemId: params.itemId,
          });
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
