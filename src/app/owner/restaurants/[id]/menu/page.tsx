"use client";

import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { MenuList } from "@/components/menu/MenuList";

export default function MenuPage() {
  const params = useParams();

  const restaurantId = params.id as string;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Menu Management
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time updates • All changes sync instantly
            </p>
          </div>
        </div>

        <MenuList restaurantId={restaurantId} />
      </div>
    </MainLayout>
  );
}
