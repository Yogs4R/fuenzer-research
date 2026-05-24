# Design Guidelines & UI/UX Policy: "Modern Academic"

## 1. Core Philosophy

Fuenzer Research is designed to bridge the gap between rigorous academic journals and modern, high-speed SaaS. The UX must follow the Zero-Friction Principle: minimize clicks, avoid early login walls, and prioritize the search bar.

## 2. Color System (Strict Hex Codes)

Do NOT use default Tailwind colors indiscriminately. Use these mapped values in `tailwind.config.js`:

- **Backgrounds**: 
  - Main Body: `bg-[#FAFAFA]` (Alabaster) - Reduces eye strain. NEVER use pure white for the full page body.
  - Cards/Containers: `bg-[#FFFFFF]` (Pure White) with subtle shadow.
- **Typography**:
  - Primary Headings: `text-[#0F172A]` (Slate-900).
  - Body Text: `text-[#334155]` (Slate-700).
  - Muted Text: `text-[#64748B]` (Slate-500).
- **Brand Accents (Fuenzer Cyan-Blue)**:
  - Primary Gradients: `bg-gradient-to-r from-[#06b6d4] to-[#2563eb]`.
  - Focus Rings/Active States: `ring-[#0ea5e9]`.

## 3. Typography Scale & Fonts

Import fonts via Google Fonts.

- **Font-Serif (Academic Print Vibe)**: Use Merriweather or Playfair Display. Apply strictly to Main landing page headings (`h1`), Journal Card Titles (`h2`), and section titles.
- **Font-Sans (Modern Interface)**: Use Inter or Geist. Apply strictly to Paragraphs, search bar inputs, chat bubbles, buttons, and navigation links.

## 4. Layout Specifications

### A. Landing Page (`/`)
- **Hero Section**: Centered. Title max-width `4xl`. Search bar must be prominent (height `h-14` or `h-16`) with attached "Global | Indonesia/SINTA" toggle tabs right above or inside it.
- **Sections Flow**: Hero -> Stats Row -> Features -> How It Works -> FAQ -> Footer.

### B. Playground / Workspace (`/search`)
- **Top Bar**: Height `h-16`. Logo on the left, primary navigation centered, Profile on right.
- **Split-Screen Content**: `h-[calc(100vh-4rem)]`.
  - **Left Panel (AI Assistant)**: `w-2/5` (40%). AI synthesis text in a stylized chat card.
  - **Right Panel (Knowledge Base)**: `w-3/5` (60%). Scrollable vertical list of Journal Cards.

## 5. Responsive Design (Mobile Stacking)

The 40/60 Split-Screen is strictly for `md` (768px) breakpoints and above.

On mobile (`< 768px`), the layout MUST stack vertically: AI Assistant panel at the top, Knowledge Base references below it.
**Crucial Mobile UX**: During the API loading phase, do not let the user stare at a blank box before scrolling down. The AI Assistant panel must display an engaging **Narrative Skeleton Loader** ("Menganalisis 5 abstrak...") so the user knows the system is actively working for them.