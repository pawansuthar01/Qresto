import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/permissions";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const permissions = restaurant.permissions as any;
    authorize(permissions, "invoice.download");

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
        restaurant: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate HTML invoice
    const invoiceHTML = generateInvoiceHTML(order);

    return new NextResponse(invoiceHTML, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.html"`,
      },
    });
  } catch (error: any) {
    console.error("Error downloading invoice:", error);
    if (error.message?.includes("Permission denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(order: any): string {
  const subtotal =
    typeof order.totalAmount === "number"
      ? order.totalAmount
      : order.items?.reduce(
          (sum: number, item: any) =>
            sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
          0
        ) || 0;

  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; padding: 40px; background: #f5f5f5; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 32px; color: #333; }
    .header .invoice-number { color: #666; font-size: 18px; margin-top: 5px; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .info-box h3 { font-size: 14px; color: #666; margin-bottom: 10px; text-transform: uppercase; }
    .info-box p { margin: 5px 0; color: #333; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead { background: #f8f8f8; }
    th { text-align: left; padding: 15px; font-weight: 600; color: #333; border-bottom: 2px solid #ddd; }
    td { padding: 15px; border-bottom: 1px solid #eee; }
    .text-right { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .totals tr td { padding: 10px 0; }
    .totals .total-row { font-size: 20px; font-weight: bold; border-top: 2px solid #333; padding-top: 15px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
    .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-SERVED { background: #22c55e; color: white; }
    .status-READY { background: #3b82f6; color: white; }
    .status-PREPARING { background: #f97316; color: white; }
    .status-PENDING { background: #eab308; color: white; }
    @media print {
      body { padding: 0; background: white; }
      .invoice { box-shadow: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <h1>INVOICE</h1>
      <div class="invoice-number">Invoice #: ${order.orderNumber}</div>
      <div class="invoice-number">Date: ${new Date(
        order.createdAt
      ).toLocaleDateString()}</div>
    </div>

    <div class="info-section">
      <div class="info-box">
        <h3>From</h3>
        <p><strong>${order.restaurant?.name || "Restaurant"}</strong></p>
        ${order.restaurant?.address ? `<p>${order.restaurant.address}</p>` : ""}
        ${
          order.restaurant?.phone
            ? `<p>Phone: ${order.restaurant.phone}</p>`
            : ""
        }
      </div>
      <div class="info-box">
        <h3>Bill To</h3>
        <p><strong>${order.customerName || "Guest Customer"}</strong></p>
        <p>Table: ${order.table?.number || "N/A"}</p>
        <p>Order Time: ${new Date(order.createdAt).toLocaleTimeString()}</p>
        <p>Status: <span class="status-badge status-${order.status}">${
    order.status
  }</span></p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${
          order.items
            ?.map((item: any) => {
              const price = Number(item.price) || 0;
              const qty = Number(item.quantity) || 0;
              const itemTotal = price * qty;
              return `
              <tr>
                <td>${item.menuItem?.name || "Unnamed Item"}</td>
                <td class="text-right">${qty}</td>
                <td class="text-right">₹${price.toFixed(2)}</td>
                <td class="text-right">₹${itemTotal.toFixed(2)}</td>
              </tr>
            `;
            })
            .join("") || ""
        }
      </tbody>
    </table>

    <table class="totals">
      <tr>
        <td>Subtotal:</td>
        <td class="text-right">₹${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Tax (5%):</td>
        <td class="text-right">₹${tax.toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td>Total Amount:</td>
        <td class="text-right">₹${total.toFixed(2)}</td>
      </tr>
    </table>

    ${
      order.notes
        ? `
      <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>Notes:</strong> ${order.notes}
      </div>
    `
        : ""
    }

    <div class="footer">
      <p>Thank you for dining with us!</p>
      <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>

    <div class="no-print" style="text-align: center; margin-top: 30px;">
      <button onclick="window.print()" style="padding: 12px 30px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
        Print Invoice
      </button>
    </div>
  </div>
</body>
</html>
  `;
}
