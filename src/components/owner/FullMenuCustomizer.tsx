import { useEffect, useState } from "react";
import {
  Palette,
  Type,
  Layout,
  ImageIcon,
  Eye,
  Save,
  Video,
  Settings,
  Sliders,
  Square,
  Circle,
  Moon,
  Zap,
  Menu,
  X,
  Monitor,
  Tablet,
  Smartphone,
  VideoIcon,
  MoveLeftIcon,
  RefreshCcwIcon,
  StretchHorizontal,
  ImportIcon,
} from "lucide-react";
import { Card } from "../ui/CardUi";
import { SelectInput } from "../ui/SelectInput";
import { SliderInput } from "../ui/silderInput";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { Button } from "../ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "../ui/use-toast";

const ColorPicker = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="flex gap-2 items-center">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-20 rounded cursor-pointer border"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
        placeholder="#000000"
      />
    </div>
  </div>
);

const defaultCustomization = {
  primaryColor: "#3b82f6",
  secondaryColor: "#1e40af",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  accentColor: "#10b981",
  buttonTextColor: "#ffffff",
  cardBackground: "#ffffff",
  borderColor: "#e5e7eb",
  hoverColor: "#2563eb",
  successColor: "#10b981",
  errorColor: "#ef4444",
  warningColor: "#f59e0b",
  fontFamily: "Inter",
  headingFont: "Inter",
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
  fontWeight: 400,
  headingWeight: 700,
  layout: "grid",
  columns: 3,
  columnsMobile: 1,
  columnsTablet: 2,
  columnsDesktop: 3,
  gap: 16,
  padding: 16,
  maxWidth: 1200,
  containerPadding: 16,
  cardStyle: "modern",
  borderRadius: 12,
  cardShadow: "0 2px 8px rgba(0,0,0,0.1)",
  cardPadding: 16,
  cardBorder: true,
  cardBorderWidth: 1,
  showImages: true,
  imageStyle: "cover",
  imagePosition: "top",
  imageHeight: 192,
  imageRadius: 8,
  showVideos: false,
  videoAutoplay: false,
  videoMuted: true,
  videoLoop: true,
  showPrices: true,
  showDescription: true,
  showBadges: true,
  showRatings: false,
  showLogo: true,
  showQuantity: true,
  headerStyle: "gradient",
  headerHeight: 72,
  logoPosition: "left",
  logoSize: 40,
  backgroundImageMobile: "",
  backgroundImageTablet: "",
  backgroundImageDesktop: "",
  backgroundVideoMobile: "",
  backgroundVideoTablet: "",
  backgroundVideoDesktop: "",
  backgroundOpacity: 100,
  backgroundBlur: 0,
  backgroundOverlay: false,
  overlayColor: "#000000",
  overlayOpacity: 50,
  darkMode: false,
  buttonRadius: 8,
  buttonSize: "medium",
  buttonStyle: "solid",
  spacing: "normal",
  itemSpacing: 16,
  sectionSpacing: 32,
  enableAnimations: true,
  animationSpeed: "normal",
  hoverEffect: "lift",
  customCSS: "",
  enableGradients: true,
  enableShadows: true,
  enableTransitions: true,
  cartWidth: "normal",
  showItemImages: true,
  showItemBadges: true,
  cartLayout: "comfortable",
};

export default function FullMenuCustomizer({
  restaurant = {},
  onSave = () => {},
  isSaving: loading = false,
  onClose,
}: any) {
  const [customization, setCustomization] = useState({
    ...defaultCustomization,
    ...restaurant.customization,
  });
  const [customizeData, setCustomizeData] = useLocalStorage<string | null>(
    "customizeData",
    null
  );
  const [isLocalData, setIsLocalData] = useState<any>({});
  useEffect(() => {
    try {
      const dataInLocal = localStorage.getItem("customizeData") || null;
      const dataInLocalData =
        customizeData && dataInLocal !== null ? JSON.parse(dataInLocal) : null;
      setIsLocalData(dataInLocalData);
    } catch {}
  }, [customizeData, setCustomizeData]);

  const [activeTab, setActiveTab] = useState("colors");
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setSaving] = useState(loading);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [deviceType, setDeviceType] = useState("desktop");

  useEffect(() => {
    setSaving(loading);
  }, [loading]);

  const update = (key: any, value: any) => {
    setCustomization((prev: any) => ({ ...prev, [key]: value }));
  };

  const resetToDefault = () => {
    if (confirm("Reset all customizations to default?")) {
      setCustomization({ ...defaultCustomization });
    }
  };

  const importLocalData = () => {
    if (confirm("import all customizations to local?")) {
      setCustomization(isLocalData);
    }
  };

  const saveInLocal = () => {
    setCustomizeData(customization);
    toast({
      title: "save in Local successfully",
      variant: "default",
    });
  };

  const handleSave = async () => {
    onSave(customization);
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType("mobile");
      } else if (width < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tabs = [
    { id: "colors", label: "Colors", icon: Palette },
    { id: "typography", label: "Typography", icon: Type },
    { id: "layout", label: "Layout", icon: Layout },
    { id: "cards", label: "Cards", icon: Square },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "elements", label: "Elements", icon: Eye },
    { id: "background", label: "Background", icon: Video },
    { id: "buttons", label: "Buttons", icon: Circle },
    { id: "spacing", label: "Spacing", icon: Sliders },
    { id: "advanced", label: "Advanced", icon: Settings },
  ];

  const getDeviceColumns = () => {
    switch (previewDevice) {
      case "mobile":
        return customization.columnsMobile || 1;
      case "tablet":
        return customization.columnsTablet || 2;
      default:
        return customization.columnsDesktop || customization.columns || 3;
    }
  };

  const getDeviceBackground = () => {
    if (!customization) return null;

    const {
      backgroundImageMobile,
      backgroundImageTablet,
      backgroundImageDesktop,
    } = customization;

    switch (previewDevice) {
      case "mobile":
        return backgroundImageMobile;
      case "tablet":
        return backgroundImageTablet;
      default:
        return backgroundImageDesktop;
    }
  };
  const getDeviceVideo = () => {
    const {
      backgroundVideoMobile,
      backgroundVideoTablet,
      backgroundVideoDesktop,
    } = customization;
    switch (previewDevice) {
      case "mobile":
        return backgroundVideoMobile;
      case "tablet":
        return backgroundVideoTablet;
      default:
        return backgroundVideoDesktop;
    }
  };

  const bgVideo = getDeviceVideo();

  const bgImage = getDeviceBackground();

  useEffect(() => {
    if (!previewMode) {
      setPreviewDevice("mobile");
    }
    if (deviceType.includes("mobile")) {
      setPreviewDevice("mobile");
    }
  }, [previewMode]);

  const renderPreview = () => {
    const deviceClass = {
      mobile: "w-[440px]",
      tablet: "w-[840px]",
      desktop: "w-[1400px]",
    }[previewDevice];

    return (
      <div
        className={`${previewMode ? deviceClass : "w-[400px]"} mx-auto`}
        style={{
          maxWidth: `${window.innerWidth - 100}px`,
          overflow: "hidden",
        }}
      >
        {previewMode && !deviceType.includes("mobile") && (
          <div className="flex gap-2 mb-4 justify-center">
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={`p-2 rounded ${
                previewDevice === "mobile"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice("tablet")}
              className={`p-2 rounded ${
                previewDevice === "tablet"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={`p-2 rounded ${
                previewDevice === "desktop"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          className="rounded-lg max-h-[100vh]  relative overflow-y-auto overflow-x-hidden  isolate"
          style={{
            fontFamily: customization.fontFamily,
            color: customization.textColor,
            backgroundColor: customization.backgroundColor,
            fontSize: `${customization.fontSize}px`,
            lineHeight: customization.lineHeight,
          }}
        >
          {bgVideo && (
            <video
              src={bgVideo}
              autoPlay={customization.videoAutoplay}
              loop={customization.videoLoop}
              muted={customization.videoMuted}
              className="absolute inset-0 w-full h-full object-cover -z-10"
              style={{ filter: `blur(${customization.backgroundBlur}px)` }}
            />
          )}
          {!bgVideo && getDeviceBackground() && (
            <div
              className="absolute inset-0 bg-cover bg-center -z-10"
              style={{
                backgroundImage: `url(${bgImage})`,
                filter: customization.backgroundBlur
                  ? `blur(${customization.backgroundBlur}px)`
                  : "none",
                opacity: (customization.backgroundOpacity ?? 100) / 100,
              }}
            />
          )}
          {customization.backgroundOverlay && (
            <div
              className="absolute inset-0 -z-10"
              style={{
                backgroundColor: customization.overlayColor,
                opacity: customization.overlayOpacity / 100,
              }}
            />
          )}

          <div
            className="sticky top-0 mb-4 z-40 md:mb-6 p-3 md:p-4 rounded-lg"
            style={{
              background:
                customization.headerStyle === "gradient"
                  ? `linear-gradient(90deg, ${customization.primaryColor}, ${customization.secondaryColor})`
                  : customization.primaryColor,
              color: customization.buttonTextColor,
              height: `${customization.headerHeight}px`,
            }}
          >
            <div className="flex items-center gap-2 md:gap-4">
              {customization.showLogo && (
                <div
                  className="bg-white rounded-full flex items-center justify-center font-bold"
                  style={{
                    width: `${customization.logoSize}px`,
                    height: `${customization.logoSize}px`,
                    color: customization.primaryColor,
                  }}
                >
                  R
                </div>
              )}
              <h1
                className="font-bold text-sm md:text-xl"
                style={{
                  fontFamily: customization.headingFont,
                  fontWeight: customization.headingWeight,
                }}
              >
                Restaurant Name
              </h1>
            </div>
          </div>

          <div
            className={`grid ${
              customization.layout === "grid" ? "" : "grid-cols-1"
            }`}
            style={{
              gridTemplateColumns:
                customization.layout === "grid"
                  ? `repeat(${getDeviceColumns()}, 1fr)`
                  : "1fr",
              gap: `${customization.gap}px`,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`overflow-hidden transition-all ${
                  customization.hoverEffect === "lift" ? "hover:scale-105" : ""
                } ${
                  customization.hoverEffect === "glow" ? "hover:shadow-xl" : ""
                }`}
                style={{
                  backgroundColor: customization.cardBackground,
                  borderRadius: `${customization.borderRadius}px`,
                  boxShadow: customization.enableShadows
                    ? customization.cardShadow
                    : "none",
                  border: customization.cardBorder
                    ? `${customization.cardBorderWidth}px solid ${customization.borderColor}`
                    : "none",
                  padding: `${customization.cardPadding}px`,
                  transition: customization.enableTransitions
                    ? "all 0.3s ease"
                    : "none",
                }}
              >
                {customization.showImages && (
                  <div
                    className="bg-gradient-to-br from-blue-400 to-purple-500 mb-3"
                    style={{
                      height: `${customization.imageHeight}px`,
                      borderRadius: `${customization.imageRadius}px`,
                    }}
                  />
                )}

                <h3
                  className="font-bold mb-2 text-sm md:text-base"
                  style={{
                    fontFamily: customization.headingFont,
                    fontWeight: customization.headingWeight,
                    color: customization.primaryColor,
                  }}
                >
                  Menu Item {i}
                </h3>

                {customization.showDescription && (
                  <p
                    className="mb-2 text-xs md:text-sm"
                    style={{ color: customization.accentColor }}
                  >
                    Delicious food item
                  </p>
                )}

                {customization.showBadges && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${customization.successColor}20`,
                        color: customization.successColor,
                      }}
                    >
                      Veg
                    </span>
                  </div>
                )}

                {customization.showPrices && (
                  <p
                    className="font-bold mb-3 text-sm md:text-base"
                    style={{ color: customization.primaryColor }}
                  >
                    ₹{299 + i * 50}
                  </p>
                )}

                <button
                  className="w-full py-2 font-medium text-sm md:text-base"
                  style={{
                    backgroundColor:
                      customization.buttonStyle === "solid"
                        ? customization.primaryColor
                        : "transparent",
                    color:
                      customization.buttonStyle === "solid"
                        ? customization.buttonTextColor
                        : customization.primaryColor,
                    borderRadius: `${customization.buttonRadius}px`,
                    border:
                      customization.buttonStyle === "outline"
                        ? `2px solid ${customization.primaryColor}`
                        : "none",
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    switch (activeTab) {
      case "colors":
        return (
          <div className="space-y-6">
            <Card title="Brand Colors" icon={Palette}>
              <div
                className={`grid 
                   grid-cols-1 gap-4
                } `}
              >
                <ColorPicker
                  label="Primary Color"
                  value={customization.primaryColor}
                  onChange={(v: any) => update("primaryColor", v)}
                />
                <ColorPicker
                  label="Secondary Color"
                  value={customization.secondaryColor}
                  onChange={(v: any) => update("secondaryColor", v)}
                />
                <ColorPicker
                  label="Accent Color"
                  value={customization.accentColor}
                  onChange={(v: any) => update("accentColor", v)}
                />
                <ColorPicker
                  label="Background Color"
                  value={customization.backgroundColor}
                  onChange={(v: any) => update("backgroundColor", v)}
                />
              </div>
            </Card>

            <Card title="Text Colors">
              <div
                className={`grid 
                   grid-cols-1 gap-4
                } `}
              >
                <ColorPicker
                  label="Text Color"
                  value={customization.textColor}
                  onChange={(v: any) => update("textColor", v)}
                />
                <ColorPicker
                  label="Button Text"
                  value={customization.buttonTextColor}
                  onChange={(v: any) => update("buttonTextColor", v)}
                />
              </div>
            </Card>

            <Card title="UI Colors">
              <div
                className={`grid 
                   grid-cols-1 gap-4
                } `}
              >
                <ColorPicker
                  label="Card Background"
                  value={customization.cardBackground}
                  onChange={(v: any) => update("cardBackground", v)}
                />
                <ColorPicker
                  label="Border Color"
                  value={customization.borderColor}
                  onChange={(v: any) => update("borderColor", v)}
                />
                <ColorPicker
                  label="Success Color"
                  value={customization.successColor}
                  onChange={(v: any) => update("successColor", v)}
                />
                <ColorPicker
                  label="Error Color"
                  value={customization.errorColor}
                  onChange={(v: any) => update("errorColor", v)}
                />
              </div>
            </Card>
          </div>
        );

      case "layout":
        return (
          <div className="space-y-6">
            <Card title="Responsive Layout" icon={Layout}>
              <div className="space-y-4">
                <SelectInput
                  label="Layout Type"
                  value={customization.layout}
                  onChange={(v: any) => update("layout", v)}
                  options={[
                    { value: "grid", label: "Grid" },
                    { value: "list", label: "List" },
                  ]}
                />
                <SliderInput
                  label="Mobile Columns"
                  value={customization.columnsMobile}
                  onChange={(v: any) => update("columnsMobile", v)}
                  min={1}
                  max={2}
                  step={1}
                />
                <SliderInput
                  label="Tablet Columns"
                  value={customization.columnsTablet}
                  onChange={(v: any) => update("columnsTablet", v)}
                  min={1}
                  max={3}
                  step={1}
                />
                <SliderInput
                  label="Desktop Columns"
                  value={customization.columnsDesktop}
                  onChange={(v: any) => update("columnsDesktop", v)}
                  min={1}
                  max={6}
                  step={1}
                />
                <SliderInput
                  label="Gap Between Items"
                  value={customization.gap}
                  onChange={(v: any) => update("gap", v)}
                  min={0}
                  max={48}
                  step={4}
                  unit="px"
                />
              </div>
            </Card>

            <Card title="Container">
              <div className="space-y-4">
                <SliderInput
                  label="Max Width"
                  value={customization.maxWidth}
                  onChange={(v: any) => update("maxWidth", v)}
                  min={800}
                  max={1920}
                  step={40}
                  unit="px"
                />
                <SliderInput
                  label="Container Padding"
                  value={customization.containerPadding}
                  onChange={(v: any) => update("containerPadding", v)}
                  min={0}
                  max={64}
                  step={4}
                  unit="px"
                />
              </div>
            </Card>
          </div>
        );

      case "background":
        return (
          <div className="space-y-6">
            <Card title="Responsive Background Images" icon={ImageIcon}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Mobile Background
                  </label>
                  <input
                    type="text"
                    value={customization.backgroundImageMobile}
                    onChange={(e) =>
                      update("backgroundImageMobile", e.target.value)
                    }
                    placeholder="Mobile image URL"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tablet Background
                  </label>
                  <input
                    type="text"
                    value={customization.backgroundImageTablet}
                    onChange={(e) =>
                      update("backgroundImageTablet", e.target.value)
                    }
                    placeholder="Tablet image URL"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Desktop Background
                  </label>
                  <input
                    type="text"
                    value={customization.backgroundImageDesktop}
                    onChange={(e) =>
                      update("backgroundImageDesktop", e.target.value)
                    }
                    placeholder="Desktop image URL"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <SliderInput
                  label="Opacity"
                  value={customization.backgroundOpacity}
                  onChange={(v: any) => update("backgroundOpacity", v)}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                />
                <SliderInput
                  label="Blur"
                  value={customization.backgroundBlur}
                  onChange={(v: any) => update("backgroundBlur", v)}
                  min={0}
                  max={20}
                  step={1}
                  unit="px"
                />
              </div>
            </Card>

            <Card title="Responsive Background Video" icon={VideoIcon}>
              <div className="space-y-4">
                <div className="space-y-2">
                  {" "}
                  <label className="text-sm font-medium text-gray-700">
                    {" "}
                    Mobile Background{" "}
                  </label>{" "}
                  <input
                    type="text"
                    value={customization.backgroundVideoMobile}
                    onChange={(e) =>
                      update("backgroundVideoMobile", e.target.value)
                    }
                    placeholder="Mobile video URL"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <label className="text-sm font-medium text-gray-700">
                    {" "}
                    Tablet Background{" "}
                  </label>{" "}
                  <input
                    type="text"
                    value={customization.backgroundVideoTablet}
                    onChange={(e) =>
                      update("backgroundVideoTablet", e.target.value)
                    }
                    placeholder="Tablet video URL"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <label className="text-sm font-medium text-gray-700">
                    {" "}
                    Desktop Background{" "}
                  </label>{" "}
                  <input
                    type="text"
                    value={customization.backgroundVideoDesktop}
                    onChange={(e) =>
                      update("backgroundVideoDesktop", e.target.value)
                    }
                    placeholder="Desktop video URL"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />{" "}
                </div>
                <SliderInput
                  label="Opacity"
                  value={customization.backgroundOpacity}
                  onChange={(v: any) => update("backgroundOpacity", v)}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                />
                <SliderInput
                  label="Blur"
                  value={customization.backgroundBlur}
                  onChange={(v: any) => update("backgroundBlur", v)}
                  min={0}
                  max={20}
                  step={1}
                  unit="px"
                />
              </div>
            </Card>

            <Card title="Overlay">
              <div className="space-y-4">
                <ToggleSwitch
                  label="Enable Overlay"
                  checked={customization.backgroundOverlay}
                  onChange={(v: any) => update("backgroundOverlay", v)}
                />
                {customization.backgroundOverlay && (
                  <>
                    <ColorPicker
                      label="Overlay Color"
                      value={customization.overlayColor}
                      onChange={(v: any) => update("overlayColor", v)}
                    />
                    <SliderInput
                      label="Overlay Opacity"
                      value={customization.overlayOpacity}
                      onChange={(v: any) => update("overlayOpacity", v)}
                      min={0}
                      max={100}
                      step={5}
                      unit="%"
                    />
                  </>
                )}
              </div>
            </Card>
          </div>
        );

      case "typography":
        return (
          <div className="space-y-6">
            <Card title="Font Families" icon={Type}>
              <div className="space-y-4">
                <SelectInput
                  label="Body Font"
                  value={customization.fontFamily}
                  onChange={(v) => update("fontFamily", v)}
                  options={[
                    { value: "Inter", label: "Inter" },
                    { value: "Poppins", label: "Poppins" },
                    { value: "Roboto", label: "Roboto" },
                    { value: "Open Sans", label: "Open Sans" },
                    { value: "Lato", label: "Lato" },
                    { value: "Montserrat", label: "Montserrat" },
                    { value: "Playfair Display", label: "Playfair Display" },
                    { value: "Georgia", label: "Georgia" },
                  ]}
                />
                <SelectInput
                  label="Heading Font"
                  value={customization.headingFont}
                  onChange={(v) => update("headingFont", v)}
                  options={[
                    { value: "Inter", label: "Inter" },
                    { value: "Poppins", label: "Poppins" },
                    { value: "Montserrat", label: "Montserrat" },
                    { value: "Playfair Display", label: "Playfair Display" },
                    { value: "Bebas Neue", label: "Bebas Neue" },
                  ]}
                />
              </div>
            </Card>

            <Card title="Font Sizing">
              <div className="space-y-4">
                <SliderInput
                  label="Base Font Size"
                  value={customization.fontSize}
                  onChange={(v) => update("fontSize", v)}
                  min={12}
                  max={24}
                  step={1}
                  unit="px"
                />
                <SliderInput
                  label="Line Height"
                  value={customization.lineHeight}
                  onChange={(v) => update("lineHeight", v)}
                  min={1}
                  max={2}
                  step={0.1}
                />
                <SliderInput
                  label="Letter Spacing"
                  value={customization.letterSpacing}
                  onChange={(v) => update("letterSpacing", v)}
                  min={-2}
                  max={4}
                  step={0.5}
                  unit="px"
                />
              </div>
            </Card>

            <Card title="Font Weights">
              <div className="space-y-4">
                <SliderInput
                  label="Body Weight"
                  value={customization.fontWeight}
                  onChange={(v) => update("fontWeight", v)}
                  min={100}
                  max={900}
                  step={100}
                />
                <SliderInput
                  label="Heading Weight"
                  value={customization.headingWeight}
                  onChange={(v) => update("headingWeight", v)}
                  min={100}
                  max={900}
                  step={100}
                />
              </div>
            </Card>
          </div>
        );
      case "cards":
        return (
          <div className="space-y-6">
            <Card title="Card Style" icon={Square}>
              <div className="space-y-4">
                <SelectInput
                  label="Card Style"
                  value={customization.cardStyle}
                  onChange={(v) => update("cardStyle", v)}
                  options={[
                    { value: "modern", label: "Modern" },
                    { value: "classic", label: "Classic" },
                    { value: "minimal", label: "Minimal" },
                    { value: "elevated", label: "Elevated" },
                  ]}
                />
                <SliderInput
                  label="Border Radius"
                  value={customization.borderRadius}
                  onChange={(v) => update("borderRadius", v)}
                  min={0}
                  max={32}
                  step={2}
                  unit="px"
                />
                <SliderInput
                  label="Card Padding"
                  value={customization.cardPadding}
                  onChange={(v) => update("cardPadding", v)}
                  min={8}
                  max={48}
                  step={4}
                  unit="px"
                />
                <ToggleSwitch
                  label="Card Border"
                  checked={customization.cardBorder}
                  onChange={(v: any) => update("cardBorder", v)}
                />
                {customization.cardBorder && (
                  <SliderInput
                    label="Border Width"
                    value={customization.cardBorderWidth}
                    onChange={(v) => update("cardBorderWidth", v)}
                    min={1}
                    max={4}
                    step={1}
                    unit="px"
                  />
                )}
              </div>
            </Card>
          </div>
        );

      case "media":
        return (
          <div className="space-y-6">
            <Card title="Image Settings" icon={ImageIcon}>
              <div className="space-y-4">
                <ToggleSwitch
                  label="Show Images"
                  checked={customization.showImages}
                  onChange={(v) => update("showImages", v)}
                />
                {customization.showImages && (
                  <>
                    <SelectInput
                      label="Image Style"
                      value={customization.imageStyle}
                      onChange={(v) => update("imageStyle", v)}
                      options={[
                        { value: "cover", label: "Cover" },
                        { value: "contain", label: "Contain" },
                        { value: "fill", label: "Fill" },
                      ]}
                    />
                    <SliderInput
                      label="Image Height"
                      value={customization.imageHeight}
                      onChange={(v) => update("imageHeight", v)}
                      min={100}
                      max={400}
                      step={10}
                      unit="px"
                    />
                    <SliderInput
                      label="Image Border Radius"
                      value={customization.imageRadius}
                      onChange={(v) => update("imageRadius", v)}
                      min={0}
                      max={24}
                      step={2}
                      unit="px"
                    />
                  </>
                )}
              </div>
            </Card>

            <Card title="Video Settings" icon={Video}>
              <div className="space-y-4 ">
                <ToggleSwitch
                  label="Enable Videos"
                  checked={customization.showVideos}
                  onChange={(v) => update("showVideos", v)}
                />
                {customization.showVideos && (
                  <>
                    <ToggleSwitch
                      label="Autoplay"
                      checked={customization.videoAutoplay}
                      onChange={(v) => update("videoAutoplay", v)}
                    />
                    <ToggleSwitch
                      label="Muted"
                      checked={customization.videoMuted}
                      onChange={(v) => update("videoMuted", v)}
                    />
                    <ToggleSwitch
                      label="Loop"
                      checked={customization.videoLoop}
                      onChange={(v) => update("videoLoop", v)}
                    />
                  </>
                )}
              </div>
            </Card>
          </div>
        );

      case "elements":
        return (
          <div className="space-y-6">
            <Card title="Display Elements" icon={Eye}>
              <div className="space-y-3">
                <ToggleSwitch
                  label="Show Prices"
                  checked={customization.showPrices}
                  onChange={(v) => update("showPrices", v)}
                  description="Display item prices"
                />
                <ToggleSwitch
                  label="Show Descriptions"
                  checked={customization.showDescription}
                  onChange={(v) => update("showDescription", v)}
                  description="Show item descriptions"
                />
                <ToggleSwitch
                  label="Show Badges"
                  checked={customization.showBadges}
                  onChange={(v) => update("showBadges", v)}
                  description="Display dietary badges"
                />
                <ToggleSwitch
                  label="Show Ratings"
                  checked={customization.showRatings}
                  onChange={(v) => update("showRatings", v)}
                  description="Show item ratings"
                />
                <ToggleSwitch
                  label="Show Logo"
                  checked={customization.showLogo}
                  onChange={(v) => update("showLogo", v)}
                  description="Display restaurant logo"
                />
                <ToggleSwitch
                  label="Show Quantity Controls"
                  checked={customization.showQuantity}
                  onChange={(v) => update("showQuantity", v)}
                  description="Show +/- quantity buttons"
                />
              </div>
            </Card>

            <Card title="Header Settings">
              <div className="space-y-4">
                <SelectInput
                  label="Header Style"
                  value={customization.headerStyle}
                  onChange={(v) => update("headerStyle", v)}
                  options={[
                    { value: "solid", label: "Solid" },
                    { value: "gradient", label: "Gradient" },
                    { value: "transparent", label: "Transparent" },
                  ]}
                />
                <SliderInput
                  label="Header Height"
                  value={customization.headerHeight}
                  onChange={(v) => update("headerHeight", v)}
                  min={48}
                  max={120}
                  step={4}
                  unit="px"
                />
                {customization.showLogo && (
                  <SliderInput
                    label="Logo Size"
                    value={customization.logoSize}
                    onChange={(v) => update("logoSize", v)}
                    min={24}
                    max={80}
                    step={4}
                    unit="px"
                  />
                )}
              </div>
            </Card>
          </div>
        );
      case "buttons":
        return (
          <div className="space-y-6">
            <Card title="Button Style" icon={Circle}>
              <div className="space-y-4">
                <SelectInput
                  label="Button Style"
                  value={customization.buttonStyle}
                  onChange={(v) => update("buttonStyle", v)}
                  options={[
                    { value: "solid", label: "Solid" },
                    { value: "outline", label: "Outline" },
                    { value: "ghost", label: "Ghost" },
                  ]}
                />
                <SliderInput
                  label="Button Border Radius"
                  value={customization.buttonRadius}
                  onChange={(v) => update("buttonRadius", v)}
                  min={0}
                  max={32}
                  step={2}
                  unit="px"
                />
                <SelectInput
                  label="Button Size"
                  value={customization.buttonSize}
                  onChange={(v) => update("buttonSize", v)}
                  options={[
                    { value: "small", label: "Small" },
                    { value: "medium", label: "Medium" },
                    { value: "large", label: "Large" },
                  ]}
                />
              </div>
            </Card>
          </div>
        );

      case "spacing":
        return (
          <div className="space-y-6">
            <Card title="Spacing System" icon={Sliders}>
              <div className="space-y-4">
                <SelectInput
                  label="Overall Spacing"
                  value={customization.spacing}
                  onChange={(v) => update("spacing", v)}
                  options={[
                    { value: "compact", label: "Compact" },
                    { value: "normal", label: "Normal" },
                    { value: "relaxed", label: "Relaxed" },
                  ]}
                />
                <SliderInput
                  label="Item Spacing"
                  value={customization.itemSpacing}
                  onChange={(v) => update("itemSpacing", v)}
                  min={0}
                  max={48}
                  step={4}
                  unit="px"
                />
                <SliderInput
                  label="Section Spacing"
                  value={customization.sectionSpacing}
                  onChange={(v) => update("sectionSpacing", v)}
                  min={0}
                  max={96}
                  step={8}
                  unit="px"
                />
              </div>
            </Card>
          </div>
        );

      case "advanced":
        return (
          <div className="space-y-6">
            <Card title="Theme Mode" icon={Moon}>
              <div className="space-y-4">
                <ToggleSwitch
                  label="Dark Mode"
                  checked={customization.darkMode}
                  onChange={(v) => update("darkMode", v)}
                  description="Enable dark theme"
                />
              </div>
            </Card>

            <Card title="Effects & Animations" icon={Zap}>
              <div className="space-y-4">
                <ToggleSwitch
                  label="Enable Animations"
                  checked={customization.enableAnimations}
                  onChange={(v) => update("enableAnimations", v)}
                  description="Smooth transitions and animations"
                />
                <ToggleSwitch
                  label="Enable Shadows"
                  checked={customization.enableShadows}
                  onChange={(v) => update("enableShadows", v)}
                  description="Card and element shadows"
                />
                <ToggleSwitch
                  label="Enable Gradients"
                  checked={customization.enableGradients}
                  onChange={(v) => update("enableGradients", v)}
                  description="Gradient backgrounds"
                />
                <ToggleSwitch
                  label="Enable Transitions"
                  checked={customization.enableTransitions}
                  onChange={(v) => update("enableTransitions", v)}
                  description="Smooth state transitions"
                />
                <SelectInput
                  label="Hover Effect"
                  value={customization.hoverEffect}
                  onChange={(v) => update("hoverEffect", v)}
                  options={[
                    { value: "none", label: "None" },
                    { value: "lift", label: "Lift" },
                    { value: "glow", label: "Glow" },
                    { value: "scale", label: "Scale" },
                  ]}
                />
                <SelectInput
                  label="Animation Speed"
                  value={customization.animationSpeed}
                  onChange={(v) => update("animationSpeed", v)}
                  options={[
                    { value: "slow", label: "Slow" },
                    { value: "normal", label: "Normal" },
                    { value: "fast", label: "Fast" },
                  ]}
                />
              </div>
            </Card>

            <Card title="Custom CSS" icon={Settings}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Additional CSS (Advanced)
                </label>
                <textarea
                  value={customization.customCSS}
                  onChange={(e) => update("customCSS", e.target.value)}
                  placeholder=".custom-class { color: red; }"
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono min-h-[120px]"
                />
                <p className="text-xs text-gray-500">
                  Add custom CSS for advanced styling
                </p>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-base md:text-xl font-bold text-gray-900">
                Menu Customizer
              </h1>
              <Button
                variant={"outline"}
                onClick={() => onClose()}
                className="flex  items-center    gap-1 "
              >
                <MoveLeftIcon className="w-4 h-4" />
                <span className="hidden md:inline">Go Back</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => saveInLocal()}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                <StretchHorizontal className="w-4 h-4" />
                <span className="hidden md:inline">Save in local</span>
              </button>
              {isLocalData && (
                <button
                  onClick={() => importLocalData()}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                  <ImportIcon className="w-4 h-4" />
                  <span className="hidden md:inline">import form local</span>
                </button>
              )}
              <button
                onClick={() => resetToDefault()}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                <RefreshCcwIcon className="w-4 h-4" />
                <span className="hidden md:inline">Default Theme</span>
              </button>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                {previewMode ? (
                  <Settings className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                <span className="hidden md:inline">
                  {previewMode ? "Edit" : "Preview"}
                </span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span className="hidden md:inline">
                  {isSaving ? "Saving..." : "Save"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="  overflow-hidden mx-auto p-2 md:p-4">
        {previewMode ? (
          <div className="bg-white rounded-xl shadow-lg p-2 md:p-6 grid ">
            {renderPreview()}
          </div>
        ) : (
          <div className="  ">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 "
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <div
              className={`fixed  inset-y-0 left-0 z-50 transform ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }  transition-transform duration-300`}
            >
              <div className="bg-white rounded-xl shadow-sm border h-full overflow-auto">
                <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Settings</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          activeTab === tab.id
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Settings Panel */}
            <div
              className={`grid grid-cols-12 gap-2
              `}
            >
              <div
                className={` grid  md:col-span-6 col-span-12 bg-white rounded-xl shadow-sm border p-4 md:p-6`}
              >
                {renderSettings()}
              </div>
              <div className="hidden   sticky  top-0 md:block md:col-span-6 max-h-[105vh] bg-white rounded-xl shadow-sm border p-4 md:p-6">
                {renderPreview()}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className=" bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 ">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-600">Active Tab:</span>{" "}
              <span className="font-semibold text-gray-900">
                {tabs.find((t) => t.id === activeTab)?.label}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Primary Color:</span>{" "}
              <span className="font-mono text-sm">
                {customization.primaryColor}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Layout:</span>{" "}
              <span className="font-semibold capitalize">
                {customization.layout}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.stringify(customization, null, 2)
                );
                alert("Settings copied to clipboard!");
              }}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              Export JSON
            </button>
            <button
              onClick={() => {
                const json = prompt("Paste JSON settings:");
                if (json) {
                  try {
                    setCustomization(JSON.parse(json));
                    alert("Settings imported successfully!");
                  } catch (e) {
                    alert("Invalid JSON format");
                  }
                }
              }}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              Import JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
