"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GuestMenu } from "@/components/guest/GuestMenu";
import { Cart } from "@/components/order/Cart";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GuestMenuPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const { items, setContext } = useCartStore();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/q/${shortCode}`);
        if (!res.ok) throw new Error("Menu not found");
        const data = await res.json();
        setMenuData(data);
        setContext(data.restaurant.id, data.table.id);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading menu...</p>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Menu Not Found</h1>
          <p className="text-muted-foreground">
            The QR code you scanned is invalid or expired
          </p>
        </div>
      </div>
    );
  }

  const customization = menuData.restaurant.customization || {};

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: customization.backgroundColor || "#ffffff",
        fontFamily: customization.fontFamily || "sans-serif",
      }}
    >
      <header className="sticky top-0 z-40 border-b bg-background shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: customization.primaryColor || "#000000" }}
            >
              {menuData.restaurant.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Table {menuData.table.number}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {items.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      <GuestMenu
        categories={menuData.restaurant.categories}
        customization={customization}
      />

      <Cart
        open={cartOpen}
        onOpenChange={setCartOpen}
        restaurantId={menuData.restaurant.id}
      />
    </div>
  );
}
