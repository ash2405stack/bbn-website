// End-to-end checks for the BBN preview, run in headless Chromium with Playwright.
// Usage: serve ./site on a port (npx http-server site -p 4173), then: node tests/journeys.mjs [baseUrl]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const BASE = process.argv[2] || 'http://localhost:4173/';
const results = []; let failed = 0;
const check = (name, ok, detail = '') => { results.push({ name, ok }); if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); };
const browser = await chromium.launch();

async function fresh(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...opts });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(BASE); return { ctx, page, errors };
}
const go = (page, hash) => page.evaluate(h => { location.hash = h; }, hash).then(() => page.waitForTimeout(60));
const text = (page, sel) => page.locator(sel).first().innerText();
async function verify(page) { const code = await text(page, '#demo-code'); await page.fill('#otp', code); await page.click('#otp-panel button.btn:not(.quiet)'); await page.waitForTimeout(60); }

/* ---------- 1. new customer: flyer, unit, plan, cost, signup, all four debit-order outcomes ---------- */
{
  const { page, errors } = await fresh();
  check('Home shows the headline and both first-screen actions', (await text(page, 'h1')).includes('Fibre we own') && await page.locator('#hq').isVisible() && await page.locator('.subhelp a').count() === 3);
  const box = await page.locator('.subhelp').boundingBox();
  check('Check my building and Subscriber Help sit on the first phone screen (390x844)', box.y + box.height <= 844, `bottom at ${Math.round(box.y + box.height)}px`);
  await page.fill('#hq', 'lighthouse'); await page.click('.search-results a.result >> nth=0'); await page.waitForSelector('#unit');
  check('Search finds a building and opens its page', (await text(page, 'h1')) === 'Lighthouse Court');
  check('Plans are visible before any contact details are asked', await page.locator('.plan').count() === 5 && await page.locator('input[type=tel]').count() === 0);
  await go(page, 'flyer-lighthouse-court');
  await page.fill('#unit', '102'); await page.click('form[data-form=unit] button');
  check('Unit 102: existing fibre point on record', (await text(page, '#unit-result')).includes('fibre point on record'));
  await page.check('#plan-h100');
  const costs = await text(page, '#costs');
  check('Full cost shows monthly total with VAT, once-off fee, term and equipment', /R700 incl\. VAT/.test(costs) && /R500 incl\. VAT/.test(costs) && /Contract term/.test(costs) && /Equipment/.test(costs));
  await page.click('#cta');
  await page.click('form[data-form=signup] button.btn');
  check('Empty signup shows inline errors and focuses the first problem', await page.locator('.ferr').count() >= 3 && await page.evaluate(() => document.activeElement.id) === 'su-name');
  await page.fill('#su-name', 'Thandi Demo'); await page.fill('#su-mobile', '12345');
  await page.click('form[data-form=signup] button.btn');
  check('A bad mobile number is rejected and the name is kept', (await page.inputValue('#su-name')) === 'Thandi Demo' && (await text(page, '.ferr')).includes('South African mobile'));
  await page.fill('#su-mobile', '082 555 0101'); await page.fill('#su-email', 'thandi@example.co.za');
  await page.reload();
  check('Form recovery: typed details survive a page reload', (await page.inputValue('#su-name')) === 'Thandi Demo' && (await page.inputValue('#su-email')) === 'thandi@example.co.za');
  await page.check('#su-terms'); await page.click('form[data-form=signup] button.btn');
  check('No application exists before the mobile number is verified', await page.evaluate(() => BBN.store.apps().length) === 0 && await page.locator('#otp').isVisible());
  await page.fill('#otp', '000000'); await page.click('#otp-panel button.btn:not(.quiet)');
  check('A wrong SMS code is refused', (await text(page, '.ferr')).includes('does not match'));
  await verify(page);
  const ref = await text(page, '.refbox');
  check('Verified signup creates an application with a reference', /^BBN-A-[A-Z0-9]{6}$/.test(ref), ref);
  check('Accepted terms version is recorded', await page.evaluate(r => BBN.store.app(r).terms.version, ref) === 'DEMO-0.1');
  check('Flyer source is carried to the application', await page.evaluate(r => BBN.store.app(r).source, ref) === 'flyer');
  const outcome = async o => { await page.click('form[data-form=mandate] button.btn'); await page.click(`[data-out=${o}]`); return text(page, '#mandate'); };
  check('Debit order: declined', (await outcome('declined')).includes('declined'));
  check('Debit order: expired, retried on the same application', (await outcome('expired')).includes('expired') && (await text(page, '.refbox')) === ref);
  await page.click('form[data-form=mandate] button.btn');
  check('Debit order: pending blocks a second request', (await text(page, '#mandate')).includes('Waiting') && await page.locator('form[data-form=mandate]').count() === 0);
  await page.evaluate(r => { const a = BBN.store.app(r); const before = a.mandate.ref; BBN.store.startMandate(a); window.__same = BBN.store.app(r).mandate.ref === before; }, ref);
  check('Duplicate mandate request is ignored while one is pending', await page.evaluate(() => window.__same));
  await go(page, 'home'); await go(page, 'apply-' + ref.toLowerCase());
  check('Interrupted signup resumes on the same application, still pending', (await text(page, '#mandate')).includes('Waiting'));
  await page.click('[data-out=approved]');
  check('Debit order: approved', (await text(page, '#mandate')).includes('authorised'));
  check('Three failed-or-open attempts and one approval all sit on one application', await page.evaluate(r => BBN.store.apps().length === 1 && BBN.store.app(r).mandate.attempts === 3, ref));
  await page.fill('#pf-date', new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10)); await page.click('form[data-form=preferred] button');
  check('Preferred time is shown as awaiting confirmation', (await page.locator('.steps').innerText()).includes('Awaiting confirmation'));
  await page.click('details summary:has-text("Confirmation email preview")');
  check('Confirmation email preview shows the reference and says nothing was sent', (await text(page, '.mail')).includes(ref) && (await page.locator('details[open]').innerText()).includes('No email was sent'));
  // staff handoff
  await go(page, 'staff');
  check('Staff queue shows coverage, authorisation, owner and next step', (await text(page, `#row-${ref}`)).includes('Create or match the customer in Splynx'));
  await page.click(`#row-${ref} [data-act=stSplynx]`); await page.click(`#row-${ref} [data-type=remote]`);
  await go(page, 'apply-' + ref.toLowerCase());
  check('Customer sees the confirmed remote activation', (await page.locator('.steps').innerText()).includes('Confirmed: remote activation'));
  // resume after verification expires
  await page.evaluate(() => BBN.store.write('verified', {})); await page.reload();
  check('Resume asks for an SMS code once the verification has expired', (await text(page, 'h1')) === 'Welcome back' && !(await page.locator('body').innerText()).includes('Thandi'));
  await page.click('[data-act=resumeVerify]'); await verify(page);
  check('After the SMS code the same application opens', (await text(page, '.refbox')) === ref);
  check('No script errors in the new-customer journey', errors.length === 0, errors.join(' | '));
  await page.context().close();
}

/* ---------- 2. units that need a check, a survey or permission; box QR; building interest ---------- */
{
  const { page, errors } = await fresh();
  await go(page, 'building-lighthouse-court'); await page.fill('#unit', 'unit 999'); await page.click('form[data-form=unit] button');
  check('Unknown unit is treated as "needs a check", not refused', (await text(page, '#unit-result')).includes('check unit 999'));
  check('No fee is assumed for an unchecked unit', (await text(page, '#costs')).includes('To be confirmed'));
  await page.click('#cta'); await page.fill('#su-name', 'Sipho Demo'); await page.fill('#su-mobile', '0835550102'); await page.click('form[data-form=signup] button.btn'); await verify(page);
  const ref = await text(page, '.refbox');
  check('Unit-check application is saved and waits for BBN', (await page.locator('.steps').innerText()).includes('Checking whether unit 999'));
  await go(page, 'staff'); await page.click(`#row-${ref} [data-state=existing]`); await go(page, 'apply-' + ref.toLowerCase());
  check('After staff confirm the unit, the customer can finish signup from the same link', await page.locator('form[data-form=finish]').isVisible());
  await page.fill('#fi-email', 'sipho@example.co.za'); await page.check('form[data-form=finish] input[name=terms]'); await page.click('form[data-form=finish] button');
  check('Finishing details opens the debit-order step', await page.locator('form[data-form=mandate]').isVisible());
  await page.check('#payer-other'); await page.fill('#py-name', 'Nomsa Payer'); await page.fill('#py-mobile', '0845550103'); await page.click('form[data-form=mandate] button.btn');
  check('A different payer can be sent the authorisation', (await text(page, '#mandate')).includes('Nomsa Payer'));
  check('No bank-detail field exists anywhere in the signup', await page.evaluate(() => !/account number|branch code|card number/i.test(document.body.innerText)));

  // survey + permission
  await go(page, 'building-lighthouse-court'); await page.fill('#unit', '306'); await page.click('form[data-form=unit] button'); await page.check('#plan-h200'); await page.click('#cta');
  await page.fill('#su-name', 'Sipho Demo'); await page.fill('#su-mobile', '0835550102'); await page.fill('#su-email', 'sipho@example.co.za'); await page.click('form[data-form=signup] button.btn'); await page.waitForTimeout(100);
  check('A still-valid verification is reused (no code screen)', await page.locator('#otp').count() === 0 && await page.locator('.refbox').count() === 1);
  const ref2 = await text(page, '.refbox');
  check('Survey and permission show as what is missing', /survey/i.test(await page.locator('.steps').innerText()) && /Permission/i.test(await page.locator('.steps').innerText()));
  await go(page, 'staff'); await page.fill(`#row-${ref2} input[name=cost]`, '2400'); await page.click(`#row-${ref2} form button`); await page.click(`#row-${ref2} [data-act=stConsent]`);
  await go(page, 'apply-' + ref2.toLowerCase());
  check('Customer must accept the final surveyed cost before committing', (await text(page, '#cost-accept')).includes('R2 400') && await page.locator('form[data-form=mandate]').count() === 0);
  await page.click('[data-act=acceptCost]');
  check('Accepting the cost moves the application on', await page.locator('form[data-form=finish]').isVisible());
  // same unit + mobile reuses the application
  await go(page, 'building-lighthouse-court'); await page.fill('#unit', '306'); await page.click('form[data-form=unit] button'); await page.check('#plan-h200'); await page.click('#cta');
  await page.fill('#su-name', 'Sipho Demo'); await page.fill('#su-mobile', '0835550102'); await page.fill('#su-email', 'sipho@example.co.za');
  if (await page.locator('#su-terms').count()) await page.check('#su-terms');
  await page.click('form[data-form=signup] button.btn');
  check('Same unit and mobile reopen the open application instead of creating another', (await text(page, '.refbox')) === ref2);

  // box QR
  await go(page, 'box-7k2m-q4hx');
  const boxText = await page.locator('main').innerText();
  check('Box QR page prefills building and unit and shows no personal data', boxText.includes('Lighthouse Court') && boxText.includes('102') && !/Thandi|Sipho|invoice|balance/i.test(boxText));
  await page.click('[data-act=boxConnect]');
  check('Get connected carries the unit to the building page', (await page.inputValue('#unit')) === '102' && (await text(page, '#unit-result')).includes('fibre point'));
  await go(page, 'box-7k2m-q4hx'); await page.click('[data-act=boxHelp]');
  check('Get help opens the troubleshooter with the building chosen', (await page.inputValue('#ft-b')) === 'lighthouse-court');
  await go(page, 'coverage'); await page.fill('#bx', 'ZZZZ-9999'); await page.click('form[data-form=boxref] button');
  check('An unregistered box reference explains the manual route', (await text(page, '.ferr')).includes('search for your building'));
  await page.fill('#bx', '7k2m q4hx'); await page.click('form[data-form=boxref] button'); await page.waitForTimeout(100);
  check('A hand-typed box reference works in any spacing or case', (await text(page, 'h1')) === 'Is this your unit?');

  // partner network and interest
  await go(page, 'building-marine-terraces');
  check('Partner network is clearly identified', (await page.locator('main').innerText()).includes('Partner network'));
  await go(page, 'coverage'); await page.fill('#cq', 'Seaview Mansions'); await page.click('[data-act=interestFrom]');
  check('An unlisted building leads to "Bring BBN fibre to my building" with the name filled in', (await page.inputValue('#in-b')) === 'Seaview Mansions');
  await page.fill('#in-a', '1 Test Street'); await page.fill('#in-n', 'Sipho Demo'); await page.fill('#in-m', '0835550102'); await page.check('form[data-form=interest] input[name=consent]'); await page.click('form[data-form=interest] button');
  const receipt = await text(page, '#int-done');
  check('Interest receipt gives a reference and does not promise coverage', /BBN-I-/.test(receipt) && receipt.includes('not a promise'));
  check('A shareable link for neighbours is shown', (await page.inputValue('input[readonly]')).includes('#interest-seaview-mansions'));
  await page.click('[data-act=interestAgain]'); await go(page, 'interest-seaview-mansions');
  check('The shared link opens with the building filled in', (await page.inputValue('#in-b')) === 'Seaview Mansions');
  await page.fill('#in-n', 'Second Neighbour'); await page.fill('#in-m', '0715550104'); await page.check('form[data-form=interest] input[name=consent]'); await page.click('form[data-form=interest] button'); await verify(page);
  check('Demand is grouped in one record per building', await page.evaluate(() => { const d = BBN.store.demand(); return d.length === 1 && d[0].count === 2; }));
  await go(page, 'business'); await page.fill('#en', 'Biz Owner'); await page.fill('#em', '0825550105'); await page.fill('#ee', 'biz@example.co.za'); await page.fill('#ew', '9 Office Park'); await page.fill('#eu', '10 staff, cloud accounting'); await page.check('form[data-form=enquiry] input[name=consent]'); await page.click('form[data-form=enquiry] button');
  check('Business enquiry is accepted with a reference', /BBN-E-/.test(await text(page, '#enq-done')));
  check('No script errors in the coverage and interest journeys', errors.length === 0, errors.join(' | '));
  await page.context().close();
}

/* ---------- 3. subscriber: status in two taps, fault report, My Account ---------- */
{
  const { page, errors } = await fresh();
  await page.click('.subhelp a[href="#status"]');
  check('Network status is one tap from the home page and already lists the outage', (await text(page, '#status-result')).includes('Internet down in Block B'));
  await page.selectOption('#st-b', 'ridge-gardens');
  const st = await text(page, '#status-result');
  check('Second tap filters to a building; notice shows area, impact, last and next update', /Block B/.test(st) && /Last update/.test(st) && /Next update/.test(st));
  await page.selectOption('#st-b', 'marine-terraces');
  check('A building with no live issue shows a checked-at time', /No known issues at Marine Terraces/.test(await text(page, '#status-result')) && /Status checked/.test(await text(page, '#status-result')));
  await page.evaluate(() => BBN.store.setSim({ statusFeed: 'down' })); await page.reload();
  const down = await text(page, '#status-result');
  check('Unavailable status feed is not shown as "all clear"', down.includes('cannot load network status') && !down.includes('No known issues'));
  await page.evaluate(() => BBN.store.setSim({ statusFeed: 'ok' }));
  await go(page, 'fault'); await page.selectOption('#ft-b', 'ridge-gardens');
  check('Known outage is shown before the fault form', (await page.locator('main').innerText()).includes('We already know about this outage') && await page.locator('form[data-form=fault]').count() === 0);
  await page.click('[data-act=faultContinue]'); await page.click('#sc-room');
  check('One-room problems get Wi-Fi advice', (await page.locator('main').innerText()).includes('Wi-Fi coverage'));
  await page.selectOption('#ft-b', 'lighthouse-court'); await page.click('#sc-all');
  await page.fill('#ft-u', '102'); await page.fill('#ft-n', 'Thandi Demo'); await page.fill('#ft-m', '0825550101'); await page.fill('#ft-d', 'Red light on the fibre box');
  await page.click('form[data-form=fault] button');
  check('Accepted fault shows a ticket reference', /BBN-T-[A-Z0-9]{6}/.test(await text(page, '#fault-done')));
  check('No response time is promised', !/within \d+ (minutes|hours)/i.test(await text(page, '#fault-done')));
  await page.click('[data-act=faultReset]'); await page.evaluate(() => BBN.store.setSim({ ticketSystem: 'down' }));
  await page.selectOption('#ft-b', 'lighthouse-court'); await page.click('#sc-all');
  await page.fill('#ft-n', 'Thandi Demo'); await page.fill('#ft-m', '0825550101'); await page.fill('#ft-d', 'Still down'); await page.click('form[data-form=fault] button');
  const rej = await text(page, '#fault-done');
  check('A rejected fault shows no reference and says what to do', rej.includes('could not log') && !/BBN-T-/.test(rej));
  await page.click('[data-act=faultBack]');
  check('After a rejection the typed fault details are still there', (await page.inputValue('#ft-d')) === 'Still down');
  await go(page, 'home'); await page.click('.subhelp a[href="#account"]'); await page.click('[data-act=portalDemo]');
  check('My Account explains the Splynx portal hand-off without faking a login', (await text(page, '#portal-msg')).includes('not connected to the portal'));
  await go(page, 'staff'); await page.selectOption('#mo-b', 'lighthouse-court'); await page.click('form[data-form=monitor] button');
  const pub = await page.evaluate(() => BBN.store.noticesFor('lighthouse-court').filter(n => n.type === 'outage').length);
  check('A monitoring alert is not public until staff publish it', pub === 0 && (await page.locator('main').innerText()).includes('Suspected outage'));
  await page.click('[data-act=susPublish]');
  check('Staff can publish the suspected outage', await page.evaluate(() => BBN.store.noticesFor('lighthouse-court').filter(n => n.type === 'outage').length) === 1);
  check('No script errors in the subscriber journey', errors.length === 0, errors.join(' | '));
  await page.context().close();
}

/* ---------- 4. layout at phone, fold and desktop widths; keyboard; reduced motion; slow data ---------- */
const VIEWS = ['home', 'coverage', 'building-lighthouse-court', 'signup', 'status', 'fault', 'support', 'account', 'business', 'estates', 'guides', 'film', 'stories', 'legal', 'interest', 'staff', 'demo'];
const SIZES = [['small phone 320', 320, 640], ['iPhone 390', 390, 844], ['Fold7 folded (approx. 373)', 373, 860], ['Fold7 unfolded (approx. 690)', 690, 790], ['desktop 1280', 1280, 800]];
for (const [label, w, h] of SIZES) {
  const { page, errors } = await fresh({ viewport: { width: w, height: h } });
  const bad = [];
  await page.evaluate(() => { BBN.setSel({ buildingId: 'lighthouse-court', unit: '102', planId: 'h100' }); });
  for (const v of VIEWS) { await go(page, v); const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (over > 0) bad.push(`${v} +${over}px`); }
  check(`No sideways scrolling on any page at ${label}`, bad.length === 0 && errors.length === 0, bad.concat(errors).join(', '));
  await page.context().close();
}
{
  const { page } = await fresh({ viewport: { width: 1280, height: 800 } });
  await page.keyboard.press('Tab');
  check('Keyboard: first Tab lands on "Skip to content"', await page.evaluate(() => document.activeElement.className) === 'skip');
  const seen = [];
  for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); seen.push(await page.evaluate(() => { const e = document.activeElement, s = getComputedStyle(e); return { t: (e.innerText || e.id || e.tagName).trim().slice(0, 24), outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 }; })); }
  check('Keyboard: every focused control has a visible focus ring', seen.every(s => s.outline), seen.filter(s => !s.outline).map(s => s.t).join(', '));
  check('Keyboard: nav, Check Coverage, building search and subscriber links are reachable in order', ['Home Fibre', 'Check Coverage', 'hq', 'Check an outage'].every(t => seen.some(s => s.t.startsWith(t))), seen.map(s => s.t).join(' > '));
  await page.focus('#hq'); await page.keyboard.type('gardens'); await page.keyboard.press('Tab'); await page.keyboard.press('Enter'); await page.waitForSelector('#unit');
  await page.focus('#unit'); await page.keyboard.type('A1'); await page.keyboard.press('Enter'); await page.waitForTimeout(60);
  check('Keyboard only: search, open a building and check a unit', (await text(page, '#unit-result')).includes('fibre point on record'));
  await page.focus('#plan-h50'); await page.keyboard.press('Space'); await page.waitForTimeout(60);
  check('Keyboard only: choose a plan and keep focus on it', await page.evaluate(() => document.activeElement.id) === 'plan-h50' && (await text(page, '#costs')).includes('R500'));
  await page.context().close();
}
{
  const { page } = await fresh({ reducedMotion: 'reduce' });
  check('Reduced motion: the hero animation is switched off', await page.evaluate(() => getComputedStyle(document.querySelector('.fibre-run')).animationName) === 'none');
  await page.context().close();
  const p2 = await fresh();
  check('Motion allowed: only the single fibre line animates', await p2.page.evaluate(() => [...document.querySelectorAll('*')].filter(e => getComputedStyle(e).animationName !== 'none').length) === 1);
  await p2.page.context().close();
}
{
  // Slow mobile data: about 400 kbit/s down, 400 ms latency (roughly "Slow 3G"), cold cache, fonts blocked to mimic a font host that never answers.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page); await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 50000, uploadThroughput: 50000 });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  let bytes = 0; cdp.on('Network.loadingFinished', e => { bytes += e.encodedDataLength; });
  const t0 = Date.now(); await page.goto(BASE, { waitUntil: 'commit' });
  await page.waitForSelector('h1'); const tHead = Date.now() - t0;
  await page.waitForLoadState('load'); const tLoad = Date.now() - t0;
  check('Slow data: headline and actions appear without waiting for fonts or artwork', await page.locator('#hq').isVisible() && await page.locator('.subhelp').isVisible(), `headline ${(tHead / 1000).toFixed(1)}s, fully loaded ${(tLoad / 1000).toFixed(1)}s, ${(bytes / 1024).toFixed(0)} KB over the wire`);
  check('Slow data: first load is under 300 KB before compression', bytes < 300 * 1024, `${(bytes / 1024).toFixed(0)} KB`);
  await ctx.close();
}
await browser.close();
console.log(`\n${results.length - failed} of ${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
