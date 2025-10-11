"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Store,
  Leaf,
  Flame,
  Users,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CartItem } from "@/types";
import Cart from "./cart";
import Image from "next/image";
import { useTableSocket } from "@/hooks/useSocket";
import { notificationSound } from "@/lib/notification-sound";

interface GuestMenuProps {
  data: any;
  shortCode: string;
}

export default function GuestMenu({ data, shortCode }: GuestMenuProps) {
  const { restaurant, table, categories: initialCategories, canOrder } = data;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategories[0]?.id || ""
  );
  const [categories, setCategories] = useState(initialCategories);

  const theme = {
    primaryColor: restaurant.customization?.primaryColor || "#3b82f6",
    secondaryColor: restaurant.customization?.secondaryColor || "#1e40af",
    backgroundColor: restaurant.customization?.backgroundColor || "#ffffff",
    textColor: restaurant.customization?.textColor || "#111827",
    accentColor: restaurant.customization?.accentColor || "#10b981",
    fontFamily: restaurant.customization?.fontFamily || "Inter",
    headingFont: restaurant.customization?.headingFont || "Inter",
    fontSize: restaurant.customization?.fontSize || "medium",
    layout: restaurant.customization?.layout || "grid",
    cardStyle: restaurant.customization?.cardStyle || "modern",
    borderRadius: restaurant.customization?.borderRadius || "12px",
    spacing: restaurant.customization?.spacing || "normal",
    columns: restaurant.customization?.columns || 3,
    showImages: restaurant.customization?.showImages ?? true,
    showVideos: restaurant.customization?.showVideos ?? false,
    imageStyle: restaurant.customization?.imageStyle || "cover",
    imagePosition: restaurant.customization?.imagePosition || "top",
    showPrices: restaurant.customization?.showPrices ?? true,
    showDescription: restaurant.customization?.showDescription ?? true,
    showBadges: restaurant.customization?.showBadges ?? true,
    showRatings: restaurant.customization?.showRatings ?? true,
    headerStyle: restaurant.customization?.headerStyle || "gradient",
    showLogo: restaurant.customization?.showLogo ?? true,
    logoPosition: restaurant.customization?.logoPosition || "left",
    backgroundImage: restaurant.customization?.backgroundImage || "",
    backgroundVideo: restaurant.customization?.backgroundVideo || "",
    backgroundOpacity: restaurant.customization?.backgroundOpacity ?? 100,
    darkMode: restaurant.customization?.darkMode ?? false,
    buttonTextColor: restaurant.customization?.buttonTextColor || "white",
    cardBackground: restaurant.customization?.cardBackground || "#fff",
    cardShadow:
      restaurant.customization?.cardShadow || "0 2px 8px rgba(0,0,0,0.1)",
  };

  const { socket, connected, tableStatus } = useTableSocket(
    table.id,
    restaurant.id,
    table.capacity
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("menu-updated", (updatedMenu) =>
      setCategories(updatedMenu.categories)
    );
    socket.on("order-status-changed", () =>
      notificationSound.playStatusUpdate()
    );
    socket.on("order-created", (order) =>
      console.log("Order confirmed:", order)
    );
    return () => {
      socket.off("menu-updated");
      socket.off("order-status-changed");
      socket.off("order-created");
    };
  }, [socket]);

  useEffect(() => {
    const enableAudio = () => {
      notificationSound.requestPermission();
      document.removeEventListener("click", enableAudio);
    };
    document.addEventListener("click", enableAudio);
    return () => document.removeEventListener("click", enableAudio);
  }, []);

  const addToCart = (menuItem: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
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

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        backgroundImage: theme.backgroundImage
          ? `url(${theme.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        opacity: theme.backgroundOpacity / 100,
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-40 shadow-sm"
        style={{
          background:
            theme.headerStyle === "gradient"
              ? `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`
              : theme.primaryColor,
          color: theme.buttonTextColor,
        }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {theme.showLogo && restaurant.logoUrl && (
              <Image
                src={restaurant.logoUrl}
                alt={restaurant.name}
                width={40}
                height={40}
                className={`rounded ${
                  theme.logoPosition === "left" ? "" : "mx-auto"
                }`}
              />
            )}
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: theme.headingFont }}
            >
              {restaurant.name}
            </h1>
          </div>

          {canOrder && cartItemCount > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-3 shadow-lg"
              style={{
                color: theme.primaryColor,
                backgroundColor: theme.cardBackground,
              }}
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            </button>
          )}
        </div>
        {!connected && (
          <div className="mt-2 text-xs bg-yellow-500/20 rounded px-2 py-1 text-center">
            Reconnecting...
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="sticky top-[72px] z-30 bg-white border-b overflow-x-auto">
        <div className="container mx-auto px-4 flex gap-2 py-3">
          {categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors"
              style={{
                backgroundColor:
                  selectedCategory === category.id
                    ? theme.accentColor
                    : theme.secondaryColor,
                color:
                  selectedCategory === category.id ? "#fff" : theme.textColor,
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div
        className={`container mx-auto px-4 py-6 grid gap-4`}
        style={{ gridTemplateColumns: `repeat(${theme.columns}, 1fr)` }}
      >
        {categories
          .filter((cat: any) => cat.id === selectedCategory)
          .map((category: any) =>
            category.items.map((item: any) => {
              const quantity = getItemQuantity(item.id);
              return (
                <Card
                  key={item.id}
                  className={`overflow-hidden ${theme.cardStyle}`}
                  style={{
                    backgroundColor: theme.cardBackground,
                    boxShadow: theme.cardShadow,
                    borderRadius: theme.borderRadius,
                    padding: theme.spacing === "normal" ? "1rem" : "0.5rem",
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                      {theme.showImages && item.imageUrl && (
                        <div
                          className={`relative w-full h-48 rounded overflow-hidden`}
                        >
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className={`object-${theme.imageStyle}`}
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-start">
                        <div>
                          <h3
                            className="font-semibold"
                            style={{ color: theme.primaryColor }}
                          >
                            {item.name}
                          </h3>
                          {theme.showDescription && item.description && (
                            <p className="text-sm text-gray-600">
                              {item.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-1">
                            {theme.showBadges && item.isVegetarian && (
                              <Leaf className="w-4 h-4 text-green-600" />
                            )}
                            {theme.showBadges &&
                              item.spiceLevel > 0 &&
                              Array.from({ length: item.spiceLevel }).map(
                                (_, i) => (
                                  <Flame
                                    key={i}
                                    className="w-3 h-3 text-red-500"
                                  />
                                )
                              )}
                          </div>
                        </div>
                        {theme.showPrices && (
                          <span className="font-bold">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                      </div>

                      {canOrder && tableStatus.joined && (
                        <div className="flex items-center gap-2 mt-2">
                          {quantity === 0 ? (
                            <Button
                              onClick={() => addToCart(item)}
                              size="sm"
                              className="w-full"
                              style={{
                                backgroundColor: theme.primaryColor,
                                color: theme.buttonTextColor,
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
                                className="flex-1"
                                style={{
                                  borderColor: theme.primaryColor,
                                  color: theme.primaryColor,
                                }}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="font-bold text-lg px-3">
                                {quantity}
                              </span>
                              <Button
                                onClick={() => addToCart(item)}
                                size="sm"
                                className="flex-1"
                                style={{
                                  backgroundColor: theme.primaryColor,
                                  color: theme.buttonTextColor,
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
      </div>

      {/* Cart */}
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

      {/* Floating Cart Button */}
      {canOrder && tableStatus.joined && cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg md:hidden">
          <Button
            onClick={() => setCartOpen(true)}
            className="w-full"
            size="lg"
            style={{
              backgroundColor: theme.primaryColor,
              color: theme.buttonTextColor,
            }}
          >
            <ShoppingCart className="mr-2 w-5 h-5" />
            View Cart ({cartItemCount}) • {formatCurrency(cartTotal)}
          </Button>
        </div>
      )}
    </div>
  );
}
