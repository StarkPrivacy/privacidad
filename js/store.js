/**
 * Privacidad.me — data layer (localStorage demo).
 * When connecting LinkStack/Laravel, replace only the I/O methods below.
 */
const PrivStore = (() => {
  const SOCIAL_DEFS = [
    { id: 'x', label: 'X / Twitter', icon: '𝕏', placeholder: 'https://x.com/...' },
    { id: 'telegram', label: 'Telegram', icon: '✈', placeholder: 'https://t.me/...' },
    { id: 'github', label: 'GitHub', icon: '⌥', placeholder: 'https://github.com/...' },
    { id: 'youtube', label: 'YouTube', icon: '▶', placeholder: 'https://youtube.com/...' },
    { id: 'instagram', label: 'Instagram', icon: '◎', placeholder: 'https://instagram.com/...' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'in', placeholder: 'https://linkedin.com/in/...' },
    { id: 'matrix', label: 'Matrix', icon: '⬡', placeholder: 'https://matrix.to/...' },
    { id: 'email', label: 'Email', icon: '✉', placeholder: 'mailto:...' },
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
      bio: '',
      avatar: '',
      theme: 'dark',
      shape: 'rounded',
      social: emptySocial(),
      links: [],
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
      })) : [],
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
        try {
          out.push(normalize(JSON.parse(localStorage.getItem(k))));
        } catch (e) {}
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

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function renderProfile(page, container, opts = {}) {
    const d = normalize(page);
    const sc = shapeClass(d.shape);
    const compact = !!opts.compact;
    const avSize = compact ? 'w-16 h-16' : 'w-24 h-24';
    const nameClass = compact ? 'text-base' : 'text-xl';
    const linkPad = compact ? 'py-2.5 px-3 text-xs' : 'py-3.5 px-4 text-sm';
    const socialSize = compact ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-sm';

    const active = SOCIAL_DEFS.filter(s => d.social[s.id] && String(d.social[s.id]).trim());
    const socialHtml = active.length
      ? `<div class="flex flex-wrap justify-center gap-2 ${compact ? 'mb-5' : 'mb-6'}">${active.map(s =>
          `<a href="${esc(d.social[s.id])}" target="_blank" rel="noopener" class="social-btn ${socialSize} rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-mist">${s.icon}</a>`
        ).join('')}</div>`
      : '';

    const linksHtml = (d.links || [])
      .filter(l => l.title || l.url)
      .map(l =>
        `<a href="${esc(l.url || '#')}" target="_blank" rel="noopener" class="link-btn block w-full ${linkPad} ${sc} bg-panel border border-white/10 text-mist font-medium mb-2.5">${esc(l.title) || 'Enlace'}</a>`
      ).join('');

    const avatar = d.avatar
      ? `<img src="${esc(d.avatar)}" alt="" class="${avSize} rounded-full mx-auto mb-3 object-cover border-2 border-neon/40" onerror="this.style.opacity='0.3'">`
      : `<div class="${avSize} rounded-full mx-auto mb-3 bg-panel border-2 border-white/10 flex items-center justify-center text-steel text-lg">${esc((d.name || '?')[0].toUpperCase())}</div>`;

    container.innerHTML = `
      ${avatar}
      <h1 class="${nameClass} font-semibold text-white mb-1.5">${esc(d.name) || 'Nombre'}</h1>
      <p class="text-${compact ? '[11px]' : 'sm'} text-steel mb-4 leading-relaxed ${compact ? '' : 'max-w-sm mx-auto'}">${esc(d.bio)}</p>
      ${socialHtml}
      <div class="space-y-0">${linksHtml || `<p class="text-[10px] text-steel/50">Sin enlaces</p>`}</div>
      <p class="mt-5 text-[10px] text-steel/40">privtr.ee/${esc(d.username)}</p>
    `;
  }

  return {
    SOCIAL_DEFS,
    defaultPage,
    sanitizeUsername,
    load,
    save,
    listUsers,
    exportAll,
    shapeClass,
    esc,
    renderProfile,
    normalize,
  };
})();
