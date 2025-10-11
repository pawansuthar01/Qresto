"use client";

import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { QRCard } from "@/components/qr/QRCard";
import { QRCodeBulkGenerator } from "@/components/qr/QRCodeBulkGenerator";
import { useQuery } from "@tanstack/react-query";
import { useRestaurant } from "@/hooks/useRestaurant";
import { usePermissions } from "@/hooks/usePermissions";

export default function QRCodesPage() {
  const params = useParams();
  const restaurantId = params.rid as string;
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);

  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ["qrcodes", restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/restaurants/${restaurantId}/qrcodes`);
      if (!res.ok) throw new Error("Failed to fetch QR codes");
      return res.json();
    },
  });

  const canRead = hasPermission("qrcode.read");
  const canGenerate = hasPermission("qrcode.generate");

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">QR Codes</h1>
            <p className="text-muted-foreground">
              View and manage your table QR codes
            </p>
          </div>
          {canGenerate && <QRCodeBulkGenerator restaurantId={restaurantId} />}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading QR codes...</p>
          </div>
        ) : qrCodes?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <p className="mb-4 text-muted-foreground">
              No QR codes generated yet. Create tables first to generate QR
              codes.
            </p>
            {canGenerate && <QRCodeBulkGenerator restaurantId={restaurantId} />}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {qrCodes?.map((qrCode: any) => (
              <QRCard
                key={qrCode.id}
                qrCode={qrCode}
                restaurantId={restaurantId}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
