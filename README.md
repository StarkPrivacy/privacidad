# privacidad.me / privtr.ee

Alternativa a Linktree enfocada en **privacidad**. Open source, basada en [LinkStack](https://linkstack.org/).

**Dominios:** privacidad.me · privtr.ee · privtree.com

## Demo UI (GitHub Pages)

https://starkprivacy.github.io/privacidad/

| Página | Uso |
|--------|-----|
| `index.html` | Landing |
| `panel.html` | Editor con vista previa en vivo |
| `u.html?u=usuario` | Página pública del perfil |
| `registro.html` / `acceso.html` | Flujo demo → panel |
| `admin.html` | Admin mínimo (lista local) |

### Cómo probar ahora

1. Abre [panel.html](https://starkprivacy.github.io/privacidad/panel.html)
2. Edita perfil, redes y enlaces (las redes van **encima** de los enlaces)
3. Pulsa **Guardar** (o deja auto-guardado)
4. **Ver página** → `u.html?u=tu-usuario`

Los datos viven en `localStorage` del navegador (solo para prototipo).

### Capa de datos

`js/store.js` — única fuente de verdad:

- `PrivStore.load` / `save` / `listUsers`
- `PrivStore.renderProfile` (panel + página pública)

Al conectar el backend (fork LinkStack), se sustituyen solo las lecturas/escrituras de `localStorage` por llamadas API; la UI no cambia.

### Migración prevista

1. Fork de LinkStack en servidor propio
2. Tema/CSS con colores boringprivacy (azul `#0a84ff`, void `#05070a`)
3. Multi-dominio y sin tracking de terceros
4. Sustituir `PrivStore` I/O por API Laravel
5. Importar usuarios existentes de la instancia actual

### Donaciones (landing)

BTC / XMR / USDT (TRC-20) — direcciones al final del proyecto.

## Licencia

Open source. Código de UI en este repo; LinkStack mantiene su propia licencia aguas arriba.
