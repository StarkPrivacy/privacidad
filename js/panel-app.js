let state = PrivStore.defaultPage('stark');
let nid = 20;
let dragId = null;
let saveTimer = null;

function init() {
  const loaded = PrivStore.load();
  state = loaded || PrivStore.starkDemo();
  nid = Math.max(20, ...(state.links.map(l => l.id || 0)), 0) + 1;
  fillForm(); renderSocialForm(); renderLinksForm(); updateChips(); refresh();
}
function loadStarkDemo() {
  if (!confirm('¿Cargar demo @stark?')) return;
  state = PrivStore.starkDemo(); nid = 30;
  fillForm(); renderSocialForm(); renderLinksForm(); updateChips(); refresh(); doSave(true);
}
function fillForm() {
  document.getElementById('name').value = state.name || '';
  document.getElementById('bio').value = state.bio || '';
  document.getElementById('username').value = state.username || '';
  document.getElementById('verified').checked = !!state.verified;
  var bg = document.getElementById('btnGlow'); if (bg) bg.checked = !!state.btnGlow;
  var st = document.getElementById('sameTab'); if (st) st.checked = !!state.sameTab;
  var ot = document.getElementById('ogTitle'); if (ot) ot.value = state.ogTitle || '';
  var od = document.getElementById('ogDesc'); if (od) od.value = state.ogDesc || '';
  var c = state.contact || PrivStore.emptyContact();
  var ce = document.getElementById('contact-enabled');
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
}
function updateImageHints() {
  var av = document.getElementById('avatar-hint');
  var bg = document.getElementById('bg-hint');
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
function onAvatarFile(ev) {
  var f = ev.target.files && ev.target.files[0]; if (!f) return;
  PrivStore.readImageFile(f, 512, 200000).then(function (data) {
    state.avatar = data; updateImageHints(); refresh(); scheduleSave(); showToast('Avatar listo');
  }).catch(function (e) { alert(e.message); });
  ev.target.value = '';
}
function onBgFile(ev) {
  var f = ev.target.files && ev.target.files[0]; if (!f) return;
  PrivStore.readImageFile(f, 1600, 450000).then(function (data) {
    state.bgImage = data; updateImageHints(); refresh(); scheduleSave(); showToast('Fondo listo');
  }).catch(function (e) { alert(e.message); });
  ev.target.value = '';
}
function clearAvatar() { state.avatar = ''; updateImageHints(); refresh(); scheduleSave(); }
function clearBg() { state.bgImage = ''; updateImageHints(); refresh(); scheduleSave(); }
function refresh() {
  document.getElementById('public-link').href = 'u.html?u=' + encodeURIComponent(state.username);
  var wrap = document.getElementById('av-wrap');
  if (state.avatar) wrap.innerHTML = '<img src="' + PrivStore.esc(state.avatar) + '" class="w-full h-full object-cover">';
  else wrap.textContent = (state.name || '?')[0].toUpperCase();
  renderDomains();
  PrivStore.renderProfile(state, document.getElementById('preview'), { compact: true });
}
function renderDomains() {
  var el = document.getElementById('domain-list');
  if (!el) return;
  var u = state.username || '…';
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
  document.getElementById('social-list').innerHTML = PrivStore.SOCIAL_DEFS.map(function (s) {
    return '<div class="flex items-center gap-2 p-2.5 rounded-xl bg-panel border border-white/5">' +
      '<span class="w-8 text-center text-mist"><i class="' + s.icon + '"></i></span>' +
      '<div class="flex-1 min-w-0"><div class="text-[10px] text-steel">' + s.label + '</div>' +
      '<input value="' + PrivStore.esc(state.social[s.id] || '') + '" placeholder="' + s.placeholder + '" ' +
      'class="w-full bg-transparent text-sm text-white focus:outline-none" ' +
      'oninput="state.social[\'' + s.id + '\']=this.value;refresh();scheduleSave()"></div></div>';
  }).join('');
}
function typeLabel(t) {
  return { link: 'Enlace', heading: 'Título', text: 'Texto', spacer: 'Espacio' }[t] || t;
}
function colorOptions(selected) {
  return PrivStore.PRESET_COLORS.map(function (c) {
    return '<option value="' + c.id + '"' + (selected === c.id ? ' selected' : '') + '>' + c.label + '</option>';
  }).join('') + '<option value=""' + (!selected ? ' selected' : '') + '>Global</option>';
}
function brandOptions(selected) {
  return PrivStore.BRANDS.map(function (b) {
    return '<option value="' + b.id + '"' + (selected === b.id ? ' selected' : '') + '>' + b.label + '</option>';
  }).join('');
}
function renderLinksForm() {
  var el = document.getElementById('link-list');
  if (!state.links.length) {
    el.innerHTML = '<p class="text-xs text-steel py-4 text-center border border-dashed border-white/10 rounded-xl">Sin enlaces</p>';
    return;
  }
  el.innerHTML = state.links.map(function (l) {
    var isBlock = l.type === 'heading' || l.type === 'text' || l.type === 'spacer';
    var isSpacer = l.type === 'spacer';
    var showStyle = !isBlock && l.type !== 'text';
    var body = isSpacer ? '<p class="text-xs text-steel">Espaciador</p>' :
      '<input value="' + PrivStore.esc(l.title) + '" onchange="updLink(' + l.id + ',\'title\',this.value)" class="w-full bg-transparent text-sm text-white font-medium" placeholder="Título">' +
      ((!isBlock || l.type === 'text') ? '<input value="' + PrivStore.esc(l.url) + '" onchange="updLink(' + l.id + ',\'url\',this.value)" class="w-full bg-transparent text-xs text-steel" placeholder="https://">' : '') +
      (showStyle ? '<div class="flex gap-2 flex-wrap"><select onchange="applyBrand(' + l.id + ',this.value)" class="text-[11px] bg-void border border-white/10 rounded-lg px-2 py-1 text-mist">' + brandOptions(l.brand || 'custom') + '</select>' +
        '<select onchange="updLink(' + l.id + ',\'color\',this.value)" class="text-[11px] bg-void border border-white/10 rounded-lg px-2 py-1 text-mist">' + colorOptions(l.color) + '</select></div>' : '');
    return '<div class="flex gap-2 p-3 rounded-xl bg-panel border border-white/5" draggable="true" data-id="' + l.id + '" ondragstart="dragStart(event,' + l.id + ')" ondragover="dragOver(event)" ondrop="drop(event,' + l.id + ')" ondragend="dragEnd(event)">' +
      '<span class="text-steel cursor-grab self-center">⠿</span><div class="flex-1 space-y-1.5 min-w-0"><div class="text-[10px] text-neon/80">' + typeLabel(l.type) + '</div>' + body + '</div>' +
      '<button type="button" onclick="delLink(' + l.id + ')" class="text-steel hover:text-red-400 self-center">✕</button></div>';
  }).join('');
}
function applyBrand(id, brandId) {
  var l = state.links.find(function (x) { return x.id === id; });
  var b = PrivStore.BRANDS.find(function (x) { return x.id === brandId; });
  if (!l || !b) return;
  l.brand = brandId; l.icon = b.icon; if (b.color) l.color = b.color;
  renderLinksForm(); refresh(); scheduleSave();
}
function addLink(type) {
  type = type || 'link';
  var defaults = {
    link: { title: '', url: '', color: 'blue', icon: 'fa-solid fa-link', brand: 'custom' },
    heading: { title: 'Sección', url: '', color: '', icon: '', brand: '' },
    text: { title: 'Texto…', url: '', color: '', icon: '', brand: '' },
    spacer: { title: '', url: '', color: '', icon: '', brand: '' },
  };
  var d = defaults[type] || defaults.link;
  state.links.push({ id: nid++, type: type, title: d.title, url: d.url, color: d.color, icon: d.icon, brand: d.brand });
  renderLinksForm(); refresh(); scheduleSave();
}
function updLink(id, f, v) {
  var l = state.links.find(function (x) { return x.id === id; });
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
  var from = state.links.findIndex(function (l) { return l.id === dragId; });
  var to = state.links.findIndex(function (l) { return l.id === targetId; });
  if (from < 0 || to < 0) return;
  var item = state.links.splice(from, 1)[0];
  state.links.splice(to, 0, item);
  dragId = null; renderLinksForm(); refresh(); scheduleSave();
}
function setOpt(key, val) { state[key] = val; updateChips(); refresh(); scheduleSave(); }
function updateChips() {
  document.querySelectorAll('.shape-btn').forEach(function (b) { b.classList.toggle('on', b.dataset.v === state.shape); });
  document.querySelectorAll('.style-btn').forEach(function (b) { b.classList.toggle('on', b.dataset.v === state.btnStyle); });
}
function tab(btn) {
  document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); t.classList.add('text-steel'); });
  btn.classList.add('active'); btn.classList.remove('text-steel');
  document.querySelectorAll('[id^=t-]').forEach(function (e) { e.classList.add('hidden'); });
  document.getElementById('t-' + btn.dataset.tab).classList.remove('hidden');
}
function scheduleSave() {
  var a = document.getElementById('autosave');
  if (a && !a.checked) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () { doSave(false); }, 600);
}
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.remove('opacity-0');
  setTimeout(function () { t.classList.add('opacity-0'); }, 1800);
}
function doSave(manual) {
  try { state = PrivStore.save(state); showToast(manual ? 'Guardado ✓' : 'Auto-guardado'); }
  catch (e) { showToast('Almacenamiento lleno'); return; }
  if (manual) {
    var b = document.getElementById('btn-save');
    b.textContent = 'Guardado ✓';
    setTimeout(function () { b.textContent = 'Guardar'; }, 1200);
  }
}
function exportJSON() {
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  a.download = state.username + '-priv.json'; a.click(); showToast('Exportado');
}
function importJSON(ev) {
  var f = ev.target.files[0]; if (!f) return;
  var r = new FileReader();
  r.onload = function () {
    try {
      state = PrivStore.normalize(JSON.parse(r.result));
      fillForm(); renderSocialForm(); renderLinksForm(); updateChips(); refresh(); doSave(true);
    } catch (e) { alert('JSON inválido'); }
  };
  r.readAsText(f);
}
init();
