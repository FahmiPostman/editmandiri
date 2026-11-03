// Inline editor: loaded only for a logged-in admin.
(function () {
  const E = window.EDITOR;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const body = document.body;

  const LIST_LABELS = {
    'hero.stats': 'Statistik',
    'services.items': 'Layanan',
    'process.items': 'Langkah',
    'pricing.items': 'Paket',
    'testimonials.items': 'Testimoni',
    'faq.items': 'FAQ',
  };
  const ACCENTS = ['#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#16a34a', '#0d9488', '#0891b2', '#0f172a'];

  const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    edit: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    save: svg('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>'),
    inbox: svg('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    out: svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
    prev: svg('<path d="m15 18-6-6 6-6"/>'),
    next: svg('<path d="m9 18 6-6-6-6"/>'),
    copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    trash: svg('<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>'),
    star: svg('<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'),
    shapes: svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><circle cx="17.5" cy="6.5" r="3.5"/><path d="M6.5 14 10 20H3z"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    link: svg('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'),
  };

  const PLAINTEXT = (() => {
    const d = document.createElement('div');
    try { d.contentEditable = 'plaintext-only'; } catch (_) { return false; }
    return d.contentEditable === 'plaintext-only';
  })();

  let editing = false;
  let dirty = false;
  let activeItem = null;

  // ---------- API ----------
  async function api(action, data = {}) {
    const res = await fetch('api.php?action=' + action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': E.csrf },
      body: JSON.stringify(data),
    });
    let json;
    try { json = await res.json(); } catch (_) { throw new Error('Respon server tidak valid.'); }
    if (!json.ok) throw new Error(json.error || 'Gagal.');
    return json;
  }

  // ---------- Toast ----------
  const toastEl = document.createElement('div');
  toastEl.className = 'adm-toast';
  toastEl.setAttribute('role', 'status');
  body.appendChild(toastEl);
  let toastTimer;
  function toast(msg, type = '') {
    toastEl.textContent = msg;
    toastEl.className = 'adm-toast show ' + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  // ---------- Admin bar ----------
  const bar = document.createElement('div');
  bar.className = 'adm adm-bar';
  bar.innerHTML = `
    <button type="button" data-act="toggle" class="adm-toggle">${I.edit}<span>Edit</span></button>
    <button type="button" data-act="save" class="adm-save" disabled>${I.save}<span>Simpan</span><i class="adm-dot"></i></button>
    <button type="button" data-act="messages">${I.inbox}<span>Pesan</span><b class="adm-badge" hidden></b></button>
    <button type="button" data-act="settings">${I.gear}<span>Atur</span></button>
    <button type="button" data-act="logout">${I.out}<span>Keluar</span></button>`;
  body.appendChild(bar);

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    ({ toggle: toggleEditing, save, messages: openMessages, settings: openSettings, logout })[btn.dataset.act]();
  });

  // Contextual toolbar for the selected list item
  const ctx = document.createElement('div');
  ctx.className = 'adm adm-ctx';
  ctx.innerHTML = `
    <span class="adm-ctx-label"></span>
    <div class="adm-ctx-btns">
      <button type="button" data-ctx="prev" title="Pindah ke sebelumnya" aria-label="Pindah ke sebelumnya">${I.prev}</button>
      <button type="button" data-ctx="next" title="Pindah ke berikutnya" aria-label="Pindah ke berikutnya">${I.next}</button>
      <button type="button" data-ctx="icon" title="Ganti ikon" aria-label="Ganti ikon">${I.shapes}</button>
      <button type="button" data-ctx="featured" title="Jadikan unggulan" aria-label="Jadikan unggulan">${I.star}</button>
      <button type="button" data-ctx="copy" title="Duplikat" aria-label="Duplikat">${I.copy}</button>
      <button type="button" data-ctx="delete" class="danger" title="Hapus" aria-label="Hapus">${I.trash}</button>
      <button type="button" data-ctx="close" title="Tutup" aria-label="Tutup">${I.close}</button>
    </div>`;
  body.appendChild(ctx);

  ctx.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-ctx]');
    if (!btn || !activeItem) return;
    const item = activeItem;
    const list = item.parentElement;
    switch (btn.dataset.ctx) {
      case 'prev': {
        const prev = item.previousElementSibling;
        if (prev && prev.hasAttribute('data-item')) { list.insertBefore(item, prev); markDirty(); }
        break;
      }
      case 'next': {
        const next = item.nextElementSibling;
        if (next && next.hasAttribute('data-item')) { list.insertBefore(next, item); markDirty(); }
        break;
      }
      case 'copy': {
        const clone = item.cloneNode(true);
        clone.classList.remove('adm-active');
        item.after(clone);
        setActive(clone);
        markDirty();
        toast('Item diduplikat');
        break;
      }
      case 'delete':
        if (list.querySelectorAll(':scope > [data-item]').length <= 1) { toast('Minimal harus ada 1 item.', 'err'); return; }
        if (!confirm('Hapus item ini?')) return;
        setActive(null);
        item.remove();
        markDirty();
        return;
      case 'featured':
        setFeatured(item, item.dataset.featured !== '1');
        markDirty();
        break;
      case 'icon':
        openIconPicker(item);
        return;
      case 'close':
        setActive(null);
        return;
    }
    updateCtx();
    activeItem && activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  function setActive(item) {
    if (activeItem) activeItem.classList.remove('adm-active');
    activeItem = item;
    if (item) item.classList.add('adm-active');
    updateCtx();
  }

  function updateCtx() {
    const show = editing && activeItem;
    ctx.classList.toggle('show', !!show);
    if (!show) return;
    const list = activeItem.parentElement;
    const items = $$(':scope > [data-item]', list);
    const idx = items.indexOf(activeItem);
    $('.adm-ctx-label', ctx).textContent = `${LIST_LABELS[list.dataset.list] || 'Item'} ${idx + 1}/${items.length}`;
    $('[data-ctx=prev]', ctx).disabled = idx === 0;
    $('[data-ctx=next]', ctx).disabled = idx === items.length - 1;
    $('[data-ctx=icon]', ctx).hidden = !('icon' in activeItem.dataset);
    const fav = $('[data-ctx=featured]', ctx);
    fav.hidden = !('featured' in activeItem.dataset);
    fav.classList.toggle('on', activeItem.dataset.featured === '1');
  }

  function setFeatured(item, on) {
    item.dataset.featured = on ? '1' : '0';
    item.classList.toggle('featured', on);
    const cta = $('.btn', item);
    if (cta) cta.classList.toggle('btn-ghost', !on);
  }

  // ---------- Edit mode ----------
  function editables() {
    return $$('[data-edit], [data-field]');
  }
  function listEditables() {
    return $$('[data-edit-list], [data-field-list]');
  }

  function toggleEditing() {
    editing = !editing;
    body.classList.toggle('editing', editing);
    const btn = $('[data-act=toggle]', bar);
    btn.innerHTML = editing ? `${I.eye}<span>Pratinjau</span>` : `${I.edit}<span>Edit</span>`;
    btn.classList.toggle('on', editing);

    editables().forEach((el) => {
      if (editing) {
        el.contentEditable = PLAINTEXT ? 'plaintext-only' : 'true';
        el.spellcheck = false;
      } else {
        el.removeAttribute('contenteditable');
      }
    });
    listEditables().forEach((el) => {
      if (editing) el.contentEditable = 'true';
      else el.removeAttribute('contenteditable');
    });

    $$('.faq-item').forEach((d) => { d.open = editing ? true : d.open; });
    $$('[data-list]').forEach((list) => {
      if (editing) {
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'adm adm-add';
        add.innerHTML = `${I.plus}<span>Tambah ${LIST_LABELS[list.dataset.list] || 'item'}</span>`;
        add.addEventListener('click', () => addItem(list));
        list.after(add);
      }
    });
    $$('[data-link], [data-link-field]').forEach((a) => {
      if (!editing) return;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'adm adm-link-chip';
      chip.title = 'Atur link tombol';
      chip.setAttribute('aria-label', 'Atur link tombol');
      chip.innerHTML = I.link;
      a.appendChild(chip);
    });
    if (!editing) {
      $$('.adm-add, .adm-link-chip').forEach((b) => b.remove());
      setActive(null);
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    } else if (!sessionStorageGet('hinted')) {
      toast('Ketuk teks mana pun untuk mengubahnya.');
      sessionStorageSet('hinted', '1');
    }
    updateCtx();
  }

  function addItem(list) {
    const items = $$(':scope > [data-item]', list);
    const tpl = items[items.length - 1];
    const clone = tpl.cloneNode(true);
    clone.classList.remove('adm-active');
    $$('[data-field]', clone).forEach((f) => { f.textContent = ''; });
    $$('[data-field-list]', clone).forEach((f) => { f.innerHTML = '<li>Poin baru</li>'; });
    if ('featured' in clone.dataset) setFeatured(clone, false);
    if (clone.tagName === 'DETAILS') clone.open = true;
    const avatar = $('.avatar', clone);
    if (avatar) avatar.textContent = '?';
    list.appendChild(clone);
    setActive(clone);
    markDirty();
    clone.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const first = $('[data-field]', clone);
    if (first) setTimeout(() => first.focus(), 300);
  }

  function isEditable(el) {
    return el && el.isContentEditable && !el.closest('.adm');
  }
  function isMultiline(el) {
    return el.hasAttribute('data-multiline') || el.hasAttribute('data-edit-list') || el.hasAttribute('data-field-list');
  }
  function editRoot(el) {
    return el.closest('[data-edit], [data-field], [data-edit-list], [data-field-list]');
  }

  // Block navigation & toggles while editing
  document.addEventListener('click', (e) => {
    if (!editing) return;
    const chip = e.target.closest('.adm-link-chip');
    if (chip) {
      e.preventDefault();
      const item = chip.closest('[data-item]');
      if (item) setActive(item);
      openLinkEditor(chip.parentElement);
      return;
    }
    if (e.target.closest('.adm, dialog')) return;
    if (e.target.closest('a, summary')) e.preventDefault();
    if (e.target.closest('#contactForm button[type=submit]')) e.preventDefault();

    const slot = e.target.closest('[data-icon-slot]');
    if (slot) { openIconPicker(slot.closest('[data-item]')); }

    const item = e.target.closest('[data-item]');
    if (item) setActive(item);
    else if (!e.target.closest('.adm-add')) setActive(null);
  });

  document.addEventListener('focusin', (e) => {
    if (!editing) return;
    const item = e.target.closest && e.target.closest('[data-item]');
    if (item && item !== activeItem) setActive(item);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (dirty) save();
      return;
    }
    if (!editing || !isEditable(e.target)) return;
    const root = editRoot(e.target);
    if (e.key === 'Enter' && root && !isMultiline(root)) {
      e.preventDefault();
      root.blur();
    }
    if (e.key === 'Escape') e.target.blur();
    // Space inside <summary> would toggle the <details> in some browsers.
    if (e.key === ' ' && e.target.closest('summary')) {
      e.preventDefault();
      document.execCommand('insertText', false, ' ');
    }
  });

  document.addEventListener('paste', (e) => {
    if (!editing || !isEditable(e.target)) return;
    e.preventDefault();
    const root = editRoot(e.target);
    let text = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (root && !isMultiline(root)) text = text.replace(/\s*\n\s*/g, ' ');
    document.execCommand('insertText', false, text);
  });

  document.addEventListener('input', (e) => {
    if (!editing || !isEditable(e.target)) return;
    markDirty();
    const root = editRoot(e.target);
    if (!root) return;
    // Keep duplicates (e.g. brand name in header & footer) in sync.
    if (root.dataset.edit) {
      $$(`[data-edit="${root.dataset.edit}"]`).forEach((el) => { if (el !== root) el.textContent = root.textContent; });
    }
    const avatar = root.dataset.field === 'name' && root.closest('[data-item]').querySelector('.avatar');
    if (avatar) avatar.textContent = (root.textContent.trim()[0] || '?').toUpperCase();
  });

  // ---------- Dirty state ----------
  function markDirty() {
    dirty = true;
    const btn = $('[data-act=save]', bar);
    btn.disabled = false;
    btn.classList.add('dirty');
  }
  function clearDirty() {
    dirty = false;
    const btn = $('[data-act=save]', bar);
    btn.disabled = true;
    btn.classList.remove('dirty');
  }
  window.addEventListener('beforeunload', (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  // ---------- Collect & save ----------
  function setPath(obj, path, value) {
    const keys = path.split('.');
    let o = obj;
    keys.slice(0, -1).forEach((k) => { if (typeof o[k] !== 'object' || o[k] === null) o[k] = {}; o = o[k]; });
    o[keys[keys.length - 1]] = value;
  }
  function readText(el) {
    return el.hasAttribute('data-multiline')
      ? el.innerText.replace(/\n{3,}/g, '\n\n').trim()
      : el.textContent.replace(/\s+/g, ' ').trim();
  }
  function readLines(el) {
    return el.innerText.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  function collect() {
    const out = JSON.parse(JSON.stringify(E.content));
    $$('[data-edit]').forEach((el) => setPath(out, el.dataset.edit, readText(el)));
    $$('[data-edit-list]').forEach((el) => setPath(out, el.dataset.editList, readLines(el)));
    $$('[data-list]').forEach((list) => {
      const items = $$(':scope > [data-item]', list).map((item) => {
        const o = {};
        $$('[data-field]', item).forEach((f) => { o[f.dataset.field] = readText(f); });
        $$('[data-field-list]', item).forEach((f) => { o[f.dataset.fieldList] = readLines(f); });
        if ('icon' in item.dataset) o.icon = item.dataset.icon;
        if ('featured' in item.dataset) o.featured = item.dataset.featured === '1';
        $$('[data-link-field]', item).forEach((a) => { o[a.dataset.linkField] = a.dataset.linkValue || ''; });
        return o;
      });
      setPath(out, list.dataset.list, items);
    });
    $$('[data-link]').forEach((a) => setPath(out, a.dataset.link, a.dataset.linkValue || ''));
    $$('[data-setting]').forEach((input) => setPath(out, input.dataset.setting, input.value.trim()));
    return out;
  }

  async function save() {
    const btn = $('[data-act=save]', bar);
    btn.disabled = true;
    btn.classList.add('busy');
    try {
      const content = collect();
      await api('save', { content });
      E.content = content;
      clearDirty();
      toast('Perubahan tersimpan ✓', 'ok');
    } catch (err) {
      btn.disabled = false;
      toast(err.message, 'err');
    } finally {
      btn.classList.remove('busy');
    }
  }

  async function logout() {
    if (dirty && !confirm('Ada perubahan yang belum disimpan. Tetap keluar?')) return;
    dirty = false;
    try { await api('logout'); } catch (_) { /* session may already be gone */ }
    location.href = location.pathname;
  }

  // ---------- Sheets (bottom sheet on mobile, drawer on desktop) ----------
  function sheet(title, html) {
    const d = document.createElement('dialog');
    d.className = 'adm adm-sheet';
    d.innerHTML = `
      <div class="adm-sheet-head"><span class="adm-grip"></span><h2>${title}</h2>
        <button type="button" class="adm-icon-btn" data-close aria-label="Tutup">${I.close}</button></div>
      <div class="adm-sheet-body">${html}</div>`;
    body.appendChild(d);
    d.addEventListener('click', (e) => {
      if (e.target === d || e.target.closest('[data-close]')) d.close();
    });
    d.addEventListener('close', () => d.remove());
    d.showModal();
    return d;
  }

  // Settings sheet
  const settingsHTML = () => {
    const current = collect();
    const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    return `
      <section class="adm-group">
        <h3>Umum</h3>
        <label class="adm-field"><span>Judul halaman (SEO)</span><input data-s="meta.title" value="${esc(current.meta.title)}" maxlength="120"></label>
        <label class="adm-field"><span>Deskripsi (SEO)</span><textarea data-s="meta.description" rows="3" maxlength="300">${esc(current.meta.description)}</textarea></label>
        <label class="adm-field"><span>Nomor WhatsApp <small>format 628xxx</small></span><input data-s="contact.whatsapp" value="${esc(current.contact.whatsapp)}" inputmode="numeric"></label>
      </section>
      <section class="adm-group">
        <h3>Warna aksen</h3>
        <div class="adm-swatches">
          ${ACCENTS.map((a) => `<button type="button" class="adm-swatch${a === current.meta.accent ? ' on' : ''}" style="--c:${a}" data-color="${a}" aria-label="${a}"></button>`).join('')}
          <label class="adm-swatch adm-swatch-custom" title="Warna lain"><input type="color" data-s="meta.accent" value="${esc(current.meta.accent)}" aria-label="Pilih warna lain"></label>
        </div>
      </section>
      <section class="adm-group">
        <h3>Ganti password</h3>
        <form class="adm-pass">
          <label class="adm-field"><span>Password lama</span><input type="password" name="current" autocomplete="current-password" required></label>
          <label class="adm-field"><span>Password baru</span><input type="password" name="new" autocomplete="new-password" minlength="6" required></label>
          <button class="adm-btn" type="submit">Ubah password</button>
        </form>
      </section>
      <section class="adm-group">
        <h3>Zona berbahaya</h3>
        <button type="button" class="adm-btn danger" data-reset>Kembalikan semua konten ke awal</button>
      </section>`;
  };

  function openSettings() {
    const d = sheet('Pengaturan', settingsHTML());
    const applySetting = (input) => {
      let hidden = $(`[data-setting="${input.dataset.s}"]`);
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.dataset.setting = input.dataset.s;
        body.appendChild(hidden);
      }
      hidden.value = input.value;
      if (input.dataset.s === 'meta.accent') {
        document.documentElement.style.setProperty('--accent', input.value);
        $$('.adm-swatch', d).forEach((s) => s.classList.toggle('on', s.dataset.color === input.value));
      }
      if (input.dataset.s === 'meta.title') document.title = input.value;
      markDirty();
    };
    $$('[data-s]', d).forEach((input) => input.addEventListener('input', () => applySetting(input)));
    $$('[data-color]', d).forEach((sw) => sw.addEventListener('click', () => {
      const input = $('[data-s="meta.accent"]', d);
      input.value = sw.dataset.color;
      applySetting(input);
    }));
    $('.adm-pass', d).addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      try {
        await api('password', { current: f.current.value, new: f.new.value });
        f.reset();
        E.defaultPassword = false;
        toast('Password berhasil diubah', 'ok');
      } catch (err) { toast(err.message, 'err'); }
    });
    $('[data-reset]', d).addEventListener('click', async () => {
      if (!confirm('Semua teks akan kembali ke isi awal. Lanjutkan?')) return;
      try {
        await api('reset');
        dirty = false;
        location.reload();
      } catch (err) { toast(err.message, 'err'); }
    });
  }

  // Messages sheet
  async function loadMessages() {
    const { messages } = await api('messages');
    const unread = messages.filter((m) => !+m.is_read).length;
    const badge = $('.adm-badge', bar);
    badge.hidden = !unread;
    badge.textContent = unread > 99 ? '99+' : unread;
    return messages;
  }

  function messageCard(m) {
    const el = document.createElement('article');
    el.className = 'adm-msg' + (+m.is_read ? '' : ' unread');
    const date = new Date(m.created_at.replace(' ', 'T') + 'Z');
    const wa = (m.phone || '').replace(/\D/g, '').replace(/^0/, '62');
    el.innerHTML = `
      <header><strong></strong><time></time></header>
      <div class="adm-msg-meta"><a class="m-email"></a>${m.phone ? '<a class="m-phone" target="_blank" rel="noopener"></a>' : ''}</div>
      <p></p>
      <div class="adm-msg-actions">
        ${+m.is_read ? '' : '<button type="button" class="adm-btn sm" data-read>Tandai dibaca</button>'}
        <button type="button" class="adm-btn sm danger" data-del>Hapus</button>
      </div>`;
    $('strong', el).textContent = m.name;
    $('time', el).textContent = isNaN(date) ? m.created_at : date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    const email = $('.m-email', el);
    if (m.email) { email.textContent = m.email; email.href = 'mailto:' + m.email; } else email.remove();
    const phone = $('.m-phone', el);
    if (phone) { phone.textContent = m.phone; phone.href = 'https://wa.me/' + wa; }
    $('p', el).textContent = m.message;
    const read = $('[data-read]', el);
    if (read) read.addEventListener('click', async () => {
      try { await api('message_read', { id: m.id }); el.classList.remove('unread'); read.remove(); loadMessages(); } catch (err) { toast(err.message, 'err'); }
    });
    $('[data-del]', el).addEventListener('click', async () => {
      if (!confirm('Hapus pesan ini?')) return;
      try { await api('message_delete', { id: m.id }); el.remove(); loadMessages(); } catch (err) { toast(err.message, 'err'); }
    });
    return el;
  }

  async function openMessages() {
    const d = sheet('Pesan Masuk', '<div class="adm-msgs"><p class="adm-empty">Memuat…</p></div>');
    const wrap = $('.adm-msgs', d);
    try {
      const messages = await loadMessages();
      wrap.innerHTML = messages.length ? '' : '<p class="adm-empty">Belum ada pesan dari form kontak.</p>';
      messages.forEach((m) => wrap.appendChild(messageCard(m)));
    } catch (err) {
      wrap.innerHTML = '';
      toast(err.message, 'err');
    }
  }

  // Icon picker
  function openIconPicker(item) {
    if (!item) return;
    const d = sheet('Pilih Ikon', `<div class="adm-icons">${Object.entries(E.icons).map(([name, s]) =>
      `<button type="button" class="adm-icon-pick${name === item.dataset.icon ? ' on' : ''}" data-icon-name="${name}" aria-label="${name}">${s}</button>`).join('')}</div>`);
    $$('[data-icon-name]', d).forEach((b) => b.addEventListener('click', () => {
      item.dataset.icon = b.dataset.iconName;
      $('[data-icon-slot]', item).innerHTML = E.icons[b.dataset.iconName];
      markDirty();
      d.close();
    }));
  }

  // Button link editor. Mirrors link_href() in lib.php.
  function whatsappNumber() {
    const input = $('[data-setting="contact.whatsapp"]');
    return (input ? input.value : E.content.contact.whatsapp).replace(/\D/g, '');
  }
  function resolveLink(link) {
    if (link.startsWith('wa:')) {
      const text = link.slice(3).trim();
      return 'https://wa.me/' + whatsappNumber() + (text ? '?text=' + encodeURIComponent(text) : '');
    }
    if (/^#[\w-]*$/.test(link) || /^(https?:\/\/|tel:|mailto:)/i.test(link)) return link;
    return '#contact';
  }
  function applyLink(a, link) {
    a.dataset.linkValue = link;
    const href = resolveLink(link);
    a.setAttribute('href', href);
    if (/^https?:/i.test(href)) { a.target = '_blank'; a.rel = 'noopener'; } else { a.removeAttribute('target'); a.removeAttribute('rel'); }
  }
  function normalizeUrl(v) {
    v = v.trim();
    if (!v) return '';
    if (/^(https?:\/\/|tel:|mailto:)/i.test(v)) return v;
    if (/^[\d\s+()-]{6,}$/.test(v)) return 'tel:' + v.replace(/[^\d+]/g, '');
    if (/^\S+@\S+\.\S+$/.test(v)) return 'mailto:' + v;
    if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(v)) return 'https://' + v;
    return null;
  }

  function openLinkEditor(a) {
    const current = a.dataset.linkValue || '';
    const type = current.startsWith('wa:') ? 'wa' : current.startsWith('#') ? 'section' : 'url';
    const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    const sections = [['#top', 'Paling atas']].concat($$('main section[id]').map((s) => {
      const label = s.querySelector('.eyebrow');
      return ['#' + s.id, label ? label.textContent.trim() : s.id];
    }));
    const label = (a.querySelector('[data-edit], [data-field]') || a).textContent.trim();
    const d = sheet('Link Tombol', `
      <p class="adm-link-for">Tombol: <strong>${esc(label)}</strong></p>
      <div class="adm-seg" role="tablist">
        <button type="button" data-type="wa">WhatsApp</button>
        <button type="button" data-type="section">Bagian halaman</button>
        <button type="button" data-type="url">URL / lainnya</button>
      </div>
      <div class="adm-pane" data-pane="wa">
        <label class="adm-field"><span>Pesan otomatis</span>
          <textarea rows="3" data-wa placeholder="Halo, saya ingin bertanya…">${esc(type === 'wa' ? current.slice(3) : '')}</textarea></label>
        <p class="adm-hint">Dikirim ke nomor <strong>${esc(whatsappNumber() || '(belum diisi)')}</strong>. Nomor bisa diubah di menu Atur.</p>
      </div>
      <div class="adm-pane" data-pane="section">
        <label class="adm-field"><span>Pindah ke bagian</span>
          <select data-section>${sections.map(([id, name]) => `<option value="${id}"${id === current ? ' selected' : ''}>${esc(name)}</option>`).join('')}</select></label>
      </div>
      <div class="adm-pane" data-pane="url">
        <label class="adm-field"><span>Alamat tujuan</span>
          <input data-url inputmode="url" autocapitalize="off" autocomplete="off" placeholder="https://… , 0812…, atau email" value="${esc(type === 'url' ? current : '')}"></label>
        <p class="adm-hint">Bisa link website, nomor telepon, atau alamat email.</p>
      </div>
      <p class="adm-link-preview"></p>
      <button type="button" class="adm-btn" data-apply>Terapkan</button>`);

    let mode = type;
    const preview = $('.adm-link-preview', d);
    const value = () => {
      if (mode === 'wa') return 'wa:' + $('[data-wa]', d).value.trim();
      if (mode === 'section') return $('[data-section]', d).value;
      return normalizeUrl($('[data-url]', d).value);
    };
    const refresh = () => {
      $$('.adm-seg button', d).forEach((b) => b.classList.toggle('on', b.dataset.type === mode));
      $$('.adm-pane', d).forEach((p) => { p.hidden = p.dataset.pane !== mode; });
      const v = value();
      preview.textContent = v ? 'Tujuan: ' + resolveLink(v) : v === null ? 'Alamat belum valid.' : '';
      preview.classList.toggle('err', v === null);
    };
    $$('.adm-seg button', d).forEach((b) => b.addEventListener('click', () => { mode = b.dataset.type; refresh(); }));
    $$('textarea, select, input', d).forEach((el) => el.addEventListener('input', refresh));
    $('[data-apply]', d).addEventListener('click', () => {
      const v = value();
      if (!v) { toast('Isi alamat tujuan yang valid.', 'err'); return; }
      applyLink(a, v);
      markDirty();
      d.close();
      toast('Link tombol diperbarui. Jangan lupa Simpan.');
    });
    refresh();
  }

  // ---------- Helpers ----------
  function sessionStorageGet(k) { try { return sessionStorage.getItem('adm-' + k); } catch (_) { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem('adm-' + k, v); } catch (_) { /* ignore */ } }

  // ---------- Init ----------
  loadMessages().catch(() => {});
  if (E.defaultPassword) setTimeout(() => toast('Anda masih memakai password default. Ganti di menu Atur.', 'err'), 600);
})();
