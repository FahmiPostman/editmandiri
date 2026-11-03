# Edit Mandiri — Company Profile Jasa Maintenance Website

Halaman company profile satu halaman yang isinya bisa diedit langsung di halaman (PHP + SQLite).

## Menjalankan
- **Laragon / Apache**: taruh folder ini di `www`, buka di browser.
- **Lokal cepat**: `php -S localhost:8000`

Butuh PHP 8+ dengan ekstensi `pdo_sqlite`. Database `data/site.sqlite` dibuat otomatis saat pertama dibuka.

## Admin
- Buka `?login` atau klik **Admin** di footer.
- Password awal: `admin123` — segera ganti lewat menu **Atur**.
- Tekan **Edit** lalu ketuk teks mana pun untuk mengubah. Ikon 🔗 pada tombol untuk mengatur link (WhatsApp, bagian halaman, atau URL).

## Catatan keamanan
Folder `data/` diblokir lewat `.htaccess` (Apache). Di Nginx atau `php -S`, blokir akses ke `data/` secara manual agar file database tidak bisa diunduh.
