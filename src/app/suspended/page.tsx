"use client";

import { useSession } from "next-auth/react";

export default function SuspendedPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-3">
          Your Account is Suspended
        </h1>
        <p className="text-gray-700 mb-2">
          {user?.reason || "No reason provided."}
        </p>
        {user?.suspendedAt && (
          <p className="text-sm text-gray-500">
            Suspended on: {new Date(user.suspendedAt).toLocaleDateString()}
          </p>
        )}
        <p className="mt-6 text-gray-600">
          Please contact our support team for further assistance.
        </p>
      </div>
    </div>
  );
}
