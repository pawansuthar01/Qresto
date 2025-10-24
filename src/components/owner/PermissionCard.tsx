"use client";

import React from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";

interface PermissionCardProps {
  permissions: Record<string, boolean>;
}

export function PermissionCard({ permissions }: PermissionCardProps) {
  // Group permissions by module prefix
  const grouped = Object.entries(permissions).reduce(
    (acc: any, [key, value]) => {
      const [module, action] = key.split(".");
      if (!acc[module]) acc[module] = [];
      acc[module].push({ action, value });
      return acc;
    },
    {}
  );

  return (
    <div className="bg-white shadow-sm border rounded-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        Permissions
      </h2>

      <div className="space-y-5">
        {Object.keys(grouped).map((module) => (
          <div
            key={module}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-800 capitalize">
              {module}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-4">
              {grouped[module].map(({ action, value }: any) => (
                <div
                  key={action}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                    value
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  {value ? (
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <ShieldOff className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="capitalize text-sm">{action}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
