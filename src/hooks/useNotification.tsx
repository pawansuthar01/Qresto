"use Client";

export const sendEmailOtp = async (email: string) => {
  try {
    const res = await fetch(`/api/notifications/email/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    return await res?.json();
  } catch (e: any) {
    return e || "something wont wrong";
  }
};
