# Fuenzer Research Backend 🔬

![Golang](https://img.shields.io/badge/Backend-Golang-00ADD8?style=for-the-badge&logo=go)
![Fiber](https://img.shields.io/badge/Framework-Fiber-00F2FE?style=for-the-badge&logo=go)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=for-the-badge)

![Fuenzer Research Preview](../frontend/public/og-image.png)

> **Riset Akademis, Disintesis AI** — Server API berkinerja tinggi bertenaga Golang & Fiber yang bertindak sebagai Gateway Aman bagi integrasi model Gemini 3.1 Flash Lite, OpenAlex API, Google Books API, serta database lokal SINTA dan Garuda.

Built for **JuaraVibeCoding** Hackathon by Google.

---

## ✨ Features (Backend Spec)

- ⚡ **REST API Berkinerja Tinggi** — Dibangun menggunakan framework **Fiber** di atas bahasa pemrograman Go yang menjamin latensi pemrosesan HTTP super rendah.
- 🤖 **Orkestrasi AI (Gemini 3.1 Flash Lite)** — Menggunakan SDK Resmi Google Gen AI untuk Go. Dikonfigurasi dengan `Temperature: 0.3` dan pembatasan data abstrak untuk mencegah halusinasi AI.
- 🔍 **Global API Gateway** — Melakukan kueri real-time, pencarian sumber, dan ekstraksi kata kunci akademis menggunakan **OpenAlex API** dan **Google Books API**.
- 🇮🇩 **Mesin Pencarian SINTA Lokal** — Menganalisis file `sinta_journals_data.json` secara dinamis pada saat *startup* untuk memuat **~700 jurnal** dan **~7.000 artikel** lokal terindeks SINTA (dari total 15.456 jurnal resmi SINTA).
- 🗄️ **Klien SQLite Garuda** — Melakukan kueri database relasional terindeks lokal berisi **652.144 artikel Garuda** (dibersihkan secara efisien dari file asli berukuran 3.621.712 artikel untuk optimasi kinerja) menggunakan driver SQLite Go.

---

## 🏗️ Tech Stack (Backend)

| Component | Technology |
|-----------|------------|
| Language | Golang 1.22+ |
| Framework | Fiber v2 (Fast HTTP router) |
| AI Integration | Google Gen AI SDK (Gemini-3.1-Flash-Lite) |
| Database | SQLite 3 (untuk Garuda articles) |
| Data Store | JSON Local Parser (untuk SINTA journals & articles) |
| Middleware | Rate Limiter, Logger, CORS |

---

## 🚀 Getting Started

### Prerequisites

- Go 1.22+
- Kunci API Google AI Studio (Gemini)

### Installation & Run

1. **Masuk ke folder backend**:
   ```bash
   cd backend
   ```

2. **Salin berkas Environment**:
   ```bash
   cp .env.example .env
   ```

3. **Konfigurasi Environment**:
   Buka berkas `.env` dan sesuaikan nilainya:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here
   PORT=8080
   ENV=development
   ALLOWED_ORIGINS=http://localhost:5173,https://research.fuenzer.web.id
   ```

4. **Instalasi Dependensi & Jalankan Server**:
   ```bash
   go mod tidy
   go run ./cmd/api
   ```

Server backend akan berjalan di `http://localhost:8080`

---

## 📁 Project Structure (Backend)

```text
/backend
├── /cmd
│   └── /api            # Titik masuk utama eksekusi server (main.go)
├── /data               # Tempat penyimpanan database & berkas JSON lokal
│   ├── garuda_articles_data.db   # Database Garuda SQLite (652K+ artikel)
│   └── sinta_journals_data.json  # Data terindeks jurnal & artikel SINTA
├── /internal
│   ├── /config         # Logika pemuatan konfigurasi dan berkas .env
│   ├── /handlers       # HTTP controllers untuk memproses request klien
│   │   ├── autocomplete.go   # Penangan fitur autocomplete kata kunci
│   │   └── research.go       # Logika orkestrasi riset & Q&A AI
│   ├── /models         # Go Structs untuk representasi model data
│   └── /services       # Logika bisnis dan komunikasi pihak ketiga
│       ├── /garuda     # Klien kueri SQLite Garuda lokal
│       ├── /gemini     # Integrasi API Google Gemini (Synthesize & Ask)
│       ├── /googlebooks# Integrasi Google Books API
│       ├── /openalex   # Integrasi OpenAlex API (Works & Sources)
│       └── /sinta      # Pemeta kamus jurnal & pencarian artikel lokal SINTA
├── go.mod              # Definisi modul dependensi Go
└── go.sum              # Checksum keamanan untuk dependensi Go
```

---

## 🔒 Security Specifications

- **Enkripsi State**: Seluruh komunikasi kunci API diproses secara tertutup di backend dan tidak pernah bocor ke sisi klien.
- **CORS Configuration**: CORS dibatasi secara ketat hanya menerima asal request dari port frontend (`http://localhost:5173`) dan domain produksi (`https://research.fuenzer.web.id`).
- **Rate Limiting**: Membatasi hingga maksimum 50 kueri/menit untuk setiap alamat IP unik guna menghindari serangan brute force.
- **Stateless Processing**: Tidak ada data kueri riset pribadi yang disimpan secara permanen di backend untuk melatih model AI.

---

## 📄 License

Dilindungi di bawah lisensi [MIT](../LICENSE).
