"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Loader2, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CartItem } from "@/types";

interface CartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  total: number;
  shortCode: string;
  tableName: string;
}

export default function Cart({
  open,
  onOpenChange,
  cart,
  setCart,
  total,
  shortCode,
  tableName,
}: CartProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const removeItem = (menuItemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

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
            notes: item.notes,
          })),
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
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
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Cart - {tableName}</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Order Placed!
            </h3>
            <p className="text-gray-600">
              Your order has been sent to the kitchen.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-600">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.menuItem.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.menuItem.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.menuItem.price)} ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">
                          {formatCurrency(item.menuItem.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.menuItem.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Your Name (Optional)</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center justify-between text-lg font-bold border-t pt-4">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      {formatCurrency(total)}
                    </span>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
