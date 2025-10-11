import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { QrCode } from "lucide-react";

async function getAboutPage() {
  const page = await prisma.companyPage.findUnique({
    where: { type: "about" },
  });

  return (
    page || {
      title: "About QResto",
      content: `
      <h2>Welcome to QResto</h2>
      <p>QResto is a modern, cloud-based restaurant management system that revolutionizes how restaurants operate. Our platform combines cutting-edge technology with intuitive design to create seamless dining experiences.</p>
      
      <h3>Our Mission</h3>
      <p>To empower restaurants of all sizes with enterprise-grade tools that are easy to use and affordable.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li>Real-time menu management</li>
        <li>QR code ordering system</li>
        <li>Live order tracking</li>
        <li>AI-powered insights</li>
        <li>Complete customization</li>
      </ul>
    `,
    }
  );
}

export default async function AboutPage() {
  const page = await getAboutPage();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">QResto</span>
          </Link>
          <div className="flex gap-6">
            <Link href="/about" className="text-blue-600 font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">
              Terms
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{page.title}</h1>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </main>
    </div>
  );
}
