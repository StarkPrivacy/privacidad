# Migración de datos → privtr.ee

Objetivo: poder llevar **la gestión y los usuarios actuales de privacidad.me**
(basado en LinkStack) a privtr.ee sin pérdidas y de forma repetible.

## 1. Esquema del perfil (versionado)

Cada perfil es un objeto JSON con `schemaVersion` (entero). La versión actual
es `PrivStore.SCHEMA_VERSION` (hoy **1**). El punto único de evolución es
`migratePage(d)` en `js/store.js`: al subir la versión se añade ahí la
transformación `if (v < N) { ... }`. `normalize()` llama a `migratePage()`
siempre, así que cualquier perfil viejo se actualiza al cargarse.

Campos (v1):

| campo | tipo | notas |
|---|---|---|
| `schemaVersion` | number | sello de versión |
| `username` | string | `[a-z0-9_-]`, ≤32, sin `@`. Es la URL: `privtr.ee/@<username>` |
| `name` | string | nombre visible |
| `bio` | string | |
| `avatar` | string | URL `https://…`, `data:image/...;base64,…` o ruta same-origin |
| `bgImage` | string | igual que `avatar` |
| `shape` | `rounded\|pill\|square` | |
| `btnStyle` | `outline\|solid\|soft\|ghost` | |
| `btnSize` | `sm\|md\|lg` | |
| `btnGlow` | bool | |
| `accentColor` | `#rgb`/`#rrggbb` | |
| `profileMode` | `both\|card\|links` | |
| `verified` | bool | **solo lo cambia admin** |
| `sameTab` | bool | abrir enlaces en la misma pestaña |
| `social` | objeto | claves fijas: `youtube telegram x instagram discord github linkedin mastodon email` → URL |
| `socialOrder` | string[] | orden de los iconos sociales |
| `links` | objeto[] | ver abajo |
| `contact` | objeto | vCard: `{enabled,title,org,note,email,phone,web,borderColor,qrStyle,showQr}` |
| `ogTitle`, `ogDesc` | string | metadatos de compartición (reservado) |
| `updatedAt` | number | epoch ms |

`links[]`: `{ id, type: link|heading|text|spacer, title, url, color, customColor, icon, brand, iconMode: none|preset|favicon }`.
El `icon` se guarda como cadena estilo Font Awesome (`"fa-brands fa-youtube"`),
que es también el identificador estable de icono en `js/icons.js` y en LinkStack.

## 2. Formato de exportación / importación

`PrivStore.exportAll()` →

```json
{ "generator": "privtr.ee", "schemaVersion": 1, "exportedAt": "2026-…Z",
  "pages": [ { …perfil… }, … ] }
```

- **Exportar**: Admin → Configuración → «Exportar todo (JSON)».
- **Importar respaldo privtr.ee**: Admin → «Importar respaldo privtr.ee».
  Acepta el objeto anterior, un array de perfiles, o un perfil suelto.
  `PrivStore.importPages(payload)` normaliza sin guardar; `saveImported(pages)`
  persiste cada uno en su clave `priv_page_<username>`.

## 3. Importar desde LinkStack / privacidad.me

`PrivStore.fromLinkStack(input)` acepta:

- exportación relacional: `{ "users": [...], "links": [...] }` (se cruzan por `user_id`)
- exportación anidada: `[ { …usuario…, "links": [ … ] }, … ]`
- un único usuario: `{ … }`

Mapeo aplicado:

| LinkStack | privtr.ee |
|---|---|
| `littlelink_name` (o `username`/`handle`/`name`) | `username` |
| `name` / `display_name` | `name` |
| `littlelink_description` / `description` | `bio` |
| `image` / `img` / `avatar` (si es URL `http(s)`) | `avatar` |
| `verified` / `is_verified` | `verified` |
| `links[]` ordenados por `order`/`position` | `links[]` |
| `link.type` `heading/header/group` → `heading`; `divider/spacer` → `spacer`; `text` → `text`; resto → `link` |
| `link.button` conocido y social (youtube, telegram, twitter/x, instagram, discord, github, linkedin, mastodon, email) | se mueve a `social{}` |
| `link.button` conocido no social (website, newsletter, podcast, shop, phone…) | `link.icon` = FA equivalente, `iconMode: preset` |
| `custom_css` / `custom_js` | **no se importa** (anotado) |

Lo que no se puede mapear queda en `page._migrationNotes` (array de strings)
y se muestra en el informe de importación del panel admin. Revisar:

- avatares que eran rutas/archivos locales de LinkStack (subir o poner URL),
- botones LinkStack sin equivalencia (elegir icono/color),
- CSS/JS personalizado.

### Recomendado para el corte real

1. Congelar escrituras en privacidad.me.
2. Exportar de LinkStack (BD → JSON con la forma de arriba; si el panel de
   LinkStack no exporta ese shape, un `SELECT` de `users` + `links` a JSON vale).
3. `fromLinkStack()` → revisar `_migrationNotes` → `saveImported()`.
4. Verificar una muestra de perfiles en `u.html?u=<username>`.
5. Redirigir `privacidad.me/@usuario` → `privtr.ee/@usuario` (mismo `username`).

## 4. Cuando exista backend

Estos mismos objetos son el contrato con el servidor: el endpoint de
importación del backend debe aceptar el formato de `exportAll()` y aplicar la
misma normalización/saneado que `normalize()` + `safeUrl()`/`safeImg()` del
cliente (en PHP: `htmlspecialchars` + validación de esquema de URL).
