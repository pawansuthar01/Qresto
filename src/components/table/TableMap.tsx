"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, QrCode, Users } from "lucide-react";
import { useActiveUser } from "@/hooks/useActiveUsers";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { useUpdateTable } from "@/hooks/useTable";
import { toast } from "../ui/use-toast";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface TableMapProps {
  tables: any[];
  restaurantId: string;
}

interface TableCardProps {
  table: any;
  onChangeStatus: (args: {
    restaurantId: string;
    tableId: string;
    data: any;
  }) => void;
  onlyCapacityChange: string[];
}

function TableCard({
  table,
  onChangeStatus,
  onlyCapacityChange,
}: TableCardProps) {
  const { currentUsers, onlyCapacity, capacity } = useActiveUser(table);

  return (
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
      <div className="p-2 relative">
        <Button
          title="guest Resat"
          disabled={onlyCapacityChange.includes(table.id)}
          onClick={() =>
            onChangeStatus({
              restaurantId: table.restaurantId,
              tableId: table.id,
              data: { currentUsers: 0, joinGuests: [] },
            })
          }
          variant={"outline"}
          className={`${
            currentUsers <= 0 && "hidden"
          } absolute right-2 top-0 w-10 text-xs h-4 bg-red-300 border border-red-500 ${
            onlyCapacityChange.includes(table.id) && "animate-pulse"
          }`}
        >
          resat
        </Button>
        <div className=" font-normal text-sm space-y-1">
          <div className="flex gap-2">
            <p>Guest</p> : <p>{currentUsers}</p>
          </div>
          {onlyCapacity && (
            <div className="flex gap-1">
              <p>isFull</p> :{" "}
              <p>{currentUsers >= capacity ? "True" : "False"}</p>
            </div>
          )}
          <div className="m-0">
            <ToggleSwitch
              label="Guest only allowed table capacity "
              checked={onlyCapacity}
              loading={onlyCapacityChange.includes(table.id)}
              onChange={() =>
                onChangeStatus({
                  restaurantId: table.restaurantId,
                  tableId: table.id,
                  data: { onlyCapacity: !table.onlyCapacity },
                })
              }
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function TableMap({ tables }: TableMapProps) {
  const updateTable = useUpdateTable();
  const [tablesData, setTablesData] = useState<any[]>(tables || []);
  const [onlyCapacityChange, setOnlyCapacityChange] = useState<string[]>([]);

  const onChangeStatus = async ({
    restaurantId,
    data,
    tableId,
  }: {
    restaurantId: string;
    data: any;
    tableId: string;
  }) => {
    try {
      if (!restaurantId && !tableId) return;
      setOnlyCapacityChange((prev) => [...prev, tableId]);
      const res = await updateTable.mutateAsync({
        restaurantId,
        tableId,
        data,
      });
      if (!res?.ok) {
        toast({
          title: "Error",
          description: res.statusText || "Failed to update table",
          variant: "destructive",
        });
        setOnlyCapacityChange((prev) => prev.filter((id) => id !== tableId));
        return;
      }
      const updateTableData = await res?.json();
      setOnlyCapacityChange((prev) => prev.filter((id) => id !== tableId));
      if (updateTableData) {
        setTablesData((prev) => {
          const index = prev.findIndex((table) => table.id === tableId);
          if (index !== -1) {
            if (data?.onlyCapacity) {
              prev[index].onlyCapacity = updateTableData.onlyCapacity;
            }
            if (data?.currentUsers !== undefined) {
              prev[index].currentUsers = updateTableData.currentUsers;
              prev[index].joinGuests = updateTableData.joinGuests;
            }
          }
          return prev;
        });
      }
      toast({ title: "Success", description: "table updated successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update table",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setTablesData(tables);
  }, [tables]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tablesData.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onChangeStatus={onChangeStatus}
          onlyCapacityChange={onlyCapacityChange}
        />
      ))}
    </div>
  );
}
