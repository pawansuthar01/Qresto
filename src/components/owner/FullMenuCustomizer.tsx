"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
  Eye,
  Save,
  RotateCcw,
} from "lucide-react";

interface FullMenuCustomizerProps {
  restaurant: any;
  onSave: (customization: any) => void;
  onClose: () => void;
}

export default function FullMenuCustomizer({
  restaurant,
  onSave,
  onClose,
}: FullMenuCustomizerProps) {
  const [customization, setCustomization] = useState({
    // Colors
    primaryColor: restaurant.customization?.primaryColor || "#3b82f6",
    secondaryColor: restaurant.customization?.secondaryColor || "#1e40af",
    backgroundColor: restaurant.customization?.backgroundColor || "#ffffff",
    textColor: restaurant.customization?.textColor || "#1f2937",
    accentColor: restaurant.customization?.accentColor || "#10b981",

    // Typography
    fontFamily: restaurant.customization?.fontFamily || "Inter",
    headingFont: restaurant.customization?.headingFont || "Inter",
    fontSize: restaurant.customization?.fontSize || "medium",

    // Layout
    layout: restaurant.customization?.layout || "grid",
    cardStyle: restaurant.customization?.cardStyle || "modern",
    borderRadius: restaurant.customization?.borderRadius || "12px",
    spacing: restaurant.customization?.spacing || "normal",
    columns: restaurant.customization?.columns || 3,

    // Images
    showImages: restaurant.customization?.showImages !== false,
    imageStyle: restaurant.customization?.imageStyle || "cover",
    imagePosition: restaurant.customization?.imagePosition || "top",

    // Elements
    showPrices: restaurant.customization?.showPrices !== false,
    showDescription: restaurant.customization?.showDescription !== false,
    showBadges: restaurant.customization?.showBadges !== false,
    showRatings: restaurant.customization?.showRatings !== false,

    // Header
    headerStyle: restaurant.customization?.headerStyle || "gradient",
    showLogo: restaurant.customization?.showLogo !== false,
    logoPosition: restaurant.customization?.logoPosition || "left",

    // Background
    backgroundImage: restaurant.customization?.backgroundImage || "",
    backgroundOpacity: restaurant.customization?.backgroundOpacity || 100,
    darkMode: restaurant.customization?.darkMode || false,
  });

  const [previewMode, setPreviewMode] = useState(false);

  const updateCustomization = (key: string, value: any) => {
    setCustomization((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(customization);
  };

  const resetToDefault = () => {
    if (confirm("Reset all customizations to default?")) {
      setCustomization({
        primaryColor: "#3b82f6",
        secondaryColor: "#1e40af",
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        accentColor: "#10b981",
        fontFamily: "Inter",
        headingFont: "Inter",
        fontSize: "medium",
        layout: "grid",
        cardStyle: "modern",
        borderRadius: "12px",
        spacing: "normal",
        columns: 3,
        showImages: true,
        imageStyle: "cover",
        imagePosition: "top",
        showPrices: true,
        showDescription: true,
        showBadges: true,
        showRatings: true,
        headerStyle: "gradient",
        showLogo: true,
        logoPosition: "left",
        backgroundImage: "",
        backgroundOpacity: 100,
        darkMode: false,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Full Menu Customization
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete control over menu appearance • Live preview
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          {!previewMode ? (
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="colors">
                  <Palette className="w-4 h-4 mr-2" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="typography">
                  <Type className="w-4 h-4 mr-2" />
                  Typography
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <Layout className="w-4 h-4 mr-2" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="images">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Images
                </TabsTrigger>
                <TabsTrigger value="elements">
                  <Eye className="w-4 h-4 mr-2" />
                  Elements
                </TabsTrigger>
              </TabsList>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Color Scheme</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Color</Label>
                      <Input
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) =>
                          updateCustomization("primaryColor", e.target.value)
                        }
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <Input
                        type="color"
                        value={customization.secondaryColor}
                        onChange={(e) =>
                          updateCustomization("secondaryColor", e.target.value)
                        }
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label>Background Color</Label>
                      <Input
                        type="color"
                        value={customization.backgroundColor}
                        onChange={(e) =>
                          updateCustomization("backgroundColor", e.target.value)
                        }
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={customization.textColor}
                        onChange={(e) =>
                          updateCustomization("textColor", e.target.value)
                        }
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label>Accent Color</Label>
                      <Input
                        type="color"
                        value={customization.accentColor}
                        onChange={(e) =>
                          updateCustomization("accentColor", e.target.value)
                        }
                        className="h-12"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Font Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Body Font</Label>
                      <select
                        value={customization.fontFamily}
                        onChange={(e) =>
                          updateCustomization("fontFamily", e.target.value)
                        }
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Playfair Display">
                          Playfair Display
                        </option>
                      </select>
                    </div>
                    <div>
                      <Label>Heading Font</Label>
                      <select
                        value={customization.headingFont}
                        onChange={(e) =>
                          updateCustomization("headingFont", e.target.value)
                        }
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Playfair Display">
                          Playfair Display
                        </option>
                      </select>
                    </div>
                    <div>
                      <Label>Font Size</Label>
                      <select
                        value={customization.fontSize}
                        onChange={(e) =>
                          updateCustomization("fontSize", e.target.value)
                        }
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Layout Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Layout Style</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {["grid", "list"].map((style) => (
                          <button
                            key={style}
                            onClick={() => updateCustomization("layout", style)}
                            className={`p-4 rounded-lg border-2 capitalize ${
                              customization.layout === style
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Card Style</Label>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        {["modern", "classic", "minimal"].map((style) => (
                          <button
                            key={style}
                            onClick={() =>
                              updateCustomization("cardStyle", style)
                            }
                            className={`p-4 rounded-lg border-2 capitalize ${
                              customization.cardStyle === style
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Border Radius</Label>
                      <Input
                        type="range"
                        min="0"
                        max="24"
                        value={parseInt(customization.borderRadius)}
                        onChange={(e) =>
                          updateCustomization(
                            "borderRadius",
                            `${e.target.value}px`
                          )
                        }
                        className="w-full"
                      />
                      <span className="text-sm text-gray-600">
                        {customization.borderRadius}
                      </span>
                    </div>

                    <div>
                      <Label>Columns (Grid)</Label>
                      <select
                        value={customization.columns}
                        onChange={(e) =>
                          updateCustomization(
                            "columns",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="1">1 Column</option>
                        <option value="2">2 Columns</option>
                        <option value="3">3 Columns</option>
                        <option value="4">4 Columns</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Image Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customization.showImages}
                          onChange={(e) =>
                            updateCustomization("showImages", e.target.checked)
                          }
                          className="w-5 h-5"
                        />
                        <span>Show Images</span>
                      </label>
                    </div>

                    <div>
                      <Label>Image Style</Label>
                      <select
                        value={customization.imageStyle}
                        onChange={(e) =>
                          updateCustomization("imageStyle", e.target.value)
                        }
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                      </select>
                    </div>

                    <div>
                      <Label>Image Position</Label>
                      <select
                        value={customization.imagePosition}
                        onChange={(e) =>
                          updateCustomization("imagePosition", e.target.value)
                        }
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="top">Top</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Elements Tab */}
              <TabsContent value="elements" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Display Elements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { key: "showPrices", label: "Show Prices" },
                      { key: "showDescription", label: "Show Description" },
                      { key: "showBadges", label: "Show Badges" },
                      { key: "showRatings", label: "Show Ratings" },
                      { key: "showLogo", label: "Show Logo" },
                      { key: "darkMode", label: "Dark Mode" },
                    ].map((element) => (
                      <label
                        key={element.key}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={
                            customization[
                              element.key as keyof typeof customization
                            ] as boolean
                          }
                          onChange={(e) =>
                            updateCustomization(element.key, e.target.checked)
                          }
                          className="w-5 h-5"
                        />
                        <span>{element.label}</span>
                      </label>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="bg-gray-100 p-8 rounded-lg">
              <div
                className="bg-white rounded-lg p-6 shadow-lg"
                style={{
                  fontFamily: customization.fontFamily,
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                }}
              >
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{
                    fontFamily: customization.headingFont,
                    color: customization.primaryColor,
                  }}
                >
                  Menu Preview
                </h2>
                <div
                  className={`grid gap-4 ${
                    customization.layout === "grid"
                      ? `grid-cols-${customization.columns}`
                      : "grid-cols-1"
                  }`}
                >
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="border rounded-lg overflow-hidden"
                      style={{ borderRadius: customization.borderRadius }}
                    >
                      {customization.showImages && (
                        <div className="h-48 bg-gray-200" />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">
                          Sample Item {i}
                        </h3>
                        {customization.showDescription && (
                          <p className="text-sm text-gray-600 mb-2">
                            Delicious food item description
                          </p>
                        )}
                        {customization.showPrices && (
                          <p
                            className="font-bold"
                            style={{ color: customization.primaryColor }}
                          >
                            ₹299
                          </p>
                        )}
                        {customization.showBadges && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-2">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <Button variant="outline" onClick={resetToDefault}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
