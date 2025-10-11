"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  BarChart3,
  Store,
  Globe,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import PageEditorDialog from "./PageEditorDialog";

interface CompanyAdminDashboardProps {
  pages: any[];
  stats: any;
  user: any;
}

export default function CompanyAdminDashboard({
  pages,
  stats,
  user,
}: CompanyAdminDashboardProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [localPages, setLocalPages] = useState(pages);

  const pageTypes = [
    {
      type: "about",
      label: "About Us",
      icon: "📖",
      color: "bg-blue-100 text-blue-600",
    },
    {
      type: "contact",
      label: "Contact",
      icon: "📧",
      color: "bg-green-100 text-green-600",
    },
    {
      type: "privacy",
      label: "Privacy Policy",
      icon: "🔒",
      color: "bg-purple-100 text-purple-600",
    },
    {
      type: "terms",
      label: "Terms & Conditions",
      icon: "📜",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const createPage = (type: string) => {
    const pageType = pageTypes.find((p) => p.type === type);
    setSelectedPage({
      type,
      title: pageType?.label || "",
      content: "",
      isPublished: false,
      seoTitle: "",
      seoDescription: "",
    });
    setEditorOpen(true);
  };

  const editPage = (page: any) => {
    setSelectedPage(page);
    setEditorOpen(true);
  };

  const deletePage = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLocalPages((prev) => prev.filter((p) => p.id !== pageId));
        alert("Page deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      alert("Failed to delete page");
    }
  };

  const togglePublish = async (page: any) => {
    try {
      const response = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...page,
          isPublished: !page.isPublished,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setLocalPages((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} title="Company Admin Panel" />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Content Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage company pages • Dynamic updates • SEO optimization
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pages
              </CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPages}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Published
              </CardTitle>
              <Globe className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.publishedPages}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Restaurants
              </CardTitle>
              <Store className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRestaurants}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Restaurants
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.activeRestaurants}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Page Management */}
        <Card>
          <CardHeader>
            <CardTitle>Company Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pageTypes.map((pageType) => {
                const existingPage = localPages.find(
                  (p) => p.type === pageType.type
                );

                return (
                  <div
                    key={pageType.type}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg ${pageType.color} flex items-center justify-center text-2xl`}
                        >
                          {pageType.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {pageType.label}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {existingPage ? "Page exists" : "Not created yet"}
                          </p>
                        </div>
                      </div>
                      {existingPage && (
                        <div className="flex items-center gap-2">
                          {existingPage.isPublished ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                              Draft
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {existingPage ? (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <p className="line-clamp-2">{existingPage.title}</p>
                          <p className="text-xs mt-1">
                            Last updated:{" "}
                            {new Date(
                              existingPage.updatedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editPage(existingPage)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePublish(existingPage)}
                          >
                            {existingPage.isPublished ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(`/${pageType.type}`, "_blank")
                            }
                          >
                            <Globe className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePage(existingPage.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => createPage(pageType.type)}
                        className="w-full"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Page
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Page Editor Dialog */}
      {editorOpen && (
        <PageEditorDialog
          page={selectedPage}
          open={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setSelectedPage(null);
          }}
          onSave={(updatedPage) => {
            setLocalPages((prev) => {
              const exists = prev.find((p) => p.id === updatedPage.id);
              if (exists) {
                return prev.map((p) =>
                  p.id === updatedPage.id ? updatedPage : p
                );
              }
              return [...prev, updatedPage];
            });
            setEditorOpen(false);
            setSelectedPage(null);
          }}
        />
      )}
    </div>
  );
}
