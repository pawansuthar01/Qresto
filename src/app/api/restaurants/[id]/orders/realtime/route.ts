import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Server-Sent Events for real-time orders
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      let lastCheck = new Date();

      const interval = setInterval(async () => {
        try {
          const newOrders = await prisma.order.findMany({
            where: {
              restaurantId: params.id,
              createdAt: { gt: lastCheck }, // fetch only new orders
            },
            include: {
              items: { include: { menuItem: true } },
              table: true,
            },
            orderBy: { createdAt: "asc" },
          });

          if (newOrders.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "orders",
                  data: newOrders,
                })}\n\n`
              )
            );

            // Update last check timestamp
            lastCheck = new Date();
          }
        } catch (error) {
          console.error("SSE Error:", error);
        }
      }, 2000); // poll every 2s

      // Cleanup on client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
