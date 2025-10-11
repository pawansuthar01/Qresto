import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

interface AISuggestion {
  type: "schedule" | "pricing" | "promotion" | "menu-item";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  actionable: boolean;
  data?: any;
}

// GET - Get AI-powered menu suggestions
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "analytics.view");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    // Fetch order data for analysis
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: params.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    const suggestions: AISuggestion[] = [];

    // Analyze peak ordering times
    const hourlyOrders = analyzeOrdersByHour(orders);
    const peakHours = findPeakHours(hourlyOrders);

    if (peakHours.length > 0) {
      suggestions.push({
        type: "schedule",
        title: "Extend Menu During Peak Hours",
        description: `Peak orders detected ${peakHours.join(
          ", "
        )}. Consider extending menu availability during these times.`,
        impact: "high",
        confidence: 0.85,
        actionable: true,
        data: { peakHours, averageOrders: hourlyOrders },
      });
    }

    // Analyze item performance
    const itemPerformance = analyzeItemPerformance(orders);
    const lowPerformers = itemPerformance.filter(
      (item) => item.orderCount < 5 && item.revenue < 1000
    );

    if (lowPerformers.length > 0) {
      suggestions.push({
        type: "menu-item",
        title: "Remove Low-Performing Items",
        description: `${lowPerformers.length} items have low sales. Consider removing or promoting them.`,
        impact: "medium",
        confidence: 0.75,
        actionable: true,
        data: { items: lowPerformers.slice(0, 5) },
      });
    }

    // Analyze pricing opportunities
    const highPerformers = itemPerformance.filter(
      (item) => item.orderCount > 50
    );
    if (highPerformers.length > 0) {
      suggestions.push({
        type: "pricing",
        title: "Optimize Pricing for Popular Items",
        description: `${highPerformers.length} items are highly popular. Small price adjustments could increase revenue by 10-15%.`,
        impact: "high",
        confidence: 0.7,
        actionable: true,
        data: { items: highPerformers.slice(0, 5) },
      });
    }

    // Day-of-week analysis
    const dayAnalysis = analyzeOrdersByDay(orders);
    const weakDays = Object.entries(dayAnalysis)
      .filter(([_, count]) => count < dayAnalysis["1"] * 0.5) // Less than 50% of best day
      .map(([day, _]) => getDayName(parseInt(day)));

    if (weakDays.length > 0) {
      suggestions.push({
        type: "promotion",
        title: "Boost Sales on Slow Days",
        description: `${weakDays.join(
          ", "
        )} have lower traffic. Consider special promotions or limited-time offers.`,
        impact: "medium",
        confidence: 0.8,
        actionable: true,
        data: { weakDays, dayAnalysis },
      });
    }

    // Combo suggestions
    const frequentPairs = findFrequentItemPairs(orders);
    if (frequentPairs.length > 0) {
      suggestions.push({
        type: "menu-item",
        title: "Create Combo Deals",
        description: `Customers often order ${frequentPairs[0].items.join(
          " + "
        )}. Create combo deals for better value.`,
        impact: "medium",
        confidence: 0.72,
        actionable: true,
        data: { combos: frequentPairs.slice(0, 3) },
      });
    }

    return NextResponse.json({
      suggestions,
      generatedAt: new Date().toISOString(),
      dataRange: "30 days",
    });
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions
function analyzeOrdersByHour(orders: any[]): Record<number, number> {
  const hourly: Record<number, number> = {};

  orders.forEach((order) => {
    const hour = new Date(order.createdAt).getHours();
    hourly[hour] = (hourly[hour] || 0) + 1;
  });

  return hourly;
}

function findPeakHours(hourlyOrders: Record<number, number>): string[] {
  const entries = Object.entries(hourlyOrders);
  const avg =
    entries.reduce((sum, [_, count]) => sum + count, 0) / entries.length;

  return entries
    .filter(([_, count]) => count > avg * 1.5)
    .map(([hour, _]) => `${hour}:00-${(parseInt(hour) + 1) % 24}:00`)
    .slice(0, 3);
}

function analyzeItemPerformance(orders: any[]): any[] {
  const itemStats: Record<string, any> = {};

  orders.forEach((order) => {
    order.items.forEach((item: any) => {
      const itemId = item.menuItemId;

      if (!itemStats[itemId]) {
        itemStats[itemId] = {
          id: itemId,
          name: item.menuItem.name,
          orderCount: 0,
          revenue: 0,
        };
      }

      itemStats[itemId].orderCount += item.quantity;
      itemStats[itemId].revenue += item.price * item.quantity;
    });
  });

  return Object.values(itemStats);
}

function analyzeOrdersByDay(orders: any[]): Record<number, number> {
  const daily: Record<number, number> = {};

  orders.forEach((order) => {
    const day = new Date(order.createdAt).getDay();
    daily[day] = (daily[day] || 0) + 1;
  });

  return daily;
}

function getDayName(day: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day];
}

function findFrequentItemPairs(orders: any[]): any[] {
  const pairs: Record<string, { items: string[]; count: number }> = {};

  orders.forEach((order) => {
    const items = order.items.map((i: any) => i.menuItem.name);

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const key = [items[i], items[j]].sort().join(" + ");

        if (!pairs[key]) {
          pairs[key] = { items: [items[i], items[j]], count: 0 };
        }

        pairs[key].count++;
      }
    }
  });

  return Object.values(pairs)
    .filter((pair) => pair.count >= 3)
    .sort((a, b) => b.count - a.count);
}
