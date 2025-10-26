import { ApiResponse, ContactFormData } from "@/types";
import { ContactSubmission } from "@prisma/client";

export async function fetchContactSubmissions(filters?: {
  status?: string;
  subject?: string;
  search?: string;
  createdAt?: string;
}): Promise<ApiResponse<ContactSubmission[]>> {
  try {
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.createdAt) params.append("date", filters.createdAt);
    const response = await fetch(`/api/contact?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    return {
      success: false,
      error: "Failed to fetch submissions",
      message: error.message,
    };
  }
}

// Submit new contact form
export async function submitContactForm(
  formData: ContactFormData
): Promise<ApiResponse<ContactSubmission>> {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      error: "Failed to submit form",
      message: error.message,
    };
  }
}

// Update submission status
export async function updateSubmissionStatus(
  id: string,
  status: string
): Promise<ApiResponse<ContactSubmission>> {
  try {
    const response = await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error updating status:", error);
    return {
      success: false,
      error: "Failed to update status",
      message: error.message,
    };
  }
}

// Delete submission
export async function DeleteSubmission(id: string): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`/api/contact/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error deleting submission:", error);
    return {
      success: false,
      error: "Failed to delete submission",
      message: error.message,
    };
  }
}

// Fetch single submission
export async function fetchSubmission(
  id: number
): Promise<ApiResponse<ContactSubmission>> {
  try {
    const response = await fetch(`/api/contact/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching submission:", error);
    return {
      success: false,
      error: "Failed to fetch submission",
      message: error.message,
    };
  }
}
