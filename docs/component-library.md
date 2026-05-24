# Component Library & Styling Execution

## 1. Usage of shadcn/ui

We rely heavily on shadcn/ui to achieve a premium look rapidly. All UI components must be generated using the shadcn CLI and placed in `frontend/src/components/ui/`.

**Required Components to Install:**
- `button` (Standardized click targets)
- `input` (Search bars)
- `card` (Journal references, Feature grid boxes)
- `tabs` (Global vs Indonesia selection on the Landing Page)
- `select` / `dropdown-menu` (Index/Tier filtering in Playground)
- `badge` (S1-S6 tags on Journal Cards)
- `skeleton` (Loading states for AI synthesis and Journal Cards)

## 2. Component Customization (The Fuenzer Vibe)

shadcn/ui defaults to a very "Vercel-like" aesthetic. You MUST modify the generated components to fit the "Modern Academic" theme.

- **Radii**: Update `tailwind.config.js` or the root CSS to use slightly softer corners. Change `--radius` to `0.5rem` or use `rounded-md`/`rounded-lg`. Avoid overly sharp edges or extreme pill shapes.
- **Borders**: Make default borders more subtle. Use `border-slate-200` for cards.
- **Icons**: Use `lucide-react` for all iconography. Keep icon strokes thin (`strokeWidth 1.5`) for elegance.

## 3. State Management & Loading UI (Narrative Skeletons)

- **Instant Feedback**: When a user hits "Search", transition immediately to the Playground screen. Do NOT wait for the API response on the Landing Page.
- **Narrative Skeletons**: While the backend processes the data (which takes 2-4 seconds), the Playground screen MUST display Skeleton components that tell a story. Instead of just blinking grey boxes, show a progress sequence:
  - Phase 1: "Mencari di Semantic Scholar..."
  - Phase 2: "Memfilter dataset jurnal lokal..."
  - Phase 3: "Menganalisis dan menyusun sintesis dengan AI..."
  This makes the waiting experience feel premium and high-end.
- **Empty States**: Build an elegant `<EmptyState />` component featuring an illustration and helpful text if the search yields zero results.

## 4. Animations

Keep it professional. No bouncy or excessive animations.

- Use simple CSS transitions for hover states: `transition-all duration-200 ease-in-out`.
- For the AI typing effect, either stream the response from Go (ideal) or simulate a fast typewriter effect if receiving a single JSON block.