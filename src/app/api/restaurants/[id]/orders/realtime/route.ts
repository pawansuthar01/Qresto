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

  // Create a readable stream for SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      // Poll for new orders every 2 seconds
      const interval = setInterval(async () => {
        try {
          const orders = await prisma.order.findMany({
            where: {
              restaurantId: params.id,
              createdAt: {
                gte: new Date(Date.now() - 60000), // Last minute
              },
            },
            include: {
              items: {
                include: {
                  menuItem: true,
                },
              },
              table: true,
            },
            orderBy: { createdAt: "desc" },
          });

          if (orders.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "orders", data: orders })}\n\n`
              )
            );
          }
        } catch (error) {
          console.error("SSE Error:", error);
        }
      }, 2000);

      // Cleanup on close
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
