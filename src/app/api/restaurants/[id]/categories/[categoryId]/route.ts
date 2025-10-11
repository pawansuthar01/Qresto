import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

// PATCH - Update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "menu.update");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    const category = await prisma.menuCategory.update({
      where: {
        id: params.categoryId,
        restaurantId: params.id,
      },
      data: validatedData,
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "menu.delete");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    await prisma.menuCategory.delete({
      where: {
        id: params.categoryId,
        restaurantId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
