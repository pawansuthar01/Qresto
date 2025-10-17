import { z } from "zod";

export const updateThemeSchema = z.object({
  // Colors
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
  cardBackground: z.string().optional(),
  borderColor: z.string().optional(),
  hoverColor: z.string().optional(),
  successColor: z.string().optional(),
  errorColor: z.string().optional(),
  warningColor: z.string().optional(),

  // Typography
  fontFamily: z.string().optional(),
  headingFont: z.string().optional(),
  fontSize: z.number().optional(),
  lineHeight: z.number().optional(),
  letterSpacing: z.number().optional(),
  fontWeight: z.number().optional(),
  headingWeight: z.number().optional(),

  // Layout
  layout: z.string().optional(),
  columns: z.number().optional(),
  gap: z.number().optional(),
  padding: z.number().optional(),
  maxWidth: z.number().optional(),
  containerPadding: z.number().optional(),

  // Cards
  cardStyle: z.string().optional(),
  borderRadius: z.number().optional(),
  cardShadow: z.string().optional(),
  cardPadding: z.number().optional(),
  cardBorder: z.boolean().optional(),
  cardBorderWidth: z.number().optional(),

  // Images
  showImages: z.boolean().optional(),
  imageStyle: z.string().optional(),
  imagePosition: z.string().optional(),
  imageHeight: z.number().optional(),
  imageRadius: z.number().optional(),

  // Video
  showVideos: z.boolean().optional(),
  videoAutoplay: z.boolean().optional(),
  videoMuted: z.boolean().optional(),
  videoLoop: z.boolean().optional(),

  // Display Elements
  showPrices: z.boolean().optional(),
  showDescription: z.boolean().optional(),
  showBadges: z.boolean().optional(),
  showRatings: z.boolean().optional(),
  showLogo: z.boolean().optional(),
  showQuantity: z.boolean().optional(),

  // Header
  headerStyle: z.string().optional(),
  headerHeight: z.number().optional(),
  logoPosition: z.string().optional(),
  logoSize: z.number().optional(),

  // Background
  backgroundImage: z.string().optional(),
  backgroundVideo: z.string().optional(),
  backgroundOpacity: z.number().optional(),
  backgroundBlur: z.number().optional(),
  backgroundOverlay: z.boolean().optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().optional(),

  // Theme
  darkMode: z.boolean().optional(),

  // Buttons
  buttonRadius: z.number().optional(),
  buttonSize: z.string().optional(),
  buttonStyle: z.string().optional(),

  // Spacing
  spacing: z.string().optional(),
  itemSpacing: z.number().optional(),
  sectionSpacing: z.number().optional(),

  // Animations
  enableAnimations: z.boolean().optional(),
  animationSpeed: z.string().optional(),
  hoverEffect: z.string().optional(),

  // Advanced
  customCSS: z.string().optional(),
  enableGradients: z.boolean().optional(),
  enableShadows: z.boolean().optional(),
  enableTransitions: z.boolean().optional(),
});
