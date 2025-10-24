"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QrCode } from "lucide-react";

interface QRCodeBulkGeneratorProps {
  restaurantId: string;
  onData: (data: any[]) => void;
}

export function QRCodeBulkGenerator({
  restaurantId,
  onData,
}: QRCodeBulkGeneratorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateBulk = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/qrcodes/generate-bulk`,
        { method: "POST" }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate QR codes");
      }
      const resData = res.json();
      return resData;
    },
    onSuccess: (data) => {
      onData(data?.qrCodes);

      queryClient.invalidateQueries({ queryKey: ["qrcodes", restaurantId] });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate QR codes",
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => generateBulk.mutate()}
      disabled={generateBulk.isPending}
    >
      <QrCode className="mr-2 h-4 w-4" />
      {generateBulk.isPending
        ? "Generating..."
        : "Generate All Missing QR Codes"}
    </Button>
  );
}
