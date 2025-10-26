import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/permissions";
import { generateShortCode } from "@/lib/utils";
import QRCode from "qrcode";

export async function POST(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        tables: {
          include: { qrCodes: true },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const permissions = restaurant.permissions as any;
    authorize(permissions, "qrcode.generate");

    // Find tables without QR codes
    const tablesWithoutQR = restaurant.tables.filter(
      (t: any) => t.qrCodes.length === 0
    );

    if (tablesWithoutQR.length === 0) {
      return NextResponse.json({ message: "All tables already have QR codes" });
    }

    const qrCodes = [];

    for (const table of tablesWithoutQR) {
      let shortCode = generateShortCode();
      let existing = await prisma.qRCode.findUnique({ where: { shortCode } });

      while (existing) {
        shortCode = generateShortCode();
        existing = await prisma.qRCode.findUnique({ where: { shortCode } });
      }

      const url = `${process.env.NEXTAUTH_URL}/q/${shortCode}`;
      const imageData = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: "H",
      });

      const qrCode = await prisma.qRCode.create({
        data: {
          shortCode,
          tableId: table.id,
          restaurantId: params.id,
          dataUrl: imageData,
        },
        include: {
          table: true,
          
        },
      });

      qrCodes.push(qrCode);
    }

    return NextResponse.json(
      {
        message: `Generated ${qrCodes.length} QR codes`,
        qrCodes,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error generating bulk QR codes:", error);
    if (error.message?.includes("Permission denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
