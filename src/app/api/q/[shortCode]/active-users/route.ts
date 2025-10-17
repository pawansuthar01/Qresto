// /api/q/[shortCode]/active-users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseClient } from "@/lib/supabase";

// Function to broadcast updates
async function broadcastUpdate(tableId: string, payload: any) {
  try {
    await supabaseClient.channel(`table_presence:${tableId}`).send({
      type: "broadcast",
      event: "users-updated",
      payload,
    });
  } catch (error) {
    console.error("Supabase broadcast error:", error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { userId, action } = await req.json();
    const shortCode = params.shortCode;

    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode },
      include: { table: true },
    });

    if (!qrCode || !qrCode.table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const { id: tableId, capacity, onlyCapacity } = qrCode.table;
    let joinGuests = qrCode.table.joinGuests || [];

    if (action === "join") {
      // ✅ Check agar user pehle se joined hai
      if (joinGuests.includes(userId)) {
        return NextResponse.json({
          status: "already_joined",
          currentUsers: joinGuests.length,
          joinGuests: joinGuests,
          capacity,
          onlyCapacity,
        });
      }

      // ✅ Check agar table full hai
      const isTableFull = onlyCapacity && joinGuests.length >= capacity;
      if (isTableFull) {
        return NextResponse.json({
          status: "full",
          currentUsers: joinGuests.length,
          joinGuests: joinGuests,
          capacity,
          onlyCapacity,
        });
      }

      // ✅ User ko add karein
      const updatedGuests = [...joinGuests, userId];
      const updatedTable = await prisma.table.update({
        where: { id: tableId },
        data: {
          currentUsers: updatedGuests.length,
          joinGuests: updatedGuests,
        },
      });

      const responsePayload = {
        status: "joined",
        currentUsers: updatedTable.currentUsers,
        capacity,
        joinGuests: updatedTable.joinGuests,
        onlyCapacity,
      };

      await broadcastUpdate(tableId, responsePayload);
      return NextResponse.json(responsePayload);
    }

    if (action === "leave") {
      if (!joinGuests.includes(userId)) {
        return NextResponse.json({
          status: "not_in_table",
          currentUsers: joinGuests.length,
          capacity,
          onlyCapacity,
        });
      }

      // ✅ User ko remove karein
      const updatedGuests = joinGuests.filter((id) => id !== userId);
      const updatedTable = await prisma.table.update({
        where: { id: tableId },
        data: {
          currentUsers: updatedGuests.length,
          joinGuests: updatedGuests,
        },
      });

      const responsePayload = {
        status: "left",
        currentUsers: updatedTable.currentUsers,
        capacity,
        onlyCapacity,
      };

      await broadcastUpdate(tableId, responsePayload);
      return NextResponse.json(responsePayload);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  _: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const shortCode = params.shortCode;

    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode },
      include: { table: true },
    });

    if (!qrCode || !qrCode.table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const { capacity, currentUsers, onlyCapacity } = qrCode.table;

    return NextResponse.json({
      currentUsers,
      capacity,
      onlyCapacity,
    });
  } catch (error) {
    console.error("Error getting active users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
