# Fuenzer Research — Style Reference (Firecrawl Inspired)
> Whiteboard blueprints, with a single Fuenzer Teal 'active' indicator.

**Theme:** light

Fuenzer Research employs a crisp, data-centric interface with a strong emphasis on clean surfaces and a single vibrant accent color (Teal/Cyan) derived from the Fuenzer Research logo. Typography is confident and precise, prioritizing legibility and structure over decorative flair. Components are lightweight and interaction-focused, using subtle borders and shadows to define hierarchy rather than heavy fills or gradients. The overall impression is one of efficiency, clarity, and directness, designed for researchers and developers engaging with academic AI tools.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| **Fuenzer Teal** | `#0d9488` | `--color-fuenzer-teal` | **Satu-satunya warna aksi utama**. Digunakan untuk tombol penuh, status aktif, dan momen konversi penting. |
| Code Blue | `#006fff` | `--color-code-blue` | Penyorotan sintaks (*syntax highlighting*) dan teks informasi teknis. |
| Cloud Canvas | `#e5e7eb` | `--color-cloud-canvas` | Dominan latar belakang halaman. Memberikan kesan *whiteboard* yang bersih. |
| Ink Black | `#262626` | `--color-ink-black` | Teks utama (*body*), label navigasi, dan judul (*headings*). |
| Paper White | `#f9f9f9` | `--color-paper-white` | Latar belakang komponen kartu (*card*) dan elemen yang diangkat (*elevated*). |
| Slate Gray | `#727272` | `--color-slate-gray` | Teks sekunder, status dinonaktifkan (*disabled*), dan detail ikon subtil. |
| Stone Gray | `#616161` | `--color-stone-gray` | Teks tautan yang redup dan teks *body* yang kurang menonjol. |
| Silver Mist | `#949494` | `--color-silver-mist` | Teks pembantu (*helper*), *placeholder*, dan garis halus pada ikon. |
| Frost Gray | `#c7c7c7` | `--color-frost-gray` | Garis dekoratif, *border* yang sangat samar, dan elemen pemisah. |

## Tokens — Typography

### Inter
Tipografi utama untuk semua teks antarmuka (menggantikan Suisse), menawarkan tampilan yang bersih dan terstruktur.
- **Weights:** 400 (Body), 500 (Subheading), 600 (Heading)
- **Token:** `--font-inter`

### GeistMono (atau SF Mono)
Digunakan untuk blok kode dan contoh teknis.
- **Weights:** 400, 500
- **Token:** `--font-geistmono`

### Type Scale
| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| caption | 10px | 1.4 | 0.1px | `--text-caption` |
| body | 14px | 1.54 | — | `--text-body` |
| body-lg | 16px | 1.6 | — | `--text-body-lg` |
| subheading | 20px | 1.43 | — | `--text-subheading` |
| heading | 24px | 1.33 | — | `--text-heading` |
| heading-lg | 40px | 1.1 | — | `--text-heading-lg` |
| display | 52px | 1.07 | -0.52px | `--text-display` |
| display-lg | 60px | 1 | -0.6px | `--text-display-lg` |

## Tokens — Spacing & Shapes

**Base unit:** 4px

### Border Radius
| Element | Value | Token |
|---------|-------|-------|
| tags | 999px | `--radius-tags` |
| cards | 16px | `--radius-cards` |
| inputs | 8px | `--radius-inputs` |
| buttons | 999px | `--radius-buttons` |
| menuItems | 8px | `--radius-menuitems` |

### Shadows
| Name | Value | Token |
|------|-------|-------|
| subtle | `rgb(249, 249, 249) 0px 0px 0px 6px` | `--shadow-subtle` |
| xl | `rgba(0, 0, 0, 0.02) 0px 40px 48px -20px, rgba(0, 0, 0, 0.03) 0px 32px 32px -20px, rgba(0, 0, 0, 0.03) 0px 16px 24px -12px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px` | `--shadow-xl` |
| subtle-2 | `color(display-p3 0.984314 0.984314 0.984314) 0px 0px 0px 8px` | `--shadow-subtle-2` |

## Components

### Primary Action Button
Berisi penuh dengan warna **Fuenzer Teal (#0d9488)**, teks putih, membulat penuh (radius 999px), dengan padding umum 12px vertikal dan 24px horizontal.

### Ghost Button
Latar belakang transparan, teks **Ink Black (#262626)**, radius 999px, padding 12px vertikal dan 24px horizontal, dengan border **Cloud Canvas (#e5e7eb)** yang muncul saat interaksi atau fokus.

### Feature Card
Latar belakang **Paper White (#f9f9f9)**, border-radius 16px, dengan efek bayangan berlapis `shadow-xl` untuk memberikan elevasi.

### Hero Input Field
Latar belakang transparan, teks Ink Black, border Cloud Canvas, tidak menggunakan border-radius eksplisit namun diwadahi dalam kartu (*card*) yang lebih besar.

## Surfaces
| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Canvas | `#e5e7eb` | Latar belakang utama untuk keseluruhan halaman. |
| 1 | Card Base | `#f9f9f9` | Latar standar untuk kartu yang memberikan pemisahan halus dari kanvas. |
| 2 | Elevated Card | `#ffffff` | Kartu atau panel interaktif yang menonjol (dilengkapi *shadow*). |

## Quick Start: Tailwind v4 Configuration

```css
@theme {
  /* Colors */
  --color-fuenzer-teal: #0d9488;
  --color-fuenzer-teal-dark: #0f766e;
  --color-code-blue: #006fff;
  --color-cloud-canvas: #e5e7eb;
  --color-ink-black: #262626;
  --color-paper-white: #f9f9f9;
  --color-slate-gray: #727272;
  --color-stone-gray: #616161;
  --color-silver-mist: #949494;
  --color-frost-gray: #c7c7c7;

  /* Typography */
  --font-inter: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-geistmono: 'GeistMono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Border Radius */
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-2xl-2: 20px;
  --radius-full: 999px;

  /* Shadows */
  --shadow-subtle: rgb(249, 249, 249) 0px 0px 0px 6px;
  --shadow-xl: rgba(0, 0, 0, 0.02) 0px 40px 48px -20px, rgba(0, 0, 0, 0.03) 0px 32px 32px -20px, rgba(0, 0, 0, 0.03) 0px 16px 24px -12px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px;
}
```