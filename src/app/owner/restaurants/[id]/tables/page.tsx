"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { TableMap } from "@/components/table/TableMap";
import { CreateTableDialog } from "@/components/table/CreateTableDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { usePermissions } from "@/hooks/usePermissions";

export default function TablesPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const canCreate = hasPermission("table.create");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Table Management</h1>
            <p className="text-muted-foreground">
              Manage your restaurant tables
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
          )}
        </div>

        {!restaurant ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading tables...</p>
          </div>
        ) : restaurant?.tables?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <p className="mb-4 text-muted-foreground">No tables yet</p>
            {canCreate && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first table
              </Button>
            )}
          </div>
        ) : (
          <TableMap
            tables={restaurant?.tables || []}
            restaurantId={restaurantId}
          />
        )}

        {canCreate && (
          <CreateTableDialog
            restaurantId={restaurantId}
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
        )}
      </div>
    </MainLayout>
  );
}
