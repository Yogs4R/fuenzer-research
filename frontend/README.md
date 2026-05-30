# Fuenzer Research Frontend 🔬

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

![Fuenzer Research Preview](public/og-image.png)

> **Riset Akademis, Disintesis AI** — Antarmuka web akademik kelas dunia berbasis React, TypeScript, dan Tailwind CSS. Menyajikan visualisasi split-screen interaktif, perbandingan pustaka multi-dokumen bertenaga AI, dan generator sitasi otomatis secara instan.

Built for **JuaraVibeCoding** Hackathon by Google.

---

## ✨ Features (Frontend Spec)

- 🖥️ **Premium Split-Screen Playground** — Area kerja berdensitas tinggi yang membagi porsi antara Asisten Tanya-Jawab AI di sebelah kiri dan daftar referensi interaktif di sebelah kanan secara mulus.
- 🎨 **Rich Aesthetics & Dark Mode** — Desain modern bersertifikasi kenyamanan mata menggunakan warna latar belakang Alabaster (`#FAFAFA`), Glassmorphism, efek transisi halus, dan dukungan penuh tema gelap (*Dark Mode*).
- 🇮🇩 **Bilingual Localization** — Dukungan penuh untuk bahasa Inggris dan bahasa Indonesia yang disesuaikan secara akademis untuk seluruh label, deskripsi, FAQ, dan modal riwayat.
- 📚 **Library & AI Compare** — Area kerja pribadi untuk menyimpan paper favorit dan membandingkan metodologi, temuan utama, atau limitasi antardokumen menggunakan AI.
- 🎓 **Bibliography & Citations Generator** — Menyalin sitasi secara instan atau mengekspor bibliografi lengkap ke berkas standar **BibTeX (.bib)** untuk diintegrasikan dengan referensi manager.
- 📄 **PDF Document Exporter** — Mengekspor hasil sintesis akademis beserta daftar pustaka lengkap secara langsung menjadi berkas dokumen PDF siap cetak.

---

## 🏗️ Tech Stack (Frontend)

| Component | Technology |
|-----------|------------|
| Library Core | React 18 (Vite Bundler) |
| Language | TypeScript (Strict Mode) |
| Styling | Tailwind CSS |
| UI Framework | shadcn/ui |
| Icons | Lucide React |
| State Store | Zustand |
| Server Cache | React Query (TanStack Query) |
| Sanitizer | DOMPurify (Pencegahan XSS) |
| Build Tool | Rolldown / Vite Production |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm atau yarn

### Installation & Run

1. **Masuk ke folder frontend**:
   ```bash
   cd frontend
   ```

2. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin berkas `.env.example` sebagai `.env` dan sesuaikan nilainya:
   ```bash
   cp .env.example .env
   ```
   Isi konfigurasi dalam berkas `.env`:
   ```env
   VITE_API_URL=http://localhost:8080
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
   ```

4. **Jalankan dalam Mode Development**:
   ```bash
   npm run dev
   ```

Aplikasi frontend akan berjalan dan dapat diakses di `http://localhost:5173`

4. **Kompilasi Produksi**:
   ```bash
   npm run build
   ```
Hasil kompilasi akan dimasukkan ke folder `/dist` siap saji.

---

## 📁 Project Structure (Frontend)

```text
/frontend
├── /public             # Aset statis publik (ikon, gambar OG)
├── /src
│   ├── /assets         # Logo basis data (SINTA, Garuda, Scopus, dll.)
│   ├── /components     # Komponen UI modular
│   │   ├── /home       # Komponen halaman beranda
│   │   ├── /playground # Panel playground riset & asisten AI
│   │   └── /shared     # Komponen navbar, footer, modal, dropdown
│   ├── /locales        # Manajemen lokalisasi (en.ts & id.ts)
│   ├── /pages          # Halaman utama (Landing, Playground, Citations, Library)
│   ├── /services       # Klien komunikasi API backend
│   ├── /store          # Pengelola state global aplikasi (Zustand)
│   ├── /types          # Definisi tipe TypeScript
│   └── /utils          # Fungsi pembantu (keyword extractor, dll.)
├── package.json        # Dependensi dan skrip eksekusi
└── vite.config.ts      # Konfigurasi bundler Vite
```

---

## 🔒 Security Specifications

- **XSS Mitigation**: Seluruh hasil keluaran teks kaya (Markdown) dari kecerdasan buatan disaring secara statis menggunakan **DOMPurify** sebelum dirender lewat `dangerouslySetInnerHTML`.
- **Stateless Session**: Data sitasi dan status login perpustakaan pengguna disimpan secara aman di dalam memory state lokal dan sesi enkripsi browser.
- **Client Shielding**: Frontend tidak pernah menyimpan atau mengirim kueri langsung ke Google Gemini. Seluruh panggilan dilewatkan secara aman lewat Gateway API Backend.

---

## 📄 License

Dilindungi di bawah lisensi [MIT](../LICENSE).
