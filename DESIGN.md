# SCREEN LANDING PAGE
---
name: Modern Academic
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#63597c'
  on-secondary: '#ffffff'
  secondary-container: '#e1d4fd'
  on-secondary-container: '#645a7d'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
typography:
  h1:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container_max: 1440px
  gutter: 24px
---

## Brand & Style
The design system embodies a "Modern Academic" aesthetic, blending the intellectual prestige of traditional journals with the high-velocity efficiency of AI. It is designed for researchers who require a high-density information environment that remains breathable and reduces cognitive load during long sessions.

The style leans into **Minimalism** with a **Tactile** twist. It avoids the coldness of pure tech by using a warm, paper-like background and high-contrast editorial typography. Visual interest is concentrated in functional areas through vibrant gradients, signaling the "AI energy" within a stable, trustworthy framework.

## Colors
The palette is rooted in an Alabaster (#F2F0EA) base to mimic high-quality archival paper, significantly reducing eye strain compared to pure white. 

- **Primary Accent:** A dynamic Cyan-to-Blue gradient represents the AI's processing power. Use this sparingly for primary actions, progress indicators, and active states.
- **Neutrals:** Deep charcoal is reserved for core body text and headings to ensure WCAG AAA compliance. Muted slate is used for metadata, citations, and secondary UI hints.
- **System Colors:** Success, error, and warning states should utilize desaturated versions of standard tones to maintain the sophisticated, academic atmosphere.

## Typography
The system employs a high-contrast pairing to distinguish between content and interface.

- **Headings:** Playfair Display provides an authoritative, editorial feel. Use it for article titles, section headers, and significant branding moments.
- **UI & Body:** Inter is used for its exceptional legibility at small sizes and its neutral, utilitarian character. It handles data-dense tables and complex citations without visual clutter.
- **Labels:** Use uppercase Inter for small badges (like SINTA tiers) and metadata labels to provide a crisp, architectural structure to the page.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for content reading, centering the research material within a maximum width of 1440px to prevent excessive line lengths. 

- **The 8px Rhythm:** All padding and margins are multiples of 8px. 
- **Density:** Use "md" spacing for dashboard views to maximize information density, but shift to "lg" and "xl" vertical rhythm in "Reading Mode" to foster focus.
- **Margins:** Page margins are generous (48px+) to create a "gallery" effect for the data cards.

## Elevation & Depth
This design system uses **Tonal Layers** and **Ambient Shadows** rather than heavy physical elevation.

- **Surface 0:** Alabaster (#F2F0EA) main background.
- **Surface 1:** Slightly darker or lighter off-white used for sidebars and navigation backgrounds.
- **Cards:** Use a white background with a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.04)) and a thin 1px border (#1A1C1E at 5% opacity).
- **Active State:** Elements like active search bars may use a subtle glow effect derived from the primary cyan gradient to indicate focus.

## Shapes
The shape language is disciplined and professional. 

- **Small Components:** Buttons, input fields, and badges use a 0.25rem (4px) radius. This "soft-square" look maintains the serious academic tone while feeling modern.
- **Large Components:** Cards and modals use a 0.5rem (8px) radius to provide a gentle container for dense information.
- **Pills:** Only used for status indicators (like SINTA tiers) to differentiate them from actionable UI chips.

## Components
- **Search Inputs:** Large, centered fields with a "ghost" border that transitions to the Cyan-Blue gradient on focus. Use a subtle inner shadow to imply depth.
- **Minimalist Cards:** No heavy headers. Use typography to establish hierarchy. Footers should contain thin-bordered action chips for "Cite," "Save," or "Share."
- **SINTA Badges:** Small, pill-shaped tags with a charcoal background and white text. Use high-contrast numeric values (e.g., S1, S2) in a semi-bold weight.
- **Action Chips:** Use 1px borders in Muted Slate. On hover, the border darkens and the background shifts to a 5% opacity version of the primary accent.
- **Citations List:** Highly structured with vertical lines (rules) separating the source, date, and author. Use "body-sm" for these elements to keep the UI clean.
- **Data Tables:** Borderless rows with alternating subtle tonal shifts on hover. Headers should use the "label-caps" typographic style.
---

# SCREEN PLAYGROUND
---
name: Modern Academic Design System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#00685c'
  on-tertiary: '#ffffff'
  tertiary-container: '#008375'
  on-tertiary-container: '#f4fffb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#62fae3'
  tertiary-fixed-dim: '#3cddc7'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005047'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
  max_width: 1280px
---

## Brand & Style

This design system embodies the intersection of scholarly tradition and technological precision. It is designed for an audience that values intellectual rigor and data-driven insights, requiring an environment that feels both authoritative and innovative. 

The aesthetic leans into **Modern Corporate** with a heavy influence from **Minimalism**. It prioritizes clarity and information density without overwhelming the user. The visual language uses "high-tech" accents—such as vibrant gradients derived from the logo and thin, precise borders—to signal a forward-thinking, digital-first approach to academia. The emotional response is one of calm confidence, professional trust, and surgical accuracy.

## Colors

The color palette is anchored by a professional **Teal (#0D9488)**, which serves as the primary driver for actions and brand identification. This is supported by a spectrum of **Blue-greens and Cyans** extracted from the logo’s gradient, used sparingly for data visualization and secondary accents to maintain a "high-tech" feel.

Readability is paramount; therefore, the background is strictly **#FAFAFA (Off-white)**. This reduces the harsh contrast of pure white while maintaining a clean, academic canvas. Typography uses a deep **Slate (#1E293B)** to ensure high legibility and a sense of permanence.

## Typography

This design system utilizes a sophisticated typographic pairing to balance tradition and utility. 

**Playfair Display** is reserved for headlines and display text. Its high-contrast serifs provide the "academic" authority and editorial elegance required for a prestigious product. 

**Inter** handles all UI elements, body copy, and data-heavy labels. It was chosen for its exceptional legibility at small sizes and its neutral, systematic character. All body text follows a generous line-height (1.6) to facilitate long-form reading and cognitive ease.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid Grid**. The central content container caps at 1280px to prevent excessive line lengths in academic text. Within this container, a **12-column grid** is utilized with a 24px gutter.

The spacing rhythm is built on an 8px baseline. Large vertical "breathing room" (48px to 80px) is used between major sections to emphasize a minimalist, premium feel. Margins are generous to ensure the interface never feels "cramped," reflecting a sense of organized, rigorous thought.

## Elevation & Depth

Depth in this design system is communicated through **Subtle Ambient Shadows** and **Tonal Layering**. We avoid heavy dropshadows in favor of "low-contrast outlines" that define boundaries with surgical precision.

- **Level 0 (Surface):** The #FAFAFA background.
- **Level 1 (Cards/Inputs):** White (#FFFFFF) surfaces with a 1px border (#E2E8F0).
- **Level 2 (Hover/Dropdowns):** A very soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.04)) and a slightly darkened border.
- **Level 3 (Modals):** High-diffusion shadows with a subtle teal-tinted ambient glow to connect the element to the primary brand color.

## Shapes

The shape language uses **Rounded (0.5rem)** corners. This radius strikes a balance between the clinical sharpness of high-tech interfaces and the inviting softness of modern educational platforms. 

Interactive elements like buttons and search inputs maintain this consistent 0.5rem radius, while larger card layouts may scale up to **1rem (rounded-lg)** to create a distinct visual container for grouped information.

## Components

### Chat-like Search Input
The search bar is the primary entry point. It should appear as a large, pill-shaped or softly rounded container with a "glassy" white background. It includes a subtle teal glowing border on focus and utilizes a sans-serif font for the input text. Micro-interactions should include a smooth expansion when clicked.

### Card-based Layouts
Cards are the primary container for information. They feature a white background, a thin #E2E8F0 border, and no shadow by default. On hover, they should lift slightly using the Level 2 elevation and display a subtle primary-colored top border (2px) to indicate interactivity.

### Sophisticated Dropdowns
Dropdown menus should feel like "sheets" of paper. Use a white background, Level 2 shadows, and clear 16px padding. Selection states should use a soft teal tint (#F0FDFA) rather than a heavy saturated block of color.

### Buttons
- **Primary:** Solid Teal (#0D9488) with white text. Transition to a deeper teal on hover.
- **Secondary:** Transparent background with a Teal border.
- **Tertiary/Ghost:** No border, teal text, appearing as a clean link.

### Chips & Tags
Used for academic categories. These should have a slight Blue-green tint background with dark teal text, using all-caps for the **label-sm** typography to denote metadata.