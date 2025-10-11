import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

// Server-Sent Events for real-time menu updates
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      try {
        const categories = await prisma.menuCategory.findMany({
          where: { restaurantId: params.id },
          include: {
            items: {
              orderBy: { displayOrder: "asc" },
            },
          },
          orderBy: { displayOrder: "asc" },
        });

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "menu", data: categories })}\n\n`
          )
        );
      } catch (error) {
        console.error("SSE Menu Error:", error);
      }

      req.signal.addEventListener("abort", () => {
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
