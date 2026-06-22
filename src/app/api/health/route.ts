import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type DatabaseHealth =
  | {
      status: "ok";
      latencyMs: number;
    }
  | {
      status: "error";
      latencyMs: number;
      error: string;
    };

async function checkDatabase(): Promise<DatabaseHealth> {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      status: "error",
      latencyMs: Date.now() - startedAt,
      error:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : "Database health check failed",
    };
  }
}

export async function GET() {
  const database = await checkDatabase();
  const isHealthy = database.status === "ok";

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      service: "qresto-mvp",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      environment: process.env.NODE_ENV ?? "unknown",
      database,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
