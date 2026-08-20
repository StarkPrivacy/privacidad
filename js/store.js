/**
 * Privacidad.me — data layer (localStorage demo).
 */
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
    { id: 'bluesky', label: 'Bluesky', icon: 'fa-brands fa-bluesky', placeholder: 'https://bsky.app/profile/...' },
    { id: 'tiktok', label: 'TikTok', icon: 'fa-brands fa-tiktok', placeholder: 'https://tiktok.com/@...' },
    { id: 'twitch', label: 'Twitch', icon: 'fa-brands fa-twitch', placeholder: 'https://twitch.tv/...' },
    { id: 'reddit', label: 'Reddit', icon: 'fa-brands fa-reddit', placeholder: 'https://reddit.com/u/...' },
    { id: 'facebook', label: 'Facebook', icon: 'fa-brands fa-facebook', placeholder: 'https://facebook.com/...' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'fa-brands fa-whatsapp', placeholder: 'https://wa.me/...' },
    { id: 'signal', label: 'Signal', icon: 'fa-solid fa-comment-dots', placeholder: 'https://signal.me/...' },
    { id: 'matrix', label: 'Matrix', icon: 'fa-solid fa-cube', placeholder: 'https://matrix.to/...' },
    { id: 'nostr', label: 'Nostr', icon: 'fa-solid fa-bolt', placeholder: 'nostr:...' },
    { id: 'email', label: 'Email', icon: 'fa-solid fa-envelope', placeholder: 'mailto:...' },
  ];

  const DOMAINS = ['privacidad.me', 'privtr.ee', 'privtree.com'];

  const PRESET_COLORS = [
    { id: 'blue', label: 'Azul', bg: '#2563eb', fg: '#ffffff' },
    { id: 'red', label: 'Rojo', bg: '#dc2626', fg: '#ffffff' },
    { id: 'black', label: 'Negro', bg: '#0a0a0a', fg: '#ffffff' },
    { id: 'sky', label: 'Cielo', bg: '#38bdf8', fg: '#0a0a0a' },
    { id: 'neon', label: 'Neon', bg: '#0a84ff', fg: '#05070a' },
    { id: 'green', label: 'Verde', bg: '#16a34a', fg: '#ffffff' },
    { id: 'violet', label: 'Violeta', bg: '#7c3aed', fg: '#ffffff' },
    { id: 'outline', label: 'Contorno', bg: 'transparent', fg: '#c5d0e0', border: 'rgba(255,255,255,0.15)' },
  ];

  function emptySocial() {
    const o = {};
    SOCIAL_DEFS.forEach(s => { o[s.id] = ''; });
    return o;
  }

  function defaultPage(username) {
    return {
      name: username || 'Usuario',
      username: (username || 'user').toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      bio: '', avatar: '', theme: 'dark', shape: 'rounded',
      btnStyle: 'outline', btnSize: 'md', btnGlow: false, bgImage: '',
      verified: false, sameTab: false, social: emptySocial(), links: [],
      ogTitle: '', ogDesc: '', updatedAt: Date.now(),
    };
  }

  function starkDemo() {
    const p = defaultPage('stark');
    p.name = 'Stark Privacy';
    p.bio = 'Sin privacidad tu libertad es solo una ilusión';
    p.avatar = 'https://pbs.twimg.com/profile_images/1691362458655440896/jaacLom0.jpg';
    p.verified = true;
    p.shape = 'rounded';
    p.btnStyle = 'solid';
    p.btnSize = 'md';
    p.social.youtube = 'https://youtube.com/@StarkPrivacy';
    p.social.telegram = 'https://t.me/StarkPrivacy';
    p.social.x = 'https://x.com/StarkPrivacy';
    p.social.instagram = 'https://instagram.com/StarkPrivacy';
    p.social.discord = 'https://discord.gg/';
    p.links = [
      { id: 1, type: 'link', title: 'Academia Boring Privacy', url: 'https://boringprivacy.io', color: 'blue', icon: 'fa-solid fa-globe' },
      { id: 2, type: 'link', title: 'Suscríbete al Newsletter', url: 'https://boringprivacy.io/#newsletter', color: 'red', icon: 'fa-solid fa-newspaper' },
      { id: 3, type: 'link', title: 'Podcasts', url: 'https://privtr.ee/@starkpodcasts', color: 'black', icon: 'fa-solid fa-podcast' },
      { id: 4, type: 'heading', title: 'Correo electrónico seguro', url: '', color: '', icon: '' },
      { id: 5, type: 'email', title: 'stark@boringprivacy.io', url: 'stark@boringprivacy.io', color: 'sky', icon: 'fa-solid fa-envelope' },
      { id: 6, type: 'text', title: 'PGP Key ID: 0x0732E79E', url: 'https://boringprivacy.io/pgp/stark.txt', color: '', icon: '' },
      { id: 7, type: 'heading', title: 'Buenos servicios de privacidad', url: '', color: '', icon: '' },
      { id: 8, type: 'link', title: 'H. Wallet | 5% Descuento', url: 'https://bitbox.swiss/stark', color: 'blue', icon: 'fa-solid fa-wallet' },
      { id: 9, type: 'link', title: 'Ordenadores | 5% Descuento', url: 'https://silkpad.net/?ref=STARK', color: 'outline', icon: 'fa-solid fa-laptop' },
      { id: 10, type: 'link', title: 'Números temporales', url: 'https://smspool.net/?r=STARK', color: 'outline', icon: 'fa-solid fa-sms' },
      { id: 11, type: 'link', title: '2FA y dispositivos | Nitrokey', url: 'https://shop.nitrokey.com/shop?aff_ref=35', color: 'outline', icon: 'fa-solid fa-key' },
      { id: 12, type: 'link', title: 'Gasta cripto sin KYC | Bitrefill', url: 'https://www.bitrefill.com/invite/a1pnn6vl', color: 'outline', icon: 'fa-brands fa-bitcoin' },
      { id: 13, type: 'link', title: 'Proton Pack | 30% Descuento', url: 'https://go.getproton.me/SH2GD', color: 'violet', icon: 'fa-solid fa-shield-halved' },
      { id: 14, type: 'link', title: 'Proton VPN | 70% Descuento', url: 'https://go.getproton.me/SH1Ou', color: 'violet', icon: 'fa-solid fa-shield-halved' },
    ];
    return p;
  }

  function sanitizeUsername(u) {
    return String(u || '').replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);
  }

  function load(username) {
    const u = sanitizeUsername(username);
    if (u) {
      try {
        const raw = localStorage.getItem('priv_page_' + u);
        if (raw) return normalize(JSON.parse(raw));
      } catch (e) {}
    }
    try {
      const raw = localStorage.getItem('priv_page');
      if (raw) {
        const d = normalize(JSON.parse(raw));
        if (!u || d.username === u) return d;
      }
    } catch (e) {}
    return null;
  }

  function normalize(d) {
    const base = defaultPage(d.username || 'user');
    return {
      ...base, ...d,
      username: sanitizeUsername(d.username || base.username),
      social: { ...emptySocial(), ...(d.social || {}) },
      links: Array.isArray(d.links) ? d.links.map((l, i) => ({
        id: l.id != null ? l.id : i + 1,
        title: l.title || '', url: l.url || '', type: l.type || 'link',
        color: l.color || '', icon: l.icon || '',
      })) : [],
      btnStyle: d.btnStyle || 'outline', btnSize: d.btnSize || 'md',
      btnGlow: !!d.btnGlow, verified: !!d.verified, sameTab: !!d.sameTab,
      bgImage: d.bgImage || '',
    };
  }

  function save(page) {
    const d = normalize({ ...page, updatedAt: Date.now() });
    d.username = sanitizeUsername(d.username);
    localStorage.setItem('priv_page', JSON.stringify(d));
    localStorage.setItem('priv_page_' + d.username, JSON.stringify(d));
    return d;
  }

  function listUsers() {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('priv_page_')) {
        try { out.push(normalize(JSON.parse(localStorage.getItem(k)))); } catch (e) {}
      }
    }
    return out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  function exportAll() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('priv')) data[k] = localStorage.getItem(k);
    }
    return data;
  }

  function shapeClass(shape) {
    if (shape === 'pill') return 'rounded-full';
    if (shape === 'square') return 'rounded-md';
    return 'rounded-xl';
  }

  function sizeClass(size) {
    if (size === 'sm') return 'py-2 px-3 text-xs';
    if (size === 'lg') return 'py-4 px-5 text-base';
    return 'py-3.5 px-4 text-sm';
  }

  function colorStyle(colorId, d, compact) {
    const preset = PRESET_COLORS.find(c => c.id === colorId);
    const sc = shapeClass(d.shape);
    const sz = compact ? 'py-2.5 px-3 text-xs' : sizeClass(d.btnSize);
    const glow = d.btnGlow ? 'box-shadow:0 0 16px rgba(10,132,255,0.25);' : '';
    if (preset) {
      const border = preset.border ? 'border:1px solid ' + preset.border + ';' : 'border:none;';
      return {
        className: 'link-btn flex items-center justify-center gap-2 w-full ' + sz + ' ' + sc + ' font-medium mb-2.5',
        style: 'background:' + preset.bg + ';color:' + preset.fg + ';' + border + glow,
      };
    }
    let fill = 'background:#0b0f14;color:#c5d0e0;border:1px solid rgba(255,255,255,0.1);';
    if (d.btnStyle === 'solid') fill = 'background:#0a84ff;color:#05070a;border:none;';
    if (d.btnStyle === 'soft') fill = 'background:rgba(10,132,255,0.15);color:#0a84ff;border:1px solid rgba(10,132,255,0.3);';
    if (d.btnStyle === 'ghost') fill = 'background:transparent;color:#c5d0e0;border:1px solid rgba(255,255,255,0.2);';
    return {
      className: 'link-btn flex items-center justify-center gap-2 w-full ' + sz + ' ' + sc + ' font-medium mb-2.5',
      style: fill + glow,
    };
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&').replace(/</g, '<').replace(/"/g, '"');
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
    const order = ['youtube', 'telegram', 'x', 'instagram', 'discord'];
    active.sort(function(a, b) {
      const ia = order.indexOf(a.id); const ib = order.indexOf(b.id);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    const socialHtml = active.length
      ? '<div class="flex flex-wrap justify-center gap-2.5 ' + (compact ? 'mb-5' : 'mb-6') + '">' +
        active.map(function(s) {
          return '<a href="' + esc(d.social[s.id]) + '" target="' + target + '" rel="noopener" title="' + esc(s.label) +
            '" class="social-btn ' + socialSize + ' rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20"><i class="' + s.icon + '"></i></a>';
        }).join('') + '</div>'
      : '';

    const linksHtml = (d.links || []).filter(function(l) {
      return l.title || l.url || l.type === 'spacer';
    }).map(function(l) {
      if (l.type === 'heading') {
        return '<h2 class="text-center text-sm font-medium text-steel/80 mt-5 mb-3 tracking-wide">' + esc(l.title) + '</h2>';
      }
      if (l.type === 'spacer') return '<div class="h-3"></div>';
      if (l.type === 'text') {
        const inner = l.url
          ? '<a href="' + esc(l.url) + '" target="' + target + '" rel="noopener" class="text-neon hover:underline">' + esc(l.title) + '</a>'
          : esc(l.title);
        return '<p class="text-center text-xs text-steel mb-3 leading-relaxed">' + inner + '</p>';
      }
      var href = l.type === 'email'
        ? (String(l.url).indexOf('mailto:') === 0 ? l.url : 'mailto:' + l.url)
        : l.type === 'phone'
          ? (String(l.url).indexOf('tel:') === 0 ? l.url : 'tel:' + l.url)
          : (l.url || '#');
      var cs = colorStyle(l.color, d, compact);
      var iconHtml = l.icon ? '<i class="' + esc(l.icon) + '"></i>' : '';
      return '<a href="' + esc(href) + '" target="' + target + '" rel="noopener" class="' + cs.className + '" style="' + cs.style + '">' + iconHtml + '<span>' + (esc(l.title) || 'Enlace') + '</span></a>';
    }).join('');

    const badge = d.verified
      ? '<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0a84ff] text-white text-[10px] ml-1.5 align-middle" title="Verificado"><i class="fa-solid fa-check"></i></span>'
      : '';

    const avatar = d.avatar
      ? '<img src="' + esc(d.avatar) + '" alt="" class="' + avSize + ' rounded-full mx-auto mb-4 object-cover border-2 border-white/20 shadow-lg" onerror="this.style.opacity=\'0.3\'">'
      : '<div class="' + avSize + ' rounded-full mx-auto mb-4 bg-panel border-2 border-white/10 flex items-center justify-center text-steel text-lg">' + esc((d.name || '?')[0].toUpperCase()) + '</div>';

    const bgStyle = d.bgImage
      ? "background-image:linear-gradient(rgba(5,7,10,0.75),rgba(5,7,10,0.85)),url('" + esc(d.bgImage) + "');background-size:cover;background-position:center;"
      : '';

    container.innerHTML =
      '<div class="' + (d.bgImage && !compact ? 'rounded-2xl p-4 -mx-2' : '') + '" style="' + bgStyle + '">' +
      avatar +
      '<h1 class="' + nameClass + ' font-semibold text-white mb-2">' + (esc(d.name) || 'Nombre') + badge + '</h1>' +
      '<p class="text-' + (compact ? '[11px]' : 'sm') + ' text-white/70 mb-5 leading-relaxed ' + (compact ? '' : 'max-w-sm mx-auto') + '">' + esc(d.bio) + '</p>' +
      socialHtml +
      '<div class="space-y-0 max-w-sm mx-auto">' + (linksHtml || '<p class="text-[10px] text-steel/50">Sin enlaces</p>') + '</div>' +
      '<p class="mt-6 text-[10px] text-white/30">privtr.ee/@' + esc(d.username) + '</p></div>';
  }

  return {
    SOCIAL_DEFS: SOCIAL_DEFS, DOMAINS: DOMAINS, PRESET_COLORS: PRESET_COLORS,
    defaultPage: defaultPage, starkDemo: starkDemo, sanitizeUsername: sanitizeUsername,
    load: load, save: save, listUsers: listUsers, exportAll: exportAll,
    shapeClass: shapeClass, sizeClass: sizeClass, colorStyle: colorStyle,
    esc: esc, renderProfile: renderProfile, normalize: normalize,
  };
})();
