import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch single submission
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        },
        { status: 400 }
      );
    }

    const submission = await prisma.contactSubmission.findUnique({
      where: { id: id },
    });

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: submission,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch submission",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH - Update submission status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        },
        { status: 400 }
      );
    }
    // Validate status
    const validStatuses = ["pending", "in-progress", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status",
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existingSubmission = await prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!existingSubmission) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission not found",
        },
        { status: 404 }
      );
    }

    // Update submission
    const updatedSubmission = await prisma.contactSubmission.update({
      where: { id },
      data: {
        status: status || existingSubmission.status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Submission updated successfully",
        data: updatedSubmission,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update submission",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete submission
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existingSubmission = await prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!existingSubmission) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission not found",
        },
        { status: 404 }
      );
    }

    // Delete submission
    await prisma.contactSubmission.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Submission deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete submission",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
