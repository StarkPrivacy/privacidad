const PrivStore = (() => {
  const SOCIAL_DEFS = [
    { id: 'youtube', label: 'YouTube', icon: 'fa-brands fa-youtube', placeholder: 'https://youtube.com/...' },
    { id: 'telegram', label: 'Telegram', icon: 'fa-brands fa-telegram', placeholder: 'https://t.me/...' },
    { id: 'x', label: 'X / Twitter', icon: 'fa-brands fa-x-twitter', placeholder: 'https://x.com/...' },
    { id: 'instagram', label: 'Instagram', icon: 'fa-brands fa-instagram', placeholder: 'https://instagram.com/...' },
    { id: 'discord', label: 'Discord', icon: 'fa-brands fa-discord', placeholder: 'https://discord.gg/...' },
    { id: 'github', label: 'GitHub', icon: 'fa-brands fa-github', placeholder: 'https://github.com/...' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'fa-brands fa-linkedin', placeholder: 'https://linkedin.com/in/...' },
    { id: 'email', label: 'Email', icon: 'fa-solid fa-envelope', placeholder: 'mailto:...' },
  ];
  const DOMAINS = ['privacidad.me', 'privtr.ee', 'privtree.com'];
  const PRESET_COLORS = [
    { id: 'blue', label: 'Azul', bg: '#2563eb', fg: '#fff' },
    { id: 'red', label: 'Rojo', bg: '#dc2626', fg: '#fff' },
    { id: 'black', label: 'Negro', bg: '#0a0a0a', fg: '#fff' },
    { id: 'sky', label: 'Cielo', bg: '#38bdf8', fg: '#0a0a0a' },
    { id: 'neon', label: 'Neon', bg: '#0a84ff', fg: '#05070a' },
    { id: 'green', label: 'Verde', bg: '#16a34a', fg: '#fff' },
    { id: 'violet', label: 'Violeta', bg: '#7c3aed', fg: '#fff' },
    { id: 'outline', label: 'Contorno', bg: 'transparent', fg: '#c5d0e0', border: 'rgba(255,255,255,0.15)' },
  ];
  const BRANDS = [
    { id: 'custom', label: 'Personalizado', icon: 'fa-solid fa-link', color: 'blue' },
    { id: 'website', label: 'Web', icon: 'fa-solid fa-globe', color: 'blue' },
    { id: 'newsletter', label: 'Newsletter', icon: 'fa-solid fa-newspaper', color: 'red' },
    { id: 'podcast', label: 'Podcast', icon: 'fa-solid fa-podcast', color: 'black' },
    { id: 'youtube', label: 'YouTube', icon: 'fa-brands fa-youtube', color: 'red' },
    { id: 'telegram', label: 'Telegram', icon: 'fa-brands fa-telegram', color: 'sky' },
  ];
  function emptySocial() { const o = {}; SOCIAL_DEFS.forEach(s => { o[s.id] = ''; }); return o; }
  function emptyContact() {
    return { enabled: false, title: '', note: '', email: '', phone: '', web: '', org: '', showQr: true };
  }
  function defaultPage(username) {
    return {
      name: username || 'Usuario',
      username: (username || 'user').toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      bio: '', avatar: '', bgImage: '',
      shape: 'rounded', btnStyle: 'outline', btnSize: 'md', btnGlow: false,
      verified: false, sameTab: false,
      social: emptySocial(), links: [], contact: emptyContact(),
      ogTitle: '', ogDesc: '', updatedAt: Date.now(),
    };
  }
  function starkDemo() {
    const p = defaultPage('stark');
    p.name = 'Stark Privacy';
    p.bio = 'Sin privacidad tu libertad es solo una ilusión';
    p.avatar = 'https://pbs.twimg.com/profile_images/1691362458655440896/jaacLom0.jpg';
    p.verified = true; p.shape = 'rounded'; p.btnStyle = 'solid';
    p.social.youtube = 'https://youtube.com/@StarkPrivacy';
    p.social.telegram = 'https://t.me/StarkPrivacy';
    p.social.x = 'https://x.com/StarkPrivacy';
    p.social.instagram = 'https://instagram.com/StarkPrivacy';
    p.contact = {
      enabled: true, title: 'Fundador · Boring Privacy',
      note: 'Privacidad, seguridad y soberanía digital',
      email: 'stark@boringprivacy.io', phone: '', web: 'https://boringprivacy.io',
      org: 'Boring Privacy', showQr: true,
    };
    p.links = [
      { id: 1, type: 'link', title: 'Academia Boring Privacy', url: 'https://boringprivacy.io', color: 'blue', icon: 'fa-solid fa-globe', brand: 'website' },
      { id: 2, type: 'link', title: 'Suscríbete al Newsletter', url: 'https://boringprivacy.io/#newsletter', color: 'red', icon: 'fa-solid fa-newspaper', brand: 'newsletter' },
      { id: 3, type: 'link', title: 'Podcasts', url: 'https://privtr.ee/@starkpodcasts', color: 'black', icon: 'fa-solid fa-podcast', brand: 'podcast' },
      { id: 4, type: 'heading', title: 'Servicios recomendados', url: '', color: '', icon: '', brand: '' },
      { id: 5, type: 'link', title: 'Proton VPN | 70% Descuento', url: 'https://go.getproton.me/SH1Ou', color: 'violet', icon: 'fa-solid fa-shield-halved', brand: 'custom' },
    ];
    return p;
  }
  function sanitizeUsername(u) {
    return String(u || '').replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);
  }
  function load(username) {
    const u = sanitizeUsername(username);
    if (u) { try { const raw = localStorage.getItem('priv_page_' + u); if (raw) return normalize(JSON.parse(raw)); } catch (e) {} }
    try { const raw = localStorage.getItem('priv_page'); if (raw) { const d = normalize(JSON.parse(raw)); if (!u || d.username === u) return d; } } catch (e) {}
    return null;
  }
  function normalize(d) {
    const base = defaultPage(d.username || 'user');
    return {
      ...base, ...d,
      username: sanitizeUsername(d.username || base.username),
      social: { ...emptySocial(), ...(d.social || {}) },
      contact: { ...emptyContact(), ...(d.contact || {}) },
      links: Array.isArray(d.links) ? d.links.map((l, i) => ({
        id: l.id != null ? l.id : i + 1, title: l.title || '', url: l.url || '', type: l.type || 'link',
        color: l.color || '', icon: l.icon || '', brand: l.brand || '',
      })) : [],
      btnStyle: d.btnStyle || 'outline', btnSize: d.btnSize || 'md',
      btnGlow: !!d.btnGlow, verified: !!d.verified, sameTab: !!d.sameTab, bgImage: d.bgImage || '',
    };
  }
  function save(page) {
    const d = normalize({ ...page, updatedAt: Date.now() });
    d.username = sanitizeUsername(d.username);
    try { localStorage.setItem('priv_page', JSON.stringify(d)); localStorage.setItem('priv_page_' + d.username, JSON.stringify(d)); }
    catch (e) { throw e; }
    return d;
  }
  function shapeClass(shape) { if (shape === 'pill') return 'rounded-full'; if (shape === 'square') return 'rounded-md'; return 'rounded-xl'; }
  function sizeClass(size) { if (size === 'sm') return 'py-2 px-3 text-xs'; if (size === 'lg') return 'py-4 px-5 text-base'; return 'py-3.5 px-4 text-sm'; }
  function colorStyle(colorId, d, compact) {
    const preset = PRESET_COLORS.find(c => c.id === colorId);
    const sc = shapeClass(d.shape); const sz = compact ? 'py-2.5 px-3 text-xs' : sizeClass(d.btnSize);
    const glow = d.btnGlow ? 'box-shadow:0 0 16px rgba(10,132,255,0.25);' : '';
    if (preset) {
      const border = preset.border ? 'border:1px solid ' + preset.border + ';' : 'border:none;';
      return { className: 'link-btn flex items-center justify-center gap-2 w-full ' + sz + ' ' + sc + ' font-medium mb-2.5',
        style: 'background:' + preset.bg + ';color:' + preset.fg + ';' + border + glow };
    }
    let fill = 'background:#0b0f14;color:#c5d0e0;border:1px solid rgba(255,255,255,0.1);';
    if (d.btnStyle === 'solid') fill = 'background:#0a84ff;color:#05070a;border:none;';
    if (d.btnStyle === 'soft') fill = 'background:rgba(10,132,255,0.15);color:#0a84ff;border:1px solid rgba(10,132,255,0.3);';
    if (d.btnStyle === 'ghost') fill = 'background:transparent;color:#c5d0e0;border:1px solid rgba(255,255,255,0.2);';
    return { className: 'link-btn flex items-center justify-center gap-2 w-full ' + sz + ' ' + sc + ' font-medium mb-2.5', style: fill + glow };
  }
  function esc(s) { return String(s || '').replace(/&/g, '&').replace(/</g, '<').replace(/"/g, '"'); }
  function contactToVcard(page) {
    const c = page.contact || emptyContact();
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + (page.name || ''), 'N:;' + (page.name || '') + ';;;'];
    if (c.org) lines.push('ORG:' + c.org);
    if (c.title) lines.push('TITLE:' + c.title);
    if (c.email) lines.push('EMAIL;TYPE=INTERNET:' + c.email);
    if (c.phone) lines.push('TEL;TYPE=CELL:' + c.phone);
    if (c.web) lines.push('URL:' + c.web);
    if (c.note) lines.push('NOTE:' + c.note);
    lines.push('END:VCARD');
    return lines.join('\r\n');
  }
  function vcardHref(page) { return 'data:text/vcard;charset=utf-8,' + encodeURIComponent(contactToVcard(page)); }
  function readImageFile(file, maxSide, maxBytes) {
    maxSide = maxSide || 1600; maxBytes = maxBytes || 450000;
    return new Promise(function (resolve, reject) {
      if (!file || !file.type.match(/^image\//)) { reject(new Error('Elige una imagen')); return; }
      const reader = new FileReader();
      reader.onload = function () {
        const img = new Image();
        img.onload = function () {
          let w = img.width, h = img.height;
          if (w > maxSide || h > maxSide) {
            if (w > h) { h = Math.round(h * maxSide / w); w = maxSide; }
            else { w = Math.round(w * maxSide / h); h = maxSide; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          let q = 0.85, data = canvas.toDataURL('image/jpeg', q);
          while (data.length > maxBytes && q > 0.4) { q -= 0.1; data = canvas.toDataURL('image/jpeg', q); }
          if (data.length > maxBytes * 1.5) { reject(new Error('Imagen demasiado grande')); return; }
          resolve(data);
        };
        img.onerror = function () { reject(new Error('No se pudo leer la imagen')); };
        img.src = reader.result;
      };
      reader.onerror = function () { reject(new Error('Error al leer')); };
      reader.readAsDataURL(file);
    });
  }
  function renderContactCard(d, compact) {
    const c = d.contact || emptyContact();
    if (!c.enabled) return '';
    const rows = [];
    if (c.email) rows.push('<a href="mailto:' + esc(c.email) + '" class="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-left hover:border-neon/40"><i class="fa-solid fa-envelope text-neon w-5 text-center"></i><span class="text-sm text-mist truncate">' + esc(c.email) + '</span></a>');
    if (c.phone) rows.push('<a href="tel:' + esc(c.phone) + '" class="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-left hover:border-neon/40"><i class="fa-solid fa-phone text-neon w-5 text-center"></i><span class="text-sm text-mist">' + esc(c.phone) + '</span></a>');
    if (c.web) rows.push('<a href="' + esc(c.web) + '" target="_blank" rel="noopener" class="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-left hover:border-neon/40"><i class="fa-solid fa-link text-neon w-5 text-center"></i><span class="text-sm text-mist truncate">' + esc(String(c.web).replace(/^https?:\/\//, '')) + '</span></a>');
    const saveBtn = '<a href="' + vcardHref(d) + '" download="' + esc(d.username || 'contacto') + '.vcf" class="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-neon text-void font-semibold text-sm"><i class="fa-solid fa-address-card"></i> Guardar contacto</a>';
    return '<div class="mt-5 mb-2 rounded-2xl border border-white/10 bg-panel/80 p-4 text-left">' +
      '<div class="text-[10px] uppercase tracking-wider text-neon/80 mb-2">Identidad</div>' +
      (c.title ? '<p class="text-sm text-white font-medium mb-1">' + esc(c.title) + '</p>' : '') +
      (c.org ? '<p class="text-xs text-steel mb-2">' + esc(c.org) + '</p>' : '') +
      (c.note ? '<p class="text-xs text-steel/80 mb-3">' + esc(c.note) + '</p>' : '') +
      '<div class="space-y-2">' + rows.join('') + '</div>' + (compact ? '' : saveBtn) + '</div>';
  }
  function renderProfile(page, container, opts) {
    opts = opts || {};
    const d = normalize(page);
    const compact = !!opts.compact;
    const avSize = compact ? 'w-16 h-16' : 'w-24 h-24';
    const nameClass = compact ? 'text-base' : 'text-2xl';
    const socialSize = compact ? 'w-9 h-9 text-sm' : 'w-10 h-10 text-base';
    const target = d.sameTab ? '_self' : '_blank';
    const active = SOCIAL_DEFS.filter(s => d.social[s.id] && String(d.social[s.id]).trim());
    const socialHtml = active.length
      ? '<div class="flex flex-wrap justify-center gap-2.5 mb-4">' +
        active.map(function (s) {
          return '<a href="' + esc(d.social[s.id]) + '" target="' + target + '" rel="noopener" class="social-btn ' + socialSize + ' rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white"><i class="' + s.icon + '"></i></a>';
        }).join('') + '</div>' : '';
    const linksHtml = (d.links || []).filter(function (l) { return l.title || l.url || l.type === 'spacer'; }).map(function (l) {
      if (l.type === 'heading') return '<h2 class="text-center text-sm font-medium text-steel/80 mt-5 mb-3">' + esc(l.title) + '</h2>';
      if (l.type === 'spacer') return '<div class="h-3"></div>';
      if (l.type === 'text') {
        const inner = l.url ? '<a href="' + esc(l.url) + '" target="' + target + '" class="text-neon">' + esc(l.title) + '</a>' : esc(l.title);
        return '<p class="text-center text-xs text-steel mb-3">' + inner + '</p>';
      }
      var href = l.url || '#';
      var cs = colorStyle(l.color, d, compact);
      var iconHtml = l.icon ? '<i class="' + esc(l.icon) + '"></i>' : '';
      return '<a href="' + esc(href) + '" target="' + target + '" rel="noopener" class="' + cs.className + '" style="' + cs.style + '">' + iconHtml + '<span>' + (esc(l.title) || 'Enlace') + '</span></a>';
    }).join('');
    const badge = d.verified ? '<span class="inline-flex w-5 h-5 rounded-full bg-[#0a84ff] text-white text-[10px] ml-1.5 align-middle items-center justify-center"><i class="fa-solid fa-check"></i></span>' : '';
    const avatar = d.avatar
      ? '<img src="' + esc(d.avatar) + '" alt="" class="' + avSize + ' rounded-full mx-auto mb-4 object-cover border-2 border-white/20">'
      : '<div class="' + avSize + ' rounded-full mx-auto mb-4 bg-panel border-2 border-white/10 flex items-center justify-center text-steel text-lg">' + esc((d.name || '?')[0].toUpperCase()) + '</div>';
    const bgStyle = d.bgImage ? "background-image:linear-gradient(rgba(5,7,10,0.72),rgba(5,7,10,0.88)),url('" + esc(d.bgImage) + "');background-size:cover;background-position:center;" : '';
    container.innerHTML =
      '<div style="' + bgStyle + '">' + avatar +
      '<h1 class="' + nameClass + ' font-semibold text-white mb-2">' + (esc(d.name) || 'Nombre') + badge + '</h1>' +
      '<p class="text-sm text-white/70 mb-4">' + esc(d.bio) + '</p>' +
      socialHtml + renderContactCard(d, compact) +
      '<div class="space-y-0 max-w-sm mx-auto mt-2">' + (linksHtml || '<p class="text-[10px] text-steel/50">Sin enlaces</p>') + '</div>' +
      '<p class="mt-6 text-[10px] text-white/30">privtr.ee/@' + esc(d.username) + '</p></div>';
  }
  return {
    SOCIAL_DEFS: SOCIAL_DEFS, DOMAINS: DOMAINS, PRESET_COLORS: PRESET_COLORS, BRANDS: BRANDS,
    defaultPage: defaultPage, starkDemo: starkDemo, sanitizeUsername: sanitizeUsername,
    load: load, save: save, normalize: normalize,
    shapeClass: shapeClass, sizeClass: sizeClass, colorStyle: colorStyle,
    esc: esc, renderProfile: renderProfile,
    emptyContact: emptyContact, contactToVcard: contactToVcard, vcardHref: vcardHref, readImageFile: readImageFile,
  };
})();
