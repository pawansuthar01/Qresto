import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const activeUsers = new Map<string, Set<string>>();

export async function POST(
  req: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { userId, action } = await req.json();

    if (!activeUsers.has(params.shortCode)) {
      activeUsers.set(params.shortCode, new Set());
    }

    const users = activeUsers.get(params.shortCode)!;

    if (action === "join") {
      users.add(userId);
    } else if (action === "leave") {
      users.delete(userId);
    }

    // Get table info for capacity check
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode: params.shortCode },
      include: { table: true },
    });

    const capacity = qrCode?.table.capacity || 4;
    const currentUsers = users.size;

    return NextResponse.json({
      currentUsers,
      capacity,
      isFull: currentUsers >= capacity,
    });
  } catch (error) {
    console.error("Error managing active users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const users = activeUsers.get(params.shortCode) || new Set();

    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode: params.shortCode },
      include: { table: true },
    });

    const capacity = qrCode?.table.capacity || 4;

    return NextResponse.json({
      currentUsers: users.size,
      capacity,
      isFull: users.size >= capacity,
    });
  } catch (error) {
    console.error("Error getting active users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
