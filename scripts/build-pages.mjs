import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath) {
  throw new Error('Usage: node scripts/build-pages.mjs <web source> <output directory>');
}
const source = resolve(sourcePath);
const output = resolve(outputPath);
await mkdir(output);
await cp(source, output, { recursive: true });

const headers = await readFile(join(source, '_headers'), 'utf8');
const policy = headers.match(/^\s*Content-Security-Policy:\s*(.+)$/mi)?.[1];
if (!policy) throw new Error('Missing site content security policy.');
// Browsers only accept frame-ancestors as an HTTP header.
const metaPolicy = policy.split(';').filter(rule => !rule.trim().startsWith('frame-ancestors ')).join(';').trim();
const security = '<meta http-equiv="Content-Security-Policy" content="' + metaPolicy + '">'
  + '<meta name="referrer" content="strict-origin-when-cross-origin">';

const course = '/curso-drenaje-linfatico-brasileno/';
const aliases = {
  es: '/',
  html: '/',
  curso: course,
  formacion: course,
  'formación': course,
};
for (const [alias, target] of Object.entries(aliases)) {
  const directory = join(output, alias);
  await mkdir(directory);
  const canonical = new URL(target, 'https://xn--drenajebrasileo-crb.com');
  // GitHub Pages no permite 301. Google trata un meta refresh instantáneo como
  // redirección permanente; sin noindex para que traspase la señal a la URL nueva.
  const page = '<!doctype html>\n<html lang="es"><head><meta charset="utf-8">'
    + '<meta http-equiv="refresh" content="0; url=' + canonical + '">'
    + '<title>Página trasladada</title>'
    + '<link rel="canonical" href="' + canonical + '">'
    + '<script>location.replace("' + target + '" + location.search + location.hash)</script></head>'
    + '<body><a href="' + canonical + '">Ir a la nueva página</a></body></html>\n';
  await writeFile(join(directory, 'index.html'), page);
}

// Imágenes renombradas en octubre de 2026: se publican también con el nombre
// antiguo para que las URL que Google ya conocía no den 404.
const renamedImages = {
  'r1_antes.jpg': 'drenaje-linfatico-brasileno-espalda-antes.jpg',
  'r1_despues.jpg': 'drenaje-linfatico-brasileno-espalda-despues.jpg',
  'r4_antes.jpg': 'drenaje-linfatico-brasileno-abdomen-1-antes.jpg',
  'r4_despues.jpg': 'drenaje-linfatico-brasileno-abdomen-1-despues.jpg',
  'r72_antes.jpg': 'drenaje-linfatico-brasileno-abdomen-2-antes.jpg',
  'r72_despues.jpg': 'drenaje-linfatico-brasileno-abdomen-2-despues.jpg',
  'r73_antes.jpg': 'drenaje-linfatico-brasileno-abdomen-3-antes.jpg',
  'r73_despues.jpg': 'drenaje-linfatico-brasileno-abdomen-3-despues.jpg',
  'r52_antes.jpg': 'drenaje-linfatico-brasileno-abdomen-4-antes.jpg',
  'r52_despues.jpg': 'drenaje-linfatico-brasileno-abdomen-4-despues.jpg',
  'r113_antes.jpg': 'drenaje-linfatico-brasileno-cintura-antes.jpg',
  'r113_despues.jpg': 'drenaje-linfatico-brasileno-cintura-despues.jpg',
  'r93_antes.jpg': 'drenaje-linfatico-brasileno-cintura-contorno-antes.jpg',
  'r93_despues.jpg': 'drenaje-linfatico-brasileno-cintura-contorno-despues.jpg',
};
for (const [oldName, newName] of Object.entries(renamedImages)) {
  await cp(join(source, 'img', newName), join(output, 'img', oldName));
}

const fallback = '<script>\n'
  + '  const path = location.pathname;\n'
  + '  if (/^\\/(es|html)(\\/|$)/.test(path)) location.replace("/" + location.search + location.hash);\n'
  + '  if (/^\\/formacion\\//.test(path)) location.replace("' + course + '" + location.search + location.hash);\n'
  + '  if (path === "/sitemap.php") location.replace("/sitemap.xml");\n'
  + '</script>';
for (const file of await readdir(output, { recursive: true })) {
  if (!file.endsWith('.html')) continue;
  const path = join(output, file);
  let html = await readFile(path, 'utf8');
  html = html.replace(/<head>(\s*<meta charset="utf-8">)/i, '<head>$1' + security);
  if (file === '404.html') html = html.replace('</head>', fallback + '</head>');
  await writeFile(path, html);
}

await rm(join(output, '_headers'));
await rm(join(output, '_redirects'));
await writeFile(join(output, '.nojekyll'), '');
