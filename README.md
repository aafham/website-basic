# Jitra2Stay Website

Website rasmi promosi homestay **Jitra2Stay** untuk paparan maklumat, kadar sewaan, kemudahan, lokasi, dan tempahan pantas melalui WhatsApp.

## 1) Website Ini Untuk Apa

Website ini dibina untuk:
- Memperkenalkan homestay Jitra2Stay kepada pelanggan.
- Menunjukkan maklumat penting seperti harga, kemudahan, gambar, FAQ, dan lokasi.
- Memudahkan prospek buat tempahan dengan cepat melalui pautan WhatsApp.
- Menyokong 2 bahasa: **Bahasa Melayu (BM)** dan **English (EN)**.
- Memberi pengalaman mesra pengguna di desktop dan mobile.

## 2) Stack & Struktur Projek

Projek ini ialah **static website** (tanpa backend framework):
- `index.html` -> struktur halaman + script interaktif.
- `style.css` -> styling, tema, responsive layout.
- `images/` -> aset gambar utama.

Ringkasnya, aplikasi ini boleh dihoskan di mana-mana static hosting (Vercel, Netlify, cPanel, dll).

## 3) Cara Guna (Local)

### Pilihan A: Buka terus fail
1. Buka `index.html` dalam browser.
2. Sesuai untuk semakan cepat.

### Pilihan B: Local server (disarankan)
1. Buka terminal di root projek.
2. Jalankan:
```powershell
python -m http.server 5500
```
3. Buka `http://localhost:5500`.

## 4) Cara Deploy

### Vercel
1. Import projek ke Vercel.
2. Deploy sebagai static site.
3. Pastikan root ada `index.html`.

### Netlify
1. Pilih deploy manual.
2. Drag & drop folder projek.
3. Terus dapat URL live.

### cPanel / Shared Hosting
1. Upload `index.html`, `style.css`, dan folder `images` ke `public_html`.
2. Website akan live pada domain.

## 5) Fungsi Dalam App

Semua fungsi di bawah berada dalam script di `index.html`.

### 5.1 UI Reveal On Scroll
- `revealOnScroll()`
- Menambah class `active` pada elemen `.reveal` bila elemen masuk viewport.

### 5.2 Sticky Header + Offset Anchor
- `updateHeaderOffset()`
- Kira tinggi header semasa dan set CSS variable `--header-offset`.
- Elak anchor scroll tertutup header sticky.
- Header juga tambah class `.shrink` bila scroll > 80px.

### 5.3 Mobile Menu Toggle
- Toggle class `.show` pada `#mainNav` melalui `#menuToggle`.
- Update `aria-expanded` untuk aksesibiliti.
- Tutup menu automatik bila link nav diklik.

### 5.4 Final CTA Reveal
- Bila seksyen `.final-cta` masuk hampir viewport, class `.show` ditambah.

### 5.5 Floating CTA + Back To Top
- `updateFloatingUI()`
- Bila scroll > 500px:
  - Tunjuk kotak `#floatingCta`
  - Tunjuk butang `#backToTop`
- `#backToTop` scroll semula ke atas secara smooth.

### 5.6 Borang Semak Tarikh ke WhatsApp
- Intercept submit pada `#dateForm`.
- Ambil nilai form: check-in, check-out, tetamu, bilik, nota.
- Jana mesej BM/EN ikut bahasa aktif.
- Buka link `wa.me` dengan mesej encoded.

### 5.7 Theme Toggle (Light/Dark)
- `getPreferredTheme()` baca pilihan simpanan / ikut system preference.
- `setTheme(theme, persist)`
- `updateThemeToggleUI()` kemas kini ikon, label dan `aria`.
- Simpan pilihan dalam `localStorage` (`preferredTheme`).

### 5.8 Language Toggle (BM/EN)
- `applyLanguage(lang)`
- Tukar:
  - text (`data-bm`, `data-en`)
  - aria-label (`data-bm-aria-label`, `data-en-aria-label`)
  - alt image (`data-bm-alt`, `data-en-alt`)
  - title (`data-bm-title`, `data-en-title`)
  - href (`data-bm-href`, `data-en-href`)
  - document title
- Simpan pilihan bahasa dalam `localStorage` (`preferredLang`).

## 6) Ciri-ciri Utama Website

- Header sticky + navigation section.
- Hero banner dengan CTA WhatsApp.
- Video walkthrough section.
- Highlights homestay.
- Kadar sewaan (2-5 bilik) + deposit info.
- Cara tempah 1-2-3.
- Form semak tarikh.
- Gallery gambar.
- About, target guest, why us.
- Lokasi + info berhampiran.
- Testimoni + trust section.
- FAQ.
- Final CTA besar.
- Floating CTA desktop + sticky WhatsApp mobile.
- Multi-language BM/EN.
- Light/Dark mode.
- Responsive untuk mobile.

## 7) Panduan Edit Kandungan

### Teks BM/EN
- Cari elemen yang ada atribut `data-bm` dan `data-en`.
- Pastikan kedua-dua versi diisi untuk elak mismatch bahasa.

### Pautan WhatsApp
- Cari atribut `href`, `data-bm-href`, `data-en-href`.
- Tukar nombor/teks mesej ikut keperluan.

### Gambar
- Letak fail dalam folder `images/`.
- Guna path relatif contoh: `images/ruang-tamu.jpg`.

### Warna & Theme
- Ubah variable CSS di `:root` dan `:root[data-theme="dark"]` dalam `style.css`.

## 8) Nota Teknikal

- Tiada backend/database.
- Tiada build step.
- Semua interaksi berlaku di browser (client-side).
- `localStorage` digunakan untuk simpan tema dan bahasa.

## 9) Limitasi Semasa

- Data borang tidak disimpan ke server, terus dihantar ke WhatsApp.
- Tiada panel admin/CMS.
- Kandungan perlu dikemaskini secara manual di fail HTML/CSS.

## 10) Cadangan Penambahbaikan

1. Pisahkan JavaScript ke fail `app.js` untuk maintainability.
2. Tambah optimasi imej (WebP/AVIF + saiz berbeza).
3. Tambah SEO lanjut (structured data schema).
4. Integrasi analytics (contoh: GA4/Plausible).
5. Tambah borang backup (email/API) jika WhatsApp gagal.

## 11) Ringkasan

Jitra2Stay ialah website static promosi dan tempahan homestay yang fokus kepada:
- maklumat jelas,
- tindakan cepat (WhatsApp),
- pengalaman pengguna kemas pada desktop/mobile,
- sokongan BM/EN dan light/dark mode.
