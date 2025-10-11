import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/permissions";
import { menuItemSchema, menuCategorySchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId: params.id },
      include: {
        items: {
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

export async function POST(
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
    authorize(params.id, "menu.create");

    const body = await req.json();
    const { type, ...data } = body;
    console.log(type, data);
    if (type === "category") {
      const validatedData = menuCategorySchema.parse(data);
      const { sortOrder, ...prismaData } = validatedData;
      const category = await prisma.menuCategory.create({
        data: {
          ...prismaData,
          restaurantId: params.id,
        },
      });
      return NextResponse.json(category, { status: 201 });
    } else if (type === "item") {
      const validatedData = menuItemSchema.parse(data);
      const item = await prisma.menuItem.create({
        data: {
          ...validatedData,
          restaurantId: params.id,
        },
        include: {
          category: true,
        },
      });
      return NextResponse.json(item, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error creating menu item:", error);
    if (error.message?.includes("Permission denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
