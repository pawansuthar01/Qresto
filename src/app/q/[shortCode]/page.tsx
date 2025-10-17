import GuestMenu from "@/components/guest/GuestMenu";

async function getMenuData(shortCode: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/q/${shortCode}`, {
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}

export default async function GuestMenuPage({
  params,
}: {
  params: { shortCode: string };
}) {
  const data = await getMenuData(params.shortCode);
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            QR Code Not Found
          </h1>
          <p className="text-gray-600">
            This QR code is invalid or has been deactivated.
          </p>
        </div>
      </div>
    );
  }
  if (data?.categories.length <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">📭</div>

          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            No Menu available
          </h1>

          <p className="text-gray-600 mb-6">Content to staff.</p>
        </div>
      </div>
    );
  }
  return <GuestMenu data={data} shortCode={params.shortCode} />;
}
