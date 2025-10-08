import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { restaurantSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const restaurants = await prisma.restaurant.findMany({
      include: {
        _count: {
          select: {
            categories: true,
            tables: true,
            qrCodes: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized. Only admins can create restaurants." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = restaurantSchema.parse(body);

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { message: "A restaurant with this slug already exists" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        address: validatedData.address,
        phone: validatedData.phone,
        logo: validatedData.logo,
        permissions: {},
        customization: {},
      },
      include: {
        _count: {
          select: {
            categories: true,
            tables: true,
            qrCodes: true,
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
