import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// DELETE - Delete media file
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; mediaId: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "media.upload");
    if (!authorized) return NextResponse.json({ error }, { status: 403 });

    if (!params.id || !params.mediaId)
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });

    await prisma.media.delete({
      where: {
        id: params.mediaId,
        restaurantId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || error || "Internal server error" },
      { status: 500 }
    );
  }
}
