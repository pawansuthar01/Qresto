import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createMenuItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string(),
  imageUrl: z.string().url().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  spiceLevel: z.number().min(0).max(5).optional(),
});

// GET - Read menu (permission: menu.read)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "menu.read");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const categories = await prisma.menuCategory.findMany({
      where: {
        restaurantId: params.id,
        isActive: true,
      },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create menu item (permission: menu.create)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "menu.create");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createMenuItemSchema.parse(body);

    const menuItem = await prisma.menuItem.create({
      data: {
        ...validatedData,
        restaurantId: params.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
