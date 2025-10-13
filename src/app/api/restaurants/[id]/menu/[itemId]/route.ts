import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";
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

// PATCH - Update menu item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { authorized, error } = await authorize(params.id, "menu.update");
    if (!authorized) return NextResponse.json({ error }, { status: 403 });

    const body = await request.json();
    const validatedData = updateMenuItemSchema.parse(body);

    const menuItem = await prisma.menuItem.update({
      where: { id: params.itemId, restaurantId: params.id },
      data: validatedData,
      include: { category: true },
    });

    // Broadcast to Supabase Realtime channel
    await supabaseAdmin
      .from(`menu:restaurantId=eq.${params.id}`)
      .upsert(menuItem, { onConflict: "id" });

    return NextResponse.json(menuItem);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: err.errors },
        { status: 400 }
      );
    }
    console.error("Error updating menu item:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu item
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { authorized, error } = await authorize(params.id, "menu.delete");
    if (!authorized) return NextResponse.json({ error }, { status: 403 });

    await prisma.menuItem.delete({
      where: { id: params.itemId, restaurantId: params.id },
    });

    // Broadcast deletion via Supabase
    await supabaseAdmin
      .from(`menu:restaurantId=eq.${params.id}`)
      .delete()
      .eq("id", params.itemId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
