import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const updatePageSchema = z.object({
  type: z.enum(["about", "contact", "privacy", "terms"]),
  title: z.string().min(2),
  content: z.string().min(10),
  isPublished: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

// GET - Get all company pages (public if published, all if admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === UserRole.SUPER_ADMIN;

    const pages = await prisma.companyPage.findMany({
      where: isAdmin ? {} : { isPublished: true },
      orderBy: { type: "asc" },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching company pages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create or update company page (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Only Company Admin can manage pages" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updatePageSchema.parse(body);

    const page = await prisma.companyPage.upsert({
      where: { type: validatedData.type },
      create: validatedData,
      update: validatedData,
    });

    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating company page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
