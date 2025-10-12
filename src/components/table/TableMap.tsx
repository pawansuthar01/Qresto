"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, QrCode, Users } from "lucide-react";

interface TableMapProps {
  tables: any[];
  restaurantId: string;
}

export function TableMap({ tables }: TableMapProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tables.map((table) => (
        <Card key={table.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Table {table.number}
              </span>
              {table.qrCodes.length !== 0 && (
                <Badge variant="secondary">
                  <QrCode className="mr-1 h-3 w-3" />
                  QR
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Capacity: {table.capacity} people</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
