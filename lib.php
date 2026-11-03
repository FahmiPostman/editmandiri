<?php
// Shared helpers: database, default content, auth.

declare(strict_types=1);

const DATA_DIR = __DIR__ . '/data';
const DB_FILE  = DATA_DIR . '/site.sqlite';
const DEFAULT_PASSWORD = 'admin123';

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
    session_start();
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo) return $pdo;

    if (!is_dir(DATA_DIR)) mkdir(DATA_DIR, 0775, true);
    $pdo = new PDO('sqlite:' . DB_FILE);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode = WAL');

    $pdo->exec('CREATE TABLE IF NOT EXISTS content (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )');

    if (setting('password_hash') === null) {
        set_setting('password_hash', password_hash(DEFAULT_PASSWORD, PASSWORD_DEFAULT));
    }
    return $pdo;
}

function setting(string $key): ?string
{
    $st = db()->prepare('SELECT value FROM settings WHERE key = ?');
    $st->execute([$key]);
    $v = $st->fetchColumn();
    return $v === false ? null : $v;
}

function set_setting(string $key, string $value): void
{
    db()->prepare('INSERT INTO settings(key, value) VALUES(?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value')->execute([$key, $value]);
}

function default_content(): array
{
    return [
        'meta' => [
            'title'       => 'RawatWeb — Jasa Maintenance Website Profesional',
            'description' => 'Jasa maintenance website: update, backup, keamanan, dan monitoring 24/7 agar website bisnis Anda selalu cepat, aman, dan online.',
            'accent'      => '#2563eb',
        ],
        'brand' => ['name' => 'RawatWeb'],
        'nav' => ['services' => 'Layanan', 'process' => 'Cara Kerja', 'pricing' => 'Harga', 'faq' => 'FAQ', 'cta' => 'Konsultasi Gratis', 'cta_link' => 'wa:Halo, saya ingin konsultasi gratis untuk website saya.'],
        'hero' => [
            'badge'    => 'Monitoring 24/7 • Respon < 1 jam',
            'title'    => 'Website Anda tetap cepat, aman, dan selalu online.',
            'subtitle' => 'Kami merawat website bisnis Anda — update rutin, backup harian, keamanan, dan perbaikan bug — supaya Anda bisa fokus mengembangkan usaha.',
            'cta1'     => 'Lihat Paket',
            'cta1_link'=> '#pricing',
            'cta2'     => 'Hubungi Kami',
            'cta2_link'=> 'wa:Halo, saya ingin bertanya tentang jasa maintenance website.',
            'stats'    => [
                ['value' => '350+', 'label' => 'Website dirawat'],
                ['value' => '99,9%', 'label' => 'Rata-rata uptime'],
                ['value' => '8 thn', 'label' => 'Pengalaman'],
            ],
        ],
        'about' => [
            'eyebrow' => 'Tentang Kami',
            'title'   => 'Tim kecil, tanggung jawab besar.',
            'text'    => 'RawatWeb berdiri sejak 2018 dengan satu tujuan: membebaskan pemilik bisnis dari urusan teknis website. Kami menangani WordPress, Laravel, hingga website custom dengan standar kerja yang jelas, laporan bulanan yang transparan, dan tim support yang mudah dihubungi.',
            'points'  => ['Laporan bulanan yang mudah dipahami', 'Support via WhatsApp & email', 'Tanpa kontrak jangka panjang'],
        ],
        'services' => [
            'eyebrow' => 'Layanan',
            'title'   => 'Semua yang website Anda butuhkan',
            'subtitle'=> 'Satu tim untuk seluruh kebutuhan perawatan teknis website.',
            'items'   => [
                ['icon' => 'refresh', 'title' => 'Update Rutin', 'desc' => 'Core, plugin, tema, dan dependensi selalu versi terbaru dan diuji sebelum diterapkan.'],
                ['icon' => 'shield',  'title' => 'Keamanan', 'desc' => 'Firewall, scan malware, hardening server, dan pembersihan jika terjadi peretasan.'],
                ['icon' => 'cloud',   'title' => 'Backup Harian', 'desc' => 'Backup otomatis di lokasi terpisah, bisa dipulihkan kapan saja dalam hitungan menit.'],
                ['icon' => 'pulse',   'title' => 'Monitoring Uptime', 'desc' => 'Pemantauan 24/7. Kami tahu dan bertindak lebih dulu sebelum pelanggan Anda sadar.'],
                ['icon' => 'bolt',    'title' => 'Optimasi Kecepatan', 'desc' => 'Caching, kompresi gambar, dan tuning server untuk skor Core Web Vitals yang lebih baik.'],
                ['icon' => 'wrench',  'title' => 'Perbaikan & Revisi', 'desc' => 'Perbaikan bug, perubahan konten, dan penyesuaian kecil tanpa biaya tambahan.'],
            ],
        ],
        'process' => [
            'eyebrow' => 'Cara Kerja',
            'title'   => 'Mulai dalam 3 langkah mudah',
            'items'   => [
                ['title' => 'Audit Gratis', 'desc' => 'Kami cek kondisi website Anda: keamanan, kecepatan, dan versi software.'],
                ['title' => 'Pilih Paket', 'desc' => 'Pilih paket sesuai kebutuhan. Onboarding selesai dalam 1×24 jam.'],
                ['title' => 'Kami Rawat', 'desc' => 'Website dirawat rutin dan Anda menerima laporan setiap bulan.'],
            ],
        ],
        'pricing' => [
            'eyebrow' => 'Harga',
            'title'   => 'Paket transparan, tanpa biaya tersembunyi',
            'subtitle'=> 'Bayar bulanan, berhenti kapan saja.',
            'items'   => [
                ['name' => 'Basic', 'price' => 'Rp299rb', 'period' => '/bulan', 'desc' => 'Untuk website profil & landing page.', 'featured' => false, 'cta' => 'Pilih Basic', 'link' => 'wa:Halo, saya tertarik dengan paket Basic.',
                 'features' => ['Update bulanan', 'Backup mingguan', 'Monitoring uptime', '1 jam revisi konten']],
                ['name' => 'Pro', 'price' => 'Rp599rb', 'period' => '/bulan', 'desc' => 'Untuk bisnis yang mengandalkan website.', 'featured' => true, 'cta' => 'Pilih Pro', 'link' => 'wa:Halo, saya tertarik dengan paket Pro.',
                 'features' => ['Update mingguan', 'Backup harian', 'Firewall & scan malware', 'Optimasi kecepatan', '3 jam revisi konten']],
                ['name' => 'Bisnis', 'price' => 'Rp1,2jt', 'period' => '/bulan', 'desc' => 'Untuk toko online & website trafik tinggi.', 'featured' => false, 'cta' => 'Pilih Bisnis', 'link' => 'wa:Halo, saya tertarik dengan paket Bisnis.',
                 'features' => ['Semua fitur Pro', 'Respon prioritas < 1 jam', 'Staging environment', 'Laporan performa detail', '8 jam revisi konten']],
            ],
        ],
        'testimonials' => [
            'eyebrow' => 'Testimoni',
            'title'   => 'Dipercaya pemilik bisnis',
            'items'   => [
                ['quote' => 'Sejak pakai RawatWeb, website toko kami tidak pernah down lagi saat promo besar. Timnya cepat tanggap.', 'name' => 'Rina Kartika', 'role' => 'Owner, Batik Lestari'],
                ['quote' => 'Website kami pernah kena malware. Dalam beberapa jam sudah bersih dan sekarang jauh lebih aman.', 'name' => 'Andi Pratama', 'role' => 'Marketing, Klinik Sehat'],
                ['quote' => 'Laporan bulanannya jelas. Saya jadi tahu apa saja yang dikerjakan tanpa harus paham teknis.', 'name' => 'Dewi Santoso', 'role' => 'Founder, Kopi Senja'],
            ],
        ],
        'faq' => [
            'eyebrow' => 'FAQ',
            'title'   => 'Pertanyaan yang sering diajukan',
            'items'   => [
                ['q' => 'Platform apa saja yang bisa dirawat?', 'a' => 'WordPress, WooCommerce, Laravel, CodeIgniter, dan website HTML/PHP custom. Hubungi kami untuk platform lainnya.'],
                ['q' => 'Apakah ada kontrak minimal?', 'a' => 'Tidak ada. Paket dibayar bulanan dan bisa dihentikan kapan saja.'],
                ['q' => 'Bagaimana jika website saya diretas?', 'a' => 'Kami akan membersihkan malware, memulihkan dari backup bila perlu, dan menutup celah keamanannya. Sudah termasuk di paket Pro dan Bisnis.'],
                ['q' => 'Apakah hosting termasuk?', 'a' => 'Paket kami fokus pada perawatan. Namun kami bisa membantu migrasi ke hosting yang lebih baik bila diperlukan.'],
            ],
        ],
        'contact' => [
            'eyebrow'  => 'Kontak',
            'title'    => 'Siap merawat website Anda?',
            'subtitle' => 'Ceritakan kebutuhan Anda. Audit awal gratis dan kami balas dalam 1 jam kerja.',
            'email'    => 'halo@rawatweb.id',
            'phone'    => '0812-3456-7890',
            'whatsapp' => '6281234567890',
            'address'  => 'Jl. Merdeka No. 10, Bandung',
            'button'   => 'Kirim via WhatsApp',
        ],
        'footer' => ['text' => 'Jasa maintenance website untuk bisnis di seluruh Indonesia.'],
    ];
}

function get_content(): array
{
    $content = default_content();
    $rows = db()->query('SELECT key, value FROM content')->fetchAll();
    foreach ($rows as $row) {
        $val = json_decode($row['value'], true);
        if (is_array($val) && isset($content[$row['key']])) {
            $content[$row['key']] = array_replace($content[$row['key']], $val);
        }
    }
    return $content;
}

function save_content(array $data): void
{
    $allowed = default_content();
    $pdo = db();
    $pdo->beginTransaction();
    $st = $pdo->prepare('INSERT INTO content(key, value, updated_at) VALUES(?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at');
    foreach ($data as $key => $value) {
        if (!isset($allowed[$key]) || !is_array($value)) continue;
        $st->execute([$key, json_encode(clean($value), JSON_UNESCAPED_UNICODE)]);
    }
    $pdo->commit();
}

// Content is stored as plain text only; HTML is escaped on output.
function clean($value)
{
    if (is_array($value)) return array_map('clean', $value);
    if (is_bool($value)) return $value;
    return mb_substr(trim((string)$value), 0, 5000);
}

function is_admin(): bool
{
    return !empty($_SESSION['admin']);
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
    return $_SESSION['csrf'];
}

function e($s): string
{
    return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}

function icon(string $name): string
{
    $paths = [
        'refresh' => '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
        'shield'  => '<path d="M12 3 4 6v6c0 5 3.4 8.6 8 9 4.6-.4 8-4 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>',
        'cloud'   => '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8H7z"/><path d="M12 11v6m-3-3 3 3 3-3"/>',
        'pulse'   => '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
        'bolt'    => '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
        'wrench'  => '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5z"/>',
        'code'    => '<path d="m8 6-6 6 6 6m8-12 6 6-6 6"/>',
        'chart'   => '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
        'lock'    => '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        'search'  => '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
        'server'  => '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
        'chat'    => '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    ];
    $p = $paths[$name] ?? $paths['wrench'];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $p . '</svg>';
}

function icon_names(): array
{
    return ['refresh', 'shield', 'cloud', 'pulse', 'bolt', 'wrench', 'code', 'chart', 'lock', 'search', 'server', 'chat'];
}

// Button links are stored as "wa:<message>", "#section", "https://…", "tel:…" or "mailto:…".
// Anything else (e.g. javascript:) falls back to the contact section.
function link_href(string $link, string $whatsapp): string
{
    $link = trim($link);
    if (str_starts_with($link, 'wa:')) {
        $text = trim(substr($link, 3));
        return 'https://wa.me/' . preg_replace('/\D+/', '', $whatsapp) . ($text !== '' ? '?text=' . rawurlencode($text) : '');
    }
    if (preg_match('/^#[\w-]*$/', $link)) return $link;
    if (preg_match('#^(https?://|tel:|mailto:)#i', $link)) return $link;
    return '#contact';
}

// href + target attributes for an editable button link.
function link_attrs(string $link, string $whatsapp): string
{
    $href = link_href($link, $whatsapp);
    $external = !str_starts_with($href, '#') && !preg_match('/^(tel|mailto):/i', $href);
    return 'href="' . e($href) . '" data-link-value="' . e($link) . '"' . ($external ? ' target="_blank" rel="noopener"' : '');
}
