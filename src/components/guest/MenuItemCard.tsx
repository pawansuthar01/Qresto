"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Minus,
  Star,
  TrendingUp,
  Flame,
  Leaf,
  Award,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: any;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  canOrder: boolean;
  customization?: any;
}

export default function MenuItemCard({
  item,
  quantity,
  onAdd,
  onRemove,
  canOrder,
  customization = {},
}: MenuItemCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getBadges = () => {
    const badges = [];

    if (item.isNew)
      badges.push({ label: "NEW", color: "bg-blue-500", icon: "✨" });
    if (item.isPopular)
      badges.push({ label: "POPULAR", color: "bg-orange-500", icon: "🔥" });
    if (item.isChefSpecial)
      badges.push({
        label: "CHEF'S SPECIAL",
        color: "bg-purple-500",
        icon: "👨‍🍳",
      });
    if (item.isTrending)
      badges.push({ label: "TRENDING", color: "bg-pink-500", icon: "📈" });
    if (item.discount)
      badges.push({
        label: `${item.discount}% OFF`,
        color: "bg-green-500",
        icon: "💰",
      });

    return badges;
  };

  const getDietaryIcons = () => {
    const icons = [];

    if (item.isVegetarian)
      icons.push({
        icon: <Leaf className="w-4 h-4" />,
        label: "Vegetarian",
        color: "text-green-600",
      });
    if (item.isVegan)
      icons.push({ icon: "🥦", label: "Vegan", color: "text-green-700" });
    if (item.isGlutenFree)
      icons.push({
        icon: "🌾",
        label: "Gluten-Free",
        color: "text-yellow-600",
      });

    return icons;
  };

  const getSpiceLevel = () => {
    if (!item.spiceLevel || item.spiceLevel === 0) return null;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: item.spiceLevel }).map((_, i) => (
          <Flame key={i} className="w-3 h-3 text-red-500" />
        ))}
      </div>
    );
  };

  const badges = getBadges();
  const dietaryIcons = getDietaryIcons();

  return (
    <div className="relative group perspective-1000">
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-2xl",
          !item.isAvailable && "opacity-60",
          "transform hover:-translate-y-1"
        )}
        style={{
          background: customization.cardBackground || "white",
          borderRadius: customization.borderRadius || "0.75rem",
        }}
      >
        <CardContent className="p-0">
          {/* Image Section with Badges */}
          <div className="relative h-48 overflow-hidden group">
            {item.imageUrl && (
              <>
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className={cn(
                    "object-cover transition-all duration-500",
                    imageLoaded
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-105",
                    "group-hover:scale-110"
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </>
            )}

            {/* Live Availability Badge */}
            <div className="absolute top-3 left-3 z-10">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
                  item.isAvailable
                    ? "bg-green-500/90 text-white"
                    : "bg-red-500/90 text-white"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    item.isAvailable ? "bg-white animate-pulse" : "bg-white"
                  )}
                />
                {item.isAvailable ? "🟢 Available" : "🔴 Unavailable"}
              </div>
            </div>

            {/* Top Right Badges */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm flex items-center gap-1",
                    badge.color
                  )}
                >
                  <span>{badge.icon}</span>
                  {badge.label}
                </div>
              ))}
            </div>

            {/* Rating Badge */}
            {item.rating && (
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{item.rating}</span>
              </div>
            )}

            {/* Order Count */}
            {item.orderCount && (
              <div className="absolute bottom-3 right-3 z-10 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                🔥 {item.orderCount} ordered today
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Title & Price */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                  {item.name}
                </h3>

                {/* Dietary Icons & Spice Level */}
                <div className="flex items-center gap-2 mb-2">
                  {dietaryIcons.map((icon, idx) => (
                    <div
                      key={idx}
                      className={cn("flex items-center", icon.color)}
                      title={icon.label}
                    >
                      {typeof icon.icon === "string" ? icon.icon : icon.icon}
                    </div>
                  ))}
                  {getSpiceLevel()}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(item.price)}
                </div>
                {item.originalPrice && item.originalPrice > item.price && (
                  <div className="text-sm text-gray-400 line-through">
                    {formatCurrency(item.originalPrice)}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Prep Time */}
            {item.prepTime && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <Clock className="w-3 h-3" />
                <span>Ready in {item.prepTime} mins</span>
              </div>
            )}

            {/* Action Button */}
            {canOrder && item.isAvailable && (
              <div className="flex items-center gap-2">
                {quantity === 0 ? (
                  <Button
                    onClick={onAdd}
                    size="sm"
                    className={cn(
                      "w-full transition-all duration-300",
                      "hover:scale-105 active:scale-95",
                      "shadow-md hover:shadow-lg"
                    )}
                    style={{
                      background: customization.primaryColor || "#3b82f6",
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      onClick={onRemove}
                      size="sm"
                      variant="outline"
                      className="flex-1 hover:scale-105 transition-transform"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center justify-center min-w-[3rem]">
                      <span className="font-bold text-lg">{quantity}</span>
                    </div>
                    <Button
                      onClick={onAdd}
                      size="sm"
                      className="flex-1 hover:scale-105 transition-transform"
                      style={{
                        background: customization.primaryColor || "#3b82f6",
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Unavailable Message */}
            {!item.isAvailable && (
              <div className="text-center py-2 bg-red-50 rounded-lg">
                <span className="text-sm font-semibold text-red-600">
                  Currently Unavailable
                </span>
              </div>
            )}
          </div>

          {/* Animated Border on Hover */}
          <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-400 transition-all duration-300 pointer-events-none" />
        </CardContent>
      </Card>

      {/* Add to Cart Animation */}
      {quantity > 0 && (
        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm animate-bounce z-20">
          {quantity}
        </div>
      )}
    </div>
  );
}
