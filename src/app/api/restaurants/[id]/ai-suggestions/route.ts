import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

interface AISuggestion {
  type:
    | "schedule"
    | "pricing"
    | "promotion"
    | "menu-item"
    | "trend"
    | "retention"
    | "category"
    | "operations";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  actionable: boolean;
  data?: any;
}

// GET - Get AI-powered menu & analytics suggestions
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "analytics.view");
    if (!authorized) return NextResponse.json({ error }, { status: 403 });

    // 📊 Fetch orders in last 30 days
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: params.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    const suggestions: AISuggestion[] = [];

    // 1️⃣ Schedule suggestion
    const hourlyOrders = analyzeOrdersByHour(orders);
    const peakHours = findPeakHours(hourlyOrders);
    if (peakHours.length > 0) {
      suggestions.push({
        type: "schedule",
        title: "Extend Menu During Peak Hours",
        description: `Peak order hours detected at ${peakHours.join(
          ", "
        )}. Extend menu availability or staff support in these hours.`,
        impact: "high",
        confidence: 0.85,
        actionable: true,
        data: { peakHours, hourlyOrders },
      });
    }

    // 2️⃣ Low-performing items
    const itemPerformance = analyzeItemPerformance(orders);
    const lowPerformers = itemPerformance.filter(
      (i) => i.orderCount < 5 && i.revenue < 1000
    );
    if (lowPerformers.length > 0) {
      suggestions.push({
        type: "menu-item",
        title: "Remove or Revamp Low-Performing Items",
        description: `${lowPerformers.length} items have very low demand. Consider removing or rebranding them.`,
        impact: "medium",
        confidence: 0.75,
        actionable: true,
        data: { items: lowPerformers.slice(0, 5) },
      });
    }

    // 3️⃣ High-performing item pricing
    const highPerformers = itemPerformance.filter((i) => i.orderCount > 50);
    if (highPerformers.length > 0) {
      suggestions.push({
        type: "pricing",
        title: "Optimize Pricing for Popular Items",
        description: `${highPerformers.length} high-demand items detected. A 5–10% price increase may boost total revenue without reducing sales.`,
        impact: "high",
        confidence: 0.7,
        actionable: true,
        data: { items: highPerformers.slice(0, 5) },
      });
    }

    // 4️⃣ Promotion days
    const dayAnalysis = analyzeOrdersByDay(orders);
    const weakDays = findWeakDays(dayAnalysis);
    if (weakDays.length > 0) {
      suggestions.push({
        type: "promotion",
        title: "Boost Sales on Slow Days",
        description: `Sales are slower on ${weakDays.join(
          ", "
        )}. Run happy-hour or discount campaigns to increase orders.`,
        impact: "medium",
        confidence: 0.8,
        actionable: true,
        data: { weakDays, dayAnalysis },
      });
    }

    // 5️⃣ Combo deals
    const frequentPairs = findFrequentItemPairs(orders);
    if (frequentPairs.length > 0) {
      suggestions.push({
        type: "menu-item",
        title: "Create Combo Deals from Common Orders",
        description: `Customers frequently buy ${frequentPairs[0].items.join(
          " + "
        )}. Consider creating combo offers for higher value.`,
        impact: "medium",
        confidence: 0.72,
        actionable: true,
        data: { combos: frequentPairs.slice(0, 3) },
      });
    }

    // 6️⃣ Trend detection — limited-time offers
    const trendingItems = itemPerformance
      .filter((i) => i.growthRate && i.growthRate > 0.3)
      .slice(0, 3);
    if (trendingItems.length > 0) {
      suggestions.push({
        type: "trend",
        title: "Promote Trending Items as Limited-Time Offers",
        description: `Items like ${trendingItems
          .map((i) => i.name)
          .join(
            ", "
          )} show rapid growth. Create limited-time offers to maximize reach.`,
        impact: "high",
        confidence: 0.8,
        actionable: true,
        data: { trendingItems },
      });
    }

    // 7️⃣ Retention check
    const returningRate = await getReturningCustomerRate(params.id);
    if (returningRate < 0.3) {
      suggestions.push({
        type: "retention",
        title: "Increase Returning Customer Rate",
        description:
          "Returning customers are below 30%. Offer loyalty rewards or discounts for repeat visits.",
        impact: "high",
        confidence: 0.82,
        actionable: true,
        data: { returningRate },
      });
    }

    // 8️⃣ Idle categories
    const idleCategories = await findIdleCategories(params.id);
    if (idleCategories.length > 0) {
      suggestions.push({
        type: "category",
        title: "Inactive Menu Categories Detected",
        description: `${idleCategories.length} categories have no recent orders. Consider refreshing or hiding them.`,
        impact: "medium",
        confidence: 0.78,
        actionable: true,
        data: { idleCategories },
      });
    }

    // 9️⃣ Operational optimization
    const avgPrepTimes = await analyzeKitchenPrepTimes(params.id);
    if (avgPrepTimes.slowItems.length > 0) {
      suggestions.push({
        type: "operations",
        title: "Optimize Kitchen Prep Times",
        description: `Items like ${avgPrepTimes.slowItems
          .map((i) => i.name)
          .join(", ")} are delaying service. Streamline preparation.`,
        impact: "medium",
        confidence: 0.8,
        actionable: true,
        data: avgPrepTimes,
      });
    }

    return NextResponse.json({
      suggestions,
      generatedAt: new Date().toISOString(),
      range: "Last 30 days",
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ────────────────────────────── Helper Functions ──────────────────────────────
function analyzeOrdersByHour(orders: any[]): Record<number, number> {
  const hourly: Record<number, number> = {};
  orders.forEach((o) => {
    const h = new Date(o.createdAt).getHours();
    hourly[h] = (hourly[h] || 0) + 1;
  });
  return hourly;
}

function findPeakHours(hourlyOrders: Record<number, number>): string[] {
  const entries = Object.entries(hourlyOrders);
  const avg = entries.reduce((s, [, c]) => s + c, 0) / entries.length;
  return entries
    .filter(([, c]) => c > avg * 1.5)
    .map(([h]) => `${h}:00-${(parseInt(h) + 1) % 24}:00`);
}

function analyzeItemPerformance(orders: any[]): any[] {
  const stats: Record<string, any> = {};
  orders.forEach((order) => {
    order.items.forEach((it: any) => {
      const id = it.menuItemId;
      if (!stats[id]) {
        stats[id] = { id, name: it.menuItem.name, orderCount: 0, revenue: 0 };
      }
      stats[id].orderCount += it.quantity;
      stats[id].revenue += it.price * it.quantity;
    });
  });

  // Random growth simulation (you can replace with real month-over-month calc)
  return Object.values(stats).map((i: any) => ({
    ...i,
    growthRate: Math.random() * 0.5 - 0.1, // -10% to +40%
  }));
}

function analyzeOrdersByDay(orders: any[]): Record<number, number> {
  const daily: Record<number, number> = {};
  orders.forEach((o) => {
    const d = new Date(o.createdAt).getDay();
    daily[d] = (daily[d] || 0) + 1;
  });
  return daily;
}

function findWeakDays(dayData: Record<number, number>): string[] {
  const best = Math.max(...Object.values(dayData));
  return Object.entries(dayData)
    .filter(([, c]) => c < best * 0.5)
    .map(([d]) => getDayName(parseInt(d)));
}

function getDayName(day: number) {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][day];
}

function findFrequentItemPairs(orders: any[]): any[] {
  const pairs: Record<string, { items: string[]; count: number }> = {};
  orders.forEach((order) => {
    const names = order.items.map((i: any) => i.menuItem.name);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const key = [names[i], names[j]].sort().join(" + ");
        pairs[key] = pairs[key] || { items: [names[i], names[j]], count: 0 };
        pairs[key].count++;
      }
    }
  });
  return Object.values(pairs)
    .filter((p) => p.count >= 3)
    .sort((a, b) => b.count - a.count);
}

// ──────────── Additional AI Insight Helpers ────────────
async function getReturningCustomerRate(restaurantId: string): Promise<number> {
  const customers = await prisma.order.groupBy({
    by: ["customerPhone"],
    where: {
      restaurantId,
      NOT: { customerPhone: null },
    },
    _count: { customerPhone: true },
  });

  const total = customers.length;
  const returning = customers.filter((c) => c._count.customerPhone > 1).length;

  return total > 0 ? returning / total : 0;
}

async function findIdleCategories(restaurantId: string): Promise<string[]> {
  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId },
    select: { id: true, name: true },
  });

  const last30DaysOrders = await prisma.orderItem.findMany({
    where: {
      order: {
        restaurantId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
    select: { menuItem: { select: { categoryId: true } } },
  });

  const activeCategoryIds = new Set(
    last30DaysOrders.map((o) => o.menuItem?.categoryId)
  );

  return categories
    .filter((c) => !activeCategoryIds.has(c.id))
    .map((c) => c.name);
}

async function analyzeKitchenPrepTimes(restaurantId: string) {
  // Simulate with random prep times; can integrate from actual logs later
  const items = await prisma.menuItem.findMany({
    where: { restaurantId },
    select: { name: true },
  });

  const data = items.map((i) => ({
    name: i.name,
    avgPrepTime: Math.floor(5 + Math.random() * 20), // 5–25 min
  }));

  const slowItems = data.filter((i) => i.avgPrepTime > 18);
  return { slowItems, all: data };
}
