"use client";

import { useState, useMemo } from "react";
import { InteractiveMenuCard } from "./InteractiveMenuCard";
import { MenuFilters } from "./MenuFilters";
import { Badge } from "@/components/ui/badge";
import { useRealtimeMenu } from "@/hooks/useRealtimeMenu";
import { Wifi, Package } from "lucide-react";

interface GuestMenuProps {
  categories: any[];
  customization: any;
  restaurantId: string;
}
export function GuestMenu({
  categories: initialCategories,
  customization,
  restaurantId,
}: GuestMenuProps) {
  const [filters, setFilters] = useState<any>({});
  console.log(restaurantId);
  const { isConnected, menuUpdates } = useRealtimeMenu(restaurantId);

  // Apply filters
  const filteredCategories = useMemo(() => {
    return initialCategories
      .map((category) => {
        let items = category.items || [];

        // Search filter
        if (filters.search) {
          const search = filters.search.toLowerCase();
          items = items.filter(
            (item: any) =>
              item.name.toLowerCase().includes(search) ||
              item.description?.toLowerCase().includes(search)
          );
        }

        // Category filter
        if (filters.category && filters.category !== "all") {
          if (category.id !== filters.category) {
            items = [];
          }
        }

        // Diet filters
        if (filters.dietFilters?.length > 0) {
          items = items.filter((item: any) => {
            const custom = item.customization || {};
            return filters.dietFilters.some((filter: string) => {
              if (filter === "veg") return custom.isVeg;
              if (filter === "nonveg") return custom.isNonVeg;
              if (filter === "vegan") return custom.isVegan;
              if (filter === "spicy") return custom.isSpicy;
              return false;
            });
          });
        }

        // Price range filter
        if (filters.priceRange && filters.priceRange !== "all") {
          const [min, max] = filters.priceRange
            .split("-")
            .map((v: string) => (v === "+" ? Infinity : parseInt(v)));
          items = items.filter(
            (item: any) =>
              item.price >= min && (max === Infinity || item.price <= max)
          );
        }

        // Popular filter
        if (filters.showPopular) {
          items = items.filter(
            (item: any) =>
              item.customization?.isTrending ||
              item.customization?.ordersToday > 10
          );
        }

        // Sort by availability (available items first)
        items = items.sort((a: any, b: any) => {
          if (a.available === b.available) return 0;
          return a.available ? -1 : 1;
        });

        return { ...category, items };
      })
      .filter((cat) => cat.items.length > 0);
  }, [initialCategories, filters]);

  const totalItems = filteredCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Live Status Bar */}
      <div className="mb-4 flex items-center justify-between">
        <Badge
          variant={isConnected ? "default" : "secondary"}
          className="text-xs"
        >
          {isConnected ? (
            <>
              <Wifi className="mr-1 h-3 w-3" />
              Live Menu
            </>
          ) : (
            <>
              <Package className="mr-1 h-3 w-3" />
              Loading...
            </>
          )}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {totalItems} items available
        </span>
      </div>

      {/* Filters */}
      <MenuFilters onFilterChange={setFilters} categories={initialCategories} />

      {/* Menu Grid */}
      <div className="space-y-8 mt-6">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No items found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="animate-in fade-in duration-500">
              <h2
                className="mb-4 text-2xl font-bold"
                style={{ color: customization.primaryColor || "#000000" }}
              >
                {category.name}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({category.items.length})
                </span>
              </h2>
              {category.description && (
                <p className="mb-4 text-muted-foreground">
                  {category.description}
                </p>
              )}

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item: any) => (
                  <InteractiveMenuCard
                    key={item.id}
                    item={item}
                    customization={customization}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
