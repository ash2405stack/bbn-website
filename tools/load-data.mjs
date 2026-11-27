// Loads site/js/data.js and site/js/register.js outside a browser, for the tools in this folder.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export function loadBBN() {
  const ctx = { window: {} }; ctx.window.BBN = {}; ctx.BBN = ctx.window.BBN;
  vm.createContext(ctx);
  for (const f of ['data.js', 'register.js']) vm.runInContext(readFileSync(join(root, 'site/js', f), 'utf8'), ctx);
  return ctx.window.BBN;
}
