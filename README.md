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
- `admin.html` -> owner admin panel (login password, CRUD data, funnel dashboard).
- `style.css` -> styling, tema, responsive layout.
- `thank-you.html` -> halaman selepas klik CTA WhatsApp (conversion step).
- `policies.html` -> polisi tempahan, house rules, dan privasi.
- `ms.html` / `en.html` -> landing URL BM/EN untuk SEO multilingual.
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

### 5.6.1 Owner Edit Tarikh Tidak Tersedia
- Owner boleh tekan butang `Owner: Edit Tarikh` pada papan unavailable dates.
- Sistem akan minta password sebelum panel edit dibuka.
- Password semasa: `1234` (boleh ubah di `app.config.js` pada key `ownerPassword`).
- Data tarikh owner disimpan dalam `localStorage` browser yang digunakan.

### 5.6.2 iCal / Calendar Sync
- Jika `bookingCalendarIcsUrl` diisi dalam `app.config.js`, website akan fetch iCal (.ics) secara automatik.
- Tarikh dari iCal akan digabungkan ke senarai unavailable dates.

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
  - buka lightbox gallery
  - assignment A/B CTA
- Event disimpan juga ke `localStorage` (`analyticsEvents`) untuk dashboard owner.

### 5.10 Map Lazy Load
- Peta Google Maps tidak terus diload semasa page initial render.
- Peta hanya dimuatkan selepas pengguna klik butang `Paparkan Peta Interaktif`.
- Kurangkan beban render awal halaman.

### 5.11 A/B Test CTA
- CTA utama menggunakan variant `A` atau `B` secara rawak (disimpan di `localStorage`).
- Variant A: fokus terus WhatsApp.
- Variant B: fokus ke seksyen semak tarikh.

### 5.12 Gallery Lightbox
- Klik gambar gallery akan buka preview penuh (lightbox).
- Sokong `prev/next`, swipe mobile, tutup dengan butang `X`, klik backdrop, atau `Esc`.

### 5.13 FAQ Accordion
- FAQ kini style accordion (satu jawapan aktif pada satu masa).
- Mesra keyboard (`Enter` / `Space` pada tajuk soalan).

### 5.14 Form Feedback
- Borang semak tarikh memaparkan status ringkas semasa validasi dan sebelum membuka WhatsApp.

### 5.15 Owner Admin Dashboard
- Buka `admin.html` dan login menggunakan password owner.
- Owner boleh:
  - edit unavailable dates
  - edit testimoni
  - edit polisi (diguna oleh `policies.html`)
  - lihat ringkasan funnel: visit -> CTA click -> replied -> confirmed

## 6) Ciri-ciri Utama Website

- Header sticky + navigation section.
- Hero banner dengan CTA utama + CTA sekunder (`Semak Tarikh`) dan trust chips.
- Video walkthrough section.
- Highlights homestay.
- Kadar sewaan (2-5 bilik) + deposit info + anggaran kos per tetamu.
- Cara tempah 1-2-3.
- Form semak tarikh.
- Papan ringkas unavailable dates (manual update).
- Gallery gambar.
- Gallery boleh dibuka dalam lightbox (prev/next + swipe).
- About, target guest, why us.
- Lokasi + info berhampiran.
- Testimoni + trust section.
- FAQ.
- FAQ diperluas (refund, parking, quiet hour, caj tetamu tambahan).
- FAQ kini accordion.
- Contact fallback (email/call) jika WhatsApp tidak tersedia.
- Final CTA besar.
- Footer kini ada quick links + contact block.
- Floating CTA desktop + sticky WhatsApp mobile.
- Multi-language BM/EN.
- Light/Dark mode.
- Responsive untuk mobile.
- URL BM/EN tersedia melalui `ms.html` dan `en.html`.

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
  - `ownerApiEndpoint` (optional backend sync)
  - `bookingCalendarIcsUrl` (public iCal URL)
- Pastikan domain live sebenar digunakan pada:
  - `app.config.js` (`business.siteUrl`)
  - `index.html` (`canonical`)
  - `sitemap.xml` dan `robots.txt`

## 8) Nota Teknikal

- Tiada backend/database.
- Tiada build step.
- Semua interaksi berlaku di browser (client-side).
- `localStorage` digunakan untuk simpan tema dan bahasa.

## 9) Limitasi Semasa

- Data borang masih dihantar ke WhatsApp (tiada booking engine penuh).
- Admin panel masih frontend-centric; untuk security production, disarankan backend auth.

## 10) Cadangan Penambahbaikan

1. Sediakan fail imej WebP/AVIF sebenar untuk setiap gambar utama.
2. Integrasi API backup tempahan (email/API) jika WhatsApp gagal.
3. Tambah dashboard mini untuk edit `unavailableRanges` tanpa ubah kod.
4. Buat endpoint owner API sebenar dan aktifkan `ownerApiEndpoint`.
5. Tambah notifikasi auto (contoh Telegram/email) bila owner kemas kini tarikh.

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
- Ditambah A/B test CTA, lightbox gallery, dan `last updated` pada availability.
- Ditambah `policies.html` dan contact fallback.
- Ditambah UI polish: hero chips, FAQ accordion, form feedback, footer quick-links, dan lightbox navigation.
- Ditambah iCal sync, admin dashboard owner, dan multilingual SEO pages (`ms.html` / `en.html`).
- Footer diperbaharui dengan layout card (brand/quick links/contact), hover/focus state lebih jelas, dan spacing mobile lebih kemas.

## 13) Checklist Sebelum Live

1. Tukar domain kepada domain sebenar dalam:
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
6. Semak `Lighthouse` sasaran:
   - Performance >= 90
   - Accessibility >= 95
   - Best Practices >= 95
   - SEO >= 95
7. Jika guna calendar sync:
   - isi `bookingCalendarIcsUrl` (public .ics URL) dalam `app.config.js`.
8. Login owner:
   - buka `admin.html`
   - masukkan password owner
   - kemas kini tarikh/testimoni/polisi/funnel dari dashboard.

## 14) Setup Wajib (Step-by-step Paling Ringkas)

Ikut urutan ini supaya website terus jalan dengan betul:

1. Buka `app.config.js`.
2. Set nilai asas business:
   - `business.phone: "+6019440666"`
   - `business.siteUrl: "https://jitra2stay.vercel.app"`
   - `business.image: "https://jitra2stay.vercel.app/images/halaman.jpg"` (sementara, boleh tukar kemudian)
3. Simpan fail, kemudian refresh browser (`Ctrl + F5`).
4. Buka `index.html` dan semak URL canonical/hreflang guna domain sama (`https://jitra2stay.vercel.app`).
5. Buka `robots.txt` dan pastikan `Sitemap` URL guna domain sama.
6. Buka `sitemap.xml` dan pastikan semua URL guna domain sama.
7. Uji fungsi utama:
   - Klik CTA WhatsApp
   - Submit borang semak tarikh
   - Buka `admin.html` dan login owner

Jika `business.image` belum ada gambar rasmi:
- Guna dulu `images/halaman.jpg` seperti di atas.
- Bila gambar baru siap, upload ke folder `images/` dan tukar URL `business.image` sahaja.

## 15) Nota UI Footer (Baru)

- Struktur footer kini guna class `site-footer` dengan 3 blok utama: brand, pautan pantas, dan contact.
- Contact dipaparkan dengan label ringkas (`Call`, `Email`, `Chat`) untuk mudahkan scan pengguna.
- Jika mahu ubah kandungan footer:
  - edit markup di `index.html` (bahagian `<footer class="site-footer">`)
  - edit gaya di `style.css` (seksyen `/* ================= FOOTER ================= */`)
