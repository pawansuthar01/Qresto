"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRestaurant } from "@/hooks/useRestaurant";
import { usePermissions } from "@/hooks/usePermissions";

interface QRCardProps {
  qrCode: any;
  restaurantId: string;
}

export function QRCard({ qrCode, restaurantId }: QRCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canDelete = hasPermission("qrcode.delete");

  const deleteQRCode = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/qrcodes/${qrCode.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete QR code");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrcodes", restaurantId] });
      toast({
        title: "Success",
        description: "QR code deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete QR code",
        variant: "destructive",
      });
    },
  });

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCode.imageData;
    link.download = `table-${qrCode.table.number}-qr.png`;
    link.click();
  };

  const menuUrl = `${window.location.origin}/q/${qrCode.shortCode}`;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Table {qrCode.table.number}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <img
            src={qrCode.imageData}
            alt={`QR Code for Table ${qrCode.table.number}`}
            className="mx-auto w-full max-w-xs"
          />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Scans: {qrCode.scans}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(menuUrl, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </div>
            {canDelete && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the QR code for Table{" "}
              {qrCode.table.number}. Customers won't be able to access the menu
              using this QR code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteQRCode.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
