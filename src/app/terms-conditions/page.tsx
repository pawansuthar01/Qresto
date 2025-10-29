"use client";
import {
  ChevronRight,
  FileText,
  AlertCircle,
  Scale,
  Ban,
  RefreshCw,
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-2 sm:py-8 max-sm:px-2 max-sm:py-8 py-16 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 max-sm:w-8 max-sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 max-sm:w-4 max-sm:h-4 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold sm:text-3xl max-sm:text-xl text-gray-900">
            Terms & Conditions
          </h1>
        </div>

        <p className="text-sm text-gray-500 mb-8">Last updated: October 2025</p>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <p className="text-xl leading-relaxed">
            Welcome to <strong className="text-blue-600">QResto</strong>. By
            accessing or using our platform, you agree to be bound by these
            Terms and Conditions.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Acceptance of Terms
            </h2>
            <p className="text-lg">
              By creating an account or using QResto services, you acknowledge
              that you have read, understood, and agree to be bound by these
              terms. If you do not agree to these terms, you must not use our
              services.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            Service Description
          </h2>
          <p className="leading-relaxed">
            QResto provides a cloud-based restaurant management system that
            includes:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>Digital menu creation and management</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>QR code generation for contactless ordering</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>Order management and tracking</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>Analytics and reporting tools</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>Customer engagement and notification features</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>Multi-location restaurant management</span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            User Responsibilities
          </h2>
          <p className="leading-relaxed">As a user of QResto, you agree to:</p>
          <ul className="space-y-3 ml-4">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Provide Accurate Information:</strong> Keep your account
                information current and accurate
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Maintain Security:</strong> Protect your login
                credentials and notify us of unauthorized access
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Comply with Laws:</strong> Use our services in
                accordance with all applicable laws
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Respect Others:</strong> Not misuse our platform or harm
                other users
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Content Responsibility:</strong> Ensure all menu items,
                descriptions, and images you upload comply with food safety
                regulations and do not infringe on intellectual property rights
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Fair Usage:</strong> Not overload our systems or attempt
                to gain unauthorized access to any part of our services
              </span>
            </li>
          </ul>

          <div className="bg-gray-50 p-8 rounded-xl mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Subscription and Payment
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              QResto offers various subscription plans. Payment terms are
              specified during signup. You authorize us to charge your payment
              method on a recurring basis. Failure to pay may result in service
              suspension.
            </p>
            <p className="text-lg leading-relaxed">
              All fees are non-refundable except as required by law or as
              explicitly stated in our refund policy. We reserve the right to
              change our fees with 30 days' notice. Continued use of the service
              after price changes constitutes acceptance of the new fees.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4 flex items-center gap-3">
            <Scale className="w-8 h-8 text-blue-600" />
            Intellectual Property
          </h2>
          <p className="leading-relaxed mb-4">
            All content, features, and functionality of QResto are owned by us
            and are protected by international copyright, trademark, and other
            intellectual property laws. You may not copy, modify, distribute, or
            reverse engineer any part of our services without written
            permission.
          </p>
          <p className="leading-relaxed">
            You retain ownership of all content you upload to QResto (including
            menu items, images, and descriptions). By uploading content, you
            grant us a worldwide, non-exclusive license to use, reproduce, and
            display that content solely for the purpose of providing our
            services to you.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            Account Suspension and Termination
          </h2>
          <p className="leading-relaxed mb-4">
            We reserve the right to suspend or terminate your account if:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>
                You violate these terms or engage in fraudulent activity
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>Your payment fails or you have outstanding balances</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>
                You engage in activities that harm other users or our platform
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>We are required to do so by law</span>
            </li>
          </ul>
          <p className="leading-relaxed mt-4">
            You may cancel your subscription at any time through your account
            settings. Upon cancellation, you will continue to have access until
            the end of your current billing period.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              Limitation of Liability
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              To the maximum extent permitted by law, QResto shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages resulting from your use of or inability to use our
              services.
            </p>
            <p className="text-lg leading-relaxed">
              Our total liability to you for any claims arising from your use of
              QResto shall not exceed the amount you paid us in the 12 months
              preceding the claim. Some jurisdictions do not allow the exclusion
              of certain warranties or limitations of liability, so some of
              these limitations may not apply to you.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            Service Availability and Modifications
          </h2>
          <p className="leading-relaxed">
            While we strive to maintain 99.9% uptime, we do not guarantee that
            our services will be uninterrupted or error-free. We may modify,
            suspend, or discontinue any aspect of our services at any time with
            reasonable notice. We are not liable for any modification,
            suspension, or discontinuation of services.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4 flex items-center gap-3">
            <Ban className="w-8 h-8 text-blue-600" />
            Prohibited Activities
          </h2>
          <p className="leading-relaxed mb-4">
            You agree not to engage in any of the following prohibited
            activities:
          </p>
          <ul className="space-y-3 ml-4">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Attempting to gain unauthorized access to our systems or other
                users' accounts
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Using our services for any illegal or unauthorized purpose
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Transmitting viruses, malware, or other malicious code
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Scraping or harvesting data from our platform without permission
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>Impersonating another person or entity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Interfering with or disrupting our services or servers
              </span>
            </li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            Indemnification
          </h2>
          <p className="leading-relaxed">
            You agree to indemnify, defend, and hold harmless QResto, its
            affiliates, and their respective officers, directors, employees, and
            agents from any claims, damages, losses, liabilities, and expenses
            (including legal fees) arising from your use of our services,
            violation of these terms, or infringement of any third-party rights.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            Dispute Resolution
          </h2>
          <p className="leading-relaxed mb-4">
            Any disputes arising from these terms or your use of QResto will be
            resolved through:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>First, informal negotiation between you and QResto</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>
                If unresolved, binding arbitration in accordance with applicable
                laws
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>
                You waive any right to participate in class action lawsuits
              </span>
            </li>
          </ul>

          <div className="bg-gray-50 p-8 rounded-xl mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-600" />
              Changes to Terms
            </h2>
            <p className="text-lg leading-relaxed">
              We reserve the right to modify these Terms & Conditions at any
              time. We will notify you of significant changes via email or
              through a prominent notice on our platform. Your continued use of
              QResto after such modifications constitutes acceptance of the
              updated terms.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            Governing Law
          </h2>
          <p className="leading-relaxed">
            These Terms & Conditions are governed by and construed in accordance
            with the laws of India, without regard to its conflict of law
            provisions. You agree to submit to the exclusive jurisdiction of the
            courts located in Jaipur, Rajasthan for resolution of any disputes.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            Severability
          </h2>
          <p className="leading-relaxed">
            If any provision of these terms is found to be unenforceable or
            invalid, that provision will be limited or eliminated to the minimum
            extent necessary so that the remaining terms remain in full force
            and effect.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">
            Entire Agreement
          </h2>
          <p className="leading-relaxed">
            These Terms & Conditions, together with our Privacy Policy,
            constitute the entire agreement between you and QResto regarding
            your use of our services and supersede all prior agreements and
            understandings.
          </p>

          <div className="bg-blue-600 text-white p-8 max-sm:p-4 sm:p-6  rounded-xl mt-12">
            <h2 className="text-2xl font-bold mb-3">Questions?</h2>
            <p className="text-blue-100 mb-4">
              If you have any questions about these Terms & Conditions, please
              contact us:
            </p>
            <p className="font-semibold mb-2">Email: qresto.pawansuthar.in</p>
            <p className="text-blue-100 text-sm mt-4">
              We typically respond to legal inquiries within 48 hours. For
              urgent matters, please mark your email as "Urgent - Legal Matter."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
