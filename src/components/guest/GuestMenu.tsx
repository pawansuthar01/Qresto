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
import Cart from "./Cart";
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

  const customization = restaurant.customization || {};

  // Use real-time table socket
  const { socket, connected, tableStatus } = useTableSocket(
    table.id,
    restaurant.id,
    table.capacity
  );

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Menu updates
    socket.on("menu-updated", (updatedMenu) => {
      setCategories(updatedMenu.categories);
    });

    // Order status updates
    socket.on("order-status-changed", (data) => {
      notificationSound.playStatusUpdate();
      // You can show a toast notification here
      console.log("Order status updated:", data);
    });

    // Order created confirmation
    socket.on("order-created", (order) => {
      console.log("Order confirmed:", order);
    });

    return () => {
      socket.off("menu-updated");
      socket.off("order-status-changed");
      socket.off("order-created");
    };
  }, [socket]);

  // Request audio permission on first interaction
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
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item) => item.menuItem.id !== menuItemId);
    });
  };

  const getItemQuantity = (menuItemId: string) => {
    return cart.find((item) => item.menuItem.id === menuItemId)?.quantity || 0;
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Show table full error
  if (tableStatus.isFull) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Table Full
            </h2>
            <p className="text-gray-600 mb-4">{tableStatus.error}</p>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Current: {tableStatus.userCount} / {tableStatus.capacity} seats
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div
        className="bg-white shadow-sm sticky top-0 z-40"
        style={{
          backgroundColor: customization.primaryColor || "#3b82f6",
          color: "white",
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-5 h-5" />
                <h1 className="text-xl font-bold">{restaurant.name}</h1>
              </div>
              <div className="flex items-center gap-3 text-sm opacity-90">
                <span>Table {table.number}</span>
                {connected && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {tableStatus.userCount}/{tableStatus.capacity}
                  </span>
                )}
              </div>
            </div>
            {canOrder && cartItemCount > 0 && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative bg-white text-blue-600 rounded-full p-3 shadow-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              </button>
            )}
          </div>

          {/* Connection status indicator */}
          {!connected && (
            <div className="mt-2 text-xs bg-yellow-500/20 rounded px-2 py-1">
              Reconnecting...
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b sticky top-[72px] z-30 overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3">
            {categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-6">
        {categories
          .filter((cat: any) => cat.id === selectedCategory)
          .map((category: any) => (
            <div key={category.id} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}

              <div className="grid grid-cols-1 gap-4 mt-6">
                {category.items.map((item: any) => {
                  const quantity = getItemQuantity(item.id);

                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {item.imageUrl && (
                            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {item.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  {item.isVegetarian && (
                                    <Leaf
                                      className="w-4 h-4 text-green-600"
                                      title="Vegetarian"
                                    />
                                  )}
                                  {item.spiceLevel && item.spiceLevel > 0 && (
                                    <div className="flex items-center gap-1">
                                      {Array.from({
                                        length: item.spiceLevel,
                                      }).map((_, i) => (
                                        <Flame
                                          key={i}
                                          className="w-3 h-3 text-red-500"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="font-bold text-blue-600">
                                {formatCurrency(item.price)}
                              </span>
                            </div>

                            {item.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            {canOrder && tableStatus.joined && (
                              <div className="flex items-center gap-2">
                                {quantity === 0 ? (
                                  <Button
                                    onClick={() => addToCart(item)}
                                    size="sm"
                                    className="w-full"
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
                })}
              </div>
            </div>
          ))}
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
        />
      )}

      {/* Floating Cart Button */}
      {canOrder && tableStatus.joined && cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg md:hidden">
          <Button
            onClick={() => setCartOpen(true)}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="mr-2 w-5 h-5" />
            View Cart ({cartItemCount}) • {formatCurrency(cartTotal)}
          </Button>
        </div>
      )}
    </div>
  );
}
