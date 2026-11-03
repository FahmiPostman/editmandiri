<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

$c = get_content();
$admin = is_admin();
$wa = preg_replace('/\D+/', '', $c['contact']['whatsapp']);
$tel = preg_replace('/[^\d+]/', '', $c['contact']['phone']);
$accent = preg_match('/^#[0-9a-fA-F]{6}$/', $c['meta']['accent']) ? $c['meta']['accent'] : '#2563eb';
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title><?= e($c['meta']['title']) ?></title>
<meta name="description" content="<?= e($c['meta']['description']) ?>">
<meta property="og:title" content="<?= e($c['meta']['title']) ?>">
<meta property="og:description" content="<?= e($c['meta']['description']) ?>">
<meta name="theme-color" content="<?= e($accent) ?>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css?v=3">
<?php if ($admin): ?><link rel="stylesheet" href="assets/editor.css?v=3"><?php endif; ?>
<style>:root{--accent:<?= e($accent) ?>}</style>
</head>
<body class="<?= $admin ? 'is-admin' : '' ?>">

<header class="site-header" id="top">
  <div class="container header-inner">
    <a href="#top" class="brand"><span class="brand-mark"><?= icon('wrench') ?></span><span data-edit="brand.name"><?= e($c['brand']['name']) ?></span></a>
    <nav class="nav" id="nav" aria-label="Navigasi utama">
      <a href="#services"><span data-edit="nav.services"><?= e($c['nav']['services']) ?></span></a>
      <a href="#process"><span data-edit="nav.process"><?= e($c['nav']['process']) ?></span></a>
      <a href="#pricing"><span data-edit="nav.pricing"><?= e($c['nav']['pricing']) ?></span></a>
      <a href="#faq"><span data-edit="nav.faq"><?= e($c['nav']['faq']) ?></span></a>
      <a <?= link_attrs($c['nav']['cta_link'], $wa) ?> data-link="nav.cta_link" class="btn btn-sm"><span data-edit="nav.cta"><?= e($c['nav']['cta']) ?></span></a>
    </nav>
    <button class="nav-toggle" id="navToggle" aria-label="Buka menu" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
  </div>
</header>

<main>
  <!-- HERO -->
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <span class="badge"><span class="dot"></span><span data-edit="hero.badge"><?= e($c['hero']['badge']) ?></span></span>
        <h1 data-edit="hero.title"><?= e($c['hero']['title']) ?></h1>
        <p class="lead" data-edit="hero.subtitle" data-multiline><?= e($c['hero']['subtitle']) ?></p>
        <div class="hero-actions">
          <a <?= link_attrs($c['hero']['cta1_link'], $wa) ?> data-link="hero.cta1_link" class="btn"><span data-edit="hero.cta1"><?= e($c['hero']['cta1']) ?></span></a>
          <a <?= link_attrs($c['hero']['cta2_link'], $wa) ?> data-link="hero.cta2_link" class="btn btn-ghost"><span data-edit="hero.cta2"><?= e($c['hero']['cta2']) ?></span></a>
        </div>
        <dl class="stats" data-list="hero.stats">
          <?php foreach ($c['hero']['stats'] as $s): ?>
          <div class="stat" data-item>
            <dt data-field="value"><?= e($s['value']) ?></dt>
            <dd data-field="label"><?= e($s['label']) ?></dd>
          </div>
          <?php endforeach; ?>
        </dl>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="window">
          <div class="window-bar"><i></i><i></i><i></i><span>dashboard.<?= e(strtolower(preg_replace('/\s+/', '', $c['brand']['name']))) ?>.id</span></div>
          <div class="window-body">
            <div class="status-row">
              <div><small>Status website</small><strong><span class="live"></span>Online</strong></div>
              <div class="uptime"><small>Uptime 30 hari</small><strong>99,98%</strong></div>
            </div>
            <div class="bars"><?php for ($i = 0; $i < 30; $i++): ?><i style="--h:<?= [70,85,60,90,75,95,80,88,65,92,78,96,84,70,90,82,94,76,88,98,72,86,91,79,93,85,97,81,89,95][$i] ?>%"></i><?php endfor; ?></div>
            <ul class="checks">
              <li><span class="ok"><?= icon('cloud') ?></span>Backup harian selesai<em>02:00</em></li>
              <li><span class="ok"><?= icon('refresh') ?></span>12 plugin diperbarui<em>Kemarin</em></li>
              <li><span class="ok"><?= icon('shield') ?></span>Scan malware: bersih<em>Kemarin</em></li>
            </ul>
          </div>
        </div>
        <div class="float-card"><span class="ok"><?= icon('bolt') ?></span><div><small>Kecepatan</small><strong>0,8 dtk</strong></div></div>
      </div>
    </div>
  </section>

  <!-- ABOUT -->
  <section class="section about" id="about">
    <div class="container about-grid">
      <div>
        <span class="eyebrow" data-edit="about.eyebrow"><?= e($c['about']['eyebrow']) ?></span>
        <h2 data-edit="about.title"><?= e($c['about']['title']) ?></h2>
      </div>
      <div>
        <p data-edit="about.text" data-multiline><?= e($c['about']['text']) ?></p>
        <ul class="ticks" data-edit-list="about.points">
          <?php foreach ($c['about']['points'] as $p): ?><li><?= e($p) ?></li><?php endforeach; ?>
        </ul>
      </div>
    </div>
  </section>

  <!-- SERVICES -->
  <section class="section alt" id="services">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow" data-edit="services.eyebrow"><?= e($c['services']['eyebrow']) ?></span>
        <h2 data-edit="services.title"><?= e($c['services']['title']) ?></h2>
        <p data-edit="services.subtitle"><?= e($c['services']['subtitle']) ?></p>
      </div>
      <div class="grid-3" data-list="services.items">
        <?php foreach ($c['services']['items'] as $s): ?>
        <article class="card service" data-item data-icon="<?= e($s['icon']) ?>">
          <div class="icon" data-icon-slot><?= icon($s['icon']) ?></div>
          <h3 data-field="title"><?= e($s['title']) ?></h3>
          <p data-field="desc" data-multiline><?= e($s['desc']) ?></p>
        </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- PROCESS -->
  <section class="section" id="process">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow" data-edit="process.eyebrow"><?= e($c['process']['eyebrow']) ?></span>
        <h2 data-edit="process.title"><?= e($c['process']['title']) ?></h2>
      </div>
      <ol class="steps" data-list="process.items">
        <?php foreach ($c['process']['items'] as $s): ?>
        <li class="step" data-item>
          <span class="step-num"></span>
          <h3 data-field="title"><?= e($s['title']) ?></h3>
          <p data-field="desc" data-multiline><?= e($s['desc']) ?></p>
        </li>
        <?php endforeach; ?>
      </ol>
    </div>
  </section>

  <!-- PRICING -->
  <section class="section alt" id="pricing">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow" data-edit="pricing.eyebrow"><?= e($c['pricing']['eyebrow']) ?></span>
        <h2 data-edit="pricing.title"><?= e($c['pricing']['title']) ?></h2>
        <p data-edit="pricing.subtitle"><?= e($c['pricing']['subtitle']) ?></p>
      </div>
      <div class="grid-3 pricing" data-list="pricing.items">
        <?php foreach ($c['pricing']['items'] as $p): ?>
        <article class="card plan<?= !empty($p['featured']) ? ' featured' : '' ?>" data-item data-featured="<?= !empty($p['featured']) ? '1' : '0' ?>">
          <span class="plan-tag">Terpopuler</span>
          <h3 data-field="name"><?= e($p['name']) ?></h3>
          <p class="plan-desc" data-field="desc"><?= e($p['desc']) ?></p>
          <div class="price"><strong data-field="price"><?= e($p['price']) ?></strong><span data-field="period"><?= e($p['period']) ?></span></div>
          <ul class="ticks" data-field-list="features">
            <?php foreach ($p['features'] as $f): ?><li><?= e($f) ?></li><?php endforeach; ?>
          </ul>
          <a <?= link_attrs($p['link'] ?? '#contact', $wa) ?> data-link-field="link" class="btn<?= empty($p['featured']) ? ' btn-ghost' : '' ?> btn-block"><span data-field="cta"><?= e($p['cta']) ?></span></a>
        </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="section" id="testimonials">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow" data-edit="testimonials.eyebrow"><?= e($c['testimonials']['eyebrow']) ?></span>
        <h2 data-edit="testimonials.title"><?= e($c['testimonials']['title']) ?></h2>
      </div>
      <div class="grid-3" data-list="testimonials.items">
        <?php foreach ($c['testimonials']['items'] as $t): ?>
        <figure class="card quote" data-item>
          <div class="stars" aria-label="5 bintang">★★★★★</div>
          <blockquote data-field="quote" data-multiline><?= e($t['quote']) ?></blockquote>
          <figcaption>
            <span class="avatar" aria-hidden="true"><?= e(mb_strtoupper(mb_substr($t['name'], 0, 1))) ?></span>
            <span><strong data-field="name"><?= e($t['name']) ?></strong><small data-field="role"><?= e($t['role']) ?></small></span>
          </figcaption>
        </figure>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section alt" id="faq">
    <div class="container narrow">
      <div class="section-head">
        <span class="eyebrow" data-edit="faq.eyebrow"><?= e($c['faq']['eyebrow']) ?></span>
        <h2 data-edit="faq.title"><?= e($c['faq']['title']) ?></h2>
      </div>
      <div class="faq" data-list="faq.items">
        <?php foreach ($c['faq']['items'] as $f): ?>
        <details class="faq-item" data-item>
          <summary><span data-field="q"><?= e($f['q']) ?></span><i class="chev" aria-hidden="true"></i></summary>
          <p data-field="a" data-multiline><?= e($f['a']) ?></p>
        </details>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- CONTACT -->
  <section class="section" id="contact">
    <div class="container contact-grid">
      <div>
        <span class="eyebrow" data-edit="contact.eyebrow"><?= e($c['contact']['eyebrow']) ?></span>
        <h2 data-edit="contact.title"><?= e($c['contact']['title']) ?></h2>
        <p class="lead" data-edit="contact.subtitle" data-multiline><?= e($c['contact']['subtitle']) ?></p>
        <ul class="contact-list">
          <li><span class="icon sm"><?= icon('chat') ?></span><a href="https://wa.me/<?= e($wa) ?>" target="_blank" rel="noopener"><span data-edit="contact.phone"><?= e($c['contact']['phone']) ?></span></a></li>
          <li><span class="icon sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span><a href="mailto:<?= e($c['contact']['email']) ?>"><span data-edit="contact.email"><?= e($c['contact']['email']) ?></span></a></li>
          <li><span class="icon sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg></span><span data-edit="contact.address"><?= e($c['contact']['address']) ?></span></li>
        </ul>
      </div>
      <form class="card form" id="contactForm" data-wa="<?= e($wa) ?>" novalidate>
        <div class="field"><label for="f-name">Nama</label><input id="f-name" name="name" required autocomplete="name"></div>
        <div class="field-row">
          <div class="field"><label for="f-email">Email <small>(opsional)</small></label><input id="f-email" name="email" type="email" autocomplete="email" inputmode="email"></div>
          <div class="field"><label for="f-phone">No. WhatsApp</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel"></div>
        </div>
        <div class="field"><label for="f-msg">Pesan</label><textarea id="f-msg" name="message" rows="4" required placeholder="Alamat website & kebutuhan Anda"></textarea></div>
        <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn btn-block" type="submit"><span data-edit="contact.button"><?= e($c['contact']['button']) ?></span></button>
        <p class="form-status" id="formStatus" role="status"></p>
      </form>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="container footer-inner">
    <div>
      <a href="#top" class="brand"><span class="brand-mark"><?= icon('wrench') ?></span><span data-edit="brand.name"><?= e($c['brand']['name']) ?></span></a>
      <p data-edit="footer.text"><?= e($c['footer']['text']) ?></p>
    </div>
    <p class="copy">© <?= date('Y') ?> <?= e($c['brand']['name']) ?>. <?php if (!$admin): ?><a href="?login" class="admin-link" id="adminLink">Admin</a><?php endif; ?></p>
  </div>
</footer>

<a class="wa-float" href="https://wa.me/<?= e($wa) ?>" target="_blank" rel="noopener" aria-label="Chat WhatsApp"><?= icon('chat') ?></a>

<?php if (!$admin): ?>
<dialog class="login" id="loginDialog">
  <form id="loginForm" method="dialog">
    <h2>Masuk Admin</h2>
    <p>Masuk untuk mengedit konten halaman ini.</p>
    <div class="field"><label for="l-pass">Password</label><input id="l-pass" type="password" autocomplete="current-password" required></div>
    <p class="form-status" id="loginStatus" role="status"></p>
    <div class="dialog-actions">
      <button type="button" class="btn btn-ghost" id="loginCancel">Batal</button>
      <button type="submit" class="btn">Masuk</button>
    </div>
  </form>
</dialog>
<?php endif; ?>

<script src="assets/app.js?v=3"></script>
<?php if ($admin): ?>
<script>
window.EDITOR = {
  csrf: <?= json_encode(csrf_token()) ?>,
  content: <?= json_encode($c, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>,
  icons: <?= json_encode(array_combine(icon_names(), array_map('icon', icon_names()))) ?>,
  defaultPassword: <?= json_encode(password_verify(DEFAULT_PASSWORD, (string)setting('password_hash'))) ?>
};
</script>
<script src="assets/editor.js?v=3"></script>
<?php endif; ?>
</body>
</html>
