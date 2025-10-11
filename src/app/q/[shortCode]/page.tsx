import GuestMenu from "@/components/guest/GuestMenu";

async function getMenuData(shortCode: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/q/${shortCode}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

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

  return <GuestMenu data={data} shortCode={params.shortCode} />;
}
