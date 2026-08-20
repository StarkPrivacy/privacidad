let state = PrivStore.defaultPage('stark');
let nid = 10;
let dragId = null;
let saveTimer = null;

function init() {
  const loaded = PrivStore.load();
  if (loaded) state = loaded;
  else {
    state = PrivStore.defaultPage('stark');
    state.name = 'Stark';
    state.bio = 'Sin privacidad tu libertad es solo una ilusión';
    state.avatar = 'https://pbs.twimg.com/profile_images/1691362458655440896/jaacLom0.jpg';
    state.social.x = 'https://x.com/StarkPrivacy';
    state.social.telegram = 'https://t.me/StarkPrivacy';
    state.links = [
      { id: 1, title: 'Academia Boring Privacy', url: 'https://boringprivacy.io', type: 'link' },
      { id: 2, title: 'Canal de Telegram', url: 'https://t.me/StarkPrivacy', type: 'link' },
    ];
  }
  nid = Math.max(10, ...(state.links.map(l => l.id || 0)), 0) + 1;
  fillForm();
  renderSocialForm();
  renderLinksForm();
  updateChips();
  refresh();
}

function fillForm() {
  document.getElementById('name').value = state.name || '';
  document.getElementById('bio').value = state.bio || '';
  document.getElementById('username').value = state.username || '';
  document.getElementById('avatar').value = state.avatar || '';
  document.getElementById('verified').checked = !!state.verified;
  document.getElementById('btnGlow').checked = !!state.btnGlow;
  document.getElementById('sameTab').checked = !!state.sameTab;
  document.getElementById('bgImage').value = state.bgImage || '';
  document.getElementById('ogTitle').value = state.ogTitle || '';
  document.getElementById('ogDesc').value = state.ogDesc || '';
}

function onField() {
  state.name = document.getElementById('name').value;
  state.bio = document.getElementById('bio').value;
  state.username = PrivStore.sanitizeUsername(document.getElementById('username').value);
  document.getElementById('username').value = state.username;
  state.avatar = document.getElementById('avatar').value.trim();
  refresh();
  scheduleSave();
}

function refresh() {
  document.getElementById('public-link').href = 'u.html?u=' + encodeURIComponent(state.username);
  const wrap = document.getElementById('av-wrap');
  if (state.avatar) {
    wrap.innerHTML = `<img src="${PrivStore.esc(state.avatar)}" class="w-full h-full object-cover" onerror="this.parentElement.textContent='?'">`;
  } else {
    wrap.textContent = (state.name || '?')[0].toUpperCase();
  }
  renderDomains();
  PrivStore.renderProfile(state, document.getElementById('preview'), { compact: true });
}

function renderDomains() {
  const u = state.username || '…';
  document.getElementById('domain-list').innerHTML = PrivStore.DOMAINS.map(d => `
    <div class="flex items-center gap-2 p-2.5 rounded-lg bg-void border border-white/10">
      <span class="flex-1 text-xs font-mono text-mist truncate">${d}/${u}</span>
      <button type="button" onclick="copyDomain('${d}')" class="text-[11px] px-2.5 py-1 rounded-md border border-neon/30 text-neon shrink-0">Copiar</button>
    </div>`).join('');
}

function copyDomain(domain) {
  const text = 'https://' + domain + '/' + state.username;
  navigator.clipboard.writeText(text);
  showToast('Copiado: ' + domain + '/' + state.username);
}

function renderSocialForm() {
  document.getElementById('social-list').innerHTML = PrivStore.SOCIAL_DEFS.map(s => `
    <div class="flex items-center gap-2 p-2.5 rounded-xl bg-panel border border-white/5">
      <span class="w-8 text-center text-mist"><i class="${s.icon}"></i></span>
      <div class="flex-1 min-w-0">
        <div class="text-[10px] text-steel">${s.label}</div>
        <input value="${PrivStore.esc(state.social[s.id] || '')}" placeholder="${s.placeholder}"
          class="w-full bg-transparent text-sm text-white focus:outline-none"
          oninput="state.social['${s.id}']=this.value;refresh();scheduleSave()">
      </div>
    </div>`).join('');
}

function typeLabel(t) {
  return { link: 'Enlace', heading: 'Título', text: 'Texto', spacer: 'Espacio', email: 'Email', phone: 'Tel.' }[t] || t;
}

function renderLinksForm() {
  const el = document.getElementById('link-list');
  if (!state.links.length) {
    el.innerHTML = '<p class="text-xs text-steel py-4 text-center border border-dashed border-white/10 rounded-xl">Sin elementos. Añade un enlace o bloque.</p>';
    return;
  }
  el.innerHTML = state.links.map(l => {
    const isBlock = l.type === 'heading' || l.type === 'text' || l.type === 'spacer';
    const isSpacer = l.type === 'spacer';
    return `
    <div class="flex gap-2 p-3 rounded-xl bg-panel border border-white/5" draggable="true"
      data-id="${l.id}"
      ondragstart="dragStart(event,${l.id})" ondragover="dragOver(event)" ondrop="drop(event,${l.id})" ondragend="dragEnd(event)">
      <span class="text-steel cursor-grab self-center select-none px-0.5">⠿</span>
      <div class="flex-1 space-y-1.5 min-w-0">
        <div class="text-[10px] text-neon/80">${typeLabel(l.type)}</div>
        ${isSpacer ? '<p class="text-xs text-steel">Espaciador visual</p>' : `
        <input value="${PrivStore.esc(l.title)}" onchange="updLink(${l.id},'title',this.value)" class="w-full bg-transparent text-sm text-white font-medium" placeholder="${isBlock ? 'Contenido' : 'Título'}">
        ${!isBlock ? `<input value="${PrivStore.esc(l.url)}" onchange="updLink(${l.id},'url',this.value)" class="w-full bg-transparent text-xs text-steel" placeholder="${l.type==='email'?'email@…':l.type==='phone'?'+34…':'https://'}">` : ''}`}
      </div>
      <button type="button" onclick="delLink(${l.id})" class="text-steel hover:text-red-400 self-center p-1">✕</button>
    </div>`;
  }).join('');
}

function addLink(type) {
  type = type || 'link';
  const defaults = {
    link: { title: '', url: '' },
    heading: { title: 'Sección', url: '' },
    text: { title: 'Texto libre…', url: '' },
    spacer: { title: '', url: '' },
    email: { title: 'Email', url: '' },
    phone: { title: 'Teléfono', url: '' },
  };
  const d = defaults[type] || defaults.link;
  state.links.push({ id: nid++, type, title: d.title, url: d.url });
  renderLinksForm(); refresh(); scheduleSave();
}
function updLink(id, f, v) {
  const l = state.links.find(x => x.id === id);
  if (l) { l[f] = v; refresh(); scheduleSave(); }
}
function delLink(id) {
  state.links = state.links.filter(x => x.id !== id);
  renderLinksForm(); refresh(); scheduleSave();
}

function dragStart(e, id) { dragId = id; e.currentTarget.classList.add('opacity-50'); }
function dragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function dragEnd() { document.querySelectorAll('#link-list > div').forEach(d => d.classList.remove('drag-over','opacity-50')); }
function drop(e, targetId) {
  e.preventDefault();
  if (dragId == null || dragId === targetId) return;
  const from = state.links.findIndex(l => l.id === dragId);
  const to = state.links.findIndex(l => l.id === targetId);
  if (from < 0 || to < 0) return;
  const [item] = state.links.splice(from, 1);
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
  saveTimer = setTimeout(() => doSave(false), 600);
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('opacity-0');
  setTimeout(() => t.classList.add('opacity-0'), 1800);
}
function doSave(manual) {
  state = PrivStore.save(state);
  showToast(manual ? 'Guardado ✓' : 'Auto-guardado');
  if (manual) {
    const b = document.getElementById('btn-save');
    b.textContent = 'Guardado ✓';
    setTimeout(() => b.textContent = 'Guardar', 1200);
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
  r.onload = () => {
    try {
      state = PrivStore.normalize(JSON.parse(r.result));
      fillForm(); renderSocialForm(); renderLinksForm(); updateChips(); refresh(); doSave(true);
    } catch (e) { alert('JSON inválido'); }
  };
  r.readAsText(f);
}

init();
