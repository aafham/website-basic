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
- `index.html` -> struktur halaman.
- `app.js` -> script interaktif (menu, bahasa, tema, form, scroll behavior).
- `app.config.js` -> konfigurasi business info, analytics, unavailable dates.
- `style.css` -> styling, tema, responsive layout.
- `thank-you.html` -> halaman selepas klik CTA WhatsApp (conversion step).
- `sitemap.xml` -> sitemap SEO.
- `robots.txt` -> arahan crawler.
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
1. Upload semua fail root (`index.html`, `app.js`, `app.config.js`, `style.css`, `thank-you.html`, `sitemap.xml`, `robots.txt`) dan folder `images` ke `public_html`.
2. Website akan live pada domain.

## 5) Fungsi Dalam App

Semua fungsi di bawah berada dalam script di `app.js`.

### 5.1 UI Reveal On Scroll
- Scroll observer dalam `updateOnScroll()`
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
- Sokong tutup menu melalui `Esc` dan klik di luar menu.

### 5.4 Final CTA Reveal
- Bila seksyen `.final-cta` masuk hampir viewport, class `.show` ditambah.

### 5.5 Floating CTA + Back To Top
- Dikendalikan dalam `updateOnScroll()` (dioptimumkan dengan `requestAnimationFrame`)
- Bila scroll > 500px:
  - Tunjuk kotak `#floatingCta`
  - Tunjuk butang `#backToTop`
- `#backToTop` scroll semula ke atas secara smooth.

### 5.6 Borang Semak Tarikh ke WhatsApp
- Intercept submit pada `#dateForm`.
- Ambil nilai form: check-in, check-out, tetamu, bilik, nota.
- Tambah validasi tarikh (`check-out` mesti selepas `check-in`).
- Semak pertindihan dengan tarikh unavailable dari `app.config.js`.
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

### 5.9 Analytics & Tracking
- Konfigurasi analytics melalui `app.config.js` (`gaMeasurementId` / `plausibleDomain`).
- Event utama ditrack:
  - klik WhatsApp CTA
  - submit form tarikh
  - tukar bahasa
  - tukar tema
  - load peta

### 5.10 Map Lazy Load
- Peta Google Maps tidak terus diload semasa page initial render.
- Peta hanya dimuatkan selepas pengguna klik butang `Paparkan Peta Interaktif`.
- Kurangkan beban render awal halaman.

## 6) Ciri-ciri Utama Website

- Header sticky + navigation section.
- Hero banner dengan CTA WhatsApp.
- Video walkthrough section.
- Highlights homestay.
- Kadar sewaan (2-5 bilik) + deposit info.
- Cara tempah 1-2-3.
- Form semak tarikh.
- Papan ringkas unavailable dates (manual update).
- Gallery gambar.
- About, target guest, why us.
- Lokasi + info berhampiran.
- Testimoni + trust section.
- FAQ.
- FAQ diperluas (refund, parking, quiet hour, caj tetamu tambahan).
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

### Konfigurasi Utama
- Semua tetapan utama kini di `app.config.js`:
  - info bisnes (`name`, `phone`, `siteUrl`)
  - analytics IDs
  - `enableThankYouRedirect`
  - `unavailableRanges`
- Gantikan domain contoh `jitra2stay.example.com` kepada domain live sebenar pada:
  - `app.config.js`
  - `index.html` (`canonical`)
  - `sitemap.xml` dan `robots.txt`

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

1. Sediakan fail imej WebP/AVIF sebenar untuk setiap gambar utama.
2. Integrasi API backup tempahan (email/API) jika WhatsApp gagal.
3. Tambah dashboard mini untuk edit `unavailableRanges` tanpa ubah kod.
4. Tambah A/B test copy CTA untuk naikkan conversion.
5. Tambah halaman polisi penuh (refund, house rules, privacy).

## 11) Ringkasan

Jitra2Stay ialah website static promosi dan tempahan homestay yang fokus kepada:
- maklumat jelas,
- tindakan cepat (WhatsApp),
- pengalaman pengguna kemas pada desktop/mobile,
- sokongan BM/EN dan light/dark mode.

## 12) Update Terkini (Februari 2026)

- JavaScript dipisahkan ke `app.js` untuk struktur kod lebih kemas.
- Ditambah `skip-link`, `focus-visible`, dan `aria-pressed` untuk accessibility.
- Ditambah validasi tarikh check-in/check-out dalam borang semakan.
- Scroll behavior dioptimumkan menggunakan `requestAnimationFrame`.
- Ditambah `app.config.js` untuk central config + analytics setup.
- Ditambah halaman `thank-you.html` untuk step conversion selepas klik WhatsApp.
- Ditambah `sitemap.xml` dan `robots.txt` untuk SEO.
- Ditambah schema `LodgingBusiness` dan map lazy-load.

## 13) Checklist Sebelum Live

1. Tukar domain contoh `jitra2stay.example.com` kepada domain sebenar dalam:
   - `app.config.js`
   - `index.html` (canonical URL)
   - `sitemap.xml`
   - `robots.txt`
2. Isi `gaMeasurementId` atau `plausibleDomain` dalam `app.config.js` jika mahu analytics aktif.
3. Semak nombor WhatsApp dalam semua CTA serta di `app.config.js`.
4. Kemas kini `unavailableRanges` dalam `app.config.js` ikut tarikh tempahan sebenar.
5. Uji aliran lengkap:
   - klik CTA WhatsApp
   - redirect ke `thank-you.html`
   - submit borang tarikh
   - klik butang load map
