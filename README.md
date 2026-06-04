# 🎬 NOOB Lower Third System

Professional lower third overlay untuk OBS, dikontrol via HP di jaringan lokal.

## 📁 Struktur
```
lowerthird/
├── server.js              ← Server utama
├── package.json
└── public/
    ├── overlay/           ← Dipasang di OBS sebagai Browser Source
    │   └── index.html
    └── controller/        ← Dibuka di HP
        └── index.html
```

## 🚀 Cara Menjalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Jalankan server
```bash
node server.js
```

### 3. Pasang di OBS
- Tambahkan **Browser Source** di OBS
- URL: `http://IPKOMPUTER:3000/overlay`
- Width: **1920**, Height: **1080**
- Centang: "Shutdown source when not visible" ❌ (jangan dicentang)

### 4. Buka Controller di HP
- Pastikan HP dan komputer satu WiFi
- Buka browser di HP: `http://IPKOMPUTER:3000/controller`

## 🎨 Tema Yang Tersedia
| Tema | Kegunaan |
|------|----------|
| 📺 Broadcast | Berita, talk show, siaran langsung |
| 🏆 Sport | Pertandingan, skor, olahraga |
| 💼 Elegant | Seminar, korporat, webinar |
| 🤖 Tech | Konferensi teknologi, gaming |
| ⬜ Minimal | Dokumenter, sinematik |
| 🌈 Gradient | Content creator, YouTube |

## ✨ Animasi Masuk
- Slide Kiri/Kanan/Atas/Bawah
- Fade
- Scale
- Wipe
- Bounce
- Glitch

## ✨ Animasi Keluar
- Slide Kiri/Kanan/Bawah
- Fade
- Scale
- Wipe

## 📰 Fitur Ticker
Running text di bagian bawah layar. Bisa diaktifkan/nonaktifkan secara real-time.

## 🌐 Cek IP Komputer
- Windows: `ipconfig` di CMD → cari IPv4
- Mac/Linux: `ifconfig` atau `ip addr`
