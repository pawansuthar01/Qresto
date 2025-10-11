"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Store,
  Users,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CartItem } from "@/types";
import Cart from "./cart";
import { useTableSocket } from "@/hooks/useSocket";
import { notificationSound } from "@/lib/notification-sound";
import MenuItemCard from "./MenuItemCard";
import MenuFilters, { FilterState } from "./MenuFilters";

interface EnhancedGuestMenuProps {
  data: any;
  shortCode: string;
}

export default function EnhancedGuestMenu({
  data,
  shortCode,
}: EnhancedGuestMenuProps) {
  const { restaurant, table, categories: initialCategories, canOrder } = data;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [categories] = useState(initialCategories);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    dietary: [],
    priceRange: [0, 1000],
    sortBy: "popular",
    showAvailableOnly: true,
  });

  const customization = restaurant.customization || {};

  const { socket, connected, tableStatus } = useTableSocket(
    table.id,
    restaurant.id,
    table.capacity
  );

  // Flatten menu items from categories
  useEffect(() => {
    const items = categories.flatMap((cat: any) =>
      cat.items.map((item: any) => ({
        ...item,
        categoryId: cat.id,
        categoryName: cat.name,
      }))
    );
    setMenuItems(items);
  }, [categories]);

  // Real-time menu updates
  useEffect(() => {
    if (!socket) return;

    socket.on("menu-item-updated", (updatedItem) => {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === updatedItem.id ? { ...item, ...updatedItem } : item
        )
      );
      notificationSound.playStatusUpdate();
    });

    socket.on("menu-item-deleted", (data) => {
      setMenuItems((prev) => prev.filter((item) => item.id !== data.itemId));
    });

    socket.on("order-status-changed", (_) => {
      notificationSound.playStatusUpdate();
    });

    return () => {
      socket.off("menu-item-updated");
      socket.off("menu-item-deleted");
      socket.off("order-status-changed");
    };
  }, [socket]);

  // Filter and sort menu items
  const filteredItems = useMemo(() => {
    let items = [...menuItems];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category !== "all") {
      items = items.filter((item) => item.categoryId === filters.category);
    }

    // Dietary filters
    if (filters.dietary.length > 0) {
      items = items.filter((item) => {
        if (filters.dietary.includes("vegetarian") && !item.isVegetarian)
          return false;
        if (filters.dietary.includes("vegan") && !item.isVegan) return false;
        if (filters.dietary.includes("gluten-free") && !item.isGlutenFree)
          return false;
        return true;
      });
    }

    // Price range filter
    items = items.filter(
      (item) =>
        item.price >= filters.priceRange[0] &&
        item.price <= filters.priceRange[1]
    );

    // Availability filter
    if (filters.showAvailableOnly) {
      items = items.filter((item) => item.isAvailable);
    }

    // Sort
    switch (filters.sortBy) {
      case "price-low":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        items.sort((a, b) => b.price - a.price);
        break;
      case "name":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "popular":
      default:
        items.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
        break;
    }

    return items;
  }, [menuItems, filters]);

  // Request audio permission
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
    notificationSound.playSuccess();
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div
        className="bg-white shadow-md sticky top-0 z-40"
        style={{
          background: `linear-gradient(135deg, ${
            customization.primaryColor || "#3b82f6"
          }, ${customization.secondaryColor || "#1e40af"})`,
          color: "white",
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-6 h-6" />
                <h1 className="text-xl md:text-2xl font-bold">
                  {restaurant.name}
                </h1>
              </div>
              <div className="flex items-center gap-3 text-sm opacity-90">
                <span className="flex items-center gap-1">
                  📍 Table {table.number}
                </span>
                {connected && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {tableStatus.userCount}/{tableStatus.capacity}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Live Menu
                </span>
              </div>
            </div>
            {canOrder && cartItemCount > 0 && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative bg-white text-blue-600 rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                  {cartItemCount}
                </span>
              </button>
            )}
          </div>

          {!connected && (
            <div className="mt-2 text-xs bg-yellow-500/20 rounded px-2 py-1 backdrop-blur-sm">
              Reconnecting...
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-4 sticky top-[88px] z-30 bg-white/95 backdrop-blur-sm shadow-sm">
        <MenuFilters onFilterChange={setFilters} categories={categories} />
      </div>

      {/* Menu Items Grid */}
      <div className="container mx-auto px-4 py-6">
        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "Dish" : "Dishes"}
            </span>
          </div>
          {filters.search && (
            <span className="text-sm text-gray-600">
              Showing results for "{filters.search}"
            </span>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No dishes found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                quantity={getItemQuantity(item.id)}
                onAdd={() => addToCart(item)}
                onRemove={() => removeFromCart(item.id)}
                canOrder={canOrder && tableStatus.joined}
                customization={customization}
              />
            ))}
          </div>
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
        />
      )}

      {/* Floating Cart Button */}
      {canOrder && tableStatus.joined && cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t shadow-2xl z-40">
          <Button
            onClick={() => setCartOpen(true)}
            className="w-full shadow-lg hover:shadow-xl transition-all"
            size="lg"
            style={{
              background: `linear-gradient(135deg, ${
                customization.primaryColor || "#3b82f6"
              }, ${customization.secondaryColor || "#1e40af"})`,
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
