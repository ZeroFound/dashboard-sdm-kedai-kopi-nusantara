# Dashboard SIM SDM Kedai Kopi Nusantara

![Logo UPN Veteran Yogyakarta](image.png)

Dashboard interaktif untuk Sistem Informasi Manajemen Sumber Daya Manusia
(SIM SDM) pada studi kasus Kedai Kopi Nusantara. Project ini dibuat sebagai
aplikasi web statis untuk membantu memantau data karyawan, absensi, beban gaji,
dan ringkasan laporan manajerial secara visual.

## Fitur Utama

- Dashboard KPI SDM: total karyawan, karyawan aktif, total hadir, total gaji,
  dan persentase kehadiran.
- Visualisasi data dengan Chart.js untuk jabatan, gender, status kehadiran,
  gaji per jabatan, dan laporan ringkasan.
- Modul keuangan untuk melihat total gaji, proporsi gaji per jabatan, dan
  perbandingan gaji karyawan.
- Manajemen data karyawan dengan fitur tambah, edit, hapus, pencarian, dan
  detail data.
- Manajemen absensi dengan fitur tambah, hapus, pencarian, dan rekap status
  hadir, izin, sakit, dan alpha.
- Smart alert untuk menandai catatan penting seperti alpha, karyawan tidak
  aktif, atau persentase kehadiran rendah.
- Penyimpanan data menggunakan localStorage sehingga perubahan tetap tersimpan
  di browser.
- Export data ke CSV.
- Tampilan responsif dengan dukungan mode tema dan fullscreen.

## Teknologi

- HTML5
- CSS3
- JavaScript
- Chart.js
- Font Awesome
- Google Fonts
- localStorage browser

## Struktur Project

```text
dashboard-sdm-kedai-kopi-nusantara/
|-- index.html    # Struktur halaman dan komponen dashboard
|-- style.css     # Styling, layout, responsivitas, dan tema
|-- app.js        # Data, logika dashboard, CRUD, chart, alert, dan export
|-- image.png     # Logo/aset visual yang digunakan pada banner
|-- README.md     # Dokumentasi project
```

## Cara Menjalankan

1. Clone repository ini.

   ```bash
   git clone https://github.com/ZeroFound/dashboard-sdm-kedai-kopi-nusantara.git
   ```

2. Masuk ke folder project.

   ```bash
   cd dashboard-sdm-kedai-kopi-nusantara
   ```

3. Buka file `index.html` langsung di browser.

Project ini tidak membutuhkan proses build atau instalasi dependency lokal
karena seluruh file utama berjalan sebagai aplikasi web statis.

## Data Default

Aplikasi menyediakan data awal karyawan dan absensi untuk kebutuhan simulasi.
Data yang diubah melalui aplikasi akan disimpan di localStorage browser. Gunakan
tombol reset pada dashboard untuk mengembalikan data ke kondisi awal.

## Modul Dashboard

- Dashboard SDM: ringkasan KPI, komposisi karyawan, status kehadiran, dan
  insight manajerial.
- Keuangan: analisis beban gaji dan proporsi gaji berdasarkan jabatan.
- Karyawan: tabel data karyawan, pencarian, CRUD, dan detail karyawan.
- Absensi: tabel absensi, pencarian, tambah data absensi, dan rekap kehadiran.
- Laporan: ringkasan visual untuk mendukung evaluasi SDM.

## Konteks Akademik

Project ini disusun untuk Tugas Proyek SIM SDM Program Studi Manajemen S1,
Fakultas Ekonomi dan Bisnis, Universitas Pembangunan Nasional "Veteran"
Yogyakarta.

## Kelompok

**Kelompok 5**

- Rosalinda Diana Putri - 141230412
- Rahma Brillianti Kandila - 141230581
- Cynthia Aulia Noorrahmasari - 141230600
- Siti Syahriatul Mukharomah - 141230612

Dosen Pengampu: **R. Hendri Gusaptono, Drs., M.M.**

## Lisensi

Project ini digunakan untuk kebutuhan pembelajaran dan pengembangan tugas
akademik.
