import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateOtp } from "@/lib/generateOtp";

async function OTP_SEND(email: string, otp: string) {
  try {
    const server_url = process.env.NOTIFICATION_SERVER_URL;
    if (!server_url) {
      return {
        success: false,
        error: "server_url missing",
      };
    }
    const response = await fetch(`${server_url}/api/notify/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        type: "OTP",
        actionUrl: `${process.env.NEXTAUTH_URL}/account/${email}/verify-otp?otp=${otp}`,
        actionMessage: "Forget",
        subject: "Your Verification Code",
        otp: otp,
      }),
    });

    const data = await response.json();

    // Check response status
    if (response.status === 429) {
      // Rate limit exceeded
      console.error("⚠️ Rate limit exceeded!");
      console.log(`Retry after: ${data.retryAfter} seconds`);

      return {
        success: false,
        error: "RATE_LIMIT_EXCEEDED",
        retryAfter: data.retryAfter,
        message: data.message,
      };
    }

    if (response.status === 400) {
      // Validation error
      console.error("❌ Validation failed:", data.errors);
      return {
        success: false,
        error: "VALIDATION_ERROR",
        errors: data.errors,
      };
    }

    if (data.success) {
      // Email sent successfully
      console.log("✅ Email sent successfully!");
      console.log("Message ID:", data.messageId);

      return {
        success: true,
        messageId: data.messageId,
        message: data.message,
      };
    } else {
      // Email sending failed
      console.error("❌ Failed to send email:", data.error);
      return {
        success: false,
        error: "SMTP_ERROR",
        message: data.error,
      };
    }
  } catch (error) {
    console.error("❌ Network error:", error);
    return {
      success: false,
      error: "NETWORK_ERROR",
      message: "Failed to connect to notification server",
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { email } = body;
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    //  Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      );
    }

    // 🧩 Generate and save OTP
    const otp = generateOtp(6);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    if (!otp || !otpExpiresAt) {
      throw new Error("something wont wrong...");
    }

    const response = await OTP_SEND(email, otp);
    if (!response.success) {
      return NextResponse.json(
        {
          error: response.error,
          errors: response.errors,
          retryAfter: response.retryAfter,
        },
        { status: 500 }
      );
    }
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt },
    });

    return NextResponse.json({
      message: response?.message || "OTP sent successfully.",
      messageId: response.messageId,
      expiresAt: otpExpiresAt,
    });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Try again later." },
      { status: 500 }
    );
  }
}
