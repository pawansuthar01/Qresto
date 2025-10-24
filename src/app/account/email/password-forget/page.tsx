"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { sendEmailOtp } from "@/hooks/useNotification";
import { toast } from "@/components/ui/use-toast";
import { isValidEmail } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const EmailResetPasswordPage: React.FC = () => {
  const { status, data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const route = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    if (!email || !isValidEmail(email)) {
      toast({
        title: "Type Error",
        description: "please Enter Valid email address",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const res = await sendEmailOtp(email);
    if (res?.message) {
      setIsSubmitted(true);
    } else {
      setError(res?.error || "Something went wrong");
      setIsSubmitted(true);
    }

    setLoading(false);
  };

  if (session?.user && status == "authenticated") {
    route.push("/account/profile");
  }
  return (
    <div className="min-h-screen pt-24 pb-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-sm mx-auto">
          <Link
            href="/signin"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8 max-sm:p-5">
            {isSubmitted ? (
              <div className="text-center">
                <div
                  className={`p-4 rounded-lg mb-6 border-2 ${
                    error
                      ? "bg-red-200 border-red-400 text-red-800"
                      : "bg-green-50 border-green-400 text-green-800"
                  }`}
                >
                  <h2 className="text-lg font-semibold mb-2 max-sm:text-md">
                    {error ? "Something went wrong" : "Check Your Email"}
                  </h2>
                  <p className="max-sm:text-sm">
                    {error
                      ? error
                      : `We've sent password reset instructions to your email
                        address. Please check your inbox and follow the link to
                        reset your password.`}
                  </p>
                </div>
                <p className="text-neutral-600">
                  Didn't receive the email?{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Try again
                  </button>
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl max-sm:text-xl font-bold text-center mb-4">
                  Reset Password
                </h1>
                <p className="text-neutral-600 text-center mb-8 max-sm:mb-4">
                  Enter your email address and we'll send you instructions to
                  reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm max-sm:text-xs  max-sm:text-sx font-medium text-neutral-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 pl-11 max-sm:text-sm max-sm:pl-7 max-sm:py-1 max-sm:px-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        required
                      />
                      <Mail className="absolute left-3 max-sm:left-2  max-sm:top-[9px] max-sm:h-4 max-sm:w-4 top-3.5 h-5 w-5 text-neutral-400" />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full max-sm:py-2 max-sm:text-sm  bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    {loading
                      ? "Please wait Sending Email..."
                      : "Send Reset Instructions"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailResetPasswordPage;
