/** privtr.ee store */
const PrivStore = (() => {
  const SOCIAL_DEFS = [
    { id: 'youtube', label: 'YouTube', icon: 'fa-brands fa-youtube', placeholder: 'https://youtube.com/...' },
    { id: 'telegram', label: 'Telegram', icon: 'fa-brands fa-telegram', placeholder: 'https://t.me/...' },
    { id: 'x', label: 'X / Twitter', icon: 'fa-brands fa-x-twitter', placeholder: 'https://x.com/...' },
    { id: 'instagram', label: 'Instagram', icon: 'fa-brands fa-instagram', placeholder: 'https://instagram.com/...' },
    { id: 'discord', label: 'Discord', icon: 'fa-brands fa-discord', placeholder: 'https://discord.gg/...' },
    { id: 'github', label: 'GitHub', icon: 'fa-brands fa-github', placeholder: 'https://github.com/...' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'fa-brands fa-linkedin', placeholder: 'https://linkedin.com/in/...' },
    { id: 'mastodon', label: 'Mastodon', icon: 'fa-brands fa-mastodon', placeholder: 'https://mastodon.social/...' },
    { id: 'email', label: 'Email', icon: 'fa-solid fa-envelope', placeholder: 'mailto:...' },
  ];
  const DOMAINS = ['privtr.ee'];
  // Versión del esquema de datos del perfil. Súbela al añadir migraciones en migratePage().
  const SCHEMA_VERSION = 1;
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
    { id: 'shop', label: 'Tienda', icon: 'fa-solid fa-cart-shopping', color: 'green' },
    { id: 'pgp', label: 'PGP', icon: 'fa-solid fa-key', color: 'outline' },
  ];
  const ICON_PRESETS = [
    { id: 'link', icon: 'fa-solid fa-link' }, { id: 'globe', icon: 'fa-solid fa-globe' },
    { id: 'newspaper', icon: 'fa-solid fa-newspaper' }, { id: 'podcast', icon: 'fa-solid fa-podcast' },
    { id: 'shield', icon: 'fa-solid fa-shield-halved' }, { id: 'key', icon: 'fa-solid fa-key' },
    { id: 'cart', icon: 'fa-solid fa-cart-shopping' }, { id: 'play', icon: 'fa-solid fa-play' },
    { id: 'envelope', icon: 'fa-solid fa-envelope' }, { id: 'phone', icon: 'fa-solid fa-phone' },
  ];
  function emptySocial() { const o = {}; SOCIAL_DEFS.forEach(s => { o[s.id] = ''; }); return o; }
  function emptyContact() { return { enabled: false, title: '', note: '', email: '', phone: '', web: '', org: '', showQr: true, borderColor: '', qrStyle: 'classic' }; }
  function defaultPage(username) {
    return {
      name: username || 'Usuario', username: (username || 'user').toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      bio: '', avatar: '', bgImage: '', shape: 'rounded', btnStyle: 'outline', btnSize: 'md', btnGlow: false,
      accentColor: '#0a84ff', profileMode: 'both', verified: false, sameTab: false,
      social: emptySocial(), socialOrder: SOCIAL_DEFS.map(function(x){return x.id;}), links: [], contact: emptyContact(), ogTitle: '', ogDesc: '',
      schemaVersion: SCHEMA_VERSION, updatedAt: Date.now(),
    };
  }
  // Punto único de migración entre versiones de esquema. Hoy v1: nada que migrar.
  function migratePage(d) {
    var v = Number(d && d.schemaVersion) || 0;
    // if (v < 2) { ...transformar...; v = 2; }
    d.schemaVersion = SCHEMA_VERSION;
    return d;
  }
  function starkDemo() {
    const p = defaultPage('stark');
    p.name = 'Stark Privacy'; p.bio = 'Sin privacidad tu libertad es solo una ilusión';
    p.avatar = 'assets/img/stark-avatar.jpg';
    p.verified = true; p.shape = 'rounded'; p.btnStyle = 'solid'; p.profileMode = 'both';
    p.social.youtube = 'https://youtube.com/@StarkPrivacy'; p.social.telegram = 'https://t.me/StarkPrivacy';
    p.social.x = 'https://x.com/StarkPrivacy'; p.social.instagram = 'https://instagram.com/StarkPrivacy';
    p.socialOrder = ['youtube', 'telegram', 'x', 'instagram', 'discord', 'github', 'linkedin', 'mastodon', 'email'];
    p.contact = { enabled: true, title: 'Fundador · Boring Privacy', note: 'Privacidad, seguridad y soberanía digital',
      email: 'stark@boringprivacy.io', phone: '', web: 'https://boringprivacy.io', org: 'Boring Privacy', showQr: true, borderColor: '#0a84ff', qrStyle: 'classic' };
    p.links = [
      { id: 1, type: 'link', title: 'Academia Boring Privacy', url: 'https://boringprivacy.io', color: 'blue', icon: 'fa-solid fa-globe', brand: 'website', iconMode: 'preset' },
      { id: 2, type: 'link', title: 'Suscríbete al Newsletter', url: 'https://boringprivacy.io/#newsletter', color: 'red', icon: 'fa-solid fa-newspaper', brand: 'newsletter', iconMode: 'preset' },
      { id: 3, type: 'link', title: 'Podcasts', url: 'https://privtr.ee/@starkpodcasts', color: 'black', icon: 'fa-solid fa-podcast', brand: 'podcast', iconMode: 'preset' },
      { id: 4, type: 'heading', title: 'Servicios recomendados', url: '', color: '', icon: '', brand: '', iconMode: 'none' },
      { id: 5, type: 'link', title: 'Proton VPN | 70% Descuento', url: 'https://go.getproton.me/SH1Ou', color: 'violet', icon: 'fa-solid fa-shield-halved', brand: 'custom', iconMode: 'preset' },
    ];
    return p;
  }
  function sanitizeUsername(u) { return String(u || '').replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32); }
  function load(username) {
    const u = sanitizeUsername(username);
    if (u) { try { const raw = localStorage.getItem('priv_page_' + u); if (raw) return normalize(JSON.parse(raw)); } catch (e) {} }
    try { const raw = localStorage.getItem('priv_page'); if (raw) { const d = normalize(JSON.parse(raw)); if (!u || d.username === u) return d; } } catch (e) {}
    return null;
  }
  const SHAPES = ['rounded', 'pill', 'square'];
  const BTN_STYLES = ['outline', 'solid', 'soft', 'ghost'];
  const BTN_SIZES = ['sm', 'md', 'lg'];
  const LINK_TYPES = ['link', 'heading', 'text', 'spacer'];
  const ICON_MODES = ['none', 'preset', 'favicon'];
  function normalize(d) {
    d = d && typeof d === 'object' ? d : {};
    d = migratePage(d);
    const base = defaultPage(d.username || 'user');
    const mode = d.profileMode === 'card' || d.profileMode === 'links' ? d.profileMode : 'both';
    const contact = { ...emptyContact(), ...(d.contact || {}) };
    contact.enabled = !!contact.enabled;
    contact.showQr = contact.showQr !== false;
    contact.borderColor = safeHex(contact.borderColor, '');
    contact.qrStyle = contact.qrStyle === 'themed' ? 'themed' : 'classic';
    return {
      ...base, ...d, username: sanitizeUsername(d.username || base.username), profileMode: mode,
      accentColor: safeHex(d.accentColor, '#0a84ff'),
      social: { ...emptySocial(), ...(d.social || {}) },
      socialOrder: Array.isArray(d.socialOrder) && d.socialOrder.length ? d.socialOrder : SOCIAL_DEFS.map(function(x){return x.id;}),
      contact: contact,
      links: Array.isArray(d.links) ? d.links.map((l, i) => ({
        id: l.id != null ? l.id : i + 1, title: l.title || '', url: l.url || '',
        type: LINK_TYPES.indexOf(l.type) >= 0 ? l.type : 'link',
        color: l.color || '', customColor: safeHex(l.customColor, ''), icon: l.icon || '', brand: l.brand || '',
        iconMode: ICON_MODES.indexOf(l.iconMode) >= 0 ? l.iconMode : (l.icon ? 'preset' : 'none'),
      })) : [],
      shape: SHAPES.indexOf(d.shape) >= 0 ? d.shape : 'rounded',
      btnStyle: BTN_STYLES.indexOf(d.btnStyle) >= 0 ? d.btnStyle : 'outline',
      btnSize: BTN_SIZES.indexOf(d.btnSize) >= 0 ? d.btnSize : 'md',
      btnGlow: !!d.btnGlow, verified: !!d.verified, sameTab: !!d.sameTab, bgImage: d.bgImage || '',
    };
  }
  function save(page) {
    const d = normalize({ ...page, updatedAt: Date.now() });
    d.username = sanitizeUsername(d.username);
    try { localStorage.setItem('priv_page', JSON.stringify(d)); localStorage.setItem('priv_page_' + d.username, JSON.stringify(d)); } catch (e) { throw e; }
    return d;
  }
  function listUsers() {
    const users = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('priv_page_') === 0) { try { users.push(normalize(JSON.parse(localStorage.getItem(k)))); } catch (e) {} }
    }
    return users;
  }
  // Formato de exportación versionado y estable (para respaldo y para llevar
  // la gestión + los usuarios de privacidad.me a privtr.ee más adelante).
  function exportAll() {
    return {
      generator: 'privtr.ee',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      pages: listUsers(),
    };
  }
  // Acepta: {pages:[...]}, un array de páginas, o una página suelta. Devuelve
  // páginas normalizadas (NO guarda). Ignora entradas no válidas.
  function importPages(payload) {
    let arr = [];
    if (Array.isArray(payload)) arr = payload;
    else if (payload && Array.isArray(payload.pages)) arr = payload.pages;
    else if (payload && typeof payload === 'object') arr = [payload];
    const out = [];
    arr.forEach(function (p) {
      try { const n = normalize(p); if (n.username) out.push(n); } catch (e) {}
    });
    return out;
  }
  function saveImported(pages) {
    let n = 0;
    (pages || []).forEach(function (p) { try { saveByUser(p); n++; } catch (e) {} });
    return n;
  }
  // Guarda una página en su clave por-usuario sin tocar la "actual" (priv_page).
  function saveByUser(page) {
    const d = normalize({ ...page, updatedAt: page && page.updatedAt || Date.now() });
    d.username = sanitizeUsername(d.username);
    if (!d.username) throw new Error('sin usuario');
    localStorage.setItem('priv_page_' + d.username, JSON.stringify(d));
    return d;
  }

  // ---- Adaptador LinkStack / privacidad.me ------------------------------------
  // privacidad.me está basado en LinkStack. Su exportación suele ser relacional
  // ({users:[...], links:[...]}) o anidada ([{...user, links:[...]}]). Este
  // adaptador es "best-effort": lo que no se pueda mapear queda anotado en
  // page._migrationNotes para revisión manual. Ver MIGRATION.md.
  const LS_SOCIAL = {
    youtube: 'youtube', telegram: 'telegram', twitter: 'x', x: 'x', 'x-twitter': 'x',
    instagram: 'instagram', discord: 'discord', github: 'github',
    linkedin: 'linkedin', mastodon: 'mastodon', email: 'email', mail: 'email',
  };
  const LS_ICON = {
    youtube: 'fa-brands fa-youtube', telegram: 'fa-brands fa-telegram', 'x-twitter': 'fa-brands fa-x-twitter',
    twitter: 'fa-brands fa-x-twitter', instagram: 'fa-brands fa-instagram', discord: 'fa-brands fa-discord',
    github: 'fa-brands fa-github', linkedin: 'fa-brands fa-linkedin', mastodon: 'fa-brands fa-mastodon',
    website: 'fa-solid fa-globe', link: 'fa-solid fa-link', 'link-classic': 'fa-solid fa-link',
    newsletter: 'fa-solid fa-newspaper', podcast: 'fa-solid fa-podcast', shop: 'fa-solid fa-cart-shopping',
    email: 'fa-solid fa-envelope', phone: 'fa-solid fa-phone',
  };
  function lsPickHandle(u) {
    return sanitizeUsername(u.littlelink_name || u.littlelink_username || u.username || u.handle || u.name || '');
  }
  function lsLinkType(t) {
    t = String(t || '').toLowerCase();
    if (t === 'heading' || t === 'header' || t === 'group') return 'heading';
    if (t === 'divider' || t === 'spacer' || t === 'break') return 'spacer';
    if (t === 'text' || t === 'paragraph') return 'text';
    return 'link';
  }
  function fromLinkStack(input) {
    let users = [];
    if (Array.isArray(input)) users = input;
    else if (input && Array.isArray(input.users)) {
      const byUser = {};
      (input.links || []).forEach(function (l) {
        (byUser[l.user_id] = byUser[l.user_id] || []).push(l);
      });
      users = input.users.map(function (u) { return { ...u, links: (u.links || byUser[u.id] || []) }; });
    } else if (input && typeof input === 'object') users = [input];

    return users.map(function (u) {
      const notes = [];
      const p = defaultPage(lsPickHandle(u) || 'usuario');
      p.name = u.name || u.display_name || p.username;
      p.bio = u.littlelink_description || u.description || u.bio || '';
      const av = u.image || u.img || u.avatar || u.picture || '';
      if (av) {
        if (/^https?:\/\//i.test(av)) p.avatar = av;
        else { notes.push('Avatar "' + av + '": súbelo o pon URL absoluta.'); }
      }
      p.verified = !!(u.verified || u.is_verified);

      const rawLinks = Array.isArray(u.links) ? u.links.slice() : [];
      rawLinks.sort(function (a, b) { return (a.order || a.position || 0) - (b.order || b.position || 0); });
      let nid = 1;
      rawLinks.forEach(function (l) {
        const type = lsLinkType(l.type);
        const btn = String(l.button || l.button_id || l.brand || '').toLowerCase();
        const url = l.link || l.url || '';
        if (type === 'link' && LS_SOCIAL[btn] && url) {
          p.social[LS_SOCIAL[btn]] = url;               // va a la fila de redes
          return;
        }
        const icon = LS_ICON[btn] || '';
        p.links.push({
          id: nid++, type: type, title: l.title || l.name || '', url: type === 'spacer' ? '' : url,
          color: '', customColor: '', icon: icon, brand: icon ? (LS_SOCIAL[btn] ? 'custom' : (btn || 'custom')) : '',
          iconMode: icon ? 'preset' : 'none',
        });
        if (btn && !LS_ICON[btn] && !LS_SOCIAL[btn]) notes.push('Botón LinkStack "' + btn + '" sin equivalencia: revisa icono/color.');
      });

      if (u.custom_css || u.custom_js) notes.push('Tenía CSS/JS personalizado en LinkStack: no se importa (revisar).');
      const out = normalize(p);
      if (notes.length) out._migrationNotes = notes;
      return out;
    });
  }
  function setVerified(username, verified) {
    const d = load(username); if (!d) return null; d.verified = !!verified; return save(d);
  }
  function shapeClass(shape) {
    if (shape === 'pill') return 'rounded-full'; if (shape === 'square') return 'rounded-md'; return 'rounded-xl';
  }
  function sizeClass(size, compact) {
    if (compact) {
      if (size === 'sm') return 'py-1 px-2 text-[10px]';
      if (size === 'lg') return 'py-3.5 px-3.5 text-sm';
      return 'py-2 px-3 text-xs';
    }
    if (size === 'sm') return 'py-1.5 px-3 text-xs';
    if (size === 'lg') return 'py-4 px-5 text-base';
    return 'py-3 px-4 text-sm';
  }
  function contrastFg(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    return ((0.299*r + 0.587*g + 0.114*b) / 255) > 0.55 ? '#05070a' : '#ffffff';
  }
  function resolveColor(colorId, customColor) {
    if (customColor && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(customColor))
      return { bg: customColor, fg: contrastFg(customColor), border: null };
    if (colorId && colorId.charAt(0) === '#' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colorId))
      return { bg: colorId, fg: contrastFg(colorId), border: null };
    const preset = PRESET_COLORS.find(c => c.id === colorId);
    if (preset) return { bg: preset.bg, fg: preset.fg, border: preset.border || null };
    return null;
  }
  function colorStyle(colorId, d, compact, customColor) {
    const sc = shapeClass(d.shape);
    const sz = sizeClass(d.btnSize, compact);
    const glowColor = safeHex(d.accentColor, '#0a84ff') || '#0a84ff';
    const glow = d.btnGlow ? 'box-shadow:0 0 16px ' + glowColor + '40;' : '';
    const resolved = resolveColor(colorId, customColor);
    if (resolved) {
      const border = resolved.border ? 'border:1px solid ' + resolved.border + ';' : 'border:none;';
      return { className: 'link-btn flex items-center justify-center gap-2 w-full ' + sz + ' ' + sc + ' font-medium mb-3',
        style: 'background:' + resolved.bg + ';color:' + resolved.fg + ';' + border + glow };
    }
    let fill = 'background:#0b0f14;color:#c5d0e0;border:1px solid rgba(255,255,255,0.1);';
    if (d.btnStyle === 'solid') fill = 'background:' + glowColor + ';color:#05070a;border:none;';
    if (d.btnStyle === 'soft') fill = 'background:' + glowColor + '26;color:' + glowColor + ';border:1px solid ' + glowColor + '4d;';
    if (d.btnStyle === 'ghost') fill = 'background:transparent;color:#c5d0e0;border:1px solid rgba(255,255,255,0.2);';
    return { className: 'link-btn flex items-center justify-center gap-2 w-full ' + sz + ' ' + sc + ' font-medium mb-3', style: fill + glow };
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // Solo permite href navegables y seguros. Bloquea javascript:, data:, vbscript:, file:...
  function safeUrl(u) {
    const s = String(u == null ? '' : u).trim();
    if (!s) return '';
    if (/^(https?:|mailto:|tel:)/i.test(s)) return s;
    if (/^[\/#?]/.test(s)) return s;                              // ruta o ancla relativa
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return '';                // cualquier otro esquema: fuera
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'mailto:' + s;
    if (/^[^\s.]+\.[^\s]{2,}/.test(s)) return 'https://' + s;     // dominio sin esquema
    return '';
  }
  // Imágenes seguras para src: http(s), data:image rasterizada (sin SVG) o ruta
  // same-origin. Bloquea javascript:, data:svg, protocol-relative y metacaracteres.
  function safeImg(u) {
    const s = String(u == null ? '' : u).trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    if (/^data:image\/(png|jpe?g|gif|webp|avif|bmp);base64,[a-z0-9+/=\s]+$/i.test(s)) return s;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return '';   // otro esquema
    if (/^\/\//.test(s)) return '';                  // protocol-relative
    if (/[<>"'\\\s]/.test(s)) return '';             // sin metacaracteres de atributo
    return s;                                        // ruta relativa / absoluta same-origin
  }
  function safeHex(v, fallback) {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(v == null ? '' : v)) ? String(v) : (fallback || '');
  }
  // Antes pedía el favicon a Google (fuga de IP + de qué enlaces ve el visitante,
  // en cada carga de perfil). Ahora se genera 100% en cliente: monograma de la
  // inicial del dominio. Cero peticiones a terceros.
  function siteHostname(pageUrl) {
    try {
      const raw = String(pageUrl || '');
      const u = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
      return u.hostname.replace(/^www\./, '');
    } catch (e) { return ''; }
  }
  function faviconMarkup(pageUrl) {
    const host = siteHostname(pageUrl);
    if (!host) return '';
    const ch = esc(host.charAt(0).toUpperCase());
    return '<span aria-hidden="true" class="inline-flex items-center justify-center w-4 h-4 rounded-[3px] bg-white/10 text-current text-[9px] font-bold leading-none">' + ch + '</span>';
  }
  // compat: se mantiene el nombre exportado; ya no devuelve URL remota
  function faviconUrl() { return ''; }
  function vcardEsc(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  }
  function contactToVcard(page) {
    const c = page.contact || emptyContact();
    const name = vcardEsc(page.name);
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + name, 'N:;' + name + ';;;'];
    if (c.org) lines.push('ORG:' + vcardEsc(c.org));
    if (c.title) lines.push('TITLE:' + vcardEsc(c.title));
    if (c.email) lines.push('EMAIL;TYPE=INTERNET:' + vcardEsc(c.email));
    if (c.phone) lines.push('TEL;TYPE=CELL:' + vcardEsc(c.phone));
    if (safeUrl(c.web)) lines.push('URL:' + vcardEsc(safeUrl(c.web)));
    if (c.note) lines.push('NOTE:' + vcardEsc(c.note));
    if (page.username) lines.push('UID:privtr.ee:' + sanitizeUsername(page.username));
    lines.push('END:VCARD');
    return lines.join('\r\n');
  }
  function vcardHref(page) { return 'data:text/vcard;charset=utf-8,' + encodeURIComponent(contactToVcard(page)); }
  function profileUrl(d) { return 'https://privtr.ee/@' + (d.username || ''); }
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
  function renderContactCard(d, compact, mode) {
    const c = d.contact || emptyContact();
    if (!c.enabled) return '';
    mode = mode || 'both';
    const isCollapsible = (mode === 'both' || mode === 'card') && !compact;
    const borderCol = safeHex(c.borderColor, '') || safeHex(d.accentColor, '#0a84ff') || '#0a84ff';
    const qrStyle = c.qrStyle === 'themed' ? 'themed' : 'classic';
    const rows = [];
    function copyBtn(kind, value, icon, label) {
      return '<button type="button" data-priv-copy="' + esc(value) + '" data-priv-copy-kind="' + esc(kind) + '" class="w-full flex items-center gap-3 py-2 px-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-left hover:border-neon/40 transition cursor-pointer">' +
        '<i class="fa-solid ' + esc(icon) + ' text-neon/80 w-4 text-center text-xs"></i>' +
        '<span class="text-xs text-mist truncate">' + esc(label) + '</span></button>';
    }
    if (c.email) rows.push(copyBtn('email', c.email, 'fa-envelope', c.email));
    if (c.phone) rows.push(copyBtn('phone', c.phone, 'fa-phone', c.phone));
    if (safeUrl(c.web)) rows.push('<a href="' + esc(safeUrl(c.web)) + '" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 py-2 px-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-left hover:border-neon/40 transition"><i class="fa-solid fa-globe text-neon/80 w-4 text-center text-xs"></i><span class="text-xs text-mist truncate">' + esc(String(c.web).replace(/^https?:\/\//, '')) + '</span></a>');
    const uid = 'card-' + esc(d.username || 'u');
    const qrSize = compact ? 100 : 132;
    const saveFull = '<a href="' + vcardHref(d) + '" download="' + esc(d.username || 'contacto') + '.vcf" class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neon text-void font-semibold text-xs" style="box-shadow:0 0 16px rgba(10,132,255,0.2)"><i class="fa-solid fa-address-card"></i> Guardar contacto</a>';
    const saveCompact = '<a href="' + vcardHref(d) + '" download="' + esc(d.username || 'contacto') + '.vcf" class="flex-1 flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-neon text-void text-[10px] font-semibold">Guardar</a>';
    const flipBtn = '<button type="button" id="' + uid + '-flip" onclick="event.stopPropagation();window.__privFlipCard&&window.__privFlipCard(\'' + uid + '\')" class="w-9 h-9 rounded-xl border border-neon/35 text-neon hover:bg-neon/10 transition flex items-center justify-center shrink-0" title="Código QR"><i class="fa-solid fa-qrcode" data-flip-icon></i></button>';
    const flipBtnCompact = '<button type="button" id="' + uid + '-flip" onclick="event.stopPropagation();window.__privFlipCard&&window.__privFlipCard(\'' + uid + '\')" class="w-8 h-8 rounded-lg border border-neon/35 text-neon flex items-center justify-center shrink-0" title="QR"><i class="fa-solid fa-qrcode text-xs" data-flip-icon></i></button>';
    const footer = '<div class="card-footer mt-3 flex items-center gap-2">' + (compact ? saveCompact : saveFull) + (compact ? flipBtnCompact : flipBtn) + '</div>';
    const metaExpanded = (c.note ? '<p class="text-[11px] text-steel/75 mb-2.5 border-l-2 pl-2.5" style="border-color:' + borderCol + '99">' + esc(c.note) + '</p>' : '') +
      (rows.length ? '<div class="space-y-1.5">' + rows.join('') + '</div>' : '');
    const faceFront = '<div class="card-face card-front" data-face="front">' + metaExpanded + '</div>';
    const faceBack =
      '<div class="card-face card-back is-hidden" data-face="back">' +
        '<div class="flex flex-col items-center justify-center gap-1.5 py-1">' +
          '<div class="rounded-xl p-2" style="background:' + (qrStyle === 'themed' ? borderCol + '22' : '#fff') + '"><canvas class="priv-qr rounded-md" width="' + qrSize + '" height="' + qrSize + '" data-qr="' + esc(profileUrl(d)) + '" data-qr-style="' + qrStyle + '" data-qr-color="' + esc(borderCol) + '"></canvas></div>' +
          '<p class="text-[11px] text-mist font-mono">@' + esc(d.username) + '</p>' +
        '</div>' +
      '</div>';
    const stage = '<div class="card-stage">' + faceFront + faceBack + '</div>';
    const headerBlock =
      '<div class="min-w-0 flex-1">' +
        '<div class="flex items-center gap-2 mb-0.5"><span class="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style="background:' + borderCol + '"></span>' +
        '<div class="text-[10px] uppercase tracking-[0.14em] font-medium" style="color:' + borderCol + '">vCard</div></div>' +
        (c.title ? '<p class="text-sm text-white font-semibold leading-snug">' + esc(c.title) + '</p>' : '') +
        (c.org ? '<p class="text-[11px] leading-snug mt-0.5" style="color:' + borderCol + '">' + esc(c.org) + '</p>' : '') +
      '</div>';
    const borderStyle = 'border:1px solid ' + borderCol + '40;';
    const glowLine = 'background:linear-gradient(90deg,transparent,' + borderCol + '80,transparent)';
    if (isCollapsible) {
      const summary = '<div class="card-summary flex items-start gap-2">' + headerBlock +
        '<i class="fa-solid fa-chevron-down text-neon/40 text-[10px] card-chevron shrink-0 mt-1"></i></div>';
      return '<div id="' + uid + '" class="vcard-shell mt-5 mb-3 rounded-2xl text-left relative overflow-hidden" data-card-flip style="' + borderStyle + '" onmouseleave="window.__privCollapseCard&&window.__privCollapseCard(\'' + uid + '\')">' +
        '<div class="absolute top-0 left-0 right-0 h-px" style="' + glowLine + '"></div>' +
        '<div class="relative px-3.5 py-3 bg-gradient-to-b from-[#0e1520] to-[#0a0e14] rounded-2xl">' +
          summary +
          '<div class="card-details"><div class="card-details-inner">' + stage + footer + '</div></div>' +
        '</div></div>';
    }
    return '<div id="' + uid + '" class="mt-5 mb-3 rounded-2xl bg-gradient-to-b from-[#0e1520] to-[#0a0e14] px-3.5 py-3 text-left relative overflow-hidden ' + (compact ? 'text-xs' : '') + '" data-card-flip style="' + borderStyle + '">' +
      '<div class="absolute top-0 left-0 right-0 h-px" style="' + glowLine + '"></div>' +
      '<div class="flex items-start gap-2">' + headerBlock + '</div>' +
      '<div class="mt-2">' + stage + '</div>' + footer + '</div>';
  }
  function renderProfile(page, container, opts) {
    opts = opts || {};
    const d = normalize(page);
    const compact = !!opts.compact;
    const mode = d.profileMode || 'both';
    const showCard = mode === 'both' || mode === 'card';
    const showLinks = mode === 'both' || mode === 'links';
    const avSize = compact ? 'w-16 h-16' : 'w-24 h-24';
    const nameClass = compact ? 'text-base' : 'text-2xl';
    const socialSize = compact ? 'w-9 h-9 text-sm' : 'w-10 h-10 text-base';
    const target = d.sameTab ? '_self' : '_blank';
    const active = SOCIAL_DEFS.filter(s => safeUrl(d.social[s.id]));
    const order = Array.isArray(d.socialOrder) && d.socialOrder.length ? d.socialOrder : ['youtube', 'telegram', 'x', 'instagram', 'discord'];
    active.sort(function (a, b) { const ia = order.indexOf(a.id), ib = order.indexOf(b.id); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
    const socialHtml = active.length
      ? '<div class="flex flex-wrap justify-center gap-2.5 ' + (compact ? 'mb-4' : 'mb-5') + '">' +
        active.map(function (s) {
          return '<a href="' + esc(safeUrl(d.social[s.id])) + '" target="' + target + '" rel="noopener noreferrer" title="' + esc(s.label) +
            '" data-reorder-id="s-' + s.id + '" class="social-btn ' + socialSize + ' rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white"><i class="' + s.icon + '"></i></a>';
        }).join('') + '</div>' : '';
    const linksHtml = showLinks ? (d.links || []).filter(function (l) { return l.title || l.url || l.type === 'spacer'; }).map(function (l) {
      if (l.type === 'heading') return '<h2 class="text-center text-sm font-medium text-steel/80 mt-5 mb-3">' + esc(l.title) + '</h2>';
      if (l.type === 'spacer') return '<div class="h-3"></div>';
      if (l.type === 'text') {
        var tu = safeUrl(l.url);
        const inner = tu ? '<a href="' + esc(tu) + '" target="' + target + '" rel="noopener noreferrer" class="text-neon hover:underline">' + esc(l.title) + '</a>' : esc(l.title);
        return '<p class="text-center text-xs text-steel mb-3">' + inner + '</p>';
      }
      var href = safeUrl(l.url) || '#';
      var cs = colorStyle(l.color, d, compact, l.customColor);
      var iconHtml = '';
      if (l.iconMode === 'favicon' && l.url) {
        iconHtml = faviconMarkup(l.url);
      } else if (l.iconMode !== 'none' && l.icon) iconHtml = '<i class="' + esc(l.icon) + '"></i>';
      return '<a href="' + esc(href) + '" target="' + target + '" rel="noopener noreferrer" data-reorder-id="l-' + l.id + '" class="' + cs.className + '" style="' + cs.style + '">' + iconHtml + '<span>' + (esc(l.title) || 'Enlace') + '</span></a>';
    }).join('') : '';
    const badge = d.verified ? '<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0a84ff] text-white text-[10px] ml-1.5 align-middle"><i class="fa-solid fa-check"></i></span>' : '';
    const avSrc = safeImg(d.avatar);
    const avatar = avSrc
      ? '<img src="' + esc(avSrc) + '" alt="" referrerpolicy="no-referrer" class="' + avSize + ' rounded-full mx-auto mb-4 object-cover border-2 border-white/20 shadow-lg">'
      : '<div class="' + avSize + ' rounded-full mx-auto mb-4 bg-panel border-2 border-white/10 flex items-center justify-center text-steel text-lg">' + esc((String(d.name || '?').trim() || '?').charAt(0).toUpperCase()) + '</div>';
    const bgSrc = safeImg(d.bgImage).replace(/['"()\\\s]/g, '');
    const bgStyle = bgSrc ? "background-image:linear-gradient(rgba(5,7,10,0.72),rgba(5,7,10,0.88)),url('" + esc(bgSrc) + "');background-size:cover;background-position:center;" : '';
    container.innerHTML =
      '<div class="' + (d.bgImage && !compact ? 'rounded-2xl p-4 -mx-2' : '') + '" style="' + bgStyle + '">' +
      avatar + '<h1 class="' + nameClass + ' font-semibold text-white mb-2">' + (esc(d.name) || 'Nombre') + badge + '</h1>' +
      '<p class="text-' + (compact ? '[11px]' : 'sm') + ' text-white/70 mb-4 leading-relaxed">' + esc(d.bio) + '</p>' +
      socialHtml + (showCard ? renderContactCard(d, compact, mode) : '') +
      (showLinks ? '<div class="space-y-0 max-w-sm mx-auto mt-4">' + (linksHtml || '') + '</div>' : '') +
      '<p class="mt-6 text-[10px] text-white/30">privtr.ee/@' + esc(d.username) + '</p></div>';
    container.querySelectorAll('[data-priv-copy]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (window.__privCopyText) window.__privCopyText(btn.getAttribute('data-priv-copy'), btn.getAttribute('data-priv-copy-kind'));
      });
    });
    if (window.PrivIcons) window.PrivIcons.hydrate(container);
    if (typeof qrcode !== 'undefined') {
      container.querySelectorAll('canvas.priv-qr').forEach(function (canvas) {
        try {
          const url = canvas.getAttribute('data-qr') || '';
          const style = canvas.getAttribute('data-qr-style') || 'classic';
          const accent = canvas.getAttribute('data-qr-color') || '#0a84ff';
          const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
          const ctx = canvas.getContext('2d'); const n = qr.getModuleCount(); const cell = canvas.width / n;
          if (style === 'themed') {
            ctx.fillStyle = '#0a0e14';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = accent;
          } else {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#05070a';
          }
          for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect(c * cell, r * cell, cell, cell);
        } catch (e) {}
      });
    }
  }
  if (typeof window !== 'undefined') {
    // Cambia el glifo del botón de giro (qrcode <-> fingerprint) sea <i> de FA o <svg> ya hidratado.
    function setFlipGlyph(el, toFingerprint) {
      const holder = el && el.querySelector('[data-flip-icon]');
      if (!holder) return;
      const fa = 'fa-solid ' + (toFingerprint ? 'fa-fingerprint' : 'fa-qrcode');
      if (window.PrivIcons) {
        const keep = (holder.getAttribute('class') || '').replace(/fa-[a-z0-9-]+/g, '').replace(/\s+/g, ' ').trim();
        const tmp = document.createElement('span');
        tmp.innerHTML = window.PrivIcons.svg(fa, keep);
        const node = tmp.firstChild;
        node.setAttribute('data-flip-icon', '');
        holder.replaceWith(node);
      } else {
        holder.classList.remove('fa-fingerprint', 'fa-qrcode');
        holder.classList.add(toFingerprint ? 'fa-fingerprint' : 'fa-qrcode');
      }
    }
    window.__privResetCardFace = function (el) {
      if (!el) return;
      const front = el.querySelector('[data-face="front"]');
      const back = el.querySelector('[data-face="back"]');
      const id = el.id;
      const btn = id ? document.getElementById(id + '-flip') : null;
      if (front) front.classList.remove('is-hidden');
      if (back) back.classList.add('is-hidden');
      el.classList.remove('is-qr');
      setFlipGlyph(el, false);
      if (btn) btn.title = 'Código QR';
    };
    window.__privCollapseCard = function (id) {
      const el = document.getElementById(id); if (!el) return;
      window.__privResetCardFace(el);
    };
    window.__privFlipCard = function (id) {
      const el = document.getElementById(id); if (!el) return;
      const front = el.querySelector('[data-face="front"]');
      const back = el.querySelector('[data-face="back"]');
      if (!front || !back) return;
      const showingBack = !back.classList.contains('is-hidden');
      const btn = document.getElementById(id + '-flip');
      if (showingBack) {
        back.classList.add('is-hidden');
        front.classList.remove('is-hidden');
        el.classList.remove('is-qr');
        setFlipGlyph(el, false);
        if (btn) btn.title = 'Código QR';
      } else {
        front.classList.add('is-hidden');
        back.classList.remove('is-hidden');
        el.classList.add('is-qr');
        setFlipGlyph(el, true);
        if (btn) btn.title = 'Volver';
      }
    };
    window.__privCopyText = function (text, kind) {
      if (!text) return;
      var msg = kind === 'phone' ? 'Teléfono copiado correctamente' : (kind === 'email' ? 'Correo copiado correctamente' : 'Copiado');
      function done() {
        if (typeof window.__privToast === 'function') window.__privToast(msg);
        else {
          var t = document.getElementById('toast');
          if (t) {
            t.textContent = msg;
            t.classList.remove('opacity-0', 'translate-y-2');
            clearTimeout(window.__toastT);
            window.__toastT = setTimeout(function () { t.classList.add('opacity-0', 'translate-y-2'); }, 1800);
          }
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          try {
            var ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
          } catch (e) {}
          done();
        });
      } else {
        try {
          var ta = document.createElement('textarea');
          ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        } catch (e) {}
        done();
      }
    };
    window.__privCopyEmail = function (email) { window.__privCopyText(email, 'email'); };
  }
  return {
    SCHEMA_VERSION,
    SOCIAL_DEFS, DOMAINS, PRESET_COLORS, BRANDS, ICON_PRESETS,
    defaultPage, starkDemo, sanitizeUsername, load, save, normalize, migratePage,
    shapeClass, sizeClass, colorStyle, esc, safeUrl, safeImg, safeHex, renderProfile,
    emptyContact, contactToVcard, vcardHref, readImageFile, faviconUrl, profileUrl,
    listUsers, exportAll, importPages, saveImported, saveByUser, fromLinkStack, setVerified,
  };
})();
