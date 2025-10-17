// src/app/api/restaurants/[id]/menu/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/permissions";
import { menuItemSchema, menuCategorySchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search") || "";
    const isAvailable = searchParams.get("isAvailable");
    const isVegetarian = searchParams.get("isVegetarian");
    const isVegan = searchParams.get("isVegan");
    const categoryId = searchParams.get("categoryId");
    const sortBy = searchParams.get("sortBy") || "displayOrder";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build where clause for items
    const itemWhere: any = {
      restaurantId: params.id,
    };

    if (search) {
      itemWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isAvailable !== null && isAvailable !== undefined) {
      itemWhere.isAvailable = isAvailable === "true";
    }

    if (isVegetarian === "true") {
      itemWhere.isVegetarian = true;
    }

    if (isVegan === "true") {
      itemWhere.isVegan = true;
    }

    if (categoryId) {
      itemWhere.categoryId = categoryId;
    }

    itemWhere.status = "active";
    // Get categories with filtered items
    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId: params.id, status: "active" },
      include: {
        items: {
          where: itemWhere,

          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    // Get total count for pagination
    const totalItems = await prisma.menuItem.count({
      where: itemWhere,
    });

    return NextResponse.json({
      categories,
      pagination: {
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
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

    authorize(params.id, "menu.create");

    const body = await req.json();
    const { type, ...data } = body;

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
