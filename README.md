# Fuenzer Research 🔬

![JuaraVibeCoding Hackathon](https://img.shields.io/badge/Hackathon-JuaraVibeCoding-4285F4?style=for-the-badge&logo=google)
![Golang](https://img.shields.io/badge/Backend-Golang-00ADD8?style=for-the-badge&logo=go)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=for-the-badge)

![Fuenzer Research Banner](frontend/public/og-image.png)

> **Riset Akademis, Disintesis AI** — Asisten riset akademis bertenaga kecerdasan buatan kelas premium untuk membantu akademisi mencari, memetakan, dan menyintesis literatur ilmiah skala nasional dan global secara instan.

Built for **JuaraVibeCoding** Hackathon by Google.

---

## ✨ Features

- 🔍 **Pencarian Global & Lintas Disiplin** — Akses 200M+ publikasi dari **OpenAlex API** (grafik publikasi dunia) dan **Google Books API** (referensi buku akademis berdensitas tinggi).
- 🇮🇩 **Integrasi Indeks SINTA Lokal** — Pemetaan otomatis tier jurnal Indonesia (**SINTA 1-6**). Mengindeks secara lokal **~700 jurnal** (dari total 15.456 jurnal di situs resmi SINTA) dan **~7.000 artikel**.
- 📚 **Database Garuda SQLite** — Pencarian presisi terhadap **652.144 artikel Garuda** lokal (dibersihkan secara efisien dari file asli berukuran 3.621.712 artikel dengan melakukan pembersihan data mulai tahun 2024 untuk optimasi ukuran berkas).
- 🤖 **Sintesis AI Berdensitas Tinggi** — Didukung oleh model **Google Gemini 3.1 Flash Lite** dengan pembatasan suhu (*temperature* 0.3) dan parameter prompt akademis yang ketat untuk sintesis literatur bebas halusinasi.
- 📂 **Ekspor Referensi & Sitasi** — Dukungan ekspor hasil riset ke format berkas **PDF** dan daftar pustaka standar **BibTeX (.bib)** untuk LaTeX.
- ⚡ **Kecepatan & Responsivitas** — Hasil pencarian, pemetaan indeks lokal, dan sintesis literatur diselesaikan dalam waktu kurang dari 5 detik dengan antarmuka premium split-screen.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI Components | shadcn/ui, Lucide React, Glassmorphism |
| State Management | Zustand, React Query |
| Backend API | Golang 1.22+, Fiber (REST API Berkinerja Tinggi) |
| AI Engine | Google Gemini 3.1 Flash Lite |
| Data Sources (Global) | OpenAlex API, Google Books API |
| Data Sources (Lokal) | SINTA JSON (~700 jurnal), Garuda SQLite (652K+ artikel) |
| Deployment | Docker, Google Cloud Run |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Go 1.22+
- Google AI Studio API Key (Gemini)

### Frontend Installation

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan secara default di `http://localhost:5173`

### Backend Installation

```bash
cd backend
cp .env.example .env
# Edit .env dan tambahkan GEMINI_API_KEY Anda
go mod tidy
go run ./cmd/api
```

Backend berjalan secara default di `http://localhost:8080`

### Docker (Production Setup)

```bash
docker build -t fuenzer-research .
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key fuenzer-research
```

---

## 📁 Project Structure

```text
/fuenzer-research
├── /frontend           # [Frontend Layer] Aplikasi React + TypeScript + Vite
│   ├── /src
│   │   ├── /components # [UI] Komponen antarmuka yang dapat digunakan kembali
│   │   ├── /pages      # [Views] Halaman utama seperti LandingPage & Playground
│   │   ├── /services   # [Client] Pengelola komunikasi dengan API Backend
│   │   ├── /store      # [State] Pengelola status aplikasi global (Zustand)
│   │   └── /types      # [Types] Definisi TypeScript untuk tipe data statis
│   └── package.json    # [Dependencies] Daftar pustaka untuk frontend
├── /backend            # [Backend Layer] Golang Fiber REST API berkinerja tinggi
│   ├── /cmd/api        # [Entry] Titik masuk utama eksekusi server backend
│   ├── /internal
│   │   ├── /config     # [Config] Modul pembaca pengaturan dan environment
│   │   ├── /handlers   # [Controllers] Penangan permintaan HTTP dari klien
│   │   ├── /models     # [Models] Struktur data inti aplikasi (Go Structs)
│   │   └── /services   # [Logic] Logika bisnis utama
│   │       ├── /gemini   # [AI Engine] Sintesis data dengan Google Gemini API
│   │       ├── /openalex  # [Data Source] Pencarian literatur OpenAlex
│   │       └── /sinta    # [Mapper] Penentuan peringkat jurnal SINTA (1-6)
│   └── /data           # [Static] Direktori data pendukung (sinta_data.json)
├── /docs               # [Documentation] Kumpulan dokumen arsitektur teknis
├── /.agent             # [AI Context] Konfigurasi BMad builder / AI Agents
├── AGENTS.md           # [AI Prompts] Panduan persona & aturan prompt untuk LLM
├── DESIGN.md           # [Design Spec] Penjelasan rinci terkait keputusan desain sistem
├── Dockerfile          # [Deployment] Instruksi build container image production
├── .gitignore          # [Version Control] Aturan pengecualian file untuk Git
├── LICENSE             # [Legal] Aturan penggunaan proyek (MIT License)
└── README.md           # [Info] Panduan pengenalan & instalasi proyek ini
```

---

## 🔒 Security

- Kunci API Google AI Studio disimpan aman di backend, tidak pernah bocor ke frontend.
- Kebijakan CORS dikonfigurasi secara ketat dan aman.
- Pembatasan laju lalu lintas (*Rate Limiting*) aktif: maks 50 req/menit per IP.
- Pencegahan XSS diaktifkan di frontend menggunakan pustaka DOMPurify.
- Sanitasi input ketat (panjang karakter query 3-200 karakter).

---

## 📄 License

Dilindungi di bawah lisensi [MIT](LICENSE).
