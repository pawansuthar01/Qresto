import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import {
  QrCode,
  Utensils,
  BarChart3,
  Smartphone,
  Star,
  Shield,
  Zap,
  Users,
  Clock,
  TrendingUp,
  Award,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/pageLayout/Layout";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  let dashboardLink = "/signup";
  if (user) {
    if (user.role === UserRole.SUPER_ADMIN) dashboardLink = "/admin/dashboard";
    else if (user.role === UserRole.ADMIN) dashboardLink = "/company/dashboard";
    else if (user.role === UserRole.OWNER)
      dashboardLink = `/owner/restaurants/${
        user.restaurantId || "pending"
      }/dashboard`;
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 max-sm:px-2 max-sm:py-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
              <Star className="w-4 h-4" />
              <span>Trusted by 1000+ Restaurants Worldwide</span>
            </div>

            <h1 className="text-6xl md:text-7xl max-sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Restaurant{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                QR System
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-sm:text-md leading-relaxed">
              Transform your restaurant with contactless ordering, digital
              menus, and real-time management. Boost efficiency by 40% and
              delight your customers.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              {user ? (
                <Link href={dashboardLink}>
                  <Button size="lg" className="px-8 py-4 text-lg">
                    Open Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/signin">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    Get Started
                  </Button>
                </Link>
              )}
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg border-2"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { number: "1000+", label: "Active Restaurants" },
              { number: "50K+", label: "Daily Orders" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl max-sm:text-2xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Restaurants
            </h2>
            <p className="text-xl max-sm:text-md text-gray-600 max-w-2xl mx-auto">
              Everything you need to run your restaurant efficiently and delight
              your customers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <QrCode className="w-10 h-10" />,
                title: "QR Ordering",
                description:
                  "Scan & order instantly. Customers can browse and place orders directly from their phones.",
              },
              {
                icon: <Utensils className="w-10 h-10" />,
                title: "Digital Menu",
                description:
                  "Customizable menus with real-time updates. Change prices and items instantly.",
              },
              {
                icon: <BarChart3 className="w-10 h-10" />,
                title: "Analytics",
                description:
                  "Track sales and insights in real-time dashboards. Make data-driven decisions.",
              },
              {
                icon: <Smartphone className="w-10 h-10" />,
                title: "Mobile First",
                description:
                  "Seamless experience on any device — smartphone, tablet, or desktop.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="font-bold text-gray-900 mb-3 text-xl">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl max-sm:text-3xl font-bold text-gray-900 mb-4">
              Why Restaurants Choose QResto
            </h2>
            <p className="text-xl max-sm:text-md text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful restaurants that have transformed
              their operations
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "40% Faster Service",
                description:
                  "Reduce wait times and serve more customers with streamlined digital ordering and kitchen management.",
                color: "bg-yellow-100 text-yellow-600",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "30% More Revenue",
                description:
                  "Increase order values with smart upselling, promotions, and personalized recommendations.",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Better Customer Experience",
                description:
                  "Delight customers with contactless ordering, multiple languages, and instant order tracking.",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enterprise Security",
                description:
                  "Bank-level encryption and compliance with international data protection standards.",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Save 20+ Hours/Week",
                description:
                  "Automate menu updates, order management, and reporting to focus on what matters most.",
                color: "bg-orange-100 text-orange-600",
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Industry Leading",
                description:
                  "Award-winning platform trusted by restaurants in over 50 countries worldwide.",
                color: "bg-indigo-100 text-indigo-600",
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all"
              >
                <div
                  className={`w-16 h-16 ${benefit.color} rounded-full flex items-center justify-center mb-4`}
                >
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-xl">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 py-16 bg-white rounded-3xl my-16 shadow-lg">
          <div className="text-center mb-12">
            <h2 className="text-4xl max-sm:text-2xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-sm:text-md max-w-2xl mx-auto">
              Launch your digital restaurant in under 30 minutes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Sign Up & Setup",
                description:
                  "Create your account and add your restaurant details, logo, and menu items with our easy-to-use interface.",
              },
              {
                step: "2",
                title: "Generate QR Codes",
                description:
                  "Download unique QR codes for each table. Print them or display digitally – customers scan and order instantly.",
              },
              {
                step: "3",
                title: "Start Receiving Orders",
                description:
                  "Orders appear in real-time on your dashboard. Manage everything from one place and watch your business grow.",
              },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-xl">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Restaurant Owners
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers say about QResto
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote:
                  "QResto transformed our restaurant operations. Order accuracy improved by 95% and customer satisfaction is at an all-time high!",
                author: "Rajesh Kumar",
                role: "Owner, Spice Garden",
                rating: 5,
              },
              {
                quote:
                  "The analytics dashboard helps us make better decisions daily. We've increased our revenue by 30% since implementing QResto.",
                author: "Priya Sharma",
                role: "Manager, Café Delight",
                rating: 5,
              },
              {
                quote:
                  "Setup was incredibly easy and support team is amazing. Our staff learned the system in just one day. Highly recommend!",
                author: "Amit Patel",
                role: "Owner, Pizza Paradise",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="font-bold text-gray-900">
                    {testimonial.author}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 max-sm:px-2 max-sm:py-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl max-sm:text-3xl font-bold mb-4">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-xl mb-8 max-sm:text-md text-blue-100">
              Join thousands of restaurants already using QResto
            </p>
            <Link href={user ? dashboardLink : "/signup"}>
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg font-bold"
              >
                {user ? "Go to Dashboard" : "Join Now"}
              </Button>
            </Link>
            <p className="text-sm text-blue-200 mt-6">
              Setup in 30 minutes • Cancel anytime
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
