let state = PrivStore.defaultPage('stark');
let nid = 20;
let dragId = null;
let saveTimer = null;

function init() {
  const loaded = PrivStore.load();
  if (loaded) state = loaded;
  else state = PrivStore.starkDemo();
  nid = Math.max(20, ...(state.links.map(l => l.id || 0)), 0) + 1;
  fillForm();
  renderSocialForm();
  renderLinksForm();
  updateChips();
  refresh();
}

function loadStarkDemo() {
  if (!confirm('¿Cargar el perfil demo de Stark Privacy? Sustituye el contenido actual.')) return;
  state = PrivStore.starkDemo();
  nid = Math.max(20, ...(state.links.map(l => l.id || 0)), 0) + 1;
  fillForm(); renderSocialForm(); renderLinksForm(); updateChips(); refresh(); doSave(true);
}

function fillForm() {
  document.getElementById('name').value = state.name || '';
  document.getElementById('bio').value = state.bio || '';
  document.getElementById('username').value = state.username || '';
  document.getElementById('verified').checked = !!state.verified;
  document.getElementById('btnGlow').checked = !!state.btnGlow;
  document.getElementById('sameTab').checked = !!state.sameTab;
  document.getElementById('ogTitle').value = state.ogTitle || '';
  document.getElementById('ogDesc').value = state.ogDesc || '';
  updateImageHints();
}

function updateImageHints() {
  const avHint = document.getElementById('avatar-hint');
  const bgHint = document.getElementById('bg-hint');
  if (avHint) avHint.textContent = state.avatar ? (state.avatar.startsWith('data:') ? 'Imagen subida' : 'URL externa') : 'Ninguna';
  if (bgHint) bgHint.textContent = state.bgImage ? (state.bgImage.startsWith('data:') ? 'Imagen subida' : 'URL externa') : 'Ninguna';
}

function onField() {
  state.name = document.getElementById('name').value;
  state.bio = document.getElementById('bio').value;
  state.username = PrivStore.sanitizeUsername(document.getElementById('username').value);
  document.getElementById('username').value = state.username;
  refresh();
  scheduleSave();
}

function onAvatarFile(ev) {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  PrivStore.readImageFile(f, 512, 200000).then(function (data) {
    state.avatar = data;
    updateImageHints();
    refresh();
    scheduleSave();
    showToast('Avatar actualizado');
  }).catch(function (e) { alert(e.message); });
  ev.target.value = '';
}

function onBgFile(ev) {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  PrivStore.readImageFile(f, 1600, 450000).then(function (data) {
    state.bgImage = data;
    updateImageHints();
    refresh();
    scheduleSave();
    showToast('Fondo actualizado');
  }).catch(function (e) { alert(e.message); });
  ev.target.value = '';
}

function clearAvatar() { state.avatar = ''; updateImageHints(); refresh(); scheduleSave(); }
function clearBg() { state.bgImage = ''; updateImageHints(); refresh(); scheduleSave(); }

function refresh() {
  document.getElementById('public-link').href = 'u.html?u=' + encodeURIComponent(state.username);
  const wrap = document.getElementById('av-wrap');
  if (state.avatar) {
    wrap.innerHTML = '<img src="' + PrivStore.esc(state.avatar) + '" class="w-full h-full object-cover" onerror="this.parentElement.textContent=\'?\'">';
  } else {
    wrap.textContent = (state.name || '?')[0].toUpperCase();
  }
  renderDomains();
  PrivStore.renderProfile(state, document.getElementById('preview'), { compact: true });
}

function renderDomains() {
  const u = state.username || '…';
  document.getElementById('domain-list').innerHTML = PrivStore.DOMAINS.map(d =>
    '<div class="flex items-center gap-2 p-2.5 rounded-lg bg-void border border-white/10">' +
    '<span class="flex-1 text-xs font-mono text-mist truncate">' + d + '/@' + u + '</span>' +
    '<button type="button" onclick="copyDomain(\'' + d + '\')" class="text-[11px] px-2.5 py-1 rounded-md border border-neon/30 text-neon shrink-0">Copiar</button></div>'
  ).join('');
}

function copyDomain(domain) {
  navigator.clipboard.writeText('https://' + domain + '/@' + state.username);
  showToast('Copiado: ' + domain + '/@' + state.username);
}

function renderSocialForm() {
  document.getElementById('social-list').innerHTML = PrivStore.SOCIAL_DEFS.map(s =>
    '<div class="flex items-center gap-2 p-2.5 rounded-xl bg-panel border border-white/5">' +
    '<span class="w-8 text-center text-mist"><i class="' + s.icon + '"></i></span>' +
    '<div class="flex-1 min-w-0"><div class="text-[10px] text-steel">' + s.label + '</div>' +
    '<input value="' + PrivStore.esc(state.social[s.id] || '') + '" placeholder="' + s.placeholder + '" ' +
    'class="w-full bg-transparent text-sm text-white focus:outline-none" ' +
    'oninput="state.social[\'' + s.id + '\']=this.value;refresh();scheduleSave()"></div></div>'
  ).join('');
}

function typeLabel(t) {
  return { link: 'Enlace', heading: 'Título', text: 'Texto', spacer: 'Espacio', email: 'Email', phone: 'Tel.', vcard: 'vCard (contacto)' }[t] || t;
}

function colorOptions(selected) {
  return PrivStore.PRESET_COLORS.map(c =>
    '<option value="' + c.id + '"' + (selected === c.id ? ' selected' : '') + '>' + c.label + '</option>'
  ).join('') + '<option value=""' + (!selected ? ' selected' : '') + '>Global</option>';
}

function brandOptions(selected) {
  return PrivStore.BRANDS.map(b =>
    '<option value="' + b.id + '"' + (selected === b.id ? ' selected' : '') + '>' + b.label + '</option>'
  ).join('');
}

function renderLinksForm() {
  const el = document.getElementById('link-list');
  if (!state.links.length) {
    el.innerHTML = '<p class="text-xs text-steel py-4 text-center border border-dashed border-white/10 rounded-xl">Sin elementos.</p>';
    return;
  }
  el.innerHTML = state.links.map(l => {
    const isBlock = l.type === 'heading' || l.type === 'text' || l.type === 'spacer';
    const isSpacer = l.type === 'spacer';
    const isVcard = l.type === 'vcard';
    const showStyle = !isBlock && l.type !== 'text';
    let body = '';
    if (isSpacer) {
      body = '<p class="text-xs text-steel">Espaciador visual</p>';
    } else if (isVcard) {
      const vc = l.vcard || PrivStore.emptyVcard();
      body =
        '<input value="' + PrivStore.esc(l.title) + '" onchange="updLink(' + l.id + ',\'title\',this.value)" class="w-full bg-transparent text-sm text-white font-medium" placeholder="Texto del botón">' +
        '<div class="grid grid-cols-2 gap-1.5 mt-1">' +
        '<input value="' + PrivStore.esc(vc.firstName) + '" onchange="updVcard(' + l.id + ',\'firstName\',this.value)" class="bg-void border border-white/10 rounded-lg px-2 py-1 text-[11px] text-mist" placeholder="Nombre">' +
        '<input value="' + PrivStore.esc(vc.lastName) + '" onchange="updVcard(' + l.id + ',\'lastName\',this.value)" class="bg-void border border-white/10 rounded-lg px-2 py-1 text-[11px] text-mist" placeholder="Apellidos">' +
        '<input value="' + PrivStore.esc(vc.org) + '" onchange="updVcard(' + l.id + ',\'org\',this.value)" class="bg-void border border-white/10 rounded-lg px-2 py-1 text-[11px] text-mist col-span-2" placeholder="Organización">' +
        '<input value="' + PrivStore.esc(vc.email) + '" onchange="updVcard(' + l.id + ',\'email\',this.value)" class="bg-void border border-white/10 rounded-lg px-2 py-1 text-[11px] text-mist" placeholder="Email">' +
        '<input value="' + PrivStore.esc(vc.phone) + '" onchange="updVcard(' + l.id + ',\'phone\',this.value)" class="bg-void border border-white/10 rounded-lg px-2 py-1 text-[11px] text-mist" placeholder="Teléfono">' +
        '<input value="' + PrivStore.esc(vc.url) + '" onchange="updVcard(' + l.id + ',\'url\',this.value)" class="bg-void border border-white/10 rounded-lg px-2 py-1 text-[11px] text-mist col-span-2" placeholder="Web">' +
        '</div>' +
        '<div class="flex gap-2 flex-wrap items-center mt-1">' +
        '<select onchange="updLink(' + l.id + ',\'color\',this.value)" class="text-[11px] bg-void border border-white/10 rounded-lg px-2 py-1 text-mist">' + colorOptions(l.color) + '</select>' +
        '</div>';
    } else {
      body =
        '<input value="' + PrivStore.esc(l.title) + '" onchange="updLink(' + l.id + ',\'title\',this.value)" class="w-full bg-transparent text-sm text-white font-medium" placeholder="' + (isBlock ? 'Contenido' : 'Título') + '">' +
        ((!isBlock || l.type === 'text')
          ? '<input value="' + PrivStore.esc(l.url) + '" onchange="updLink(' + l.id + ',\'url\',this.value)" class="w-full bg-transparent text-xs text-steel" placeholder="' +
            (l.type === 'email' ? 'email@…' : l.type === 'phone' ? '+34…' : l.type === 'text' ? 'URL opcional' : 'https://') + '">' : '') +
        (showStyle
          ? '<div class="flex gap-2 flex-wrap items-center">' +
            '<select onchange="applyBrand(' + l.id + ',this.value)" class="text-[11px] bg-void border border-white/10 rounded-lg px-2 py-1 text-mist" title="Marca">' + brandOptions(l.brand || 'custom') + '</select>' +
            '<select onchange="updLink(' + l.id + ',\'color\',this.value)" class="text-[11px] bg-void border border-white/10 rounded-lg px-2 py-1 text-mist">' + colorOptions(l.color) + '</select>' +
            '</div>' : '');
    }
    return '<div class="flex gap-2 p-3 rounded-xl bg-panel border border-white/5" draggable="true" data-id="' + l.id + '" ' +
      'ondragstart="dragStart(event,' + l.id + ')" ondragover="dragOver(event)" ondrop="drop(event,' + l.id + ')" ondragend="dragEnd(event)">' +
      '<span class="text-steel cursor-grab self-center select-none px-0.5">⠿</span>' +
      '<div class="flex-1 space-y-1.5 min-w-0">' +
      '<div class="text-[10px] text-neon/80">' + typeLabel(l.type) + '</div>' + body +
      '</div>' +
      '<button type="button" onclick="delLink(' + l.id + ')" class="text-steel hover:text-red-400 self-center p-1">✕</button></div>';
  }).join('');
}

function applyBrand(id, brandId) {
  const l = state.links.find(x => x.id === id);
  const b = PrivStore.BRANDS.find(x => x.id === brandId);
  if (!l || !b) return;
  l.brand = brandId;
  l.icon = b.icon;
  if (b.color) l.color = b.color;
  renderLinksForm(); refresh(); scheduleSave();
}

function addLink(type) {
  type = type || 'link';
  const defaults = {
    link: { title: '', url: '', color: 'blue', icon: 'fa-solid fa-link', brand: 'custom' },
    heading: { title: 'Sección', url: '', color: '', icon: '', brand: '' },
    text: { title: 'Texto libre…', url: '', color: '', icon: '', brand: '' },
    spacer: { title: '', url: '', color: '', icon: '', brand: '' },
    email: { title: 'Email', url: '', color: 'sky', icon: 'fa-solid fa-envelope', brand: 'email' },
    phone: { title: 'Teléfono', url: '', color: 'green', icon: 'fa-solid fa-phone', brand: 'phone' },
    vcard: { title: 'Guardar contacto', url: '', color: 'neon', icon: 'fa-solid fa-address-card', brand: '',
      vcard: Object.assign(PrivStore.emptyVcard(), { firstName: state.name || '', email: '' }) },
  };
  const d = defaults[type] || defaults.link;
  state.links.push({
    id: nid++, type: type, title: d.title, url: d.url, color: d.color, icon: d.icon, brand: d.brand || '',
    vcard: d.vcard || PrivStore.emptyVcard(),
  });
  renderLinksForm(); refresh(); scheduleSave();
}

function updLink(id, f, v) {
  const l = state.links.find(x => x.id === id);
  if (l) { l[f] = v; refresh(); scheduleSave(); }
}
function updVcard(id, f, v) {
  const l = state.links.find(x => x.id === id);
  if (!l) return;
  if (!l.vcard) l.vcard = PrivStore.emptyVcard();
  l.vcard[f] = v;
  refresh(); scheduleSave();
}
function delLink(id) {
  state.links = state.links.filter(x => x.id !== id);
  renderLinksForm(); refresh(); scheduleSave();
}

function dragStart(e, id) { dragId = id; e.currentTarget.classList.add('opacity-50'); }
function dragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function dragEnd() { document.querySelectorAll('#link-list > div').forEach(d => d.classList.remove('drag-over', 'opacity-50')); }
function drop(e, targetId) {
  e.preventDefault();
  if (dragId == null || dragId === targetId) return;
  const from = state.links.findIndex(l => l.id === dragId);
  const to = state.links.findIndex(l => l.id === targetId);
  if (from < 0 || to < 0) return;
  const item = state.links.splice(from, 1)[0];
  state.links.splice(to, 0, item);
  dragId = null;
  renderLinksForm(); refresh(); scheduleSave();
}

function setOpt(key, val) {
  state[key] = val;
  updateChips();
  refresh();
  scheduleSave();
}
function updateChips() {
  document.querySelectorAll('.shape-btn').forEach(b => b.classList.toggle('on', b.dataset.v === state.shape));
  document.querySelectorAll('.style-btn').forEach(b => b.classList.toggle('on', b.dataset.v === state.btnStyle));
  document.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('on', b.dataset.v === state.btnSize));
}

function tab(btn) {
  document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.classList.add('text-steel'); });
  btn.classList.add('active'); btn.classList.remove('text-steel');
  document.querySelectorAll('[id^=t-]').forEach(e => e.classList.add('hidden'));
  document.getElementById('t-' + btn.dataset.tab).classList.remove('hidden');
}

function scheduleSave() {
  if (!document.getElementById('autosave').checked) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () { doSave(false); }, 600);
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('opacity-0');
  setTimeout(function () { t.classList.add('opacity-0'); }, 1800);
}
function doSave(manual) {
  try {
    state = PrivStore.save(state);
    showToast(manual ? 'Guardado ✓' : 'Auto-guardado');
  } catch (e) {
    showToast('Almacenamiento lleno — reduce imágenes');
    return;
  }
  if (manual) {
    const b = document.getElementById('btn-save');
    b.textContent = 'Guardado ✓';
    setTimeout(function () { b.textContent = 'Guardar'; }, 1200);
  }
}

function exportJSON() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  a.download = state.username + '-priv.json';
  a.click();
  showToast('Exportado');
}
function importJSON(ev) {
  const f = ev.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = function () {
    try {
      state = PrivStore.normalize(JSON.parse(r.result));
      fillForm(); renderSocialForm(); renderLinksForm(); updateChips(); refresh(); doSave(true);
    } catch (e) { alert('JSON inválido'); }
  };
  r.readAsText(f);
}

init();
