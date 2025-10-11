"use client";

import { QrCode, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface DashboardHeaderProps {
  user: any;
  title: string;
}

export default function DashboardHeader({ user, title }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">QResto</span>
            </div>
            <div className="hidden md:block">
              <span className="text-gray-400">|</span>
              <span className="ml-4 text-gray-600">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-600">
                {user.role === "ADMIN" ? "Company Owner" : "Restaurant Owner"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
