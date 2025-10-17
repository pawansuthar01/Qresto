// src/app/owner/restaurants/[id]/qrcodes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { QRCard } from "@/components/qr/QRCard";
import { QRCodeBulkGenerator } from "@/components/qr/QRCodeBulkGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRestaurant } from "@/hooks/useRestaurant";
import { usePermissions } from "@/hooks/usePermissions";
import { Search, Filter, ChevronDown, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function QRCodesPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);

  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    tableId: "",
  });

  const canRead = hasPermission("qrcode.read");
  const canGenerate = hasPermission("qrcode.generate");

  const fetchQRCodes = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.tableId && { tableId: filters.tableId }),
      });

      const res = await fetch(
        `/api/restaurants/${restaurantId}/qrcodes?${queryParams}`
      );

      if (!res.ok) throw new Error("Failed to fetch QR codes");

      const data = await res.json();
      setQrCodes(data.qrCodes || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch QR codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchQRCodes(1);
    }
  }, [restaurantId, filters]);

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    fetchQRCodes(newPage);
  };

  const downloadAllQRCodes = async () => {
    try {
      // Fetch all QR codes without pagination
      const res = await fetch(
        `/api/restaurants/${restaurantId}/qrcodes?limit=1000`
      );
      if (!res.ok) throw new Error("Failed to fetch QR codes");

      const data = await res.json();
      const allQRCodes = data.qrCodes || [];

      // Create a downloadable file with all QR codes
      const qrData = allQRCodes.map((qr: any) => ({
        table: qr.table?.number,
        shortCode: qr.shortCode,
        url: `${window.location.origin}/q/${qr.shortCode}`,
        dataUrl: qr.dataUrl,
      }));

      const blob = new Blob([JSON.stringify(qrData, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-codes-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "QR codes exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export QR codes",
        variant: "destructive",
      });
    }
  };

  if (!canRead) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            You don't have permission to view QR codes
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">QR Codes</h1>
            <p className="text-muted-foreground">
              Total: {pagination.total} QR codes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadAllQRCodes}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            {canGenerate && (
              <QRCodeBulkGenerator
                restaurantId={restaurantId}
                onData={(data) => {
                  setQrCodes([...qrCodes, data]);
                }}
              />
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by table number or short code..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown
                className={`w-4 h-4 ml-2 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Filter by Table</Label>
                  <select
                    value={filters.tableId}
                    onChange={(e) =>
                      setFilters({ ...filters, tableId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Tables</option>
                    {restaurant?.tables?.map((table: any) => (
                      <option key={table.id} value={table.id}>
                        Table {table.number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => setFilters({ search: "", tableId: "" })}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QR Codes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : qrCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <p className="mb-4 text-muted-foreground">
              No QR codes found. Create tables first to generate QR codes.
            </p>
            {canGenerate && (
              <QRCodeBulkGenerator
                restaurantId={restaurantId}
                onData={(data) => {
                  setQrCodes([...qrCodes, data]);
                }}
              />
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {qrCodes.map((qrCode: any) => (
                <QRCard
                  key={qrCode.id}
                  qrCode={qrCode}
                  restaurantId={restaurantId}
                />
              ))}
            </div>

            {/* Pagination */}
            <Card>
              <CardContent className="p-4">
                <PaginationControls
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  showFirstLast={true}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
