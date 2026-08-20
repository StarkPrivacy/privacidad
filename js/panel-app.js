let state = PrivStore.defaultPage('stark');
let nid = 20;
let dragId = null;
let saveTimer = null;
let socialExpanded = false;

function init() {
  const loaded = PrivStore.load();
  state = loaded || PrivStore.starkDemo();
  nid = Math.max(20, ...(state.links.map(l => l.id || 0)), 0) + 1;
  fillForm(); renderSocialForm(); renderLinksForm(); updateChips(); refresh();
}

function loadStarkDemo() {
  if (!confirm('¿Cargar demo @stark? Sustituye el contenido actual.')) return;
  state = PrivStore.starkDemo();
  nid = 30;
  fillForm(); renderSocialForm(); renderLinksForm(); updateChips(); refresh(); doSave(true);
}

function fillForm() {
  document.getElementById('name').value = state.name || '';
  document.getElementById('bio').value = state.bio || '';
  document.getElementById('username').value = state.username || '';
  const bg = document.getElementById('btnGlow'); if (bg) bg.checked = !!state.btnGlow;
  const st = document.getElementById('sameTab'); if (st) st.checked = !!state.sameTab;
  const ot = document.getElementById('ogTitle'); if (ot) ot.value = state.ogTitle || '';
  const od = document.getElementById('ogDesc'); if (od) od.value = state.ogDesc || '';
  const ac = state.accentColor || '#0a84ff';
  const acEl = document.getElementById('accentColor'); if (acEl) acEl.value = ac;
  const hx = document.getElementById('accentHex'); if (hx) hx.value = ac;
  const c = state.contact || PrivStore.emptyContact();
  const ce = document.getElementById('contact-enabled');
  if (ce) {
    ce.checked = !!c.enabled;
    document.getElementById('c-title').value = c.title || '';
    document.getElementById('c-org').value = c.org || '';
    document.getElementById('c-note').value = c.note || '';
    document.getElementById('c-email').value = c.email || '';
    document.getElementById('c-phone').value = c.phone || '';
    document.getElementById('c-web').value = c.web || '';
    document.getElementById('contact-fields').classList.toggle('hidden', !c.enabled);
  }
  updateImageHints();
  updateModeChips();
}

function updateImageHints() {
  const av = document.getElementById('avatar-hint');
  const bg = document.getElementById('bg-hint');
  if (av) av.textContent = state.avatar ? (state.avatar.indexOf('data:') === 0 ? 'Subida' : 'URL') : 'Ninguna';
  if (bg) bg.textContent = state.bgImage ? (state.bgImage.indexOf('data:') === 0 ? 'Subida' : 'URL') : 'Ninguna';
}

function onField() {
  state.name = document.getElementById('name').value;
  state.bio = document.getElementById('bio').value;
  state.username = PrivStore.sanitizeUsername(document.getElementById('username').value);
  document.getElementById('username').value = state.username;
  refresh(); scheduleSave();
}

function setProfileMode(mode) {
  state.profileMode = mode;
  if (mode === 'card') {
    if (!state.contact) state.contact = PrivStore.emptyContact();
    state.contact.enabled = true;
    const ce = document.getElementById('contact-enabled');
    if (ce) { ce.checked = true; document.getElementById('contact-fields').classList.remove('hidden'); }
  }
  updateModeChips(); refresh(); scheduleSave();
}

function updateModeChips() {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('on', b.dataset.v === state.profileMode));
}

function onContactToggle() {
  if (!state.contact) state.contact = PrivStore.emptyContact();
  state.contact.enabled = document.getElementById('contact-enabled').checked;
  document.getElementById('contact-fields').classList.toggle('hidden', !state.contact.enabled);
  refresh(); scheduleSave();
}

function onContactField() {
  if (!state.contact) state.contact = PrivStore.emptyContact();
  state.contact.title = document.getElementById('c-title').value;
  state.contact.org = document.getElementById('c-org').value;
  state.contact.note = document.getElementById('c-note').value;
  state.contact.email = document.getElementById('c-email').value;
  state.contact.phone = document.getElementById('c-phone').value;
  state.contact.web = document.getElementById('c-web').value;
  refresh(); scheduleSave();
}

function onAccentColor() {
  const v = document.getElementById('accentColor').value;
  state.accentColor = v;
  document.getElementById('accentHex').value = v;
  refresh(); scheduleSave();
}
function onAccentHex() {
  let v = document.getElementById('accentHex').value.trim();
  if (v && v.charAt(0) !== '#') v = '#' + v;
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) {
    state.accentColor = v;
    document.getElementById('accentColor').value = v.length === 4
      ? '#' + v[1]+v[1]+v[2]+v[2]+v[3]+v[3] : v;
    refresh(); scheduleSave();
  }
}

function onAvatarFile(ev) {
  const f = ev.target.files && ev.target.files[0]; if (!f) return;
  PrivStore.readImageFile(f, 512, 200000).then(function (data) {
    state.avatar = data; updateImageHints(); refresh(); scheduleSave(); showToast('Avatar listo');
  }).catch(function (e) { alert(e.message); });
  ev.target.value = '';
}
function onBgFile(ev) {
  const f = ev.target.files && ev.target.files[0]; if (!f) return;
  PrivStore.readImageFile(f, 1600, 450000).then(function (data) {
    state.bgImage = data; updateImageHints(); refresh(); scheduleSave(); showToast('Fondo listo');
  }).catch(function (e) { alert(e.message); });
  ev.target.value = '';
}
function clearAvatar() { state.avatar = ''; updateImageHints(); refresh(); scheduleSave(); }
function clearBg() { state.bgImage = ''; updateImageHints(); refresh(); scheduleSave(); }

function refresh() {
  document.getElementById('public-link').href = 'u.html?u=' + encodeURIComponent(state.username);
  const wrap = document.getElementById('av-wrap');
  if (state.avatar) wrap.innerHTML = '<img src="' + PrivStore.esc(state.avatar) + '" class="w-full h-full object-cover">';
  else wrap.textContent = (state.name || '?')[0].toUpperCase();
  renderDomains();
  PrivStore.renderProfile(state, document.getElementById('preview'), { compact: true });
}

function renderDomains() {
  const el = document.getElementById('domain-list');
  if (!el) return;
  const u = state.username || '…';
  el.innerHTML = PrivStore.DOMAINS.map(function (d) {
    return '<div class="flex items-center gap-2 p-2.5 rounded-lg bg-void border border-white/10">' +
      '<span class="flex-1 text-xs font-mono text-mist truncate">' + d + '/@' + u + '</span>' +
      '<button type="button" onclick="copyDomain(\'' + d + '\')" class="text-[11px] px-2.5 py-1 rounded-md border border-neon/30 text-neon">Copiar</button></div>';
  }).join('');
}
function copyDomain(domain) {
  navigator.clipboard.writeText('https://' + domain + '/@' + state.username);
  showToast('Copiado');
}

function renderSocialForm() {
  const filled = [];
  const empty = [];
  PrivStore.SOCIAL_DEFS.forEach(function (s) {
    const v = (state.social[s.id] || '').trim();
    if (v) filled.push(s); else empty.push(s);
  });
  const showAll = !filled.length || socialExpanded;
  const list = showAll ? filled.concat(empty) : filled;
  const el = document.getElementById('social-list');
  el.innerHTML = list.map(function (s) {
    return '<div class="flex items-center gap-2 p-2.5 rounded-xl bg-panel border border-white/5">' +
      '<span class="w-8 text-center text-mist"><i class="' + s.icon + '"></i></span>' +
      '<div class="flex-1 min-w-0"><div class="text-[10px] text-steel">' + s.label + '</div>' +
      '<input value="' + PrivStore.esc(state.social[s.id] || '') + '" placeholder="' + s.placeholder + '" ' +
      'class="w-full bg-transparent text-sm text-white focus:outline-none" ' +
      'oninput="onSocialInput(\'' + s.id + '\',this.value)"></div></div>';
  }).join('');
  const btn = document.getElementById('social-more-btn');
  if (!btn) return;
  if (!filled.length) {
    btn.classList.add('hidden');
    socialExpanded = true;
  } else if (empty.length) {
    btn.classList.remove('hidden');
    btn.textContent = socialExpanded ? 'Ver menos' : 'Ver más redes (' + empty.length + ')';
  } else {
    btn.classList.add('hidden');
  }
}
function onSocialInput(id, val) {
  state.social[id] = val;
  refresh(); scheduleSave();
}
function toggleSocialMore() {
  socialExpanded = !socialExpanded;
  renderSocialForm();
}

function typeLabel(t) {
  return { link: 'Enlace', heading: 'Título', text: 'Texto', spacer: 'Espacio' }[t] || t;
}
function colorOptions(selected) {
  return PrivStore.PRESET_COLORS.map(function (c) {
    return '<option value="' + c.id + '"' + (selected === c.id ? ' selected' : '') + '>' + c.label + '</option>';
  }).join('') +
    '<option value="custom"' + (selected === 'custom' ? ' selected' : '') + '>Personalizado #</option>' +
    '<option value=""' + (!selected ? ' selected' : '') + '>Global</option>';
}
function brandOptions(selected) {
  return PrivStore.BRANDS.map(function (b) {
    return '<option value="' + b.id + '"' + (selected === b.id ? ' selected' : '') + '>' + b.label + '</option>';
  }).join('');
}
function iconModeOptions(selected) {
  const opts = [
    { id: 'none', label: 'Sin icono' },
    { id: 'favicon', label: 'Favicon web' },
    { id: 'preset', label: 'Icono predeterminado' },
  ];
  return opts.map(function (o) {
    return '<option value="' + o.id + '"' + (selected === o.id ? ' selected' : '') + '>' + o.label + '</option>';
  }).join('');
}
function presetIconOptions(selected) {
  return PrivStore.ICON_PRESETS.map(function (p) {
    return '<option value="' + p.icon + '"' + (selected === p.icon ? ' selected' : '') + '>' + p.id + '</option>';
  }).join('');
}

function renderLinksForm() {
  const el = document.getElementById('link-list');
  if (!state.links.length) {
    el.innerHTML = '<p class="text-xs text-steel py-4 text-center border border-dashed border-white/10 rounded-xl">Sin enlaces</p>';
    return;
  }
  el.innerHTML = state.links.map(function (l) {
    const isBlock = l.type === 'heading' || l.type === 'text' || l.type === 'spacer';
    const isSpacer = l.type === 'spacer';
    const showStyle = !isBlock && l.type !== 'text';
    const isCustom = l.color === 'custom' || (l.customColor && l.customColor.charAt(0) === '#');
    let body = isSpacer ? '<p class="text-xs text-steel">Espaciador</p>' :
      '<input value="' + PrivStore.esc(l.title) + '" onchange="updLink(' + l.id + ',\'title\',this.value)" class="w-full bg-transparent text-sm text-white font-medium" placeholder="Título">' +
      ((!isBlock || l.type === 'text') ? '<input value="' + PrivStore.esc(l.url) + '" onchange="updLink(' + l.id + ',\'url\',this.value)" class="w-full bg-transparent text-xs text-steel" placeholder="https://">' : '') +
      (showStyle ? '<div class="flex gap-2 flex-wrap items-center">' +
        '<select onchange="applyBrand(' + l.id + ',this.value)" class="text-[11px] bg-void border border-white/10 rounded-lg px-2 py-1 text-mist">' + brandOptions(l.brand || 'custom') + '</select>' +
        '<select onchange="onLinkColor(' + l.id + ',this.value)" class="text-[11px] bg-void border border-white/10 rounded-lg px-2 py-1 text-mist">' + colorOptions(isCustom ? 'custom' : l.color) + '</select>' +
        (isCustom ? '<input type="color" value="' + PrivStore.esc(l.customColor || '#0a84ff') + '" oninput="updLinkCustomColor(' + l.id + ',this.value)" class="w-7 h-7 rounded border border-white/10 bg-void cursor-pointer">' +
          '<input value="' + PrivStore.esc(l.customColor || '#0a84ff') + '" maxlength="7" onchange="updLinkCustomColor(' + l.id + ',this.value)" class="w-20 text-[11px] bg-void border border-white/10 rounded-lg px-1.5 py-1 text-mist font-mono">' : '') +
        '</div>' +
        '<div class="flex gap-2 flex-wrap items-center">' +
        '<select onchange="onIconMode(' + l.id + ',this.value)" class="text-[11px] bg-void border border-white/10 rounded-lg px-2 py-1 text-mist">' + iconModeOptions(l.iconMode || 'none') + '</select>' +
        (l.iconMode === 'preset' ? '<select onchange="updLink(' + l.id + ',\'icon\',this.value)" class="text-[11px] bg-void border border-white/10 rounded-lg px-2 py-1 text-mist">' + presetIconOptions(l.icon) + '</select>' : '') +
        (l.iconMode === 'favicon' ? '<span class="text-[10px] text-steel">Carga el favicon del dominio (opcional)</span>' : '') +
        '</div>' : '');
    return '<div class="flex gap-2 p-3 rounded-xl bg-panel border border-white/5" draggable="true" data-id="' + l.id + '" ondragstart="dragStart(event,' + l.id + ')" ondragover="dragOver(event)" ondrop="drop(event,' + l.id + ')" ondragend="dragEnd(event)">' +
      '<span class="text-steel cursor-grab self-center">⠿</span><div class="flex-1 space-y-1.5 min-w-0"><div class="text-[10px] text-neon/80">' + typeLabel(l.type) + '</div>' + body + '</div>' +
      '<button type="button" onclick="delLink(' + l.id + ')" class="text-steel hover:text-red-400 self-center">✕</button></div>';
  }).join('');
}

function onLinkColor(id, val) {
  const l = state.links.find(function (x) { return x.id === id; });
  if (!l) return;
  if (val === 'custom') {
    l.color = 'custom';
    if (!l.customColor) l.customColor = '#0a84ff';
  } else {
    l.color = val;
    l.customColor = '';
  }
  renderLinksForm(); refresh(); scheduleSave();
}
function updLinkCustomColor(id, val) {
  const l = state.links.find(function (x) { return x.id === id; });
  if (!l) return;
  if (val && val.charAt(0) !== '#') val = '#' + val;
  l.color = 'custom';
  l.customColor = val;
  refresh(); scheduleSave();
}
function onIconMode(id, mode) {
  const l = state.links.find(function (x) { return x.id === id; });
  if (!l) return;
  l.iconMode = mode;
  if (mode === 'preset' && !l.icon) l.icon = 'fa-solid fa-link';
  renderLinksForm(); refresh(); scheduleSave();
}

function applyBrand(id, brandId) {
  const l = state.links.find(function (x) { return x.id === id; });
  const b = PrivStore.BRANDS.find(function (x) { return x.id === brandId; });
  if (!l || !b) return;
  l.brand = brandId; l.icon = b.icon; if (b.color) l.color = b.color;
  if (l.iconMode !== 'favicon') l.iconMode = 'preset';
  renderLinksForm(); refresh(); scheduleSave();
}
function addLink(type) {
  type = type || 'link';
  const defaults = {
    link: { title: '', url: '', color: 'blue', icon: 'fa-solid fa-link', brand: 'custom', iconMode: 'preset' },
    heading: { title: 'Sección', url: '', color: '', icon: '', brand: '', iconMode: 'none' },
    text: { title: 'Texto…', url: '', color: '', icon: '', brand: '', iconMode: 'none' },
    spacer: { title: '', url: '', color: '', icon: '', brand: '', iconMode: 'none' },
  };
  const d = defaults[type] || defaults.link;
  state.links.push({ id: nid++, type: type, title: d.title, url: d.url, color: d.color, icon: d.icon, brand: d.brand, iconMode: d.iconMode, customColor: '' });
  renderLinksForm(); refresh(); scheduleSave();
}
function updLink(id, f, v) {
  const l = state.links.find(function (x) { return x.id === id; });
  if (l) { l[f] = v; refresh(); scheduleSave(); }
}
function delLink(id) {
  state.links = state.links.filter(function (x) { return x.id !== id; });
  renderLinksForm(); refresh(); scheduleSave();
}
function dragStart(e, id) { dragId = id; e.currentTarget.classList.add('opacity-50'); }
function dragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function dragEnd() { document.querySelectorAll('#link-list > div').forEach(function (d) { d.classList.remove('drag-over', 'opacity-50'); }); }
function drop(e, targetId) {
  e.preventDefault();
  if (dragId == null || dragId === targetId) return;
  const from = state.links.findIndex(function (l) { return l.id === dragId; });
  const to = state.links.findIndex(function (l) { return l.id === targetId; });
  if (from < 0 || to < 0) return;
  const item = state.links.splice(from, 1)[0];
  state.links.splice(to, 0, item);
  dragId = null; renderLinksForm(); refresh(); scheduleSave();
}
function setOpt(key, val) { state[key] = val; updateChips(); refresh(); scheduleSave(); }
function updateChips() {
  document.querySelectorAll('.shape-btn').forEach(function (b) { b.classList.toggle('on', b.dataset.v === state.shape); });
  document.querySelectorAll('.style-btn').forEach(function (b) { b.classList.toggle('on', b.dataset.v === state.btnStyle); });
  document.querySelectorAll('.size-btn').forEach(function (b) { b.classList.toggle('on', b.dataset.v === state.btnSize); });
}
function tab(btn) {
  document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); t.classList.add('text-steel'); });
  btn.classList.add('active'); btn.classList.remove('text-steel');
  document.querySelectorAll('[id^=t-]').forEach(function (e) { e.classList.add('hidden'); });
  document.getElementById('t-' + btn.dataset.tab).classList.remove('hidden');
  if (btn.dataset.tab === 'redes') renderSocialForm();
}
function scheduleSave() {
  const a = document.getElementById('autosave');
  if (a && !a.checked) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () { doSave(false); }, 600);
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.remove('opacity-0');
  setTimeout(function () { t.classList.add('opacity-0'); }, 1800);
}
function doSave(manual) {
  try { state = PrivStore.save(state); showToast(manual ? 'Guardado ✓' : 'Auto-guardado'); }
  catch (e) { showToast('Almacenamiento lleno'); return; }
  if (manual) {
    const b = document.getElementById('btn-save');
    b.textContent = 'Guardado ✓';
    setTimeout(function () { b.textContent = 'Guardar'; }, 1200);
  }
}
function exportJSON() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  a.download = state.username + '-priv.json'; a.click(); showToast('Exportado');
}
function importJSON(ev) {
  const f = ev.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = function () {
    try {
      state = PrivStore.normalize(JSON.parse(r.result));
      fillForm(); renderSocialForm(); renderLinksForm(); updateChips(); refresh(); doSave(true);
    } catch (e) { alert('JSON inválido'); }
  };
  r.readAsText(f);
}
function demoPassword() {
  showToast('En producción se cambiará en el servidor');
  document.getElementById('pw-current').value = '';
  document.getElementById('pw-new').value = '';
}
function demo2FA(el) {
  showToast(el.checked ? '2FA activado (demo)' : '2FA desactivado (demo)');
}
init();
