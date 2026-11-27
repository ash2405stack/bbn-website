// Production gate. Fails while any demo data, placeholder or open item remains.
// This is expected to FAIL for the preview. It must pass before a public launch is considered.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadBBN, root } from './load-data.mjs';
const B = loadBBN(), problems = [];
if (B.config.demo) problems.push('config.demo is true');
if (!B.config.splynxPortalUrl) problems.push('config.splynxPortalUrl is empty');
if (B.plans.some(p => p.sample)) problems.push(`${B.plans.filter(p => p.sample).length} plans are still marked sample`);
const open = B.register.filter(r => r.status !== 'Confirmed');
if (open.length) problems.push(`${open.length} register items are not Confirmed`);
let placeholders = 0;
for (const f of readdirSync(join(root, 'site/js'))) {
  if (f === 'register.js') continue;
  placeholders += (readFileSync(join(root, 'site/js', f), 'utf8').match(/tc\('|TO CONFIRM|B\.sampleTag|SAMPLE/g) || []).length;
}
placeholders += (readFileSync(join(root, 'site/index.html'), 'utf8').match(/Private preview|Preview build|Staff demo/g) || []).length;
if (placeholders) problems.push(`${placeholders} placeholder or demo markers remain in the site source`);
if (problems.length) { console.error('NOT READY FOR PRODUCTION:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('Production gate passed.');
