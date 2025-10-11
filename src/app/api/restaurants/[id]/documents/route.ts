import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { z } from "zod";

const createDocumentSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(10),
  type: z.enum(["menu", "policy", "terms", "about", "contact"]),
  isPublished: z.boolean().optional(),
});

// GET - List documents
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const published = searchParams.get("published") === "true";

    const documents = await prisma.document.findMany({
      where: {
        restaurantId: params.id,
        ...(type && { type }),
        ...(published && { isPublished: true }),
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create document
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "settings.update");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createDocumentSchema.parse(body);

    const slug = generateSlug(validatedData.title);

    const document = await prisma.document.create({
      data: {
        ...validatedData,
        slug,
        restaurantId: params.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
