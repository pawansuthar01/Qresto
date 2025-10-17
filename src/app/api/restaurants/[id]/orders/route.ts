// src/app/api/restaurants/[id]/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Response helpers for consistent API responses
 */

const pagedSuccess = (data: any, pagination: any, status = 200) =>
  NextResponse.json({ success: true, data, pagination }, { status });

const fail = (message: string, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

/**
 * Validation schema
 */
const createOrderSchema = z.object({
  tableId: z.string(),
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().int().positive(),
      notes: z.string().optional(),
    })
  ),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Utility: compute date range without mutating 'now'
 */
function computeDateRange(
  dateRange: string,
  startDate?: string | null,
  endDate?: string | null
) {
  const now = new Date();
  const result: { gte?: Date; lte?: Date } = {};

  if (dateRange === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    result.gte = start;
    result.lte = end;
  } else if (dateRange === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const start = new Date(y);
    start.setHours(0, 0, 0, 0);
    const end = new Date(y);
    end.setHours(23, 59, 59, 999);
    result.gte = start;
    result.lte = end;
  } else if (dateRange === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    result.gte = weekAgo;
  } else if (dateRange === "month") {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    result.gte = monthAgo;
  } else if (dateRange === "custom" && startDate && endDate) {
    result.gte = new Date(startDate);
    result.lte = new Date(endDate);
  }

  return result;
}

/**
 * GET - list orders with filters & pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized } = await authorize(params.id, "order.read");
    if (!authorized) return fail("Access Denied", 403);

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Pagination defaults
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("limit") || "25", 10))
    );
    const skip = (page - 1) * limit;

    // Extract query parameters
    const status = (searchParams.get("status") as OrderStatus) || null;
    const dateRange = searchParams.get("dateRange") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search") || "";
    const timeRange = searchParams.get("timeRange") || "all";

    // Build base where
    const where: any = { restaurantId: params.id };

    if (status) where.status = status;

    // Apply date-range filters (computed non-mutatively)
    if (dateRange && dateRange !== "all") {
      const dr = computeDateRange(dateRange, startDate, endDate);
      if (dr.gte || dr.lte) {
        where.createdAt = {};
        if (dr.gte) where.createdAt.gte = dr.gte;
        if (dr.lte) where.createdAt.lte = dr.lte;
      }
    }

    // Apply search filters at DB level (case-insensitive where possible)
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search } },
      ];
    }

    if (timeRange !== "all") {
      const orders = await prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          tableId: true,
          table: true,
          customerName: true,
          customerPhone: true,
          notes: true,
          totalAmount: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              menuItemId: true,
              quantity: true,
              price: true,
              notes: true,
              menuItem: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5000,
      });
      const filteredByTime = orders.filter((order) => {
        const hour = new Date(order.createdAt).getHours();
        if (timeRange === "morning") return hour >= 6 && hour < 12;
        if (timeRange === "afternoon") return hour >= 12 && hour < 17;
        if (timeRange === "evening") return hour >= 17 && hour < 21;
        if (timeRange === "night") return hour >= 21 || hour < 6;
        return true;
      });

      // apply additional search (if present) - already handled in DB but keep safe for phone lowercase mismatch
      let final = filteredByTime;
      if (search) {
        const sl = search.toLowerCase();
        final = final.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(sl) ||
            (o.customerName && o.customerName.toLowerCase().includes(sl)) ||
            (o.customerPhone && o.customerPhone.includes(search))
        );
      }

      const total = final.length;
      const paginated = final.slice(skip, skip + limit);

      return pagedSuccess(paginated, {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    // Without timeRange JS filtering, do DB count + pagination
    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: true,
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
    console.log("orders", orders);

    return pagedSuccess(orders, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET /orders error:", err);
    return fail("Internal server error", 500);
  }
}

/**
 * POST - create an order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { authorized } = await authorize(params.id, "order.create");
    if (!authorized) return fail("Access Denied", 403);

    const body = await request.json();
    const validated = createOrderSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          details: validated.error.errors,
        },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Verify table
    const table = await prisma.table.findFirst({
      where: { id: data.tableId, restaurantId: params.id },
    });
    if (!table) return fail("Table not found", 404);

    // Load menu items
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: data.items.map((i) => i.menuItemId) },
        restaurantId: params.id,
      },
    });

    if (menuItems.length !== data.items.length) {
      return fail("Some menu items not found", 400);
    }

    // Compute total
    const totalAmount = data.items.reduce((sum, item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)!;
      return sum + (menuItem.price ?? 0) * item.quantity;
    }, 0);

    // Generate unique order number (ensure uniqueness)
    let orderNumber = generateOrderNumber();
    let exists = await prisma.order.findUnique({ where: { orderNumber } });
    // Add max attempts to avoid infinite loop
    let attempts = 0;
    while (exists && attempts < 5) {
      orderNumber = generateOrderNumber();
      exists = await prisma.order.findUnique({ where: { orderNumber } });
      attempts++;
    }
    if (exists) {
      // last resort - append timestamp
      orderNumber = `${orderNumber}-${Date.now()}`;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        tableId: data.tableId,
        restaurantId: params.id,
        totalAmount,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        notes: data.notes,
        items: {
          create: data.items.map((item) => {
            const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)!;
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: menuItem.price,
              notes: item.notes,
            };
          }),
        },
      },
      include: {
        table: true,
        items: { include: { menuItem: true } },
      },
    });

    // Broadcast to Supabase Realtime (non-blocking) - do not fail order creation if broadcast fails
    (async () => {
      try {
        await supabaseAdmin
          .from(`orders:restaurantId=eq.${params.id}`)
          .upsert(order, { onConflict: "id" });
      } catch (bErr) {
        // log but do not throw
        console.error("Supabase broadcast failed for order", order.id, bErr);
      }
    })();

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", details: err.errors },
        { status: 400 }
      );
    }
    console.error("POST /orders error:", err);
    return fail("Internal server error", 500);
  }
}
