import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const updateThemeSchema = z.object({
  // Colors
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
  cardBackground: z.string().optional(),
  borderColor: z.string().optional(),
  hoverColor: z.string().optional(),
  successColor: z.string().optional(),
  errorColor: z.string().optional(),
  warningColor: z.string().optional(),

  // Typography
  fontFamily: z.string().optional(),
  headingFont: z.string().optional(),
  fontSize: z.number().optional(),
  lineHeight: z.number().optional(),
  letterSpacing: z.number().optional(),
  fontWeight: z.number().optional(),
  headingWeight: z.number().optional(),

  // Layout
  layout: z.enum(["grid", "list"]).optional(),
  columns: z.number().optional(),
  gap: z.number().optional(),
  padding: z.number().optional(),
  maxWidth: z.number().optional(),
  containerPadding: z.number().optional(),

  // Cards
  cardStyle: z.enum(["modern", "classic", "minimal"]).optional(),
  borderRadius: z.number().optional(),
  cardShadow: z.string().optional(),
  cardPadding: z.number().optional(),
  cardBorder: z.boolean().optional(),
  cardBorderWidth: z.number().optional(),

  // Images
  showImages: z.boolean().optional(),
  imageStyle: z.enum(["cover", "contain", "auto"]).optional(),
  imagePosition: z.enum(["top", "bottom", "left", "right"]).optional(),
  imageHeight: z.number().optional(),
  imageRadius: z.number().optional(),

  // Video
  showVideos: z.boolean().optional(),
  videoAutoplay: z.boolean().optional(),
  videoMuted: z.boolean().optional(),
  videoLoop: z.boolean().optional(),

  // Display Elements
  showPrices: z.boolean().optional(),
  showDescription: z.boolean().optional(),
  showBadges: z.boolean().optional(),
  showRatings: z.boolean().optional(),
  showLogo: z.boolean().optional(),
  showQuantity: z.boolean().optional(),

  // Header
  headerStyle: z.enum(["gradient", "solid", "transparent"]).optional(),
  headerHeight: z.number().optional(),
  logoPosition: z.enum(["left", "center", "right"]).optional(),
  logoSize: z.number().optional(),

  // Background
  backgroundImage: z.string().optional(),
  backgroundVideo: z.string().optional(),
  backgroundOpacity: z.number().optional(),
  backgroundBlur: z.number().optional(),
  backgroundOverlay: z.boolean().optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().optional(),

  // Theme
  darkMode: z.boolean().optional(),

  // Buttons
  buttonRadius: z.number().optional(),
  buttonSize: z.enum(["small", "medium", "large"]).optional(),
  buttonStyle: z.enum(["solid", "outline", "text"]).optional(),

  // Spacing
  spacing: z.enum(["tight", "normal", "loose"]).optional(),
  itemSpacing: z.number().optional(),
  sectionSpacing: z.number().optional(),

  // Animations
  enableAnimations: z.boolean().optional(),
  animationSpeed: z.enum(["slow", "normal", "fast"]).optional(),
  hoverEffect: z.enum(["lift", "shadow", "scale", "none"]).optional(),

  // Advanced
  customCSS: z.string().optional(),
  enableGradients: z.boolean().optional(),
  enableShadows: z.boolean().optional(),
  enableTransitions: z.boolean().optional(),
});

// GET - Get current theme
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      select: { customization: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant.customization);
  } catch (error) {
    console.error("Error fetching theme:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update theme (permission: menu.customize)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "menu.customize");

    if (!authorized) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateThemeSchema.parse(body);

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      select: { customization: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Merge with existing customization
    const updatedCustomization = {
      ...(restaurant.customization as any),
      ...validatedData,
    };
    const updated = await prisma.restaurant.update({
      where: { id: params.id },
      data: { customization: updatedCustomization },
    });

    if (global.io) {
      const io = global.io;
      const tables = await prisma.table.findMany({
        where: { restaurantId: params.id },
        select: { id: true },
      });

      tables.forEach((table) => {
        io.to(`table:${table.id}`).emit("theme-updated", updatedCustomization);
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating theme:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
