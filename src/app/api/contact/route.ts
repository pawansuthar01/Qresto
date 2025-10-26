import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all contact submissions with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.sessionToken) {
      return NextResponse.json({ message: "Unauthorized", status: 401 });
    }
    if (!["ADMIN", "SUPER_ADMIN", "STAFF"].includes(session?.user.role || "")) {
      return NextResponse.json({ message: " Access  denied", status: 403 });
    }
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");
    const date = searchParams.get("date");

    // Build filter conditions
    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (subject && subject !== "all") {
      where.subject = subject;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    if (date && date !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date === "today") {
        where.createdAt = {
          gte: today,
        };
      } else if (date === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        where.createdAt = {
          gte: yesterday,
          lt: today,
        };
      } else if (date === "older") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        where.createdAt = {
          lt: yesterday,
        };
      }
    }

    // Fetch submissions from database
    const submissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get statistics
    const stats = {
      total: await prisma.contactSubmission.count(),
      pending: await prisma.contactSubmission.count({
        where: { status: "pending" },
      }),
      inProgress: await prisma.contactSubmission.count({
        where: { status: "in-progress" },
      }),
      completed: await prisma.contactSubmission.count({
        where: { status: "completed" },
      }),
    };

    return NextResponse.json(
      {
        success: true,
        data: submissions,
        stats,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching contact submissions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch submissions",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new contact submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Name, email, subject, and message are required",
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Create submission in database
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        subject,
        message,
        status: "pending",
      },
    });

    // Optional: Send email notification to admin
    // await sendEmailNotification(submission);

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! We've received your message.",
        data: submission,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating contact submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit form",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
