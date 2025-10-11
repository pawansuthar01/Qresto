import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTableSchema = z.object({
  number: z.string().min(1),
  name: z.string().optional(),
  capacity: z.number().int().positive().default(4),
});

// GET - List tables (permission: table.read)
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "table.read");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const tables = await prisma.table.findMany({
      where: { restaurantId: params.id },
      include: {
        qrCodes: {
          where: { isActive: true },
          select: {
            id: true,
            shortCode: true,
            dataUrl: true,
            scans: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { number: "asc" },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create table (permission: table.create)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "table.create");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createTableSchema.parse(body);

    // Check if table number already exists
    const existingTable = await prisma.table.findFirst({
      where: {
        restaurantId: params.id,
        number: validatedData.number,
      },
    });

    if (existingTable) {
      return NextResponse.json(
        { error: "Table number already exists" },
        { status: 400 }
      );
    }

    const table = await prisma.table.create({
      data: {
        ...validatedData,
        restaurantId: params.id,
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating table:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
