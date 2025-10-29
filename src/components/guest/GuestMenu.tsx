"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Leaf,
  Flame,
  AlertCircle,
  Search,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CartItem } from "@/types";
import Cart from "./cart";
import Image from "next/image";
import { notificationSound } from "@/lib/notification-sound";
import {
  addActiveUser,
  removeActiveUser,
  useActiveUser,
} from "@/hooks/useActiveUsers";
import { usePathname } from "next/navigation";

interface GuestMenuProps {
  data: any;
  shortCode: string;
}

const defaultCustomization = {
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
  fontFamily: "Inter",
  headingFont: "Inter",
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
  fontWeight: 400,
  headingWeight: 700,
  layout: "grid",
  columns: 3,
  columnsMobile: 1,
  columnsTablet: 2,
  columnsDesktop: 3,
  gap: 16,
  padding: 16,
  maxWidth: 1200,
  containerPadding: 16,
  cardStyle: "modern",
  borderRadius: 12,
  cardShadow: "0 2px 8px rgba(0,0,0,0.1)",
  cardPadding: 16,
  cardBorder: true,
  cardBorderWidth: 1,
  showImages: true,
  imageStyle: "cover",
  imagePosition: "top",
  imageHeight: 192,
  imageRadius: 8,
  showVideos: false,
  videoAutoplay: false,
  videoMuted: true,
  videoLoop: true,
  showPrices: true,
  showDescription: true,
  showBadges: true,
  showRatings: false,
  showLogo: true,
  showQuantity: true,
  headerStyle: "gradient",
  headerHeight: 72,
  logoPosition: "left",
  logoSize: 40,
  backgroundImage: "",
  backgroundVideo: "",
  backgroundImageMobile: "",
  backgroundImageTablet: "",
  backgroundImageDesktop: "",
  backgroundVideoMobile: "",
  backgroundVideoTablet: "",
  backgroundVideoDesktop: "",
  backgroundOpacity: 100,
  backgroundBlur: 0,
  backgroundOverlay: false,
  overlayOpacity: 50,
  darkMode: false,
  buttonRadius: 8,
  buttonSize: "medium",
  buttonStyle: "solid",
  spacing: "normal",
  itemSpacing: 16,
  sectionSpacing: 32,
  enableAnimations: true,
  animationSpeed: "normal",
  hoverEffect: "lift",
  customCSS: "",
  enableGradients: true,
  enableShadows: true,
  enableTransitions: true,
};

export default function GuestMenu({ data, shortCode }: GuestMenuProps) {
  const { restaurant, table, categories: initialCategories, canOrder } = data;
  const [cart, setCart] = useState<CartItem[]>([]);
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [userId] = useState(() => {
    if (typeof window !== "undefined") {
      let storedId = localStorage.getItem("guestUserId");
      if (storedId) return storedId;

      const newId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Math.random().toString(36).substr(2, 9)}`;

      localStorage.setItem("guestUserId", newId);
      return newId;
    }
    return `guest_${crypto.randomUUID()}`;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategories[0]?.id || ""
  );
  const [categories] = useState(initialCategories);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { capacity, currentUsers, onlyCapacity, joinGuests } =
    useActiveUser(table);
  const [tableStatus, setTableStatus] = useState({
    joined: true,
    joinGuests: joinGuests,
    error: "",
    onlyCapacity: onlyCapacity,
    userCount: currentUsers || 0,
    capacity: capacity,
  });

  const theme = {
    ...defaultCustomization,
    ...restaurant.customization,
  };

  const [isJoined, setIsJoined] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const previousPathname = useRef(pathname);

  // Device detection
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType("mobile");
      } else if (width < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getResponsiveBackground = () => {
    if (deviceType === "mobile") {
      return {
        image: theme.backgroundImageMobile || theme.backgroundImage,
        video: theme.backgroundVideoMobile || theme.backgroundVideo,
      };
    } else if (deviceType === "tablet") {
      return {
        image: theme.backgroundImageTablet || theme.backgroundImage,
        video: theme.backgroundVideoTablet || theme.backgroundVideo,
      };
    } else {
      return {
        image: theme.backgroundImageDesktop || theme.backgroundImage,
        video: theme.backgroundVideoDesktop || theme.backgroundVideo,
      };
    }
  };

  const getResponsiveColumns = () => {
    if (deviceType === "mobile") {
      return theme.columnsMobile || 1;
    } else if (deviceType === "tablet") {
      return theme.columnsTablet || 2;
    } else {
      return theme.columnsDesktop || theme.columns || 3;
    }
  };

  const joinTable = async () => {
    if (tableStatus.joinGuests.includes(userId) || isJoined || !table.id) {
      return;
    }
    const data = await addActiveUser(shortCode, table.id, userId);
    setTableStatus({
      joinGuests: data.joinGuests,
      onlyCapacity: data.onlyCapacity,
      joined: data?.status !== "full" ? true : false,
      userCount: data?.currentUsers || 0,
      capacity: data?.capacity || 0,
      error: "",
    });
    if (data?.status === "joined" || data?.status === "already_joined") {
      setIsJoined(true);
    }
  };

  const leaveTable = async () => {
    const payload = JSON.stringify({ userId, action: "leave" });
    navigator.sendBeacon(
      `/api/q/${shortCode}/active-users`,
      new Blob([payload], { type: "application/json" })
    );
    await removeActiveUser(shortCode, table.id, userId);
    setIsJoined(false);
    setTableStatus((prev) => ({
      ...prev,
      joined: false,
      userCount: prev.userCount - 1,
    }));
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      leaveTable();
    }, 150000);
  };

  useEffect(() => {
    joinTable();
    resetInactivityTimer();

    const activityHandler = () => resetInactivityTimer();
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((e) =>
      document.addEventListener(e, activityHandler)
    );

    const handleBeforeUnload = () => leaveTable();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      leaveTable();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((e) =>
        document.removeEventListener(e, activityHandler)
      );
    };
  }, []);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      leaveTable();
      previousPathname.current = pathname;
    }
  }, [pathname]);

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

  const scrollToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    categoryRefs.current[categoryId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Filter items by search
  const filteredCategories = categories
    .map((cat: any) => ({
      ...cat,
      items: cat.items.filter(
        (item: any) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat: any) => cat.items.length > 0);

  if (
    !tableStatus.joinGuests?.includes(userId) && tableStatus.onlyCapacity
      ? tableStatus.userCount >= tableStatus.capacity
      : false
  ) {
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
          <CardContent className="p-6 sm:p-8 text-center">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Table is Currently Full
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Sorry, there are no available seats at this table right now.
              <br />
              <strong>Connect to staff</strong>
            </p>
            <p className="text-base sm:text-lg font-semibold">
              Current: {tableStatus.userCount}/{tableStatus.capacity} seats
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const background = getResponsiveBackground();
  const columns = getResponsiveColumns();

  const hoverClass = theme.enableAnimations
    ? theme.hoverEffect === "lift"
      ? "hover:scale-[1.02] active:scale-[0.98]"
      : theme.hoverEffect === "glow"
      ? "hover:shadow-2xl"
      : theme.hoverEffect === "scale"
      ? "hover:scale-105"
      : ""
    : "";

  const transitionClass = theme.enableTransitions
    ? "transition-all duration-300"
    : "";

  return (
    <div
      className="min-h-screen pb-20 sm:pb-24 relative"
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
      {/* Responsive Background */}
      {background.video ? (
        <video
          autoPlay={theme.videoAutoplay}
          loop={theme.videoLoop}
          muted={theme.videoMuted}
          playsInline
          className="fixed inset-0 w-full h-full object-cover -z-10"
          style={{
            opacity: theme.backgroundOpacity / 100,
            filter: `blur(${theme.backgroundBlur}px)`,
          }}
        >
          <source src={background.video} type="video/mp4" />
        </video>
      ) : background.image ? (
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url(${background.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: deviceType === "mobile" ? "scroll" : "fixed",
            opacity: theme.backgroundOpacity / 100,
            filter: `blur(${theme.backgroundBlur}px)`,
          }}
        />
      ) : null}

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

      {/* Modern Header */}
      <div
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background:
            theme.enableGradients && theme.headerStyle === "gradient"
              ? `linear-gradient(135deg, ${theme.primaryColor}f0, ${theme.secondaryColor}f0)`
              : theme.headerStyle === "solid"
              ? `${theme.primaryColor}f0`
              : "rgba(255,255,255,0.9)",
          color: theme.buttonTextColor,
          minHeight: `${theme.headerHeight}px`,
          boxShadow: theme.enableShadows
            ? "0 2px 20px rgba(0,0,0,0.1)"
            : "none",
        }}
      >
        <div
          className="container mx-auto h-full flex justify-between items-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3"
          style={{
            maxWidth: `${theme.maxWidth}px`,
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {theme.showLogo && restaurant.logoUrl && (
              <div
                className="bg-white rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/50"
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
            <div className="min-w-0 flex-1">
              <h1
                className="font-bold truncate text-sm sm:text-base lg:text-lg"
                style={{
                  fontFamily: theme.headingFont,
                  fontWeight: theme.headingWeight,
                }}
              >
                {restaurant.name}
              </h1>
              <p className="text-xs sm:text-sm truncate opacity-90">
                Table {table.number}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 sm:p-2.5 rounded-full backdrop-blur-sm ${transitionClass}`}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: theme.buttonTextColor,
              }}
            >
              {showSearch ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {canOrder && cartItemCount > 0 && (
              <button
                onClick={() => setCartOpen(true)}
                className={`relative rounded-full p-2 sm:p-2.5 shadow-lg backdrop-blur-sm ${transitionClass}`}
                style={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  color: theme.primaryColor,
                }}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span
                  className="absolute -top-1 -right-1 text-white text-[10px] sm:text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold shadow-lg"
                  style={{ backgroundColor: theme.errorColor }}
                >
                  {cartItemCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-3 sm:px-4 lg:px-6 pb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="w-full px-4 py-2.5 rounded-full text-sm border-0 shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                color: theme.textColor,
              }}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Category Navigation - Horizontal Scroll */}
      <div
        className="sticky z-40 backdrop-blur-md overflow-x-auto scrollbar-hide"
        style={{
          top: `${theme.headerHeight}px`,
          backgroundColor: `${theme.cardBackground}f0`,
          borderBottom: `1px solid ${theme.borderColor}`,
          boxShadow: theme.enableShadows
            ? "0 2px 10px rgba(0,0,0,0.05)"
            : "none",
        }}
      >
        <div
          className="container mx-auto flex gap-2 py-2.5 sm:py-3 px-3 sm:px-4 lg:px-6"
          style={{
            maxWidth: `${theme.maxWidth}px`,
          }}
        >
          {categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(category.id)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 font-medium whitespace-nowrap text-xs sm:text-sm rounded-full flex-shrink-0 ${transitionClass}`}
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
                boxShadow:
                  selectedCategory === category.id && theme.enableShadows
                    ? "0 4px 12px rgba(0,0,0,0.15)"
                    : "none",
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items - Section Based Layout */}
      <div
        className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-6"
        style={{
          maxWidth: `${theme.maxWidth}px`,
          gap: `${theme.sectionSpacing}px`,
        }}
      >
        {(searchQuery ? filteredCategories : categories).map(
          (category: any) => (
            <section
              key={category.id}
              ref={(el: HTMLDivElement | null) => {
                categoryRefs.current[category.id] = el;
              }}
              className="scroll-mt-32"
              style={{
                marginBottom: `${theme.sectionSpacing}px`,
              }}
            >
              {/* Category Header */}
              <div className="mb-4 sm:mb-6">
                <h2
                  className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2"
                  style={{
                    fontFamily: theme.headingFont,
                    color: theme.primaryColor,
                    fontWeight: theme.headingWeight,
                  }}
                >
                  {category.name}
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </h2>
                {category.description && theme.showDescription && (
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: theme.accentColor }}
                  >
                    {category.description}
                  </p>
                )}
              </div>

              {/* Items Grid */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns:
                    theme.layout === "grid" ? `repeat(${columns}, 1fr)` : "1fr",
                  gap: `${theme.gap}px`,
                }}
              >
                {category.items.map((item: any) => {
                  const quantity = getItemQuantity(item.id);
                  return (
                    <Card
                      key={item.id}
                      className={`overflow-hidden ${hoverClass} ${transitionClass}`}
                      style={{
                        backgroundColor: theme.cardBackground,
                        boxShadow: theme.enableShadows
                          ? theme.cardShadow
                          : "none",
                        borderRadius: `${theme.borderRadius}px`,
                        padding: `${theme.cardPadding}px`,
                        border: theme.cardBorder
                          ? `${theme.cardBorderWidth}px solid ${theme.borderColor}`
                          : "none",
                      }}
                    >
                      <CardContent className="p-0">
                        <div
                          className="flex flex-col h-full"
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
                              {theme.showBadges && (
                                <div className="absolute top-2 right-2 flex flex-col gap-1">
                                  {item.isVegetarian && (
                                    <span
                                      className="text-[10px] sm:text-xs px-2 py-1 rounded-full backdrop-blur-sm inline-flex items-center gap-1 shadow-lg"
                                      style={{
                                        backgroundColor: `${theme.successColor}`,
                                        color: "#fff",
                                      }}
                                    >
                                      <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </span>
                                  )}
                                  {item.spiceLevel > 0 && (
                                    <span
                                      className="text-[10px] sm:text-xs px-2 py-1 rounded-full backdrop-blur-sm inline-flex items-center gap-1 shadow-lg"
                                      style={{
                                        backgroundColor: `${theme.errorColor}`,
                                        color: "#fff",
                                      }}
                                    >
                                      <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex flex-col gap-1 flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <h3
                                className="font-semibold text-xs sm:text-sm lg:text-base line-clamp-2"
                                style={{
                                  color: theme.textColor,
                                  fontFamily: theme.headingFont,
                                  fontWeight: theme.headingWeight,
                                }}
                              >
                                {item.name}
                              </h3>
                              {theme.showPrices && (
                                <span
                                  className="font-bold whitespace-nowrap text-xs sm:text-sm lg:text-base flex-shrink-0"
                                  style={{
                                    color: theme.primaryColor,
                                  }}
                                >
                                  {formatCurrency(item.price)}
                                </span>
                              )}
                            </div>

                            {theme.showDescription && item.description && (
                              <p
                                className="text-[10px] sm:text-xs lg:text-sm line-clamp-2"
                                style={{
                                  color: theme.accentColor,
                                }}
                              >
                                {item.description}
                              </p>
                            )}

                            {canOrder && (
                              <div className="flex items-center gap-2 mt-auto pt-2">
                                {quantity === 0 ? (
                                  <Button
                                    onClick={() => addToCart(item)}
                                    size="sm"
                                    className={`w-full text-[10px] sm:text-xs lg:text-sm ${transitionClass}`}
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
                                      padding: "8px 12px",
                                    }}
                                  >
                                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 mr-1" />
                                    Add
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-1.5 sm:gap-2 w-full">
                                    <Button
                                      onClick={() => removeFromCart(item.id)}
                                      size="sm"
                                      variant="outline"
                                      className={`flex-1 ${transitionClass}`}
                                      style={{
                                        borderColor: theme.primaryColor,
                                        color: theme.primaryColor,
                                        borderRadius: `${theme.buttonRadius}px`,
                                        padding: "8px",
                                      }}
                                    >
                                      <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                                    </Button>
                                    <span
                                      className="font-bold px-2 sm:px-3 text-xs sm:text-sm lg:text-base"
                                      style={{
                                        color: theme.textColor,
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
                                        padding: "8px",
                                      }}
                                    >
                                      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
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
            </section>
          )
        )}
      </div>

      {/* Cart Component */}
      {canOrder && (
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

      {/* Mobile Floating Cart Button */}
      {!cartOpen && canOrder && tableStatus.joined && cartItemCount > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 backdrop-blur-md z-50 safe-area-bottom"
          style={{
            background: `${theme.cardBackground}f5`,
            borderTop: `1px solid ${theme.borderColor}`,
            boxShadow: theme.enableShadows
              ? "0 -4px 20px rgba(0,0,0,0.1)"
              : "none",
          }}
        >
          <Button
            onClick={() => setCartOpen(true)}
            className={`w-full text-sm sm:text-base font-semibold ${transitionClass} shadow-lg`}
            size="lg"
            style={{
              backgroundColor: theme.primaryColor,
              color: theme.buttonTextColor,
              borderRadius: `${theme.buttonRadius}px`,
              padding: "14px 20px",
            }}
          >
            <ShoppingCart className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
            View Cart ({cartItemCount}) • {formatCurrency(cartTotal)}
          </Button>
        </div>
      )}

      {/* Custom CSS */}
      {theme.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: theme.customCSS }} />
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        @media (max-width: 640px) {
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
}
