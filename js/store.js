/**
 * Privacidad.me — data layer (localStorage demo).
 * Swap load/save for LinkStack API later.
 */
const PrivStore = (() => {
  /* icon: Font Awesome 6 class (fa-brands / fa-solid) */
  const SOCIAL_DEFS = [
    { id: 'x', label: 'X / Twitter', icon: 'fa-brands fa-x-twitter', placeholder: 'https://x.com/...' },
    { id: 'telegram', label: 'Telegram', icon: 'fa-brands fa-telegram', placeholder: 'https://t.me/...' },
    { id: 'github', label: 'GitHub', icon: 'fa-brands fa-github', placeholder: 'https://github.com/...' },
    { id: 'youtube', label: 'YouTube', icon: 'fa-brands fa-youtube', placeholder: 'https://youtube.com/...' },
    { id: 'instagram', label: 'Instagram', icon: 'fa-brands fa-instagram', placeholder: 'https://instagram.com/...' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'fa-brands fa-linkedin', placeholder: 'https://linkedin.com/in/...' },
    { id: 'discord', label: 'Discord', icon: 'fa-brands fa-discord', placeholder: 'https://discord.gg/...' },
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

  function emptySocial() {
    const o = {};
    SOCIAL_DEFS.forEach(s => { o[s.id] = ''; });
    return o;
  }

  function defaultPage(username) {
    return {
      name: username || 'Usuario',
      username: (username || 'user').toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      bio: '',
      avatar: '',
      theme: 'dark',
      shape: 'rounded',
      btnStyle: 'outline',
      btnSize: 'md',
      btnGlow: false,
      bgImage: '',
      verified: false,
      sameTab: false,
      social: emptySocial(),
      links: [],
      blocks: [],
      ogTitle: '',
      ogDesc: '',
      updatedAt: Date.now(),
    };
  }

  function sanitizeUsername(u) {
    return String(u || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);
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
      ...base,
      ...d,
      username: sanitizeUsername(d.username || base.username),
      social: { ...emptySocial(), ...(d.social || {}) },
      links: Array.isArray(d.links) ? d.links.map((l, i) => ({
        id: l.id != null ? l.id : i + 1,
        title: l.title || '',
        url: l.url || '',
        type: l.type || 'link',
      })) : [],
      blocks: Array.isArray(d.blocks) ? d.blocks : [],
      btnStyle: d.btnStyle || 'outline',
      btnSize: d.btnSize || 'md',
      btnGlow: !!d.btnGlow,
      verified: !!d.verified,
      sameTab: !!d.sameTab,
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
    return 'py-3 px-4 text-sm';
  }

  function btnClasses(d, compact) {
    const sc = shapeClass(d.shape);
    const sz = compact ? 'py-2.5 px-3 text-xs' : sizeClass(d.btnSize);
    let fill = 'bg-panel border border-white/10 text-mist';
    if (d.btnStyle === 'solid') fill = 'bg-neon text-void border border-neon font-semibold';
    if (d.btnStyle === 'ghost') fill = 'bg-transparent border border-white/20 text-mist';
    if (d.btnStyle === 'soft') fill = 'bg-neon/15 border border-neon/30 text-neon';
    const glow = d.btnGlow ? ' shadow-[0_0_16px_rgba(10,132,255,0.25)]' : '';
    return `link-btn block w-full ${sz} ${sc} ${fill}${glow} font-medium mb-2.5`;
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function renderProfile(page, container, opts = {}) {
    const d = normalize(page);
    const compact = !!opts.compact;
    const avSize = compact ? 'w-16 h-16' : 'w-24 h-24';
    const nameClass = compact ? 'text-base' : 'text-xl';
    const socialSize = compact ? 'w-9 h-9 text-sm' : 'w-10 h-10 text-base';
    const target = d.sameTab ? '_self' : '_blank';

    const active = SOCIAL_DEFS.filter(s => d.social[s.id] && String(d.social[s.id]).trim());
    const socialHtml = active.length
      ? `<div class="flex flex-wrap justify-center gap-2 ${compact ? 'mb-5' : 'mb-6'}">${active.map(s =>
          `<a href="${esc(d.social[s.id])}" target="${target}" rel="noopener" title="${esc(s.label)}" class="social-btn ${socialSize} rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-mist"><i class="${s.icon}"></i></a>`
        ).join('')}</div>`
      : '';

    const linksHtml = (d.links || [])
      .filter(l => l.title || l.url || l.type === 'spacer')
      .map(l => {
        if (l.type === 'heading') {
          return `<h2 class="text-left text-sm font-semibold text-white mt-3 mb-2 px-1">${esc(l.title)}</h2>`;
        }
        if (l.type === 'spacer') {
          return `<div class="h-3"></div>`;
        }
        if (l.type === 'text') {
          return `<p class="text-left text-xs text-steel mb-3 px-1 leading-relaxed">${esc(l.title)}</p>`;
        }
        const href = l.type === 'email' ? (l.url.startsWith('mailto:') ? l.url : 'mailto:' + l.url)
          : l.type === 'phone' ? (l.url.startsWith('tel:') ? l.url : 'tel:' + l.url)
          : (l.url || '#');
        return `<a href="${esc(href)}" target="${target}" rel="noopener" class="${btnClasses(d, compact)}">${esc(l.title) || 'Enlace'}</a>`;
      }).join('');

    const badge = d.verified
      ? `<span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-neon text-void text-[9px] ml-1 align-middle" title="Verificado">✓</span>`
      : '';

    const avatar = d.avatar
      ? `<img src="${esc(d.avatar)}" alt="" class="${avSize} rounded-full mx-auto mb-3 object-cover border-2 border-neon/40" onerror="this.style.opacity='0.3'">`
      : `<div class="${avSize} rounded-full mx-auto mb-3 bg-panel border-2 border-white/10 flex items-center justify-center text-steel text-lg">${esc((d.name || '?')[0].toUpperCase())}</div>`;

    const bgStyle = d.bgImage
      ? `background-image:url('${esc(d.bgImage)}');background-size:cover;background-position:center;`
      : '';

    container.innerHTML = `
      <div class="${d.bgImage ? 'rounded-2xl p-4 -mx-1' : ''}" style="${bgStyle}">
      ${d.bgImage ? '<div class="rounded-xl bg-void/80 backdrop-blur-sm p-3">' : ''}
      ${avatar}
      <h1 class="${nameClass} font-semibold text-white mb-1.5">${esc(d.name) || 'Nombre'}${badge}</h1>
      <p class="text-${compact ? '[11px]' : 'sm'} text-steel mb-4 leading-relaxed ${compact ? '' : 'max-w-sm mx-auto'}">${esc(d.bio)}</p>
      ${socialHtml}
      <div class="space-y-0">${linksHtml || `<p class="text-[10px] text-steel/50">Sin enlaces</p>`}</div>
      <p class="mt-5 text-[10px] text-steel/40">privtr.ee/${esc(d.username)}</p>
      ${d.bgImage ? '</div>' : ''}
      </div>
    `;
  }

  return {
    SOCIAL_DEFS, DOMAINS,
    defaultPage, sanitizeUsername, load, save, listUsers, exportAll,
    shapeClass, sizeClass, btnClasses, esc, renderProfile, normalize,
  };
})();
