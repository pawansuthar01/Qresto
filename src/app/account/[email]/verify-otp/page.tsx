"use client";

import { useSearchParams } from "next/navigation";
import VerifyPage from "@/components/account/passowrdForget";

export default function PasswordForgetPage({
  params,
}: {
  params: { email: string };
}) {
  const searchParams = useSearchParams();
  const email = decodeURIComponent(params.email);

  const otp = searchParams.get("otp") || "";

  return <VerifyPage email={email} otp={otp} />;
}
