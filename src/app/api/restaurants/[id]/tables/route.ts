// ---------------------------------------------------
// src/app/api/restaurants/[id]/tables/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/permissions";
import { tableSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search") || "";
    const hasQR = searchParams.get("hasQR");
    const minCapacity = searchParams.get("minCapacity");
    const maxCapacity = searchParams.get("maxCapacity");

    const where: any = { restaurantId: params.id };

    if (search) {
      where.number = { contains: search, mode: "insensitive" };
    }

    if (hasQR === "true") {
      where.qrCodes = { some: {} };
    } else if (hasQR === "false") {
      where.qrCodes = { none: {} };
    }

    if (minCapacity) {
      where.capacity = { ...where.capacity, gte: parseInt(minCapacity) };
    }

    if (maxCapacity) {
      where.capacity = { ...where.capacity, lte: parseInt(maxCapacity) };
    }

    const total = await prisma.table.count({ where });

    const tables = await prisma.table.findMany({
      where,
      include: {
        qrCodes: true,
      },
      orderBy: { number: "asc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      tables,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
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
    authorize(permissions, "table.create");

    const body = await req.json();
    const validatedData = tableSchema.parse(body);

    const table = await prisma.table.create({
      data: {
        ...validatedData,
        restaurantId: params.id,
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error: any) {
    console.error("Error creating table:", error);
    if (error.message?.includes("Permission denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
