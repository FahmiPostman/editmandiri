<?php
// JSON endpoints: login, logout, save content, contact form, messages, password.

declare(strict_types=1);
require __DIR__ . '/lib.php';

header('Content-Type: application/json; charset=utf-8');

function respond(array $data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function require_admin(): void
{
    if (!is_admin()) respond(['ok' => false, 'error' => 'Sesi berakhir, silakan login lagi.'], 401);
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!hash_equals(csrf_token(), $token)) respond(['ok' => false, 'error' => 'Token tidak valid. Muat ulang halaman.'], 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed'], 405);

$input = json_decode(file_get_contents('php://input') ?: '[]', true) ?: [];
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'login':
            // Small delay slows down password guessing.
            usleep(400000);
            if (password_verify((string)($input['password'] ?? ''), (string)setting('password_hash'))) {
                session_regenerate_id(true);
                $_SESSION['admin'] = true;
                respond(['ok' => true]);
            }
            respond(['ok' => false, 'error' => 'Password salah.'], 401);

        case 'logout':
            $_SESSION = [];
            session_destroy();
            respond(['ok' => true]);

        case 'save':
            require_admin();
            if (!is_array($input['content'] ?? null)) respond(['ok' => false, 'error' => 'Data kosong.'], 422);
            save_content($input['content']);
            respond(['ok' => true]);

        case 'reset':
            require_admin();
            db()->exec('DELETE FROM content');
            respond(['ok' => true]);

        case 'password':
            require_admin();
            $current = (string)($input['current'] ?? '');
            $new = (string)($input['new'] ?? '');
            if (!password_verify($current, (string)setting('password_hash'))) respond(['ok' => false, 'error' => 'Password lama salah.'], 422);
            if (mb_strlen($new) < 6) respond(['ok' => false, 'error' => 'Password baru minimal 6 karakter.'], 422);
            set_setting('password_hash', password_hash($new, PASSWORD_DEFAULT));
            respond(['ok' => true]);

        case 'contact':
            $name = trim((string)($input['name'] ?? ''));
            $email = trim((string)($input['email'] ?? ''));
            $phone = trim((string)($input['phone'] ?? ''));
            $message = trim((string)($input['message'] ?? ''));
            if (!empty($input['website'])) respond(['ok' => true]); // honeypot
            if ($name === '' || $message === '' || ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL))) {
                respond(['ok' => false, 'error' => 'Nama dan pesan wajib diisi, email harus valid jika diisi.'], 422);
            }
            db()->prepare('INSERT INTO messages(name, email, phone, message) VALUES(?, ?, ?, ?)')
                ->execute([mb_substr($name, 0, 120), mb_substr($email, 0, 160), mb_substr($phone, 0, 40), mb_substr($message, 0, 3000)]);
            respond(['ok' => true]);

        case 'messages':
            require_admin();
            $rows = db()->query('SELECT * FROM messages ORDER BY id DESC LIMIT 200')->fetchAll();
            respond(['ok' => true, 'messages' => $rows]);

        case 'message_read':
            require_admin();
            db()->prepare('UPDATE messages SET is_read = 1 WHERE id = ?')->execute([(int)($input['id'] ?? 0)]);
            respond(['ok' => true]);

        case 'message_delete':
            require_admin();
            db()->prepare('DELETE FROM messages WHERE id = ?')->execute([(int)($input['id'] ?? 0)]);
            respond(['ok' => true]);

        default:
            respond(['ok' => false, 'error' => 'Aksi tidak dikenal.'], 404);
    }
} catch (Throwable $ex) {
    respond(['ok' => false, 'error' => 'Terjadi kesalahan server.'], 500);
}
