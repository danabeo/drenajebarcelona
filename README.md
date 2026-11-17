# drenajebrasileño.com

Web estática de **Maria · Drenaje Brasileño** (Barcelona). La web principal se publica con GitHub Pages; el DNS sigue en Cloudflare. Se dejó Cloudflare Pages porque Movistar bloquea IP de Cloudflare los fines de semana y la web quedaba inaccesible.

| Carpeta | Dominio | Proyecto de Cloudflare Pages |
|---|---|---|
| `web/` | https://drenajebrasileño.com (`xn--drenajebrasileo-crb.com`) | `drenajebrasileno-web` · build output directory: `web` |
| `formacion/` | https://formacion.drenajebrasileño.com (solo redirige 301 al curso en la web principal) | `drenajebrasileno-formacion` · build output directory: `formacion` |

- No hay paso de compilación (build command vacío). Cada `push` a `main` se publica solo.
- `web/index.html` (español, raíz), `web/en`, `pt-br`, `fr`, `it`, `de`: una página por idioma. `/es/` redirige a `/` (301): el español vive en la raíz y es también el x-default.
- `_headers` y `_redirects` son ficheros de Cloudflare Pages (cabeceras de caché/seguridad y redirecciones 301 de las URLs antiguas).
- Las páginas se generan desde la plantilla de trabajo; si se edita a mano un idioma, hay que repetir el cambio en los demás.

Contacto de la web: WhatsApp +34 624 33 66 76 · C/ Sant Fructuós, 2 · 08004 Barcelona.

GitHub Pages publica automáticamente web/ desde main con GitHub Actions. El
artefacto se genera con node scripts/build-pages.mjs web .pages-output. La
compilación añade las páginas de redirección y adapta la política de
seguridad al HTML. GitHub Pages sirve las rutas de compatibilidad mediante
redirecciones en el navegador, con una página 404 para las rutas comodín.
Los archivos _headers y _redirects siguen disponibles para el despliegue
de respaldo en Cloudflare Pages.

Redirecciones en GitHub Pages: no admite 301 propias. Las rutas antiguas
(/es/, /html/, /curso/, /formacion/) son páginas con meta refresh instantáneo
y canonical a la URL nueva, que Google trata como redirección permanente.
Las subrutas (/es/..., /formacion/...) pasan por 404.html, que redirige con
JavaScript. Las imágenes renombradas se publican también con su nombre antiguo.
GitHub Pages ya redirige http a https y www al dominio sin www.
