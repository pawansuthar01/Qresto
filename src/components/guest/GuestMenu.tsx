"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Leaf,
  Flame,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CartItem } from "@/types";
import Cart from "./cart";
import Image from "next/image";
import { notificationSound } from "@/lib/notification-sound";
import { supabaseClient } from "@/lib/supabase";
interface GuestMenuProps {
  data: any;
  shortCode: string;
}

// Default customization values matching the Advanced Customizer
const defaultCustomization = {
  // Colors
  primaryColor: "#3b82f6",
  secondaryColor: "#1e40af",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  accentColor: "#10b981",
  buttonTextColor: "#ffffff",
  cardBackground: "#ffffff",
  borderColor: "#e5e7eb",
  hoverColor: "#2563eb",
  successColor: "#10b981",
  errorColor: "#ef4444",
  warningColor: "#f59e0b",
  labelColor: "#374151",
  placeholderColor: "#9ca3af",
  overlayColor: "#000000",

  // Typography
  fontFamily: "Inter",
  headingFont: "Inter",
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
  fontWeight: 400,
  headingWeight: 700,

  // Layout
  layout: "grid",
  columns: 3,
  gap: 16,
  padding: 16,
  maxWidth: 1200,
  containerPadding: 16,

  // Cards
  cardStyle: "modern",
  borderRadius: 12,
  cardShadow: "0 2px 8px rgba(0,0,0,0.1)",
  cardPadding: 16,
  cardBorder: true,
  cardBorderWidth: 1,

  // Images
  showImages: true,
  imageStyle: "cover",
  imagePosition: "top",
  imageHeight: 192,
  imageRadius: 8,

  // Video
  showVideos: false,
  videoAutoplay: false,
  videoMuted: true,
  videoLoop: true,

  // Display Elements
  showPrices: true,
  showDescription: true,
  showBadges: true,
  showRatings: false,
  showLogo: true,
  showQuantity: true,

  // Header
  headerStyle: "gradient",
  headerHeight: 72,
  logoPosition: "left",
  logoSize: 40,

  // Background
  backgroundImage: "",
  backgroundVideo: "",
  backgroundOpacity: 100,
  backgroundBlur: 0,
  backgroundOverlay: false,
  overlayOpacity: 50,

  // Theme
  darkMode: false,

  // Buttons
  buttonRadius: 8,
  buttonSize: "medium",
  buttonStyle: "solid",

  // Spacing
  spacing: "normal",
  itemSpacing: 16,
  sectionSpacing: 32,

  // Animations
  enableAnimations: true,
  animationSpeed: "normal",
  hoverEffect: "lift",

  // Advanced
  customCSS: "",
  enableGradients: true,
  enableShadows: true,
  enableTransitions: true,

  // Cart Specific
  cartWidth: "normal",
  showItemImages: true,
  showItemBadges: true,
  showSubtotal: true,
  showTax: true,
  showDiscount: true,
  enableCoupon: true,
  enableTips: true,
  showEstimatedTime: true,
  cartLayout: "comfortable",
};

export default function GuestMenu({ data, shortCode }: GuestMenuProps) {
  const { restaurant, table, categories: initialCategories, canOrder } = data;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategories[0]?.id || ""
  );
  const [categories, setCategories] = useState(initialCategories);
  const [tableStatus, setTableStatus] = useState({
    joined: true,
    isFull: false,
    error: "",
    userCount: 0,
    capacity: table.capacity,
  });

  // Merge restaurant customization with defaults
  const theme = {
    ...defaultCustomization,
    ...restaurant.customization,
  };

  useEffect(() => {
    // Subscribe to menu updates for this restaurant
    const menuChannel = supabaseClient
      .channel(`public:menu_categories:restaurant_id=eq.${restaurant.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_categories" },
        (payload: any) => {
          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT"
          ) {
            const updatedCategory = payload.new;
            setCategories((prev: any) =>
              prev.map((cat: any) =>
                cat.id === updatedCategory.id
                  ? { ...cat, ...updatedCategory }
                  : cat
              )
            );
            notificationSound.playStatusUpdate();
          }
        }
      )
      .subscribe();

    // Subscribe to table updates (e.g., seat count / table full)
    const tableChannel = supabaseClient
      .channel(`public:tables:id=eq.${table.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tables" },
        (payload: any) => {
          const updatedTable = payload.new;
          setTableStatus((prev) => ({
            ...prev,
            userCount: updatedTable.userCount,
            isFull: updatedTable.userCount >= updatedTable.capacity,
            error: updatedTable.isFullMessage || "",
          }));
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(menuChannel);
      supabaseClient.removeChannel(tableChannel);
    };
  }, [restaurant.id, table.id]);

  useEffect(() => {
    const enableAudio = () => {
      notificationSound.requestPermission();
      document.removeEventListener("click", enableAudio);
    };
    document.addEventListener("click", enableAudio);
    return () => document.removeEventListener("click", enableAudio);
  }, []);

  const addToCart = (menuItem: any) => {
    const normalizedItem = {
      ...menuItem,
      imageUrl: menuItem.imageUrl || undefined,
    };
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.menuItem.id === normalizedItem.id
      );
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === normalizedItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem: normalizedItem, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getItemQuantity = (menuItemId: string) =>
    cart.find((item) => item.menuItem.id === menuItemId)?.quantity || 0;

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (tableStatus.isFull) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          fontFamily: theme.fontFamily,
        }}
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{tableStatus.error}</h2>
            <p className="text-gray-600 mb-4">
              Current: {tableStatus.userCount}/{tableStatus.capacity} seats
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Animation classes based on theme
  const hoverClass = theme.enableAnimations
    ? theme.hoverEffect === "lift"
      ? "hover:scale-105 transition-transform"
      : theme.hoverEffect === "glow"
      ? "hover:shadow-2xl transition-shadow"
      : theme.hoverEffect === "scale"
      ? "hover:scale-110 transition-transform"
      : ""
    : "";

  const transitionClass = theme.enableTransitions
    ? "transition-all duration-300"
    : "";

  return (
    <div
      className="min-h-screen pb-24 relative"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        fontSize: `${theme.fontSize}px`,
        lineHeight: theme.lineHeight,
        letterSpacing: `${theme.letterSpacing}px`,
        fontWeight: theme.fontWeight,
      }}
    >
      {/* Background Image/Video */}
      {theme.backgroundImage && (
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url(${theme.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: theme.backgroundOpacity / 100,
            filter: `blur(${theme.backgroundBlur}px)`,
          }}
        />
      )}

      {theme.backgroundVideo && (
        <video
          autoPlay={theme.videoAutoplay}
          loop={theme.videoLoop}
          muted={theme.videoMuted}
          className="fixed inset-0 w-full h-full object-cover -z-10"
          style={{
            opacity: theme.backgroundOpacity / 100,
            filter: `blur(${theme.backgroundBlur}px)`,
          }}
        >
          <source src={theme.backgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* Background Overlay */}
      {theme.backgroundOverlay && (
        <div
          className="fixed inset-0 -z-5"
          style={{
            backgroundColor: theme.overlayColor,
            opacity: theme.overlayOpacity / 100,
          }}
        />
      )}

      {/* Header */}
      <div
        className="sticky top-0 z-40 shadow-lg"
        style={{
          background:
            theme.enableGradients && theme.headerStyle === "gradient"
              ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
              : theme.headerStyle === "solid"
              ? theme.primaryColor
              : "transparent",
          color: theme.buttonTextColor,
          height: `${theme.headerHeight}px`,
        }}
      >
        <div
          className="container mx-auto h-full flex justify-between items-center"
          style={{
            maxWidth: `${theme.maxWidth}px`,
            paddingLeft: `${theme.containerPadding}px`,
            paddingRight: `${theme.containerPadding}px`,
          }}
        >
          <div className="flex items-center gap-3">
            {theme.showLogo && restaurant.logoUrl && (
              <div
                className="bg-white rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  width: `${theme.logoSize}px`,
                  height: `${theme.logoSize}px`,
                }}
              >
                <Image
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  width={theme.logoSize}
                  height={theme.logoSize}
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h1
                className="font-bold"
                style={{
                  fontFamily: theme.headingFont,
                  fontWeight: theme.headingWeight,
                  fontSize: `${theme.fontSize * 1.5}px`,
                }}
              >
                {restaurant.name}
              </h1>
              <p
                style={{
                  fontSize: `${theme.fontSize * 0.875}px`,
                  opacity: 0.9,
                }}
              >
                Table {table.number}
              </p>
            </div>
          </div>

          {canOrder && cartItemCount > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className={`relative rounded-full p-3 shadow-lg ${transitionClass}`}
              style={{
                backgroundColor: theme.cardBackground,
                color: theme.primaryColor,
              }}
            >
              <ShoppingCart className="w-6 h-6" />
              <span
                className="absolute -top-2 -right-2 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                style={{ backgroundColor: theme.errorColor }}
              >
                {cartItemCount}
              </span>
            </button>
          )}
        </div>

        {!tableStatus.joined && (
          <div
            className="mt-2 text-xs rounded px-2 py-1 text-center"
            style={{
              backgroundColor: `${theme.warningColor}20`,
              color: theme.warningColor,
            }}
          >
            Reconnecting...
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div
        className="sticky z-30 border-b overflow-x-auto"
        style={{
          top: `${theme.headerHeight}px`,
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderColor,
        }}
      >
        <div
          className="container mx-auto flex gap-2 py-3"
          style={{
            maxWidth: `${theme.maxWidth}px`,
            paddingLeft: `${theme.containerPadding}px`,
            paddingRight: `${theme.containerPadding}px`,
          }}
        >
          {categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 font-medium whitespace-nowrap ${transitionClass}`}
              style={{
                backgroundColor:
                  selectedCategory === category.id
                    ? theme.primaryColor
                    : "transparent",
                color:
                  selectedCategory === category.id
                    ? theme.buttonTextColor
                    : theme.textColor,
                border:
                  selectedCategory === category.id
                    ? "none"
                    : `2px solid ${theme.borderColor}`,
                borderRadius: `${theme.buttonRadius}px`,
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div
        className="container mx-auto py-6 grid"
        style={{
          maxWidth: `${theme.maxWidth}px`,
          paddingLeft: `${theme.containerPadding}px`,
          paddingRight: `${theme.containerPadding}px`,
          gridTemplateColumns:
            theme.layout === "grid" ? `repeat(${theme.columns}, 1fr)` : "1fr",
          gap: `${theme.gap}px`,
        }}
      >
        {categories
          .filter((cat: any) => cat.id === selectedCategory)
          .map((category: any) =>
            category.items.map((item: any) => {
              const quantity = getItemQuantity(item.id);
              return (
                <Card
                  key={item.id}
                  className={`overflow-hidden ${hoverClass}`}
                  style={{
                    backgroundColor: theme.cardBackground,
                    boxShadow: theme.enableShadows ? theme.cardShadow : "none",
                    borderRadius: `${theme.borderRadius}px`,
                    padding: `${theme.cardPadding}px`,
                    border: theme.cardBorder
                      ? `${theme.cardBorderWidth}px solid ${theme.borderColor}`
                      : "none",
                  }}
                >
                  <CardContent className="p-0">
                    <div
                      className="flex flex-col"
                      style={{ gap: `${theme.itemSpacing}px` }}
                    >
                      {theme.showImages && item.imageUrl && (
                        <div
                          className="relative w-full overflow-hidden"
                          style={{
                            height: `${theme.imageHeight}px`,
                            borderRadius: `${theme.imageRadius}px`,
                          }}
                        >
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className={`object-${theme.imageStyle}`}
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3
                            className="font-semibold"
                            style={{
                              color: theme.primaryColor,
                              fontFamily: theme.headingFont,
                              fontWeight: theme.headingWeight,
                              fontSize: `${theme.fontSize}px`,
                            }}
                          >
                            {item.name}
                          </h3>
                          {theme.showPrices && (
                            <span
                              className="font-bold whitespace-nowrap"
                              style={{
                                color: theme.primaryColor,
                                fontSize: `${theme.fontSize}px`,
                              }}
                            >
                              {formatCurrency(item.price)}
                            </span>
                          )}
                        </div>

                        {theme.showDescription && item.description && (
                          <p
                            className="text-sm"
                            style={{
                              color: theme.accentColor,
                              fontSize: `${theme.fontSize * 0.875}px`,
                            }}
                          >
                            {item.description}
                          </p>
                        )}

                        {theme.showBadges && (
                          <div className="flex gap-2 flex-wrap">
                            {item.isVegetarian && (
                              <span
                                className="text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
                                style={{
                                  backgroundColor: `${theme.successColor}20`,
                                  color: theme.successColor,
                                }}
                              >
                                <Leaf className="w-3 h-3" /> Veg
                              </span>
                            )}
                            {item.spiceLevel > 0 && (
                              <span
                                className="text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
                                style={{
                                  backgroundColor: `${theme.errorColor}20`,
                                  color: theme.errorColor,
                                }}
                              >
                                {Array.from({ length: item.spiceLevel }).map(
                                  (_, i) => (
                                    <Flame key={i} className="w-3 h-3" />
                                  )
                                )}
                                Spicy
                              </span>
                            )}
                          </div>
                        )}

                        {canOrder && tableStatus.joined && (
                          <div className="flex items-center gap-2 mt-2">
                            {quantity === 0 ? (
                              <Button
                                onClick={() => addToCart(item)}
                                size="sm"
                                className={`w-full ${transitionClass}`}
                                style={{
                                  backgroundColor:
                                    theme.buttonStyle === "solid"
                                      ? theme.primaryColor
                                      : "transparent",
                                  color:
                                    theme.buttonStyle === "solid"
                                      ? theme.buttonTextColor
                                      : theme.primaryColor,
                                  border:
                                    theme.buttonStyle === "outline"
                                      ? `2px solid ${theme.primaryColor}`
                                      : "none",
                                  borderRadius: `${theme.buttonRadius}px`,
                                  padding:
                                    theme.buttonSize === "small"
                                      ? "6px 12px"
                                      : theme.buttonSize === "large"
                                      ? "12px 24px"
                                      : "8px 16px",
                                }}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Cart
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2 w-full">
                                <Button
                                  onClick={() => removeFromCart(item.id)}
                                  size="sm"
                                  variant="outline"
                                  className={`flex-1 ${transitionClass}`}
                                  style={{
                                    borderColor: theme.primaryColor,
                                    color: theme.primaryColor,
                                    borderRadius: `${theme.buttonRadius}px`,
                                  }}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span
                                  className="font-bold px-3"
                                  style={{
                                    color: theme.textColor,
                                    fontSize: `${theme.fontSize * 1.125}px`,
                                  }}
                                >
                                  {quantity}
                                </span>
                                <Button
                                  onClick={() => addToCart(item)}
                                  size="sm"
                                  className={`flex-1 ${transitionClass}`}
                                  style={{
                                    backgroundColor: theme.primaryColor,
                                    color: theme.buttonTextColor,
                                    borderRadius: `${theme.buttonRadius}px`,
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
      </div>

      {/* Cart Component */}
      {canOrder && tableStatus.joined && (
        <Cart
          open={cartOpen}
          onOpenChange={setCartOpen}
          cart={cart}
          setCart={setCart}
          total={cartTotal}
          shortCode={shortCode}
          tableName={`Table ${table.number}`}
          theme={theme}
        />
      )}

      {/* Floating Cart Button - Mobile */}
      {canOrder && tableStatus.joined && cartItemCount > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 border-t shadow-lg md:hidden z-50"
          style={{
            backgroundColor: theme.cardBackground,
            borderColor: theme.borderColor,
          }}
        >
          <Button
            onClick={() => setCartOpen(true)}
            className={`w-full ${transitionClass}`}
            size="lg"
            style={{
              backgroundColor: theme.primaryColor,
              color: theme.buttonTextColor,
              borderRadius: `${theme.buttonRadius}px`,
              fontSize: `${theme.fontSize * 1.125}px`,
            }}
          >
            <ShoppingCart className="mr-2 w-5 h-5" />
            View Cart ({cartItemCount}) • {formatCurrency(cartTotal)}
          </Button>
        </div>
      )}

      {/* Custom CSS */}
      {theme.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: theme.customCSS }} />
      )}
    </div>
  );
}
