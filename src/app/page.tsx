import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { QrCode, Utensils, BarChart3, Smartphone } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    if (session.user.role === UserRole.SUPER_ADMIN) {
      redirect("/admin/dashboard");
    } else if (session.user.role === UserRole.ADMIN) {
      redirect("/company/dashboard");
    }
    // Restaurant Owner -> Their Restaurant
    else if (
      session.user.role === UserRole.OWNER &&
      session.user.restaurantId
    ) {
      redirect(`/owner/restaurants/${session.user.restaurantId}/dashboard`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">QResto</span>
          </div>
          <Link href="/signin">
            <Button>Login</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Restaurant
            <span className="text-blue-600"> QR System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Transform your restaurant with contactless ordering, digital menus,
            and real-time management
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: <QrCode className="w-8 h-8" />,
                title: "QR Ordering",
                description: "Scan & order instantly",
              },
              {
                icon: <Utensils className="w-8 h-8" />,
                title: "Digital Menu",
                description: "Beautiful customizable menus",
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Analytics",
                description: "Track orders in real-time",
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Mobile First",
                description: "Works on any device",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <Link href="/signin">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
