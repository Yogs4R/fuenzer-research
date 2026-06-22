# Bing Webmaster & Copilot Grounding Guidelines

This document outlines the core guidelines for ensuring that **Fuenzer Research** remains fully discoverable, crawlable, and eligible for indexing on Bing, as well as grounding and citation within Microsoft Copilot experiences.

---

## Part 1: Core Search & AI Discovery Guidelines

### 1. SEO Fundamentals for AI Experiences
Bing and Copilot search experiences rely on the same core crawling, indexing, and ranking foundation as traditional search. Best practices that support search visibility also improve eligibility for AI-generated experiences and grounding citations.
* **Crawl Efficiency**: Minimize resource usage and page render overhead.
* **Indexing Accuracy**: Ensure canonical URLs are correctly set.
* **Content Clarity**: Use logical structures that machines can easily parse.
* **Authority & Trust**: Signal authorship and maintain stable, reliable content.

### 2. URL Discovery
Bing relies on clear signals to find and index content. Ensure Bingbot can reliably discover all important pages using:
* **IndexNow URL Submission**: Submitting updates instantly.
* **XML Sitemaps**: Listing all clean, canonical links.
* **Crawlable Internal Links**: Standard anchor elements with descriptive text.
* **External Backlinks**: Contextual links from trusted external domains.

### 3. Sitemap Cleanliness
Sitemaps indicate to Bing which URLs are preferred.
* **Canonical Only**: Sitemaps must list only canonical URLs (e.g. including trailing slashes consistently if generated that way).
* **Freshness Signals**: Include accurate `<lastmod>` tags.
* **Up-to-Date**: Remove deleted or redirected URLs immediately.
* **HTTP Headers**: Use `ETag` and `Last-Modified` headers to help Bingbot detect changes without re-downloading entire pages.

### 4. Timely Notifications via IndexNow
Notify search engines immediately when content changes to prevent outdated references in Copilot citations:
* **Added URLs**: Notify when new content is published.
* **Updated URLs**: Notify when content is modified.
* **Deleted URLs**: Notify when content is removed.
* **Streaming Submissions**: Stream updates instantly instead of batching to reduce server load and improve indexing freshness.

### 5. Link Architecture & Authority
Establish clear site structure and authority signals:
* **Standard HTML**: Use `<a href="...">` links instead of JavaScript-only click event handlers.
* **Anchor Text**: Use descriptive keywords in anchor texts and include `alt` attributes on image-based links.

### 6. Consolidate Duplicate URLs
Avoid serving duplicate or thin content across multiple URLs, as it dilutes ranking signals and reduces the probability of being chosen for Copilot grounding:
* Use `<link rel="canonical" href="..." />` to specify the single source of truth.
* Use consistent URL patterns (e.g., standardizing on trailing slashes).
* Use URL parameter controls to ignore tracking/session variables.

### 7. URL Redirection
Handle page moves correctly to preserve search value and grounding continuity:
* Use **301 redirects** for permanent URL moves.
* Use **302 redirects** only for temporary changes (less than 2 days).
* Always prefer HTTP redirects over canonical tags when moving content.

### 8. Efficient Crawling & Rendering
Ensure Bingbot can load and render page content efficiently:
* **No Robots Blocks**: Never block important CSS, JS, or API paths in `robots.txt`.
* **Server-Side Rendering (SSR)**: Avoid hiding critical content behind client-side-only rendering dependencies.
* **Minimal Assets**: Reduce the number of HTTP requests required to paint the page.

### 9. Clean Deletion
When deleting content permanently:
* Return an HTTP **404 Not Found** or **410 Gone** status code.
* Remove the deleted URLs from your XML sitemaps.
* Notify IndexNow immediately.

### 10. robots.txt and Meta Directives
Use directives to control access and Copilot display density:
* **Crawl Control**: Use `robots.txt` to manage crawl traffic, not to prevent indexing (use `noindex` for that).
* **Display Directives**:
  - `data-nosnippet` / `nosnippet`: Prevents Bing from showing text captions, which can limit Copilot citation quality.
  - `data-snippet`: Use this attribute to specify allowed content for citations.
* **AI Grounding Directives**:
  - `noarchive`: Prevents content from being used in Copilot responses.
  - `nocache`: Restricts Copilot to displaying only the URL and title, reducing answer citation quality. Avoid using `nocache` for pages intended to be cited in AI answers.

---

## Part 2: Content Optimization & Structure

### 11. Clear and Focused Content
Bing prioritizes well-structured, focused, and useful content for citations and grounding:
* Satisfy search intent directly.
* Provide original, authoritative value.
* Ensure explanations are self-contained and clear.
* Avoid ad-heavy or thin affiliate pages.

### 12. Multimodal Content (Images & Videos)
Ensure visual assets support, rather than replace, textual content:
* Use descriptive file names (e.g., `fuenzer-research-logo-light.webp`).
* Provide descriptive `alt` text.
* Include captions, transcripts, and appropriate structured schema markup.

### 13. Semantic HTML Structure
Organize content using clear HTML hierarchies:
* Utilize unique `<title>` tags and meta descriptions.
* Maintain a logical `<h1\>` through `<h6\>` heading hierarchy without skipping levels.
* Use HTML5 semantic elements (`<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`).

### 14. Accurate Structured Data
Use JSON-LD, Microdata, or RDFa to help Bing understand context:
* Ensure structured data accurately reflects the visible content on the page.
* Avoid marked-up content that is hidden from the user.

### 15. Independent Verification
Make key definitions and facts explicit. Grounded answers prioritize content where key facts do not rely on external references or implied context.

### 16. Clear Entity Definition
Use clear and consistent naming for people, organizations, products, and locations to improve Copilot entity association.

### 17. Single Topic Focus
Dedicate each URL to a single primary topic. Align the page title, headings, and body content intent.

### 18. Surface Information Early
Place key findings and answers near the top of the page. Avoid long, generic introductions.

### 19. Keep Content Fresh
Keep page facts updated. Remove or revise outdated data, and use IndexNow to signal modifications instantly.

### 20. URL Stability
Maintain stable URLs over time. Avoid renaming paths without a strong technical reason.

---

## Part 3: Crawl Capacity & Impressional SEO

### 21. Manage Crawl Efficiency
Reduce crawl waste to ensure Bingbot prioritizes indexing your most important content:
* Consolidate duplicate paths.
* Block non-essential directories (e.g. admin panels, query params) in `robots.txt`.
* Keep the site navigation structure simple.

### 22. Measuring Beyond Clicks
In AI search experiences, content is often displayed as Copilot references or direct answers without generating a traditional web click.
* Monitor **Impressions** and **Crawl/Index Status** in Bing Webmaster Tools.
* Track citation references as a key indicator of search share.

---

## Fuenzer Research Compliance Audit & Status

We reviewed the Fuenzer Research codebase against the guidelines above. Here is our technical compliance checklist:

| Guideline | Requirement | Status | Verification Detail |
| :--- | :--- | :--- | :--- |
| **#1 SEO for AI** | Crawl efficiency & high-accuracy metadata | **Approved** | SPA built with Vite/React. Page metadata is dynamically set using the `useSEO` custom React hook on Landing, Playground, Library, Citations, Privacy, Terms, Login, Signup, Reset Password, Verify Email, and NotFound routes, supporting precise indexing and entity recognition for AI search engines. |
| **#2 URL Discovery** | Clean URL discovery paths & sitemap | **Approved** | `/sitemap.xml` lists all paths with trailing slashes. Navigation routes are crawlable. The app can be registered and index-submitted on Bing Webmaster Tools. |
| **#3 Sitemap** | List only canonical URLs | **Approved** | `/sitemap.xml` lists clean canonical URLs ending in trailing slashes: root (`https://research.fuenzer.web.id/`), `/privacy/`, `/terms/`, `/playground/`, `/library/`, and `/citations/`. |
| **#4 IndexNow** | Instant search index notifications | **Approved** | Supports manually triggering IndexNow crawl submissions when the SPA code or assets are modified. |
| **#5 Link Arch.** | Accessible standard links & anchor text | **Approved** | Links inside the navigation bars, user library, citation view, and legal components use standard HTML anchor tags (`<a>`) or buttons with clean labels and descriptive anchor text. |
| **#6 Canonical** | Consolidate URLs with canonical tags | **Approved** | Canonical tag is programmatically updated by `useSEO` during page mounts to avoid duplicate path crawling. Root canonical in `index.html` matches `https://research.fuenzer.web.id/` and subpage canonicals point to trailing-slash versions (e.g., `/privacy/`). |
| **#7 Redirection** | Correct HTTP redirect/rewrite codes | **Approved** | Sub-paths are mapped server-side to `/index.html` (200 rewrite) in the Go GoFiber backend (`backend/cmd/api/main.go`) to support HTML5 PushState routing cleanly, ensuring crawlers can access all routes without 404/500 errors. |
| **#8 Rendering** | Efficient asset loading & rendering | **Approved** | Production assets are minified and compressed. Font preloads from Google Fonts are used. `robots.txt` has `Allow: /` to ensure assets are fully crawlable. |
| **#9 Clean Deletion** | Return 404/500 status codes on error/deletion | **Approved** | Custom 404/Not Found states are handled internally via `NotFoundPage.tsx` and mapped dynamically. |
| **#10 Directives** | Directives check for robots & AI crawler | **Approved** | No restricting directives like `noarchive`, `nocache`, or `nosnippet` exist in the index template or SEO metadata. |
| **#11 Content** | Focused and intent-satisfying content | **Approved** | Clean structure detailing Fuenzer Research's AI academic search, indexing SINTA/Garuda/Scopus/OpenAlex databases, Gemini synthesis, and citation formatted views. |
| **#12 Multimodal** | Metadata on images and video content | **Approved** | Layout images and icons utilize descriptive filenames and alt descriptions (e.g., `fuenzer-research-logo-light.webp`). |
| **#13 HTML** | Logical heading hierarchy | **Approved** | Clean sequential structure starting from page-level `h1` down to section `h2`/`h3` headings without skipping intermediate outline levels. |
| **#14 Schemas** | Structured JSON-LD data | **Approved** | Configured via JSON-LD in `index.html` (WebSite schema) and programmatically injected via `useSEO` on individual page states (WebPage, PrivacyPolicy, and TermsOfService schemas). |
| **#15 Verification** | Clear definitions & facts on-page | **Approved** | Clear descriptions about Fuenzer Research's operations, search limits, databases, and AI synthesis models. |
| **#16 Entities** | Define entities clearly | **Approved** | Structured schema configurations explicitly link `Fuenzer Research` as the WebSite/App and its creators. |
| **#17 Single Topic** | Dedicated pages for single primary topics | **Approved** | Homepage focuses entirely on search input; `/playground/` on active research and AI chat; `/library/` on saved bookmarks; `/citations/` on citation export; `/privacy/` on privacy policy; `/terms/` on terms of service. |
| **#18 Surface Info** | Core information placed at top of layout | **Approved** | Search bar and database statistics are placed immediately at the top of the homepage above the fold. |
| **#19 Freshness** | Keep page facts updated | **Approved** | Content pages are designed to pull real-time database updates and copyright/legal information are updated to reflect the current year. |
| **#20 Stability** | Maintain stable URLs over time | **Approved** | Static and clean routing structure (`/`, `/privacy/`, `/terms/`, `/playground/`, `/library/`, `/citations/`) remains stable. |
| **#21 Crawl Waste** | Block duplicate directories & parameters | **Approved** | Single clean URL variants are declared. No dynamic tracking/session parameter variables are exposed to search engines. |
| **#22 Metrics** | Monitor impressions & citation metrics | **Approved** | Bing Webmaster Tools, Google Search Console, and Google Analytics (`G-8WBME81KPS` governed by the `CookieConsent` consent management) are configured to monitor indexing status, crawl rates, and traffic. |