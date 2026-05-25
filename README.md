# Fuenzer Research 🔬

![JuaraVibeCoding Hackathon](https://img.shields.io/badge/Hackathon-JuaraVibeCoding-4285F4?style=for-the-badge&logo=google)
![Golang](https://img.shields.io/badge/Backend-Golang-00ADD8?style=for-the-badge&logo=go)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=for-the-badge)

> **Riset Akademis, Disintesis AI** — Tool riset akademis berbasis AI yang membantu peneliti menemukan dan menyintesis literatur ilmiah.

Built for **JuaraVibeCoding** Hackathon by Google.

## ✨ Features

- 🔍 **Pencarian Global** — Akses 200M+ paper dari OpenAlex
- 🇮🇩 **Filter SINTA** — Identifikasi otomatis tier jurnal Indonesia (SINTA 1-6)
- 🤖 **Sintesis AI** — Google Gemini 2.5 Flash menganalisis abstrak & menghasilkan ringkasan akademis
- ⚡ **Real-time** — Dari query ke sintesis dalam <5 detik
- 📱 **Responsive** — UI premium untuk desktop dan mobile

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI Components | shadcn/ui, Lucide React |
| State | Zustand, React Query |
| Backend | Golang 1.22+, Fiber |
| AI Engine | Google Gemini 2.5 Flash |
| Data Source | OpenAlex API |
| Deployment | Docker, Google Cloud Run |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Go 1.22+
- Google AI Studio API Key

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
go mod tidy
go run ./cmd/api
```

Backend runs at `http://localhost:8080`

### Docker (Production)

```bash
docker build -t fuenzer-research .
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key fuenzer-research
```

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

## 🔒 Security

- API keys never exposed to frontend
- CORS strictly configured
- Rate limiting: 50 req/min per IP
- XSS prevention via DOMPurify
- Input sanitization (3-200 chars)

## 📄 License

[MIT](LICENSE)
