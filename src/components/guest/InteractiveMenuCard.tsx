"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Star,
  TrendingUp,
  Leaf,
  Flame,
  Sparkles,
  Info,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface InteractiveMenuCardProps {
  item: any;
  customization: any;
  onAddToCart?: () => void;
}

export function InteractiveMenuCard({
  item,
  customization,
}: InteractiveMenuCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    setIsAdding(true);

    // Play sound
    if (typeof window !== "undefined") {
      const audio = new Audio("./cart-add.wav");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }

    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
    });

    toast({
      title: "✓ Added to cart",
      description: `${item.name}`,
      duration: 2000,
    });

    // Animation
    setTimeout(() => setIsAdding(false), 600);
  };

  const getBadges = () => {
    const badges = [];
    const custom = item.customization || {};

    if (custom.isNew)
      badges.push({ label: "New", icon: Sparkles, color: "bg-blue-500" });
    if (custom.isChefSpecial)
      badges.push({
        label: "Chef's Special",
        icon: Star,
        color: "bg-yellow-500",
      });
    if (custom.isTrending)
      badges.push({
        label: "Trending",
        icon: TrendingUp,
        color: "bg-orange-500",
      });
    if (custom.isVegan)
      badges.push({ label: "Vegan", icon: Leaf, color: "bg-green-500" });
    if (custom.isSpicy)
      badges.push({ label: "Spicy", icon: Flame, color: "bg-red-500" });

    return badges;
  };

  const badges = getBadges();

  return (
    <div
      className={cn(
        "relative perspective-1000 transition-transform duration-300",
        "hover:scale-105 hover:z-10"
      )}
      style={{ perspective: "1000px" }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all duration-500 cursor-pointer",
          "hover:shadow-2xl hover:shadow-primary/20",
          isFlipped && "rotate-y-180"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Side */}
        <div className={cn("relative backface-hidden", isFlipped && "hidden")}>
          {/* Live Status Badge */}
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            {item.available ? (
              <Badge className="bg-green-500 text-white animate-pulse">
                🟢 Available
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white">🔴 Unavailable</Badge>
            )}
          </div>

          {/* Custom Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {badges.slice(0, 2).map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <Badge
                  key={idx}
                  className={cn(badge.color, "text-white text-xs")}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {badge.label}
                </Badge>
              );
            })}
          </div>

          {/* Image with Hover Effect */}
          {item.image && (
            <div className="relative h-48 overflow-hidden group">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="font-bold text-lg leading-tight"
                style={{ color: customization.primaryColor || "#000" }}
              >
                {item.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>

            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Rating & Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {item.customization?.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{item.customization.rating}</span>
                </div>
              )}
              {item.customization?.ordersToday && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{item.customization.ordersToday} today</span>
                </div>
              )}
            </div>

            {/* Price & Add Button */}
            <div className="flex items-center justify-between pt-2">
              <span
                className="text-2xl font-bold"
                style={{ color: customization.primaryColor || "#000" }}
              >
                {formatCurrency(item.price)}
              </span>

              <Button
                size="sm"
                disabled={!item.available || isAdding}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                className={cn(
                  "transition-all duration-300",
                  isAdding && "scale-125"
                )}
                style={{
                  backgroundColor: item.available
                    ? customization.primaryColor || undefined
                    : undefined,
                }}
              >
                <Plus
                  className={cn(
                    "h-4 w-4 mr-1 transition-transform",
                    isAdding && "rotate-90"
                  )}
                />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div
          className={cn(
            "absolute inset-0 backface-hidden bg-gradient-to-br from-primary/5 to-primary/10 p-6",
            !isFlipped && "hidden"
          )}
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="h-full flex flex-col">
            <h3 className="text-xl font-bold mb-4">Details</h3>

            <div className="space-y-3 flex-1">
              {item.description && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              )}

              {item.customization?.ingredients && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Ingredients</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.customization.ingredients}
                  </p>
                </div>
              )}

              {item.customization?.allergens && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Allergens</h4>
                  <p className="text-sm text-red-600">
                    {item.customization.allergens}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {badges.map((badge, idx) => {
                  const Icon = badge.icon;
                  return (
                    <Badge key={idx} className={cn(badge.color, "text-white")}>
                      <Icon className="h-3 w-3 mr-1" />
                      {badge.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              Back to Menu
            </Button>
          </div>
        </div>
      </Card>

      {/* Add to Cart Animation */}
      {isAdding && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="animate-ping text-4xl">✨</div>
        </div>
      )}
    </div>
  );
}
