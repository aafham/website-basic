# Jitra2Stay Website

Website static promosi homestay Jitra2Stay dengan fokus:
- maklumat jelas
- CTA WhatsApp pantas
- BM/EN toggle
- desktop + mobile responsive

## Stack Ringkas
- `index.html` -> struktur halaman utama
- `style.css` -> UI/tema/responsive
- `app.js` -> interaksi (menu, form, scroll, language/theme toggle)
- `app.config.js` -> konfigurasi business, tarikh unavailable, analytics
- `admin.html` -> panel owner (frontend)

## Jalankan Secara Local
Pilihan cepat:
- buka `index.html` terus di browser

Pilihan disarankan:
```powershell
python -m http.server 5500
```
Lepas tu buka `http://localhost:5500`.

## Deploy
Boleh deploy sebagai static site di:
- Vercel
- Netlify
- cPanel/shared hosting

Pastikan semua fail root + folder `images/` ikut naik sekali.

## Konfigurasi Wajib (`app.config.js`)
Set minimum ini sebelum live:
- `business.phone`
- `business.siteUrl`
- `business.image`
- `unavailableRanges`
- `ownerPassword` (wajib tukar)
- `gaMeasurementId` atau `plausibleDomain` (jika guna analytics)

## Fail Penting Lain
- `thank-you.html` -> halaman selepas CTA WhatsApp
- `policies.html` -> polisi & house rules
- `ms.html` / `en.html` -> landing BM/EN
- `robots.txt` / `sitemap.xml` -> SEO

## Cara Edit Kandungan
- Teks BM/EN: guna `data-bm` dan `data-en`
- Gambar: letak dalam `images/`
- Warna/spacing/UI: edit di `style.css`
- WhatsApp link/copy: edit di `index.html` + `app.config.js`

## Checklist Sebelum Live
1. Samakan domain pada `app.config.js`, `index.html` (canonical), `robots.txt`, `sitemap.xml`.
2. Semak semua CTA WhatsApp berfungsi.
3. Semak borang tarikh + unavailable dates.
4. Uji BM/EN toggle dan dark/light mode.
5. Uji `admin.html` login dan tukar `ownerPassword`.
6. Hard refresh (`Ctrl + F5`) selepas update besar.

