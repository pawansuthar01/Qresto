"use client";

import { useSession } from "next-auth/react";

export default function BlockedPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-red-700 mb-3">
          Your Account is Blocked
        </h1>
        <p className="text-gray-700 mb-2">
          {user?.reason || "No reason provided."}
        </p>
        {user?.blockedAt && (
          <p className="text-sm text-gray-500">
            Blocked on: {new Date(user.blockedAt).toLocaleDateString()}
          </p>
        )}
        <p className="mt-6 text-gray-600">
          Please contact support if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}
