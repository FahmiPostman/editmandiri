// Public behaviour: mobile nav, header shadow, reveal on scroll, contact form, admin login.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Mobile nav
  const toggle = $('#navToggle');
  const setNav = (open) => {
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => {
    if (!document.body.classList.contains('editing')) setNav(false);
  }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  // Header border once scrolled
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  if ('IntersectionObserver' in window && !document.body.classList.contains('is-admin')) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('.section-head, .card, .step, .faq-item, .about-grid > *').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }

  // Contact form → saved to SQLite as a backup, then opened in WhatsApp
  const form = $('#contactForm');
  const status = $('#formStatus');
  const waMessage = (d) => {
    const brand = ($('.brand [data-edit="brand.name"]') || {}).textContent || '';
    const lines = [`Halo ${brand.trim()}, saya ingin konsultasi.`, '', `Nama: ${d.name}`];
    if (d.email) lines.push(`Email: ${d.email}`);
    if (d.phone) lines.push(`No. WhatsApp: ${d.phone}`);
    lines.push('', 'Pesan:', d.message);
    return lines.join('\n');
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (document.body.classList.contains('editing')) return;
    const data = Object.fromEntries(new FormData(form));
    ['name', 'email', 'phone', 'message'].forEach((k) => { data[k] = (data[k] || '').trim(); });
    if (!data.name || !data.message) {
      status.className = 'form-status err';
      status.textContent = 'Mohon isi nama dan pesan.';
      return;
    }
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      status.className = 'form-status err';
      status.textContent = 'Format email belum benar.';
      return;
    }
    const waUrl = 'https://wa.me/' + form.dataset.wa + '?text=' + encodeURIComponent(waMessage(data));
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    status.className = 'form-status';
    status.textContent = 'Membuka WhatsApp…';
    try {
      await fetch('api.php?action=contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } catch (_) {
      // Saving the backup copy failed; WhatsApp is still the main channel.
    }
    form.reset();
    btn.disabled = false;
    status.className = 'form-status ok-msg';
    status.innerHTML = 'Tekan <strong>kirim</strong> di WhatsApp untuk menyelesaikan. WhatsApp tidak terbuka? <a href="' + waUrl.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener">Klik di sini</a>.';
    location.href = waUrl;
  });

  // Admin login
  const dialog = $('#loginDialog');
  if (dialog) {
    const open = () => { dialog.showModal(); setTimeout(() => $('#l-pass').focus(), 50); };
    $('#adminLink').addEventListener('click', (e) => { e.preventDefault(); open(); });
    $('#loginCancel').addEventListener('click', () => dialog.close());
    if (new URLSearchParams(location.search).has('login')) open();
    $('#loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const st = $('#loginStatus');
      st.className = 'form-status';
      st.textContent = 'Memeriksa…';
      try {
        const res = await fetch('api.php?action=login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('#l-pass').value }) });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error);
        location.href = location.pathname;
      } catch (err) {
        st.className = 'form-status err';
        st.textContent = err.message || 'Gagal masuk.';
      }
    });
  }
})();
