# Perencanaan Optimasi & Pemeliharaan Database Garuda

Dokumen ini mencatat analisis masalah performa pencarian database lokal Garuda, solusi optimasi kueri yang diimplementasikan, serta rencana jangka panjang untuk integrasi fitur ini di lingkungan produksi Cloud Run.

---

## 📋 Daftar Fitur yang Perlu Diperbaiki

| Fitur | Prioritas | Status Saat Ini | Masalah Utama | Rencana Perbaikan / Solusi |
| :--- | :--- | :--- | :--- | :--- |
| **Pencarian Indeks GARUDA Lokal** | 🔴 Tinggi | ⚠️ Pemeliharaan (Disabled) | Kelambatan disk virtual Cloud Run & OOM saat membaca berkas SQLite 1,95 GB secara acak. | Migrasi data ke Google Cloud SQL (PostgreSQL) atau pasang volume penyimpanan dengan GCS Fuse. |

---

## 🔍 Analisis Masalah (Kenapa Lambat & Timeout?)

Saat melakukan pencarian dengan parameter **Index = GLOBAL**, performa sistem sangat cepat karena sistem **tidak mengakses file database lokal Garuda (`garuda_articles_data.db`)**. Pencarian indeks GLOBAL memanggil **OpenAlex API** secara eksternal yang dihosting pada infrastruktur pencarian global berkinerja tinggi, lalu hasilnya dicocokkan di memori dengan kamus SINTA (`sintaMapper.MapPapers`).

Sebaliknya, saat memilih indeks **GARUDA**, sistem melakukan kueri pencarian teks (FTS5) langsung ke file SQLite lokal sebesar **1,95 GB**. Hal ini memicu dua masalah utama di Cloud Run:

1. **Out of Memory (OOM) / Eror 503**: Membuka koneksi dan memuat data biner besar SQLite ke dalam RAM Cloud Run dengan batas memori `1Gi` (1024 MiB) menyebabkan kontainer kehabisan RAM (penggunaan puncak menyentuh `1081 MiB`), sehingga kontainer dihentikan paksa (Signal 9) oleh kernel.
2. **Kelambatan Kueri (Timeout 30 detik)**: Kueri pencarian awal menggunakan subquery `IN` yang tidak optimal:
   ```sql
   SELECT ... FROM artikel WHERE id IN (SELECT rowid FROM artikel_fts WHERE artikel_fts MATCH ?) LIMIT 15
   ```
   Di SQLite, kueri ini memaksa FTS5 mencari seluruh kecocokan data (bisa puluhan ribu artikel untuk istilah umum seperti *"Pendidikan"*), memuat semua rowid-nya ke memori, memindai tabel `artikel` secara sekuensial, baru memotong hasilnya di akhir (`LIMIT 15`). Ini memakan waktu **3,12 detik** di SSD lokal pengembang, dan melonjak hingga **>30 detik** (timeout) pada disk virtual Cloud Run.

---

## ⚡ Solusi & Optimasi Kueri

### 1. Peningkatan Kapasitas RAM
Batas alokasi memori kontainer di [deploy.sh](../deploy.sh) telah ditingkatkan dari `1Gi` ke **`2Gi`** untuk memberikan ruang bebas (headroom) yang cukup bagi penanganan kueri database lokal tanpa memicu OOM crash.

### 2. Optimasi Kueri JOIN FTS5 (Speedup 32x)
Kueri pencarian dalam [client.go](../backend/internal/services/garuda/client.go) telah dioptimalkan dengan mengganti subquery `IN` menjadi operasi `JOIN` langsung pada `rowid` virtual FTS5:
```sql
SELECT a.article_title, a.title, a.article_abstract, a.article_year, a.doi, a.url, a.source
FROM artikel_fts f
JOIN artikel a ON a.id = f.rowid
WHERE f.artikel_fts MATCH ?
LIMIT ?
```
* **Cara Kerja**: SQLite FTS5 akan mencari indeks kata kunci secara langsung, mengambil maksimal 15 kecocokan pertama (`LIMIT 15` didorong ke tingkat FTS), dan melakukan join instan menggunakan indeks Primary Key tabel `artikel`.
* **Hasil Uji Coba**: Kecepatan kueri lokal meningkat drastis dari **3.120ms menjadi 95ms** (32 kali lebih cepat).

---

## 🛠️ Status & Strategi Deployment Saat Ini (Maintenance Mode)

Meskipun optimasi kueri `JOIN` sangat cepat di lokal, infrastruktur serverless (Cloud Run) menggunakan penyimpanan kontainer virtual yang memiliki latensi baca-tulis berkas (*I/O latency*) yang tinggi jika terjadi lonjakan pencarian serentak. 

Sebagai langkah mitigasi risiko performa di produksi, sistem saat ini disetel pada **Mode Pemeliharaan (Maintenance Mode)**:
1. **Backend**: Langsung me-return status `503 Service Unavailable` saat indeks `GARUDA` dipanggil.
2. **Frontend**: Menampilkan pop-up modal pemeliharaan yang menyarankan pengguna untuk beralih ke indeks **Global** (dengan lokasi **Indonesia**), yang secara fungsional tetap dapat menemukan artikel lokal Indonesia via indeks OpenAlex tanpa membebani server.

---

## 🚀 Rencana Pengembangan Jangka Panjang

Jika di masa mendatang database Garuda ingin diaktifkan kembali secara penuh tanpa menggunakan mode pemeliharaan, berikut adalah langkah yang direkomendasikan:

1. **Migrasi ke Cloud SQL (PostgreSQL/MySQL)**:
   * Pindahkan data dari SQLite lokal 1.95 GB ke database relasional terkelola (managed database) seperti Google Cloud SQL PostgreSQL.
   * Gunakan ekstensi pencarian teks penuh seperti `pg_trgm` atau integrasikan dengan Elasticsearch/Algolia. Ini akan membebaskan kontainer Cloud Run dari beban membaca file besar secara lokal.
2. **Gunakan Google Cloud Storage Fuse (GCS Fuse)**:
   * Pasang (mount) berkas SQLite di Google Cloud Storage Bucket, lalu kaitkan ke Cloud Run menggunakan integrasi volume agar pembacaan berkas lebih optimal dan tidak menambah ukuran kontainer Docker.
