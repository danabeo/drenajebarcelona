# drenajebrasileño.com

Web estática de **Maria · Drenaje Brasileño** (Barcelona). Se publica con Cloudflare Pages.

| Carpeta | Dominio | Proyecto de Cloudflare Pages |
|---|---|---|
| `web/` | https://drenajebrasileño.com (`xn--drenajebrasileo-crb.com`) | `drenajebrasileno-web` · build output directory: `web` |
| `formacion/` | https://formacion.drenajebrasileño.com (solo redirige 301 al curso en la web principal) | `drenajebrasileno-formacion` · build output directory: `formacion` |

- No hay paso de compilación (build command vacío). Cada `push` a `main` se publica solo.
- `web/index.html` (español, raíz), `web/en`, `pt-br`, `fr`, `it`, `de`: una página por idioma. `/es/` redirige a `/` (301): el español vive en la raíz y es también el x-default.
- `_headers` y `_redirects` son ficheros de Cloudflare Pages (cabeceras de caché/seguridad y redirecciones 301 de las URLs antiguas).
- Las páginas se generan desde la plantilla de trabajo; si se edita a mano un idioma, hay que repetir el cambio en los demás.

Contacto de la web: WhatsApp +34 624 33 66 76 · C/ Sant Fructuós, 2 · 08004 Barcelona.
