import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { updateThemeSchema } from "@/lib/schemas/theme";
import z from "zod";

// GET - Get current theme
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      select: { customization: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant.customization);
  } catch (error) {
    console.error("Error fetching theme:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update theme (permission: menu.customize)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "menu.customize");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateThemeSchema.parse(body);

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      select: { customization: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Merge with existing customization
    const updatedCustomization = {
      ...(restaurant.customization as any),
      ...validatedData,
    };
    const updated = await prisma.restaurant.update({
      where: { id: params.id },
      data: { customization: updatedCustomization },
    });

    if (global.io) {
      const io = global.io;
      const tables = await prisma.table.findMany({
        where: { restaurantId: params.id },
        select: { id: true },
      });

      tables.forEach((table) => {
        io.to(`table:${table.id}`).emit("theme-updated", updatedCustomization);
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating theme:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
