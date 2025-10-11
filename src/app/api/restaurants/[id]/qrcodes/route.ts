import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/permissions";
import { generateShortCode } from "@/lib/utils";
import QRCode from "qrcode";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    authorize(session.user.role, permissions, "qrcode.generate");

    const body = await req.json();
    const { tableId } = body;

    // Generate unique short code
    let shortCode = generateShortCode();
    let existing = await prisma.qRCode.findUnique({ where: { shortCode } });

    while (existing) {
      shortCode = generateShortCode();
      existing = await prisma.qRCode.findUnique({ where: { shortCode } });
    }

    // Generate QR code image
    const url = `${process.env.NEXTAUTH_URL}/q/${shortCode}`;
    const imageData = await QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    const qrCode = await prisma.qRCode.create({
      data: {
        shortCode,
        tableId,
        restaurantId: params.id,
        imageData,
      },
      include: {
        table: true,
      },
    });

    return NextResponse.json(qrCode, { status: 201 });
  } catch (error: any) {
    console.error("Error generating QR code:", error);
    if (error.message?.includes("Permission denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
