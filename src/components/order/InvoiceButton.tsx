"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRestaurant } from "@/hooks/useRestaurant";
import { usePermissions } from "@/hooks/usePermissions";

interface InvoiceButtonProps {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
}

export function InvoiceButton({
  orderId,
  orderNumber,
  restaurantId,
}: InvoiceButtonProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);

  const canGenerate = hasPermission("invoice.generate");
  const canDownload = hasPermission("invoice.download");

  const handleView = async () => {
    if (!canGenerate) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to generate invoices",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/orders/${orderId}/invoice`
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate invoice");
      }

      const invoice = await res.json();

      // Open invoice in new window
      const invoiceWindow = window.open("", "_blank");
      if (invoiceWindow) {
        invoiceWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${orderNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f5f5f5; font-weight: 600; }
                .totals { margin-left: auto; width: 300px; }
                .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #333; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>INVOICE</h1>
                <p>Invoice #: ${invoice.invoiceNumber}</p>
                <p>Date: ${new Date(
                  invoice.invoiceDate
                ).toLocaleDateString()}</p>
              </div>
              
              <div class="info">
                <div>
                  <h3>From</h3>
                  <p><strong>${invoice.restaurant.name}</strong></p>
                  ${
                    invoice.restaurant.address
                      ? `<p>${invoice.restaurant.address}</p>`
                      : ""
                  }
                  ${
                    invoice.restaurant.phone
                      ? `<p>${invoice.restaurant.phone}</p>`
                      : ""
                  }
                </div>
                <div>
                  <h3>Bill To</h3>
                  <p><strong>${invoice.customer.name}</strong></p>
                  <p>Table: ${invoice.customer.table}</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: right">Qty</th>
                    <th style="text-align: right">Price</th>
                    <th style="text-align: right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items
                    .map(
                      (item: any) => `
                    <tr>
                      <td>${item.name}</td>
                      <td style="text-align: right">${item.quantity}</td>
                      <td style="text-align: right">₹${item.price.toFixed(
                        2
                      )}</td>
                      <td style="text-align: right">₹${item.total.toFixed(
                        2
                      )}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>

              <table class="totals">
                <tr>
                  <td>Subtotal:</td>
                  <td style="text-align: right">₹${invoice.subtotal.toFixed(
                    2
                  )}</td>
                </tr>
                <tr>
                  <td>Tax (5%):</td>
                  <td style="text-align: right">₹${invoice.tax.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                  <td>Total:</td>
                  <td style="text-align: right">₹${invoice.total.toFixed(
                    2
                  )}</td>
                </tr>
              </table>

              ${
                invoice.notes
                  ? `<p><strong>Notes:</strong> ${invoice.notes}</p>`
                  : ""
              }

              <div style="text-align: center; margin-top: 40px;">
                <button onclick="window.print()" style="padding: 10px 30px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">
                  Print Invoice
                </button>
              </div>
            </body>
          </html>
        `);
        invoiceWindow.document.close();
      }

      toast({
        title: "Success",
        description: "Invoice generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!canDownload) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to download invoices",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/orders/${orderId}/invoice/download`
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to download invoice");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderNumber}.html`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!canGenerate && !canDownload) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {canGenerate && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleView}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              View Invoice
            </>
          )}
        </Button>
      )}

      {canDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download
            </>
          )}
        </Button>
      )}
    </div>
  );
}
