# privtr.ee

Página de enlaces orientada a la privacidad.

**Dominio del servicio:** privtr.ee
`privtree.com` redirige a privtr.ee. `privacidad.me` será un proyecto distinto.

Demo de interfaz (estática): uso interno de desarrollo. Hasta la publicación
formal no se comunica como proyecto open source ni se indexa
(`robots.txt` + `<meta name="robots" content="noindex">` en todas las páginas).

## Sin terceros

No se carga nada de Google ni de CDNs de terceros. Todo es de origen propio:

- **CSS**: Tailwind **precompilado** a `assets/app.css` (no el CDN de Tailwind).
- **Tipografía**: Inter autoalojada en `assets/fonts/*.woff2` (subconjuntos latin / latin-ext).
- **Iconos**: SVG autoalojados en `js/icons.js` (Font Awesome Free 6.5.2, CC BY 4.0),
  sin fuente de iconos ni CSS de FA. `<i class="fa-…">` se hidrata a `<svg>` en carga.
- **QR**: `qrcode-generator` 1.4.4 autoalojado en `js/vendor/qrcode.min.js` (MIT).

Comprobación: `grep -r "googleapis\|gstatic\|cdnjs\|jsdelivr\|unpkg\|cloudflare" *.html js/` → sin resultados.

## Estructura

```
*.html            páginas (una hoja: assets/app.css)
assets/app.css    CSS compilado (generado — no editar a mano)
assets/fonts/     Inter woff2
assets/img/       imágenes locales
src/input.css     fuente del CSS (aquí se editan estilos)
tailwind.config.js  tema único (colores, tipografías, animaciones)
build.sh          compila assets/app.css (descarga el CLI standalone; sin Node)
js/store.js       modelo de datos + render del perfil + saneado + migración
js/panel-app.js   lógica del panel de edición
js/icons.js       mapa de iconos SVG (generado)
MIGRATION.md      esquema de datos y migración desde LinkStack / privacidad.me
```

## Build del CSS

```sh
./build.sh          # una vez
./build.sh --watch  # recompila al guardar src/input.css o cambiar clases
```

`build.sh` descarga el binario **standalone** de Tailwind en `tools/`
(no requiere Node; `tools/` está en `.gitignore`). Con Node disponible el
equivalente es `npx tailwindcss -c tailwind.config.js -i src/input.css -o assets/app.css --minify`.

Tras tocar clases en HTML/JS o `src/input.css`, **hay que recompilar** y
versionar `assets/app.css` (el render es determinista, no se compila en runtime).

## Datos y migración

Ver [MIGRATION.md](MIGRATION.md). Resumen: cada perfil lleva `schemaVersion`;
`PrivStore.exportAll()` produce un JSON versionado; el panel admin importa
respaldos propios y exportaciones de LinkStack / privacidad.me
(`PrivStore.fromLinkStack()`).

## Pendiente

- Backend real (skin sobre LinkStack) — el contrato de datos es el de `MIGRATION.md`.
- `admin.html` no tiene control de acceso (es demo localStorage); irá tras el rol admin del backend.
