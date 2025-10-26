"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  Calendar,
  User,
  Building2,
  MessageSquare,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { MainLayout } from "@/components/layout/MainLayout";
import Loading from "@/components/ui/loading";
import { ContactSubmission } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import {
  DeleteSubmission,
  fetchContactSubmissions,
  updateSubmissionStatus,
} from "@/hooks/useContact";
import { toast } from "@/components/ui/use-toast";

export default function ContactSubmissionsPage() {
  const { data: session, status } = useSession();

  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isStatusUpdate, setIsStatusUPdate] = useState<any[]>([]);

  // Status color mapping
  const statusColors: any = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  // Filter submissions
  const filteredSubmissions = submissions?.filter((submission) => {
    const matchesSearch =
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission?.company?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      submission.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;

    const matchesSubject =
      subjectFilter === "all" || submission.subject === subjectFilter;

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" &&
        submission?.createdAt === new Date("2025-01-20")) ||
      (dateFilter === "yesterday" &&
        submission?.createdAt === new Date("2025-01-19")) ||
      (dateFilter === "older" &&
        submission?.createdAt < new Date("2025-01-19"));

    return matchesSearch && matchesStatus && matchesSubject && matchesDate;
  });

  // Update status
  const updateStatus = async (id: string, newStatus: string) => {
    setIsStatusUPdate([...isStatusUpdate, id]);
    const update = await updateSubmissionStatus(id, newStatus);
    setIsStatusUPdate(isStatusUpdate.filter((i) => i !== id));
    if (update.success) {
      toast({
        title: "Status updated successfully",
        description: "The status has been updated successfully",
        variant: "default",
      });
      setSubmissions(
        submissions?.map((sub) =>
          sub?.id === id ? { ...sub, status: newStatus } : sub
        )
      );
      return;
    }
    toast({
      title: update.error,
      variant: "destructive",
    });
  };

  // Delete submission
  const deleteSubmission = async (id: string) => {
    if (confirm("Are you sure you want to delete this submission?")) {
      await DeleteSubmission(id);
      setSubmissions(submissions.filter((sub) => sub.id !== id));
    }
  };

  // View details
  const viewDetails = (submission: any) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Company",
      "Subject",
      "Message",
      "Status",
      "createdAt",
    ];
    const csvData = filteredSubmissions.map((sub) => [
      sub.id,
      sub.name,
      sub.email,
      sub.phone,
      sub.company,
      sub.subject,
      sub.message,
      sub.status,
      sub.createdAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...csvData].map((row) => row.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "contact_submissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get statistics
  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    inProgress: submissions.filter((s) => s.status === "in-progress").length,
    completed: submissions.filter((s) => s.status === "completed").length,
  };

  const handelFetchSubmissions = async () => {
    try {
      if (isFilterLoading) return;
      setIsFilterLoading(true);
      const res = await fetchContactSubmissions({
        status: statusFilter,
        search: searchTerm,
        createdAt: dateFilter,
        subject: subjectFilter,
      });
      setIsFilterLoading(false);
      setIsLoading(false);
      if (res?.success) {
        setSubmissions(res?.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    handelFetchSubmissions();
  }, [dateFilter, statusFilter, subjectFilter]);

  if (status === "loading") {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  if (
    !session ||
    !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role || "")
  ) {
    return (
      <div className="text-center text-2xl mx-auto my-12  font-bold">
        Access Denied
      </div>
    );
  }
  if (isLoading) {
    return (
      <MainLayout>
        <Loading message="loading submissions ..." h="h-full" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8 max-sm:py-2 max-sm:px-0 sm:py-1 sm:px-0">
          {/* Header */}
          <div className="mb-8 max-sm:mb-4">
            <h1 className="text-4xl max-sm:text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Contact Form Submissions
            </h1>
            <p className="text-gray-600">
              Manage and respond to customer inquiries
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-2 sm:grid-cols-2 max-sm:grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 sm:p-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 sm:text-xs text-sm mb-1">Total</p>
                  <p className="text-3xl sm:text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-7 sm:h-7  bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 sm:w-4 sm:h-4  text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600  sm:text-xs text-sm mb-1">
                    Pending
                  </p>
                  <p className="text-3xl sm:text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-7 sm:h-7  bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 sm:w-4 sm:h-4 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 sm:text-xs text-sm mb-1">
                    In Progress
                  </p>
                  <p className="text-3xl sm:text-2xl font-bold text-blue-600">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-7 sm:h-7 bg-blue-100 rounded-full flex items-center justify-center">
                  <Filter className="w-6 h-6 sm:w-4 sm:h-4  text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600  sm:text-xs  text-sm mb-1">
                    Completed
                  </p>
                  <p className="text-3xl sm:text-2xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-7 sm:h-7  bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 sm:w-4 sm:h-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="grid md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm  sm:text-xs font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 sm:left-2  top-1/2 transform -translate-y-1/2 text-gray-400 sm:w-4 sm:h-4 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4  sm:pl-7 sm:pr-2  p-1  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block sm:text-xs text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:py-1 sm:px-2 text-sm  px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block text-sm sm:text-xs font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full px-4 py-2 sm:py-1 text-sm sm:px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Subjects</option>
                  <option value="Sales Inquiry">Sales Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Request a Demo">Request a Demo</option>
                  <option value="Billing Question">Billing Question</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block sm:text-xs text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 sm:py-1 text-sm sm:px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="older">Older</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between  items-center mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm sm:text-xs text-gray-600">
                Showing {filteredSubmissions.length} of {submissions.length}{" "}
                submissions
              </p>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 sm:px-2 sm:py-1 sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 ">
            <div className=" overflow-x-auto ">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-4  text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isFilterLoading ? (
                    <Loading h="h-full" />
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">
                                {submission.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {submission.email}
                              </p>
                              <p className="text-[13px] text-gray-500">
                                {submission.company}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex text-xs items-center px-3 py-1 rounded-full  font-medium bg-indigo-100 text-indigo-800">
                            {submission.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p
                            title={submission.message}
                            className="text-xs text-gray-700 cursor-pointer line-clamp-2 max-w-xs"
                          >
                            {submission.message}
                          </p>
                        </td>
                        <td>
                          <p className="text-gray-900 font-medium text-xs">
                            {formatDate(submission.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {isStatusUpdate.includes(submission.id as any) ? (
                            <span className="text-[15px] font-normal cursor-progress text-gray-500">
                              updating..
                            </span>
                          ) : (
                            <select
                              disabled={submission.status == "completed"}
                              value={submission.status}
                              onChange={(e) =>
                                updateStatus(submission.id, e.target.value)
                              }
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                statusColors[submission.status]
                              } cursor-pointer`}
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewDetails(submission)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
                            </button>
                            <a
                              href={`mailto:${submission.email}`}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Send Email"
                            >
                              <Mail className="w-5 h-5 sm:w-4 sm:h-4" />
                            </a>
                            <a
                              href={`tel:${submission.phone}`}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Call"
                            >
                              <Phone className="w-5 h-5 sm:w-4 sm:h-4" />
                            </a>
                            <button
                              onClick={() => deleteSubmission(submission.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No submissions found</p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for viewing details */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Submission Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-900">
                        {selectedSubmission.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">
                        {selectedSubmission.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">
                        {selectedSubmission.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-orange-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-semibold text-gray-900">
                        {selectedSubmission.company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Inquiry Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Subject</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {selectedSubmission.subject}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Message</p>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                      {selectedSubmission.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold text-gray-900">
                          {selectedSubmission.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-semibold text-gray-900">
                          {selectedSubmission.time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Update Status
                </h3>
                <select
                  value={selectedSubmission.status}
                  onChange={(e) => {
                    updateStatus(selectedSubmission.id, e.target.value);
                    setSelectedSubmission({
                      ...selectedSubmission,
                      status: e.target.value,
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={`mailto:${selectedSubmission.email}`}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Send Email
                </a>
                <a
                  href={`tel:${selectedSubmission.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
