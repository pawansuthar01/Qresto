import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { generateShortCode } from "@/lib/utils";
import QRCode from "qrcode";
import { z } from "zod";

const createQRCodeSchema = z.object({
  tableId: z.string(),
});

// GET - List QR codes (permission: qrcode.read)
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "qrcode.read");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const qrCodes = await prisma.qRCode.findMany({
      where: { restaurantId: params.id },
      include: {
        table: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(qrCodes);
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Generate QR code (permission: qrcode.generate)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "qrcode.generate");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const { tableId } = createQRCodeSchema.parse(body);

    // Verify table belongs to restaurant
    const table = await prisma.table.findFirst({
      where: {
        id: tableId,
        restaurantId: params.id,
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Generate unique short code
    let shortCode = generateShortCode(8);
    let exists = await prisma.qRCode.findUnique({ where: { shortCode } });

    while (exists) {
      shortCode = generateShortCode(8);
      exists = await prisma.qRCode.findUnique({ where: { shortCode } });
    }

    // Generate QR code URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const qrUrl = `${baseUrl}/q/${shortCode}`;

    // Generate QR code data URL
    const dataUrl = await QRCode.toDataURL(qrUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Create QR code record
    const qrCode = await prisma.qRCode.create({
      data: {
        shortCode,
        dataUrl,
        tableId,
        restaurantId: params.id,
      },
      include: {
        table: true,
      },
    });

    return NextResponse.json(qrCode, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
