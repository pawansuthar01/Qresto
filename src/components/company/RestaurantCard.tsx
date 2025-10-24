"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Users, ShoppingBag, Settings } from "lucide-react";

interface RestaurantCardProps {
  restaurant: any;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5 text-blue-600" />
          {restaurant.name}
        </CardTitle>
        <p className="text-sm text-gray-600">{restaurant.email}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Menu Items
            </span>
            <span className="font-semibold">
              {restaurant?._count?.items || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tables
            </span>
            <span className="font-semibold">
              {restaurant?._count?.tables || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Orders
            </span>
            <span className="font-semibold">
              {restaurant?._count?.orders || 0}
            </span>
          </div>

          <div className="pt-4 flex gap-2">
            <Link
              href={`/owner/restaurants/${restaurant.id}/dashboard`}
              className="flex-1"
            >
              <Button variant="outline" className="w-full" size="sm">
                View
              </Button>
            </Link>
            <Link
              href={`/company/restaurants/${restaurant.id}/permissions`}
              className="flex-1"
            >
              <Button className="w-full" size="sm">
                Manage
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
