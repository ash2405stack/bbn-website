// Builds dist/bbn-preview.html: one self-contained page fragment for the private hosted preview.
// It inlines the CSS, data and scripts from site/. Logos stay as separate files under assets/.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'site');
const html = readFileSync(join(site, 'index.html'), 'utf8');
const between = (a, b) => html.split(a)[1].split(b)[0].trim();
const head = between('<!--HEAD-START-->', '<!--HEAD-END-->');
const body = between('<!--BODY-START-->', '<!--BODY-END-->');
const css = readFileSync(join(site, 'css/app.css'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"[^>]*><\/script>/g)].map(m => m[1]);
let js = scripts.map(s => `/* ${s} */\n` + readFileSync(join(site, s), 'utf8')).join('\n');
const previewUrl = process.argv[2] || '';
if (previewUrl) js = js.replace("previewUrl: ''", `previewUrl: ${JSON.stringify(previewUrl)}`);
js = js.replace(/<\/script/gi, '<\\/script');
const out = `${head}\n<style>\n${css}\n</style>\n${body}\n<script>\n${js}\nBBN.start();\n</script>\n`;
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/bbn-preview.html'), out);
console.log(`dist/bbn-preview.html written (${(out.length / 1024).toFixed(0)} KB)` + (previewUrl ? `, QR codes point at ${previewUrl}` : ''));
