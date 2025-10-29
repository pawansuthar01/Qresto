"use client";
import { Layout } from "@/components/pageLayout/Layout";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();
  return (
    <Layout>
      <div className="min-h-screen  relative">
        <div className="container  mx-auto px-4 py-10 max-sm:px-2 max-sm:py-8 max-w-8xl">
          <h1 className="text-5xl flex max-sm:text-4xl font-bold text-gray-900 mb-8">
            About QResto
          </h1>
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-xl leading-relaxed">
              Welcome to <strong className="text-blue-600">QResto</strong>, a
              modern, cloud-based restaurant management system that
              revolutionizes how restaurants operate. Our platform combines
              cutting-edge technology with intuitive design to create seamless
              dining experiences.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Our Mission
              </h2>
              <p className="text-lg">
                To empower restaurants of all sizes with enterprise-grade tools
                that are easy to use and affordable, enabling them to focus on
                what they do best – creating amazing food and memorable
                experiences.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
              Key Features
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <ChevronRight className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <span>
                  <strong>Menu schedule:</strong> show menu in specific time
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <span>
                  <strong>QR Code Ordering System:</strong> Contactless ordering
                  for enhanced safety
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <span>
                  <strong>Live Order Tracking:</strong> Monitor orders from
                  kitchen to table
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <span>
                  <strong>AI-Powered Insights:</strong> Data-driven
                  recommendations for your business
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <span>
                  <strong>Complete Customization:</strong> Brand your digital
                  menu your way
                </span>
              </li>
            </ul>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 rounded-xl mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Us?
              </h2>
              <p className="text-lg leading-relaxed mb-4">
                We understand the challenges restaurants face in today's
                fast-paced world. That's why we built QResto – to simplify
                operations, reduce costs, and enhance customer satisfaction.
                With features like contactless ordering, real-time analytics,
                and seamless integration, we're not just a software provider;
                we're your partner in success.
              </p>
              <p className="text-lg leading-relaxed">
                Our commitment to excellence is reflected in every aspect of our
                platform. From our 24/7 customer support to our continuous
                product improvements, we're dedicated to helping your restaurant
                thrive in the digital age.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Customer First",
                  description:
                    "Every decision we make is centered around delivering value to our restaurant partners and their customers. Your success is our success.",
                },
                {
                  title: "Innovation",
                  description:
                    "We continuously innovate and adopt the latest technologies to stay ahead of industry trends and provide cutting-edge solutions.",
                },
                {
                  title: "Reliability",
                  description:
                    "We maintain 99.9% uptime and ensure our platform is always available when you need it most – during peak service hours.",
                },
                {
                  title: "Transparency",
                  description:
                    "No hidden fees, no surprises. We believe in honest communication and transparent pricing for all our services.",
                },
              ].map((value, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-gray-100 p-6 rounded-xl hover:border-blue-200 transition-colors"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
              The QResto Story
            </h2>
            <p className="text-lg leading-relaxed">
              QResto was born from a simple observation: restaurants were
              struggling with outdated systems that didn't keep pace with modern
              customer expectations. Our founders, experienced restaurateurs and
              technologists, came together with a vision to create a platform
              that would bridge this gap.
            </p>
            <p className="text-lg leading-relaxed mt-4">
              What started as a solution for a single restaurant quickly evolved
              into a comprehensive platform serving thousands of establishments
              worldwide. Today, QResto processes millions of orders annually,
              helping restaurants increase efficiency, reduce operational costs,
              and deliver exceptional customer experiences.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
              How QResto Works
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Quick Setup
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Create your account, add your restaurant details, and upload
                    your menu items with photos. Our intuitive interface makes
                    the process effortless, taking less than 30 minutes from
                    start to finish.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Generate QR Codes
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Create unique QR codes for each table or section in your
                    restaurant. Print them out or display them digitally –
                    customers simply scan to view your menu and place orders.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Manage Orders
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive orders in real-time through your dashboard. Track
                    order status, manage kitchen workflow, and communicate with
                    customers – all from one centralized platform.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Analyze & Grow
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Leverage our analytics dashboard to understand customer
                    preferences, identify popular items, track peak hours, and
                    make data-driven decisions to grow your business.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 rounded-xl mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Technology That Adapts to You
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                QResto is built on modern cloud infrastructure, ensuring
                scalability, security, and reliability. Our platform leverages
                cutting-edge technologies including:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <span>
                    <strong>Cloud-Native Architecture:</strong> Ensures your
                    data is always accessible and secure, with automatic backups
                    and 99.9% uptime guarantee
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <span>
                    <strong>Real-Time Synchronization:</strong> All changes sync
                    instantly across devices, so your team always has the latest
                    information
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <span>
                    <strong>Mobile-First Design:</strong> Optimized for
                    smartphones and tablets, ensuring a seamless experience for
                    customers and staff
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <span>
                    <strong>Enterprise-Grade Security:</strong> Bank-level
                    encryption and compliance with international data protection
                    standards
                  </span>
                </li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
              Who We Serve
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              QResto is designed to meet the unique needs of different types of
              food service establishments:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Fine Dining Restaurants",
                  description:
                    "Elegant digital menus with detailed descriptions, wine pairing suggestions, and sophisticated presentation that matches your upscale ambiance.",
                },
                {
                  title: "Casual Dining & Cafés",
                  description:
                    "Quick, easy ordering with photo-rich menus that highlight your best dishes. Perfect for high-volume service and fast table turnover.",
                },
                {
                  title: "Food Courts & Chains",
                  description:
                    "Multi-location management with centralized menu control, standardized ordering processes, and consolidated reporting across all outlets.",
                },
                {
                  title: "Bars & Pubs",
                  description:
                    "Specialized features for drinks menus, happy hour promotions, and easy modifier options for custom cocktails and beverages.",
                },
                {
                  title: "Quick Service Restaurants",
                  description:
                    "Streamlined ordering for maximum speed, integration with kitchen display systems, and support for takeaway and delivery orders.",
                },
                {
                  title: "Hotels & Resorts",
                  description:
                    "Room service ordering, poolside dining, and multi-restaurant management all within one unified platform.",
                },
              ].map((segment, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-gray-100 p-6 rounded-xl hover:border-blue-200 transition-colors"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {segment.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {segment.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Our Commitment to Sustainability
              </h2>
              <p className="text-lg leading-relaxed">
                By eliminating paper menus and streamlining operations, QResto
                helps restaurants reduce their environmental footprint. Our
                digital-first approach means fewer printed materials, less food
                waste through better inventory management, and reduced energy
                consumption through optimized operations. We're proud to support
                restaurants in their journey toward more sustainable practices.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
              Global Reach, Local Support
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              While QResto serves restaurants across multiple countries and
              continents, we understand that great service is personal. Our
              support team is available 24/7 to assist you in your local
              language and timezone. We also work with regional partners to
              ensure you get the hands-on support you need, whether it's initial
              setup, staff training, or ongoing optimization.
            </p>
            <p className="text-lg leading-relaxed">
              With customers in over 50 countries and support for multiple
              languages and currencies, QResto truly understands the diverse
              needs of the global restaurant industry. Yet we never lose sight
              of what makes each restaurant unique – your local flavors,
              cultural traditions, and community connections.
            </p>

            <div className="bg-blue-600 text-white p-8 rounded-xl mt-12">
              <h2 className="text-3xl font-bold mb-4">
                Join the QResto Family
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-6">
                Whether you're a small café or a large restaurant chain, QResto
                has the perfect solution for you. Join thousands of restaurants
                that have already transformed their operations with our
                platform.
              </p>
              <button
                onClick={() => router.push("/signin")}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
