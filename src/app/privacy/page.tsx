"use client";
import {
  ChevronRight,
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  UserCheck,
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-8xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900">Privacy Policy</h1>
        </div>

        <p className="text-sm text-gray-500 mb-8">Last updated: October 2025</p>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <p className="text-xl leading-relaxed">
            At <strong className="text-purple-600">QResto</strong>, we take your
            privacy seriously. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use our restaurant
            management platform.
          </p>

          <div className="bg-purple-50 border-l-4 border-purple-600 p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Information We Collect
            </h2>
            <p className="text-lg">
              We collect information that you provide directly to us, including
              but not limited to:
            </p>
          </div>

          <ul className="space-y-3 ml-4">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>Personal Information:</strong> Name, email address,
                phone number, and business details
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>Usage Data:</strong> Information about how you use our
                platform
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>Device Information:</strong> IP address, browser type,
                and device identifiers
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>Cookies:</strong> We use cookies to enhance your
                experience
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>Payment Information:</strong> Credit card details and
                billing information (processed securely through encrypted
                payment gateways)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>Location Data:</strong> No
              </span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            How We Use Your Information
          </h2>
          <p className="leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Provide, maintain, and improve our services</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Process transactions and send related information</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Send technical notices and support messages</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Respond to your comments and questions</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Analyze usage patterns to enhance user experience</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Prevent fraud and ensure platform security</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Comply with legal obligations and enforce our terms</span>
            </li>
          </ul>

          <div className="bg-gray-50 p-8 rounded-xl mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Lock className="w-8 h-8 text-purple-600" />
              Data Security
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              We implement industry-standard security measures to protect your
              personal information. However, no method of transmission over the
              Internet is 100% secure. We strive to use commercially acceptable
              means to protect your data, but we cannot guarantee absolute
              security.
            </p>
            <p className="text-lg leading-relaxed">
              Our security measures include: SSL/TLS encryption for data in
              transit, encrypted database storage, regular security audits and
              penetration testing, multi-factor authentication options, and 24/7
              security monitoring and incident response.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4 flex items-center gap-3">
            <Database className="w-8 h-8 text-purple-600" />
            Data Storage and Retention
          </h2>
          <p className="leading-relaxed">
            We store your data on secure servers located in data centers that
            comply with international security standards. Your information is
            retained for as long as your account is active or as needed to
            provide you services. After account deletion, we may retain certain
            information for:
          </p>
          <ul className="space-y-2 ml-4 mt-4">
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Legal compliance and regulatory requirements</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Fraud prevention and security purposes</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Resolving disputes and enforcing agreements</span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4 flex items-center gap-3">
            <Globe className="w-8 h-8 text-purple-600" />
            Information Sharing and Disclosure
          </h2>
          <p className="leading-relaxed mb-4">
            We do not sell your personal information. We may share your
            information only in the following circumstances:
          </p>
          <ul className="space-y-3 ml-4">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>Service Providers:</strong> With trusted third-party
                service providers who assist in operating our platform (e.g.,
                payment processors, hosting services)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights and safety
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>With Your Consent:</strong> When you explicitly
                authorize us to share your information
              </span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-purple-600" />
            Your Rights
          </h2>
          <p className="leading-relaxed mb-4">You have the right to:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Access, update, or delete your personal information</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Opt-out of marketing communications</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Request data portability</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Lodge a complaint with a supervisory authority</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>Restrict or object to certain data processing</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <span>
                Withdraw consent at any time (where processing is based on
                consent)
              </span>
            </li>
          </ul>

          <div className="bg-purple-50 border-l-4 border-purple-600 p-6 my-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
              <Eye className="w-6 h-6 text-purple-600" />
              Cookies and Tracking Technologies
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity
              on our platform and store certain information. You can instruct
              your browser to refuse all cookies or indicate when a cookie is
              being sent.
            </p>
            <p className="text-lg leading-relaxed">
              Types of cookies we use include: Essential cookies for platform
              functionality, Analytics cookies to understand usage patterns,
              Preference cookies to remember your settings, and Marketing
              cookies for relevant advertisements (with your consent).
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            Children's Privacy
          </h2>
          <p className="leading-relaxed">
            Our services are not intended for individuals under the age of 18.
            We do not knowingly collect personal information from children. If
            you are a parent or guardian and believe your child has provided us
            with personal information, please contact us immediately.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            International Data Transfers
          </h2>
          <p className="leading-relaxed">
            Your information may be transferred to and maintained on servers
            located outside of your state, province, country, or other
            governmental jurisdiction where data protection laws may differ. We
            ensure appropriate safeguards are in place for such transfers in
            compliance with applicable laws.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            Changes to This Privacy Policy
          </h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date. You are advised to review this
            Privacy Policy periodically for any changes. Changes are effective
            when posted on this page.
          </p>

          <div className="bg-purple-600 text-white p-8 rounded-xl mt-12">
            <h2 className="text-2xl font-bold mb-3">Contact Us</h2>
            <p className="text-purple-100 mb-4">
              If you have questions about this Privacy Policy, please contact us
              at:
            </p>
            <p className="font-semibold mb-2">Email: paw.kum.2111@gmail.com</p>
            <p className="text-purple-100 text-sm mt-4">
              We typically respond to privacy inquiries within 48 hours. For
              urgent matters related to data security, please mark your email as
              "Urgent - Privacy Concern."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
