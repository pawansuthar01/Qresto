import { CartItem, EnhancedTheme } from "@/types";
import { useState } from "react";

interface CartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  total: number;
  shortCode: string;
  tableName: string;
  theme?: EnhancedTheme;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export default function EnhancedCart({
  open,
  onOpenChange,
  cart,
  setCart,
  shortCode,

  tableName,
  theme = {},
}: CartProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [customTip, setCustomTip] = useState("");

  // Theme defaults
  const t = {
    primaryColor: theme.primaryColor || "#3b82f6",
    secondaryColor: theme.secondaryColor || "#1e40af",
    accentColor: theme.accentColor || "#64748b",
    backgroundColor: theme.backgroundColor || "#ffffff",
    textColor: theme.textColor || "#1f2937",
    buttonTextColor: theme.buttonTextColor || "#ffffff",
    cardBackground: theme.cardBackground || "#ffffff",
    borderColor: theme.borderColor || "#e5e7eb",
    successColor: theme.successColor || "#10b981",
    errorColor: theme.errorColor || "#ef4444",
    labelColor: theme.labelColor || "#374151",
    fontFamily: theme.fontFamily || "Inter, sans-serif",
    fontSize: theme.fontSize || 14,
    lineHeight: theme.lineHeight || 1.5,
    headingFont: theme.headingFont || "Inter, sans-serif",
    headingWeight: theme.headingWeight || 700,
    cardPadding: theme.cardPadding || 16,
    borderRadius: theme.borderRadius || 12,
    buttonRadius: theme.buttonRadius || 8,
    inputRadius: theme.inputRadius || 6,
    cardShadow: theme.cardShadow || "0 2px 8px rgba(0,0,0,0.1)",
    enableAnimations: theme.enableAnimations !== false,
    cartWidth: theme.cartWidth || "normal",
    showItemImages: theme.showItemImages !== false,
    showItemBadges: theme.showItemBadges !== false,
    cartLayout: theme.cartLayout || "comfortable",
  };

  // Cart calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const taxRate = 0.05;
  const tax = theme.showTax ? subtotal * taxRate : 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const tipAmount =
    selectedTip > 0 ? selectedTip : customTip ? parseFloat(customTip) || 0 : 0;
  const finalTotal = subtotal + tax - discount + tipAmount;

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.menuItem.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setCart(cart.filter((item) => item.menuItem.id !== itemId));
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "save10") {
      setAppliedCoupon({ code: couponCode, discount: subtotal * 0.1 });
      setCouponCode("");
    } else {
      alert("Invalid coupon code. Try 'SAVE10'");
    }
  };
  console.log(cart);
  console.log(specialInstructions);
  const handlePlaceOrder = async () => {
    if (!cart.length) return;

    setLoading(true);
    setError("");
    const response = await fetch(`/api/q/${shortCode}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
        })),
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        notes: specialInstructions,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to place order");
    }

    try {
      setSuccess(true);
      setTimeout(() => {
        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        setSpecialInstructions("");
        setAppliedCoupon(null);
        setSelectedTip(0);
        setCustomTip("");
        setSuccess(false);
        onOpenChange(false);
      }, 2500);
    } catch (err) {
      setError("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const widthClass =
    t.cartWidth === "narrow"
      ? "max-w-md"
      : t.cartWidth === "wide"
      ? "max-w-2xl"
      : "max-w-lg";

  const paddingClass =
    t.cartLayout === "compact"
      ? "p-3"
      : t.cartLayout === "spacious"
      ? "p-6"
      : "p-4";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      onClick={() => onOpenChange(false)}
    >
      <div
        className={`${widthClass} w-full bg-white rounded-xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col`}
        style={{
          fontFamily: t.fontFamily,
          fontSize: `${t.fontSize}px`,
          lineHeight: t.lineHeight,
          borderRadius: `${t.borderRadius}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b"
          style={{
            padding: `${t.cardPadding}px`,
            borderColor: t.borderColor,
            background: theme.enableGradients
              ? `linear-gradient(135deg, ${t.primaryColor}, ${t.secondaryColor})`
              : t.primaryColor,
            color: t.buttonTextColor,
          }}
        >
          <div className="flex items-center gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <div>
              <h2
                style={{
                  fontFamily: t.headingFont,
                  fontWeight: t.headingWeight,
                  fontSize: "1.25rem",
                }}
              >
                Your Cart
              </h2>
              <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                {tableName} • {cart.length}{" "}
                {cart.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-white/20 transition"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${paddingClass}`}>
          {success ? (
            <div className="py-16 text-center">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke={t.successColor}
                strokeWidth="2"
                className="mx-auto mb-4"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: t.successColor, fontFamily: t.headingFont }}
              >
                Order Placed Successfully! 🎉
              </h3>
              <p style={{ color: t.accentColor, fontSize: "1rem" }}>
                Your order has been sent to the kitchen
              </p>
              {theme.showEstimatedTime && (
                <div
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: `${t.primaryColor}20`,
                    color: t.primaryColor,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="font-semibold">Estimated: 15-20 mins</span>
                </div>
              )}
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="mb-4 p-4 rounded-lg flex items-center gap-3"
                  style={{
                    backgroundColor: `${t.errorColor}20`,
                    color: t.errorColor,
                    borderRadius: `${t.inputRadius}px`,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={t.accentColor}
                    strokeWidth="2"
                    className="mx-auto mb-4 opacity-30"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <p style={{ color: t.accentColor, fontSize: "1.125rem" }}>
                    Your cart is empty
                  </p>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="mt-4 px-6 py-2 rounded-lg font-medium"
                    style={{
                      backgroundColor: t.primaryColor,
                      color: t.buttonTextColor,
                      borderRadius: `${t.buttonRadius}px`,
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className={`rounded-lg border ${
                          t.enableAnimations
                            ? "transition-transform hover:scale-102"
                            : ""
                        }`}
                        style={{
                          padding: `${t.cardPadding}px`,
                          borderColor: t.borderColor,
                          backgroundColor: t.cardBackground,
                          borderRadius: `${t.borderRadius}px`,
                          boxShadow: t.cardShadow,
                        }}
                      >
                        <div className="flex gap-3">
                          {t.showItemImages && item.menuItem.imageUrl && (
                            <div
                              className="flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden"
                              style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: `${t.inputRadius}px`,
                              }}
                            >
                              <img
                                src={item.menuItem.imageUrl}
                                alt={item.menuItem.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4
                                  className="font-semibold"
                                  style={{
                                    color: t.textColor,
                                    fontFamily: t.headingFont,
                                  }}
                                >
                                  {item.menuItem.name}
                                </h4>
                                {item.menuItem.category && (
                                  <p
                                    className="text-sm"
                                    style={{ color: t.accentColor }}
                                  >
                                    {item.menuItem.category}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(item.menuItem.id)}
                                className="p-1 rounded hover:bg-red-50 transition"
                                style={{ color: t.errorColor }}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>

                            {t.showItemBadges && (
                              <div className="flex gap-2 mt-2">
                                {item.menuItem.isVegetarian && (
                                  <span
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{
                                      backgroundColor: `${t.successColor}20`,
                                      color: t.successColor,
                                    }}
                                  >
                                    🌱 Veg
                                  </span>
                                )}
                                {item.menuItem.spiceLevel &&
                                  item.menuItem.spiceLevel > 0 && (
                                    <span
                                      className="text-xs px-2 py-1 rounded-full"
                                      style={{
                                        backgroundColor: `${t.errorColor}20`,
                                        color: t.errorColor,
                                      }}
                                    >
                                      🌶️ Spicy
                                    </span>
                                  )}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.menuItem.id, -1)
                                  }
                                  className="p-1 rounded border"
                                  style={{
                                    borderColor: t.borderColor,
                                    color: t.primaryColor,
                                  }}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                </button>
                                <span
                                  className="font-semibold w-8 text-center"
                                  style={{ color: t.textColor }}
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.menuItem.id, 1)
                                  }
                                  className="p-1 rounded"
                                  style={{
                                    backgroundColor: t.primaryColor,
                                    color: t.buttonTextColor,
                                  }}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                </button>
                              </div>
                              <span
                                className="font-bold"
                                style={{ color: t.primaryColor }}
                              >
                                {formatCurrency(
                                  item.menuItem.price * item.quantity
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Section */}
                  {theme.enableCoupon && !appliedCoupon && (
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        borderColor: t.borderColor,
                        backgroundColor: `${t.primaryColor}05`,
                        borderRadius: `${t.borderRadius}px`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={t.primaryColor}
                          strokeWidth="2"
                        >
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        <span
                          className="font-semibold"
                          style={{ color: t.textColor }}
                        >
                          Have a coupon?
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter code (try SAVE10)"
                          className="flex-1 px-3 py-2 border rounded"
                          style={{
                            borderColor: t.borderColor,
                            borderRadius: `${t.inputRadius}px`,
                          }}
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-4 py-2 rounded font-medium"
                          style={{
                            backgroundColor: t.primaryColor,
                            color: t.buttonTextColor,
                            borderRadius: `${t.buttonRadius}px`,
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div
                      className="p-3 rounded-lg flex items-center justify-between"
                      style={{
                        backgroundColor: `${t.successColor}20`,
                        borderRadius: `${t.borderRadius}px`,
                      }}
                    >
                      <span style={{ color: t.successColor, fontWeight: 600 }}>
                        ✓ Coupon "{appliedCoupon.code}" applied!
                      </span>
                      <button
                        onClick={() => setAppliedCoupon(null)}
                        className="text-sm underline"
                        style={{ color: t.successColor }}
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Tips Section */}
                  {theme.enableTips && (
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        borderColor: t.borderColor,
                        borderRadius: `${t.borderRadius}px`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={t.primaryColor}
                          strokeWidth="2"
                        >
                          <polyline points="20 12 20 22 4 22 4 12" />
                          <rect x="2" y="7" width="20" height="5" />
                          <line x1="12" y1="22" x2="12" y2="7" />
                          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                        </svg>
                        <span
                          className="font-semibold"
                          style={{ color: t.textColor }}
                        >
                          Add a tip for the staff
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {[10, 20, 50, 100].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => {
                              setSelectedTip(amount);
                              setCustomTip("");
                            }}
                            className="py-2 rounded border font-medium"
                            style={{
                              borderColor:
                                selectedTip === amount
                                  ? t.primaryColor
                                  : t.borderColor,
                              backgroundColor:
                                selectedTip === amount
                                  ? `${t.primaryColor}20`
                                  : "transparent",
                              color:
                                selectedTip === amount
                                  ? t.primaryColor
                                  : t.textColor,
                              borderRadius: `${t.inputRadius}px`,
                            }}
                          >
                            ₹{amount}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={customTip}
                        onChange={(e) => {
                          setCustomTip(e.target.value);
                          setSelectedTip(0);
                        }}
                        placeholder="Custom amount"
                        className="w-full px-3 py-2 border rounded"
                        style={{
                          borderColor: t.borderColor,
                          borderRadius: `${t.inputRadius}px`,
                        }}
                      />
                    </div>
                  )}

                  {/* Customer Details */}
                  <div className="space-y-3">
                    <div>
                      <label
                        className="block mb-1 font-medium text-sm flex items-center gap-1"
                        style={{ color: t.labelColor }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border rounded"
                        style={{
                          borderColor: t.borderColor,
                          borderRadius: `${t.inputRadius}px`,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1 font-medium text-sm flex items-center gap-1"
                        style={{ color: t.labelColor }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 border rounded"
                        style={{
                          borderColor: t.borderColor,
                          borderRadius: `${t.inputRadius}px`,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1 font-medium text-sm flex items-center gap-1"
                        style={{ color: t.labelColor }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Any special requests..."
                        rows={2}
                        className="w-full px-3 py-2 border rounded resize-none"
                        style={{
                          borderColor: t.borderColor,
                          borderRadius: `${t.inputRadius}px`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div
                    className="p-4 rounded-lg space-y-2"
                    style={{
                      backgroundColor: `${t.accentColor}10`,
                      borderRadius: `${t.borderRadius}px`,
                    }}
                  >
                    {theme.showSubtotal && (
                      <div className="flex justify-between">
                        <span style={{ color: t.accentColor }}>Subtotal</span>
                        <span style={{ color: t.textColor }}>
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                    )}
                    {theme.showTax && (
                      <div className="flex justify-between">
                        <span style={{ color: t.accentColor }}>GST (5%)</span>
                        <span style={{ color: t.textColor }}>
                          {formatCurrency(tax)}
                        </span>
                      </div>
                    )}
                    {theme.showDiscount && appliedCoupon && (
                      <div
                        className="flex justify-between"
                        style={{ color: t.successColor }}
                      >
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    {theme.enableTips && tipAmount > 0 && (
                      <div className="flex justify-between">
                        <span style={{ color: t.accentColor }}>Tip</span>
                        <span style={{ color: t.textColor }}>
                          {formatCurrency(tipAmount)}
                        </span>
                      </div>
                    )}
                    <div
                      className="flex justify-between text-lg font-bold pt-2 border-t"
                      style={{ borderColor: t.borderColor }}
                    >
                      <span style={{ color: t.textColor }}>Total</span>
                      <span style={{ color: t.primaryColor }}>
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                    style={{
                      backgroundColor: loading ? t.accentColor : t.primaryColor,
                      color: t.buttonTextColor,
                      borderRadius: `${t.buttonRadius}px`,
                      fontSize: "1.125rem",
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="2" x2="12" y2="6" />
                          <line x1="12" y1="18" x2="12" y2="22" />
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                          <line x1="2" y1="12" x2="6" y2="12" />
                          <line x1="18" y1="12" x2="22" y2="12" />
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                        </svg>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="1"
                            y="4"
                            width="22"
                            height="16"
                            rx="2"
                            ry="2"
                          />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        Place Order • {formatCurrency(finalTotal)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
