import { CartItem, EnhancedTheme } from "@/types";
import { useState } from "react";
import {
  X,
  Minus,
  Plus,
  Trash2,
  Tag,
  Gift,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";

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
    enableGradients: theme.enableGradients !== false,
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

  const handlePlaceOrder = async () => {
    if (!cart.length) return;

    setLoading(true);
    setError("");

    try {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      onClick={() => onOpenChange(false)}
    >
      <div
        className={`${widthClass} w-full bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slide-up`}
        style={{
          fontFamily: t.fontFamily,
          fontSize: `${t.fontSize}px`,
          lineHeight: t.lineHeight,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b sticky top-0 z-10"
          style={{
            padding: "16px 20px",
            borderColor: t.borderColor,
            background: t.enableGradients
              ? `linear-gradient(135deg, ${t.primaryColor}, ${t.secondaryColor})`
              : t.primaryColor,
            color: t.buttonTextColor,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <div>
              <h2
                className="text-lg sm:text-xl font-bold"
                style={{
                  fontFamily: t.headingFont,
                  fontWeight: t.headingWeight,
                }}
              >
                Your Cart
              </h2>
              <p className="text-xs sm:text-sm opacity-90">
                {tableName} • {cart.length}{" "}
                {cart.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {success ? (
            <div className="py-12 sm:py-16 px-6 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle
                  className="w-12 h-12 sm:w-14 sm:h-14"
                  style={{ color: t.successColor }}
                />
              </div>
              <h3
                className="text-2xl sm:text-3xl font-bold mb-3"
                style={{ color: t.successColor, fontFamily: t.headingFont }}
              >
                Order Placed! 🎉
              </h3>
              <p
                className="text-base sm:text-lg mb-6"
                style={{ color: t.accentColor }}
              >
                Your order has been sent to the kitchen
              </p>
              {theme.showEstimatedTime && (
                <div
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full"
                  style={{
                    backgroundColor: `${t.primaryColor}20`,
                    color: t.primaryColor,
                  }}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-sm">
                    Estimated: 15-20 mins
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              {error && (
                <div
                  className="p-4 rounded-xl flex items-center gap-3"
                  style={{
                    backgroundColor: `${t.errorColor}20`,
                    color: t.errorColor,
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
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="py-12 sm:py-16 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={t.accentColor}
                      strokeWidth="2"
                      className="opacity-40"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </div>
                  <p className="text-lg mb-6" style={{ color: t.accentColor }}>
                    Your cart is empty
                  </p>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="px-8 py-3 rounded-xl font-semibold text-sm"
                    style={{
                      backgroundColor: t.primaryColor,
                      color: t.buttonTextColor,
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3 sm:space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="rounded-xl border transition-all hover:shadow-md"
                        style={{
                          padding: "12px",
                          borderColor: t.borderColor,
                          backgroundColor: t.cardBackground,
                        }}
                      >
                        <div className="flex gap-3">
                          {t.showItemImages && item.menuItem.imageUrl && (
                            <div
                              className="flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                              style={{
                                width: "70px",
                                height: "70px",
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
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4
                                  className="font-semibold text-sm sm:text-base truncate"
                                  style={{
                                    color: t.textColor,
                                    fontFamily: t.headingFont,
                                  }}
                                >
                                  {item.menuItem.name}
                                </h4>
                                {item.menuItem.category && (
                                  <p
                                    className="text-xs"
                                    style={{ color: t.accentColor }}
                                  >
                                    {item.menuItem.category}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(item.menuItem.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 transition flex-shrink-0"
                                style={{ color: t.errorColor }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {t.showItemBadges && (
                              <div className="flex gap-1.5 mb-2">
                                {item.menuItem.isVegetarian && (
                                  <span
                                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
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
                                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
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

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.menuItem.id, -1)
                                  }
                                  className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white transition"
                                  style={{
                                    color: t.primaryColor,
                                  }}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span
                                  className="font-semibold w-8 text-center text-sm"
                                  style={{ color: t.textColor }}
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.menuItem.id, 1)
                                  }
                                  className="w-7 h-7 rounded-md flex items-center justify-center transition"
                                  style={{
                                    backgroundColor: t.primaryColor,
                                    color: t.buttonTextColor,
                                  }}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span
                                className="font-bold text-sm sm:text-base"
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
                      className="p-4 rounded-xl border"
                      style={{
                        borderColor: t.borderColor,
                        backgroundColor: `${t.primaryColor}05`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Tag
                          className="w-4 h-4"
                          style={{ color: t.primaryColor }}
                        />
                        <span
                          className="font-semibold text-sm"
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
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                          style={{
                            borderColor: t.borderColor,
                          }}
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap"
                          style={{
                            backgroundColor: t.primaryColor,
                            color: t.buttonTextColor,
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div
                      className="p-3 rounded-xl flex items-center justify-between"
                      style={{
                        backgroundColor: `${t.successColor}20`,
                      }}
                    >
                      <span
                        className="text-sm font-semibold"
                        style={{ color: t.successColor }}
                      >
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
                      className="p-4 rounded-xl border"
                      style={{
                        borderColor: t.borderColor,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Gift
                          className="w-4 h-4"
                          style={{ color: t.primaryColor }}
                        />
                        <span
                          className="font-semibold text-sm"
                          style={{ color: t.textColor }}
                        >
                          Add a tip for the staff
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[10, 20, 50, 100].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => {
                              setSelectedTip(amount);
                              setCustomTip("");
                            }}
                            className="py-2 rounded-lg border font-medium text-sm transition"
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
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        style={{
                          borderColor: t.borderColor,
                        }}
                      />
                    </div>
                  )}

                  {/* Customer Details */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Name (Optional)"
                      className="w-full px-4 py-3 border rounded-xl text-sm"
                      style={{
                        borderColor: t.borderColor,
                      }}
                    />

                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Phone Number (Optional)"
                      className="w-full px-4 py-3 border rounded-xl text-sm"
                      style={{
                        borderColor: t.borderColor,
                      }}
                    />

                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Special Instructions (Optional)"
                      rows={2}
                      className="w-full px-4 py-3 border rounded-xl resize-none text-sm"
                      style={{
                        borderColor: t.borderColor,
                      }}
                    />
                  </div>

                  {/* Price Breakdown */}
                  <div
                    className="p-4 rounded-xl space-y-2.5"
                    style={{
                      backgroundColor: `${t.accentColor}10`,
                    }}
                  >
                    {theme.showSubtotal && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: t.accentColor }}>Subtotal</span>
                        <span
                          style={{ color: t.textColor }}
                          className="font-medium"
                        >
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                    )}
                    {theme.showTax && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: t.accentColor }}>GST (5%)</span>
                        <span
                          style={{ color: t.textColor }}
                          className="font-medium"
                        >
                          {formatCurrency(tax)}
                        </span>
                      </div>
                    )}
                    {theme.showDiscount && appliedCoupon && (
                      <div
                        className="flex justify-between text-sm font-medium"
                        style={{ color: t.successColor }}
                      >
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    {theme.enableTips && tipAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: t.accentColor }}>Tip</span>
                        <span
                          style={{ color: t.textColor }}
                          className="font-medium"
                        >
                          {formatCurrency(tipAmount)}
                        </span>
                      </div>
                    )}
                    <div
                      className="flex justify-between text-base sm:text-lg font-bold pt-2.5 border-t"
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
                    className="w-full py-3.5 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition text-base sm:text-lg shadow-lg"
                    style={{
                      backgroundColor: loading ? t.accentColor : t.primaryColor,
                      color: t.buttonTextColor,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>Place Order • {formatCurrency(finalTotal)}</>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @media (min-width: 640px) {
          .animate-slide-up {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
