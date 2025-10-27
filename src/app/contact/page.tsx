"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  Clock,
  MessageSquare,
  Headphones,
  CheckCircle,
} from "lucide-react";
import { Layout } from "@/components/pageLayout/Layout";
import { submitContactForm } from "@/hooks/useContact";
import { toast } from "@/components/ui/use-toast";
import { isValidEmail, isValidNumber } from "@/lib/utils";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    subject: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.company ||
      !formData.email ||
      !formData.name ||
      !formData.message ||
      !formData.phone ||
      !formData.subject
    ) {
      toast({
        title: "Type Error",
        description: "First Fill All Details than submit...!",
        variant: "destructive",
      });
      return;
    }

    if (formData.message.length < 10) {
      toast({
        title: "Type Error",
        description: "Enter message AtLeast 10 char length",
        variant: "destructive",
      });
      return;
    }
    if (!isValidNumber(formData.phone)) {
      toast({
        title: "Type Error",
        description: "Enter valid number!",
        variant: "destructive",
      });
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast({
        title: "Type Error",
        description: "Enter valid email!",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const res = await submitContactForm(formData);
    setSubmitting(false);

    if (res?.success) {
      setSubmitted(true);
    } else {
      toast({
        title: res.error,
        variant: "destructive",
      });
    }
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
      subject: "",
    });
  };

  return (
    <Layout>
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We'd love to hear from you! Whether you have a question about
              features, pricing, or anything else, our team is ready to help.
            </p>
          </div>

          {/* Support Options */}
          <div className="flex  justify-center gap-2 flex-wrap mb-12">
            {[
              {
                icon: <Headphones className="w-8 h-8" />,
                title: "24/7 Support",
                description: "Round-the-clock assistance for all your needs",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: <MessageSquare className="w-8 h-8" />,
                title: "Live Chat",
                description: "Instant responses during business hours",
                color: "bg-green-100 text-green-600",
              },
            ].map((option, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div
                  className={`w-16 h-16 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  {option.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 text-sm">{option.description}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg animate-fade-in flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Thank you!</strong> We've received your message and
                    will get back to you within 24 hours.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your Restaurant"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="sales">Sales Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="demo">Request a Demo</option>
                    <option value="billing">Billing Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {submitting ? "wait message sending..." : "Send Message"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting this form, you agree to our{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="/terms-conditions"
                    target="_blank"
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    Terms of Service
                  </a>
                  .
                </p>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  <ContactItem
                    icon={<Mail className="w-6 h-6 text-blue-600" />}
                    title="Email Us"
                    desc="Our team responds within 24 hours"
                    link="mailto:paw.kum.2111@gmail.com"
                    linkText="paw.kum.2111@gmail.com"
                    color="bg-blue-100"
                  />
                  <ContactItem
                    icon={<Phone className="w-6 h-6 text-green-600" />}
                    title="Call Us"
                    desc="Mon-Fri 9am - 6pm IST"
                    link="tel:+9784740736"
                    linkText="+91 9784740736"
                    color="bg-green-100"
                  />

                  <ContactItem
                    icon={<Clock className="w-6 h-6 text-orange-600" />}
                    title="Business Hours"
                    desc="Mon–Fri: 9am–6pm | Sat: 10am–4pm "
                    color="bg-orange-100"
                  />
                </div>
              </div>

              {/* Help Box */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-3">
                  Need Immediate Support?
                </h3>
                <p className="mb-4 text-blue-100">
                  Our technical support team is here to help you 24/7 with any
                  urgent issues.
                </p>

                <a
                  href="mailto:paw.sut.211138@gmail.com"
                  className="px-6 py-3 bg-white flex items-center text-center justify-center text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-full"
                >
                  Visit Help Center
                </a>
                <p className="text-sm text-blue-100 mt-4 text-center">
                  Average response time: &lt; 2 hours
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Quick answers to common questions
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: "How quickly can I get started with QResto?",
                  a: "You can be up and running in less than 30 minutes! Just sign up, add menu items, and generate QR codes.",
                },
                {
                  q: "Do my customers need to download an app?",
                  a: "No! Customers simply scan the QR code with their phone's camera — the menu opens instantly in their browser.",
                },
                {
                  q: "What kind of support do you provide?",
                  a: "We offer 24/7 email support for all plans, live chat for premium users, and phone support for enterprise customers.",
                },
                {
                  q: "Can I customize my digital menu?",
                  a: "Yes — you can easily change colors, fonts, and logos to match your restaurant's branding.",
                },
                {
                  q: "Is there a contract or can I cancel anytime?",
                  a: "All plans are month-to-month with no long-term contracts. You can cancel anytime.",
                },
                {
                  q: "Do you offer training for my staff?",
                  a: "Yes! We provide comprehensive onboarding sessions, video tutorials, and documentation. Our support team is also available to answer any questions.",
                },
                {
                  q: "Can I manage multiple restaurant locations?",
                  a: "Absolutely! Our platform is designed to handle multiple locations with centralized management and location-specific customization.",
                },
                {
                  q: "Is my data secure?",
                  a: "Yes, we use bank-level encryption and follow industry-best security practices. Your data is backed up regularly and stored in secure data centers.",
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Reusable contact item component
const ContactItem = ({
  icon,
  title,
  desc,
  link,
  linkText,
  extra,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  link?: string;
  linkText?: string;
  extra?: string;
  color: string;
}) => (
  <div className="flex items-start gap-4">
    <div
      className={`w-12 h-12 ${color} rounded-full flex items-center justify-center flex-shrink-0`}
    >
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 mb-1">{desc}</p>
      {link && (
        <a href={link} className="text-blue-600 hover:underline">
          {linkText}
        </a>
      )}
      {extra && <p className="text-gray-700">{extra}</p>}
    </div>
  </div>
);
