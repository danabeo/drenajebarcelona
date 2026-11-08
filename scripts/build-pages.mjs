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
  const page = '<!doctype html>\n<html lang="es"><head><meta charset="utf-8">'
    + '<meta name="robots" content="noindex"><title>Página trasladada</title>'
    + '<link rel="canonical" href="' + canonical + '">'
    + '<meta http-equiv="refresh" content="0; url=' + target + '"></head>'
    + '<body><a href="' + target + '">Ir a la nueva página</a></body></html>\n';
  await writeFile(join(directory, 'index.html'), page);
}

const sitemap = await readFile(join(source, 'sitemap.xml'), 'utf8');
await writeFile(join(output, 'sitemap-index.xml'), sitemap);
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
await writeFile(join(output, 'sitemap.txt'), sitemapUrls.join('\n') + '\n');

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
