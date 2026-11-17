# Graph Report - fuenzer-research  (2026-11-17)

## Corpus Check
- Large corpus: 135 files · ~699,596 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 840 nodes · 1948 edges · 59 communities (41 shown, 18 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- React App & Routing
- UI Shared Components
- Research Handler & Tests
- Firestore Sync Helpers
- Library Compare & Citations
- CI Security Workflow
- Backend Auth & IP Tests
- API Orchestration Architecture
- Firebase Client Auth
- CI Release Workflow
- Frontend Runtime Dependencies
- Backend Config & Setup
- Autocomplete & Domain Models
- Fiber Gateway & IP Spoofing Guard
- Backend Auth Email Handlers
- Frontend Dev Dependencies
- Core Platform Features
- TypeScript App Config
- Brand Logos & Icons
- TypeScript Node Config
- Firebase Admin SDK Wrapper
- ESLint Configuration
- External API Clients
- Backend Specification & Indexes
- Frontend Tooling Packages
- Contributing & Git Conventions
- LLM Discovery & Routes
- AI Synthesis Persona & Rules
- Agent Guidelines & Security Overview
- Firecrawl Visual Tokens
- SEO, Analytics & JSON-LD
- HTML Shell & AI Endpoints
- Fuenzer Design Tokens
- Federated Search & Workspace
- Cloud Run & Export Suite
- Bing & Copilot SEO Compliance
- HTTP Transport Test Helpers
- Garuda SQLite FTS5 Performance
- Vite Build Config
- NPM Dependency Overrides
- NPM Package Scripts
- Code of Conduct
- Timeout Test Fixtures
- Root TypeScript Project Config
- OpenAlex Resilience Rules
- Cloud Run Deployment Script
- Monorepo Structure Manifesto
- UI Component Library Guidelines
- Landing Page & Zero-Friction UX
- Project Progress Kanban
- API Data Flow Spec
- Bing Webmaster Guidelines
- Garuda Maintenance Planning
- Production Security Policy
- Go Module Root

## God Nodes (most connected - your core abstractions)
1. `useUiStore` - 48 edges
2. `useResearchStore` - 46 edges
3. `useAuthStore` - 37 edges
4. `react` - 32 edges
5. `lucide-react` - 28 edges
6. `useSEO()` - 27 edges
7. `Navbar()` - 23 edges
8. `react-router-dom` - 22 edges
9. `AcademicSource` - 20 edges
10. `PlaygroundPage()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Garuda SQLite 3 Client (garuda_articles_data.db, 652,144 cleaned articles)` --semantically_similar_to--> `Garuda Curated SQLite Database (652,144 articles from 3.6M portal)`  [EXTRACTED] [semantically similar]
  backend/README.md → README.en.md
- `Fuenzer Research Backend REST API (Golang + Fiber v2)` --semantically_similar_to--> `Go Fiber API Gateway (Golang 1.25, Goroutines, Security Headers, CORS, 15/min Limiter)`  [EXTRACTED] [semantically similar]
  backend/README.md → README.en.md
- `Fuenzer Research Frontend Application` --semantically_similar_to--> `Frontend SPA Architecture (React 19, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query, JSZip, jsPDF)`  [INFERRED] [semantically similar]
  frontend/README.md → frontend/public/llms-full.txt
- `Fuenzer Research Platform Summary` --semantically_similar_to--> `Fuenzer Research Platform`  [INFERRED] [semantically similar]
  frontend/public/llms.txt → frontend/public/llms-full.txt
- `MatchesRank()` --calls--> `ContainsAll()`  [EXTRACTED]
  backend/internal/services/sinta/mapper.go → backend/internal/config/config.go

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fuenzer Research Brand Logos, Icons, and OG Preview** — frontend_assets_dark_fuenzer_research_logo_dark_png_asset, frontend_assets_dark_fuenzer_research_logo_dark_webp_asset, frontend_assets_light_fuenzer_research_logo_light_asset, frontend_public_android_chrome_192x192_asset, frontend_public_android_chrome_512x512_asset, frontend_public_apple_touch_icon_asset, frontend_public_assets_dark_fuenzer_research_logo_dark_png_asset, frontend_public_assets_dark_fuenzer_research_logo_dark_webp_asset, frontend_public_assets_light_fuenzer_research_logo_light_asset, frontend_public_favicon_16x16_asset, frontend_public_favicon_32x32_asset, frontend_public_og_image_asset [INFERRED 0.85]
- **Academic Index and Literature Source Partner Logos** — frontend_src_assets_logos_garuda_asset, frontend_src_assets_logos_googlebooks_asset, frontend_src_assets_logos_googlescholar_asset, frontend_src_assets_logos_scimago_asset, frontend_src_assets_logos_scopus_asset, frontend_src_assets_logos_sinta_asset [INFERRED 0.85]

## Communities (59 total, 18 thin omitted)

### Community 0 - "React App & Routing"
Cohesion: 0.07
Nodes (60): App(), AuthInitializer(), queryClient, OAuthProviders(), OAuthProvidersProps, HeroBackground(), AuthLayout(), AuthLayoutProps (+52 more)

### Community 1 - "UI Shared Components"
Cohesion: 0.11
Nodes (48): Dropdown(), DropdownItem(), DropdownItemProps, DropdownProps, Footer(), JournalCard(), JournalCardProps, SaveToLibraryModal() (+40 more)

### Community 2 - "Research Handler & Tests"
Cohesion: 0.08
Nodes (21): NewResearchHandler(), respondOpenAlexError(), TestRespondOpenAlexError(), AcademicSource, IndexEntry, SintaJournal, Client, buildAskPrompt() (+13 more)

### Community 3 - "Firestore Sync Helpers"
Cohesion: 0.14
Nodes (33): clearAllHistory(), createLibrary(), deleteHistoryEntry(), deleteLibrary(), Library, loadBookmarksFromLibrary(), loadHistory(), loadLibraries() (+25 more)

### Community 4 - "Library Compare & Citations"
Cohesion: 0.11
Nodes (27): CompareMessage, LibraryCompareView(), LibraryCompareViewProps, readCompareHistory(), AIAssistantPanel(), AIAssistantPanelProps, AIChatBubble(), HistoryEntry (+19 more)

### Community 5 - "CI Security Workflow"
Cohesion: 0.07
Nodes (32): name, runs-on, steps, GITHUB_TOKEN, jobs, container-scanning, secret-scanning, name (+24 more)

### Community 6 - "Backend Auth & IP Tests"
Cohesion: 0.13
Nodes (16): TestAuthHandlerGuards(), TestIsValidEmail(), TestResolveAllowedOrigin(), TestSendVerificationRequiresAuth(), isGibberish(), TestIsGibberish(), TestResearchHandlerValidation(), truncateRunes() (+8 more)

### Community 7 - "API Orchestration Architecture"
Cohesion: 0.06
Nodes (26): Step 3: Gemini 2.5 Flash Synthesis (Temperature 0.3, short-circuit 200 OK on 0 results), Extensible indexes Array Schema ([{provider: sinta, tier: SINTA 2}]), Step 1: OpenAlex Data Retrieval (top 5 papers, Indonesia query append, 8s timeout -> 504), POST /api/v1/research Orchestration Endpoint, Dockerized Google Cloud Run Deployment, Golang 1.22+ Fiber API Gateway (localhost:8080), Google Gemini 1.5 Flash Engine (Google Gen AI SDK for Go), OpenAlex API External Data Source (+18 more)

### Community 8 - "Firebase Client Auth"
Cohesion: 0.14
Nodes (23): app, auth, db, firebaseConfig, googleProvider, logOut(), microsoftProvider, onAuthChange() (+15 more)

### Community 9 - "CI Release Workflow"
Cohesion: 0.08
Nodes (25): name, permissions, runs-on, steps, CHANGELOG, jobs, build-and-release, name (+17 more)

### Community 10 - "Frontend Runtime Dependencies"
Cohesion: 0.09
Nodes (23): dependencies, axios@^1.20.0, dompurify@^3.4.17, firebase@^12.14.0, jspdf@^4.2.1, jszip@^3.10.1, lucide-react@^1.16.0, marked@^18.0.4 (+15 more)

### Community 11 - "Backend Config & Setup"
Cohesion: 0.14
Nodes (13): main(), ContainsAll(), getEnv(), Config, Load(), ResolveDataFile(), extractEmail(), Client (+5 more)

### Community 12 - "Autocomplete & Domain Models"
Cohesion: 0.14
Nodes (12): NewAutocompleteHandler(), OpenAlexWork, Client, AutocompleteHandler, AskResponse, GeminiAbstract, OpenAlexAuthor, OpenAlexAuthorship (+4 more)

### Community 13 - "Fiber Gateway & IP Spoofing Guard"
Cohesion: 0.15
Nodes (4): clientIP(), isCloudflareIP(), lastForwardedIP(), TestClientIPAntiSpoofing()

### Community 14 - "Backend Auth Email Handlers"
Cohesion: 0.21
Nodes (12): formatCustomRedirectLink(), isLocalhostOrigin(), isValidEmail(), NewAuthHandler(), newAuthHandlerWithClient(), renderAuthEmailHTML(), resolveAllowedOrigin(), TestRenderAuthEmailHTMLEscapesInput() (+4 more)

### Community 15 - "Frontend Dev Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer@^10.5.0, postcss@^8.5.25, tailwindcss@^4.3.0, @tailwindcss/typography@^0.5.19, @types/marked@^5.0.2, @types/node@^24.12.3, @types/react@^19.2.14 (+11 more)

### Community 16 - "Core Platform Features"
Cohesion: 0.11
Nodes (15): Apache 2.0 License, Bilingual Localization (Indonesian & English), Bibliography & Citations Generator (BibTeX .bib & RIS .ris), Literature Matrix CSV Exporter (CSV Injection Safe), Rich Aesthetics & Dark Mode (Alabaster #FAFAFA, Glassmorphism), Fuenzer Research Frontend README, Frontend Environment Configuration (VITE_API_URL & VITE_FIREBASE_*), Fuenzer Research Frontend Application (+7 more)

### Community 17 - "TypeScript App Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 18 - "Brand Logos & Icons"
Cohesion: 0.13
Nodes (18): Fuenzer Research Logo Dark (PNG), Fuenzer Research Logo Dark (WebP), Fuenzer Research Logo Light (WebP), Android Chrome Icon 192x192, Android Chrome Icon 512x512, Apple Touch Icon, Public Fuenzer Research Logo Dark (PNG), Public Fuenzer Research Logo Dark (WebP) (+10 more)

### Community 19 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 20 - "Firebase Admin SDK Wrapper"
Cohesion: 0.29
Nodes (3): Client, firebaseAuthClient, mockFirebaseAuth

### Community 21 - "ESLint Configuration"
Cohesion: 0.15
Nodes (12): eslint@^10.3.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.6.0, typescript-eslint@^8.59.2, eslint, @eslint/js (+4 more)

### Community 22 - "External API Clients"
Cohesion: 0.21
Nodes (6): GoogleBooksResponse, APIError, AutocompleteResponse, AutocompleteResult, OpenAlexSourceItem, OpenAlexSourcesResponse

### Community 23 - "Backend Specification & Indexes"
Cohesion: 0.22
Nodes (10): Backend Internal Handlers (auth, autocomplete, research) & Services (email, firebase, garuda, gemini, googlebooks, openalex, sinta), backend/README.md - Fuenzer Research Backend Specification, Fuenzer Research Backend REST API (Golang + Fiber v2), Garuda SQLite 3 Client (garuda_articles_data.db, 652,144 cleaned articles), SINTA Local JSON Search Engine (sinta_journals_data.json, ~700 journals & ~7000 articles), Garuda Curated SQLite Database (652,144 articles from 3.6M portal), Go Fiber API Gateway (Golang 1.25, Goroutines, Security Headers, CORS, 15/min Limiter), Google Books API (+2 more)

### Community 24 - "Frontend Tooling Packages"
Cohesion: 0.18
Nodes (10): @types/dompurify@^3.0.5, @tailwindcss/postcss@^4.3.0, @types/zxcvbn@^4.4.5, name, private, type, version, @tailwindcss/postcss (+2 more)

### Community 25 - "Contributing & Git Conventions"
Cohesion: 0.22
Nodes (10): Git Branch Naming & Conventional Commits Convention, Development Prerequisites (Go 1.26+, Node.js 20.x+, npm 10.x+, Git, Docker), CONTRIBUTING.md - Contributing Guide & Dev Setup, Backend Setup (Go + Fiber on http://localhost:8080 via ./cmd/api), PR Quality & Automated CI Checks (gofmt, go vet, npm lint/build, Trivy, Gitleaks), Frontend Setup (React 19 + TypeScript + Tailwind CSS + Vite on http://localhost:5173), Automated CI/CD Security Scanning (Trivy Container Scan, Gitleaks Secret Scan, Dependabot), SECURITY.md - Security Policy & Vulnerability Disclosure (+2 more)

### Community 26 - "LLM Discovery & Routes"
Cohesion: 0.22
Nodes (9): Fuenzer Research Concise LLM Manifest (llms.txt), Fuenzer Research Platform Summary, Fuenzer Research Full LLM System & Academic Architecture Documentation (llms-full.txt), Fuenzer Application Navigation Routes (/, /playground/, /library/, /citations/, /login/, /signup/, /privacy/, /terms/), Full-Stack Technology Summary (React 19, Vite 8, TS 6, Tailwind 4, Go 1.25 Fiber, SQLite, Firestore, Gemini 3.1 Flash Lite), GEO & AI Crawlers Allowlist (GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended), Robots Exclusion & GEO Crawler Configuration (robots.txt), Production XML Sitemap (sitemap.xml) (+1 more)

### Community 27 - "AI Synthesis Persona & Rules"
Cohesion: 0.28
Nodes (6): Amelia (BMad Senior Software Engineer), Fuenzer Synthesis Engine (Academic Assistant Persona, Indonesian, max 150-word single paragraph), Gemini 2.5 Flash Runtime Model, Prompt Injection Sanitization in services/gemini/prompt.go, Dual AI Mode (Search Mode & Ask Mode Contextual Q&A), Google Gemini 3.1 Flash Lite AI Engine

### Community 28 - "Agent Guidelines & Security Overview"
Cohesion: 0.29
Nodes (8): Antislop Skill Configuration (.agents/skills/antislop), AGENTS.md - AI Persona & Prompt Specifications, Graphify Knowledge Graph Query and Update Rules, Auth Endpoint Rate Limit (3/5m) & Email Header Injection Prevention (RFC 5322, CRLF sanitization, PII-free logs), README.md - Fuenzer Research Overview (Indonesian), README.en.md - Fuenzer Research Architecture & Product Overview (English), Multi-Library Folder & Shareable Workspace Forking, Security Layers (Strict CORS, 15/m & 3/5m Auth Rate Limit, CSP/HSTS, RFC 5322 Email, DOMPurify, SQLite Parameterized Queries)

### Community 29 - "Firecrawl Visual Tokens"
Cohesion: 0.25
Nodes (7): Firecrawl Color Tokens (--color-fire-orange #ff4d00, --color-code-blue #006fff, --color-cloud-canvas #e5e7eb, --color-ink-black #262626, --color-paper-white #f9f9f9), Firecrawl Surfaces & Elevation (Canvas #e5e7eb, Card Base #f9f9f9, Elevated Card #ffffff, multi-layer shadows), Firecrawl Style Reference, Firecrawl Spacing & Layout (4px base unit, 1200px max-width, 164px section gap), Firecrawl CSS Custom Properties & Tailwind v4 @theme Configuration, Firecrawl Typography Tokens (suisse, GeistMono, type scale), Firecrawl UI Components (Primary Action Button, Ghost Button, Feature Card, Hero Input Field, Code Block Card)

### Community 30 - "SEO, Analytics & JSON-LD"
Cohesion: 0.25
Nodes (8): Google Analytics GA4 Consent Mode Script (/analytics.js), Ridwan Yoga Suryantara (Founder & Software Engineer), Fuenzer Research WebApplication JSON-LD Schema, Fuenzer Research WebSite JSON-LD Schema, GEO & SEO Metadata (ID Region, hreflang, Open Graph, Twitter Card), Frontend HTML Entry Point (index.html), Frontend TypeScript Entry Module (/src/main.tsx), Web App Manifest & Favicon Assets (/site.webmanifest)

### Community 31 - "HTML Shell & AI Endpoints"
Cohesion: 0.25
Nodes (7): Trusted Types Policy Script (/trusted-types.js), POST /api/v1/ask Endpoint, GET /api/v1/autocomplete Endpoint, POST /api/v1/research Endpoint, Golang 1.25 Fiber v2 Backend on Google Cloud Run (Goroutines, Trusted Types CSP, HSTS), Dynamic AI Synthesis Engine (Google Gemini 3.1 Flash Lite, 150-word Paragraph), Contextual Multi-Reference Comparative Q&A (Library Compare, up to 5 Papers)

### Community 32 - "Fuenzer Design Tokens"
Cohesion: 0.33
Nodes (6): Design Color Tokens (Code Blue, Cloud Canvas, Ink Black, Paper White, Slate/Stone/Silver/Frost Gray), DESIGN.md - Fuenzer Research Style Reference (Firecrawl Inspired), Fuenzer Teal (#0d9488 / --color-fuenzer-teal) Primary Action Color, 3-Level Surface Hierarchy (Canvas #e5e7eb, Card Base #f9f9f9, Elevated Card #ffffff), Tailwind v4 @theme Configuration, Typography Tokens (Inter UI font & GeistMono code font + Type Scale)

### Community 33 - "Federated Search & Workspace"
Cohesion: 0.33
Nodes (7): Multi-Format Citation & Bibliography Exporter (APA 7th, Harvard, MLA 9th, Chicago, Vancouver, BibTeX, RIS, PDF ZIP, CSV), Concurrent Federated Academic Search (OpenAlex, Garuda SQLite, Google Books, Scopus & SINTA), Personal Workspace & Cross-Device Sync (Firebase Auth, Firestore, Shareable Links & Fork), Frontend SPA Architecture (React 19, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query, JSZip, jsPDF), Curated Garuda SQLite FTS5 Database (652,144 Articles from 3.6M Kaggle Corpus), Fuenzer Research Platform, SINTA Tier (1-6) Real-Time Verification via In-Memory JSON Hash Map

### Community 34 - "Cloud Run & Export Suite"
Cohesion: 0.29
Nodes (6): Automated Literature Matrix Excel/CSV Export, Docker Multi-Stage Build (Alpine 3.19) & Google Cloud Run Deployment, Export Suite (jsPDF PDF, JSZip Batch ZIP, 5 Citation Styles, BibTeX), Firebase Auth 12 & Firestore Sync, Fuenzer Research AI Academic Literature Platform, React 19 + TypeScript 6 + Vite 8 + Zustand 5 + TanStack React Query 5 SPA

### Community 35 - "Bing & Copilot SEO Compliance"
Cohesion: 0.33
Nodes (5): Bing Webmaster Tools, Google Search Console & Google Analytics (G-8WBME81KPS, CookieConsent), Fuenzer Research 22-Point Bing & Copilot Compliance Audit, IndexNow Instant URL Submission, Canonical XML Sitemap (/sitemap.xml with trailing slashes), useSEO Custom React Hook (Dynamic Metadata, Canonical Tags, JSON-LD Schemas)

### Community 37 - "Garuda SQLite FTS5 Performance"
Cohesion: 0.40
Nodes (3): SQLite FTS5 JOIN Query Optimization in backend/internal/services/garuda/client.go (32x speedup, 3120ms to 95ms), Garuda Local SQLite FTS5 Database (garuda_articles_data.db, 1.95 GB), Cloud Run Container Memory Upgrade (1Gi to 2Gi in deploy.sh)

### Community 38 - "Vite Build Config"
Cohesion: 0.40
Nodes (4): vite@^8.3.4, @vitejs/plugin-react@^6.0.1, vite, @vitejs/plugin-react

### Community 39 - "NPM Dependency Overrides"
Cohesion: 0.40
Nodes (5): overrides, @babel/core, @grpc/grpc-js, postcss-selector-parser, protobufjs

### Community 40 - "NPM Package Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 41 - "Code of Conduct"
Cohesion: 0.50
Nodes (4): Community Impact Enforcement Ladder (Correction, Warning, Temporary Ban, Permanent Ban), Contributor Covenant v2.1 & Mozilla Diversity Ladder Attribution, CODE_OF_CONDUCT.md - Contributor Covenant Code of Conduct, Maintainer Conduct Reporting Channel (GitHub Issues & Email)

## Knowledge Gaps
- **88 isolated node(s):** `fuenzer-research/backend`, `Gemini 2.5 Flash Runtime Model`, `Winston (BMad System Architect)`, `Prompt Injection Sanitization in services/gemini/prompt.go`, `Antislop Skill Configuration (.agents/skills/antislop)` (+83 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 285 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `React App & Routing` to `UI Shared Components`, `Firestore Sync Helpers`, `Library Compare & Citations`, `Frontend Runtime Dependencies`, `Frontend Tooling Packages`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `fuenzer-research/backend`, `Gemini 2.5 Flash Runtime Model`, `Winston (BMad System Architect)` to the rest of the system?**
  _88 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React App & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.0696763553906411 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `React App & Routing` to `UI Shared Components`, `Firestore Sync Helpers`, `Library Compare & Citations`, `Frontend Runtime Dependencies`, `Frontend Tooling Packages`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `UI Shared Components` be split into smaller, more focused modules?**
  _Cohesion score 0.11059907834101383 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `React App & Routing` to `Frontend Tooling Packages`, `UI Shared Components`, `Frontend Runtime Dependencies`, `Firestore Sync Helpers`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Should `Research Handler & Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.08309178743961353 - nodes in this community are weakly interconnected._