"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Eye, Code, Loader2 } from "lucide-react";

interface PageEditorDialogProps {
  page: any;
  open: boolean;
  onClose: () => void;
  onSave: (page: any) => void;
}

export default function PageEditorDialog({
  page,
  open,
  onClose,
  onSave,
}: PageEditorDialogProps) {
  const [formData, setFormData] = useState({
    type: page?.type || "",
    title: page?.title || "",
    content: page?.content || "",
    isPublished: page?.isPublished || false,
    seoTitle: page?.seoTitle || "",
    seoDescription: page?.seoDescription || "",
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save page");

      const savedPage = await response.json();
      onSave(savedPage);
      alert("Page saved successfully!");
    } catch (error) {
      console.error("Error saving page:", error);
      alert("Failed to save page");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {page?.id ? "Edit" : "Create"} Page
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}{" "}
              Page
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreview(!preview)}>
              {preview ? (
                <Code className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {preview ? "Edit" : "Preview"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>

        <div className="p-6">
          {!preview ? (
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6 mt-6">
                <div>
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter page title"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Page Content (HTML) *</Label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter HTML content..."
                    className="w-full h-96 p-4 border rounded-lg font-mono text-sm mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    You can use HTML tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;,
                    &lt;ul&gt;, &lt;ol&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
                  </p>
                </div>

                {/* HTML Helper Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Heading 2", tag: "<h2>Heading</h2>" },
                    { label: "Heading 3", tag: "<h3>Heading</h3>" },
                    { label: "Paragraph", tag: "<p>Text</p>" },
                    { label: "Bold", tag: "<strong>Text</strong>" },
                    {
                      label: "List",
                      tag: "<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>",
                    },
                  ].map((btn) => (
                    <Button
                      key={btn.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const textarea = document.getElementById(
                          "content"
                        ) as HTMLTextAreaElement;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = formData.content;
                        const newText =
                          text.substring(0, start) +
                          btn.tag +
                          text.substring(end);
                        setFormData({ ...formData, content: newText });
                      }}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-6 mt-6">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                    placeholder="Enter SEO title (optional)"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 50-60 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder="Enter SEO description (optional)"
                    className="w-full h-24 p-3 border rounded-lg mt-2"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 150-160 characters (
                    {formData.seoDescription.length}/160)
                  </p>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6 mt-6">
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPublished: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <span className="font-medium">Publish Page</span>
                      <p className="text-sm text-gray-600">
                        Make this page visible to public
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Page URL</h4>
                  <code className="text-sm text-blue-700">
                    {window.location.origin}/{formData.type}
                  </code>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            // Preview Mode
            <div className="bg-gray-100 p-8 rounded-lg">
              <div className="bg-white rounded-lg p-8 max-w-4xl mx-auto shadow-lg">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  {formData.title}
                </h1>
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <div className="text-sm text-gray-600">
              {formData.isPublished ? (
                <span className="text-green-600">
                  ✓ This page will be published
                </span>
              ) : (
                <span className="text-orange-600">
                  ⚠ This page will be saved as draft
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Page
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
