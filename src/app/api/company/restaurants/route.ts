import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateSlug } from "@/lib/utils";
import { z } from "zod";
import { getServerSession } from "next-auth";

const createRestaurantSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  ownerName: z.string().min(2),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  permissions: z.object({
    "menu.create": z.boolean().optional(),
    "menu.read": z.boolean().optional(),
    "menu.update": z.boolean().optional(),
    "menu.delete": z.boolean().optional(),
    "menu.customize": z.boolean().optional(),
    "table.create": z.boolean().optional(),
    "table.read": z.boolean().optional(),
    "table.update": z.boolean().optional(),
    "table.delete": z.boolean().optional(),
    "qrcode.generate": z.boolean().optional(),
    "qrcode.read": z.boolean().optional(),
    "qrcode.update": z.boolean().optional(),
    "qrcode.delete": z.boolean().optional(),
    "order.create": z.boolean().optional(),
    "order.read": z.boolean().optional(),
    "order.update": z.boolean().optional(),
    "invoice.generate": z.boolean().optional(),
    "invoice.download": z.boolean().optional(),
    "analytics.view": z.boolean().optional(),
    "staff.manage": z.boolean().optional(),
    "settings.update": z.boolean().optional(),
    "media.upload": z.boolean().optional(),
  }),
});

// GET - List all restaurants (Company Owner only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurants = await prisma.restaurant.findMany({
      include: {
        owners: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            items: true,
            tables: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new restaurant with owner (Company Owner only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createRestaurantSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(validatedData.name);
    let slugExists = await prisma.restaurant.findUnique({ where: { slug } });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(validatedData.name)}-${counter}`;
      slugExists = await prisma.restaurant.findUnique({ where: { slug } });
      counter++;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create restaurant with owner
    const restaurant = await prisma.restaurant.create({
      data: {
        name: validatedData.name,
        slug,
        email: validatedData.email,
        description: validatedData.description,
        phone: validatedData.phone,
        address: validatedData.address,
        permissions: validatedData.permissions,
        owners: {
          create: {
            email: validatedData.email,
            password: hashedPassword,
            name: validatedData.ownerName,
            role: UserRole.OWNER,
          },
        },
      },
      include: {
        owners: true,
      },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
