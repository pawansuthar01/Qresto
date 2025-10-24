"use client";
import { maskEmail } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";
import Loading from "../ui/loading";
import { toast } from "../ui/use-toast";

export default function VerifyPage({
  email,
  otp,
}: {
  email: string;
  otp?: string;
}) {
  const [otpDigits, setOtpDigits] = useState(
    otp ? otp.split("") : ["", "", "", "", "", ""]
  );
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Mask email helper

  if (!email) {
    <Loading />;
  }
  const masked = maskEmail(email);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    return;
  }, [resendTimer]);

  // Handle OTP input change
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const updatedOtp = [...otpDigits];
    updatedOtp[index] = value;
    setOtpDigits(updatedOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const otp = otpDigits.join("");

    if (otp.length !== 6) {
      return setError("Please enter the complete 6-digit OTP.");
    }
    if (!newPassword || !confirmPassword) {
      return setError("Please enter and confirm your new password.");
    }
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setIsLoading(true);

      const res = await fetch(`/api/users/${email}/password`, {
        method: "PATCH",
        body: JSON.stringify({
          otp,
          new: newPassword,
          confirm: confirmPassword,
          logout: true,
        }),
      });
      const data = await res.json();
      if (!res?.ok) {
        toast({
          title: "Error during forget password",
          description: data.error || "something wont wrong ...",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "successfully forget password",
        description: data.message || "successfully forget password",
        variant: "default",
      });

      setSuccess("OTP verified and password updated successfully!");
      setOtpDigits(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer === 0) {
      setResendTimer(60);
      // await fetch("/api/resend-otp", { method: "POST", body: JSON.stringify({ email }) });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Verify OTP & Reset Password
        </h2>

        {masked && (
          <p className="text-center text-sm text-gray-600 mb-6">
            A verification OTP has been sent to
            <span className="font-medium text-blue-600"> {masked}</span>. It’s
            valid for <strong>10 minutes</strong>.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-3">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputsRef.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 h-12 rounded-md text-center text-xl font-semibold bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            ))}
          </div>

          {/* Password Inputs */}
          <div className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Messages */}
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          {success && (
            <p className="text-sm text-center text-green-600">{success}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify & Update Password"}
          </button>

          {/* Resend */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in <strong>{resendTimer}s</strong>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-blue-600 text-sm hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
