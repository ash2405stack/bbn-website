/* BBN website preview: staff demo, QR samples, demo checklist and the open-item register.
   The staff screens are a DEMO of the controls BBN staff will need. They have no sign-in and store nothing outside this browser. */
(function () {
  var B = window.BBN, S = B.store, V = B.V, A = B.A, F = B.F, esc = B.esc, tc = B.tc, R = B.R;
  var MAND = { none: 'Not started', pending: 'Pending', approved: 'Approved', declined: 'Declined', expired: 'Expired' };

  function appRow(a) {
    var b = S.building(a.buildingId), n = S.needs(a), next = S.nextStep(a), act = [];
    var btn = function (label, act_, extra) { return '<button class="btn sm ghost" data-act="' + act_ + '" data-ref="' + a.ref + '"' + (extra || '') + '>' + label + '</button>'; };
    if (n.coverage) act.push(btn('Fibre point on record', 'stUnit', ' data-state="existing"'), btn('New installation, standard fee', 'stUnit', ' data-state="new"'), btn('New installation, needs survey', 'stUnit', ' data-state="survey"'));
    if (n.survey) act.push('<form data-form="stCost" novalidate class="inline"><input type="hidden" name="ref" value="' + a.ref + '"><input name="cost" inputmode="numeric" required data-label="the surveyed cost" placeholder="Surveyed cost in rand" aria-label="Surveyed installation cost in rand" style="max-width:190px;min-height:40px"><button class="btn sm ghost">Send cost to customer</button></form>');
    if (n.consent) act.push(btn('Permission received', 'stConsent'));
    if (a.help) act.push(btn('Help given', 'stHelp'));
    if (a.mandate.status === 'approved' && a.splynx.status === 'none') act.push(btn('Create or match in Splynx (simulated)', 'stSplynx'));
    if (a.splynx.status !== 'none' && a.booking.status !== 'confirmed') act.push(btn('Confirm remote activation', 'stBook', ' data-type="remote"'), btn('Book technician visit', 'stBook', ' data-type="visit"'));
    var cov = n.coverage ? '<span class="pill warn">Unit to check</span>' : (n.survey || n.consent || n.costAccept) ? '<span class="pill warn">Open requirements</span>' : '<span class="pill ok">Confirmed</span>';
    var mc = { none: 'mute', pending: 'warn', approved: 'ok', declined: 'bad', expired: 'bad' }[a.mandate.status];
    return '<tr id="row-' + a.ref + '"><td><b class="num">' + a.ref + '</b><br><span class="muted">' + esc(a.name) + '<br>' + B.maskMobile(a.mobile) + '</span></td>' +
      '<td>' + esc(b.name) + '<br>Unit ' + esc(a.unit) + '<br><span class="muted">Via ' + ({ box: 'box QR', flyer: 'flyer QR', search: 'search' }[a.source] || 'search') + '</span></td>' +
      '<td>' + cov + '</td><td><span class="pill ' + mc + '">' + MAND[a.mandate.status] + '</span>' + (a.mandate.ref ? '<br><span class="muted num">' + a.mandate.ref + '</span>' : '') + (a.splynx.id ? '<br><span class="muted num">' + a.splynx.id + '</span>' : '') + '</td>' +
      '<td><b>' + next.owner + '</b></td><td>' + esc(next.text) + (a.preferred ? '<br><span class="muted">Customer prefers ' + esc(a.preferred.date) + ', ' + esc(a.preferred.window) + '</span>' : '') +
      (act.length ? '<div class="row" style="margin-top:8px">' + act.join('') + '</div>' : '') + '</td></tr>';
  }
  A.stUnit = function (el) {
    var a = S.app(el.getAttribute('data-ref')), st = el.getAttribute('data-state');
    S.setUnit(a.buildingId, a.unit, st === 'existing' ? { state: 'existing' } : st === 'new' ? { state: 'new', survey: false, consent: false } : { state: 'new', survey: true, consent: true });
    B.rerender('row-' + a.ref);
  };
  F.stCost = function (d) {
    var cost = parseInt(String(d.cost).replace(/\D/g, ''), 10); if (!cost) return { cost: 'Enter the surveyed cost in rand, for example 2400.' };
    var a = S.app(d.ref); S.setUnit(a.buildingId, a.unit, { finalCost: cost }); B.rerender();
  };
  A.stConsent = function (el) { var a = S.app(el.getAttribute('data-ref')); S.setUnit(a.buildingId, a.unit, { consentReceived: true }); B.rerender(); };
  A.stHelp = function (el) { var a = S.app(el.getAttribute('data-ref')); a.help = false; S.saveApp(a); B.rerender(); };
  A.stSplynx = function (el) { var a = S.app(el.getAttribute('data-ref')); a.splynx = { status: 'matched', id: 'SPX-DEMO-' + S.code(4), at: Date.now() }; S.saveApp(a); B.rerender(); };
  A.stBook = function (el) { var a = S.app(el.getAttribute('data-ref')); a.booking = { status: 'confirmed', type: el.getAttribute('data-type'), when: a.preferred ? a.preferred.date + ', ' + a.preferred.window : '' }; S.saveApp(a); B.rerender(); };

  V.staff = function () {
    var apps = S.apps(), sim = S.sim(), sus = S.suspected(), notices = S.notices(), demand = S.demand(), enq = S.enquiries(), faults = S.faults();
    var bopts = B.buildings.filter(function (b) { return b.offer !== 'none'; }).map(function (b) { return '<option value="' + b.id + '">' + esc(b.name) + '</option>'; }).join('');
    return { title: 'Staff demo', html: B.pageHead('Staff demo', 'The controls BBN staff will use, shown with sample data. There is no sign-in in this preview. ' + tc('STAFF_ACCESS')) +
      '<section class="section"><div class="wrap stack-lg">' +

      '<div class="stack"><h2>Application review queue</h2><p class="muted">Every application shows coverage, debit-order status, who owns the next step, and what that step is. Operations owns coverage. Sameera owns billing.</p>' +
        (apps.length ? '<div class="tablewrap"><table><thead><tr><th>Application</th><th>Building</th><th>Coverage</th><th>Authorisation</th><th>Owner</th><th>Next step</th></tr></thead><tbody>' + apps.map(appRow).join('') + '</tbody></table></div>' :
          '<div class="note"><p>No applications yet. Start one from <a href="#building-lighthouse-court">Lighthouse Court</a>. Try unit 204 to see a unit that needs a check.</p></div>') +
        '<p class="small muted">Splynx stays the live billing system. “Create or match in Splynx” only sets a sample reference here.</p></div>' +

      '<div class="grid2"><div class="stack"><h2>Network notices</h2>' +
        (sus.length ? '<div class="stack">' + sus.map(function (x) { var b = S.building(x.buildingId); return '<div class="note warn"><h3>Suspected outage: ' + esc(b.name) + '</h3><p class="muted">Raised by monitoring at ' + B.time(x.at) + '. Not public until staff publish it.</p><div class="row"><button class="btn sm" data-act="susPublish" data-id="' + x.id + '">Publish as outage</button><button class="btn sm ghost" data-act="susDismiss" data-id="' + x.id + '">Dismiss</button></div></div>'; }).join('') + '</div>' : '') +
        '<form class="card" data-form="notice" novalidate><h3>Publish a notice</h3><div class="formgrid">' +
          '<div class="field"><label for="no-t">Type</label><select id="no-t" name="type"><option value="outage">Outage</option><option value="maintenance">Planned maintenance</option></select></div>' +
          '<div class="field"><label for="no-b">Building</label><select id="no-b" name="buildingId">' + bopts + '</select></div>' +
          '<div class="field wide"><label for="no-a">Affected area</label><input id="no-a" name="area" required data-label="the affected area" placeholder="For example: Block B, floors 3 to 5"></div>' +
          '<div class="field wide"><label for="no-i">Impact, in plain words</label><input id="no-i" name="impact" required data-label="the impact"></div>' +
          '<div class="field"><label for="no-n">Next update in (minutes)</label><input id="no-n" name="next" inputmode="numeric" placeholder="Leave empty if not known"></div>' +
          '<div class="wide"><button class="btn">Publish</button></div></div></form>' +
        '<div class="tablewrap"><table><thead><tr><th>Notice</th><th>Type</th><th>Updated</th><th></th></tr></thead><tbody>' + notices.map(function (n) {
          return '<tr><td><b>' + esc(n.title) + '</b><br><span class="muted">' + esc(n.area) + '</span></td><td>' + n.type + '</td><td>' + B.time(n.updated) + '</td><td>' +
            (n.type === 'outage' ? '<button class="btn sm ghost" data-act="noRestore" data-id="' + n.id + '">Mark restored</button> ' : '') + '<button class="btn sm quiet" data-act="noRemove" data-id="' + n.id + '">Remove</button></td></tr>'; }).join('') + '</tbody></table></div></div>' +

      '<div class="stack"><h2>Simulation switches</h2><div class="card">' +
          '<label class="check"><input type="checkbox" id="sw-feed" data-change="simFeed"' + (sim.statusFeed !== 'ok' ? ' checked' : '') + '><span><b>Status feed unavailable</b><br><span class="muted small">Network Status then says it cannot confirm either way, instead of showing “no known issues”.</span></span></label>' +
          '<label class="check"><input type="checkbox" id="sw-tick" data-change="simTicket"' + (sim.ticketSystem !== 'ok' ? ' checked' : '') + '><span><b>Support system rejects fault reports</b><br><span class="muted small">The fault form then shows no ticket reference and tells the customer what to do instead.</span></span></label>' +
          '<form data-form="monitor" novalidate class="stack-sm"><div class="field"><label for="mo-b">Simulate a monitoring alert for</label><div class="inline"><select id="mo-b" name="buildingId" style="flex:1 1 180px;width:auto">' + bopts + '</select><button class="btn ghost">Raise alert</button></div></div></form></div>' +

        '<h2>Field update (technician)</h2><form class="card" data-form="field" novalidate><p class="muted small">The assigned technician records or verifies the box reference against the right building and unit.</p><div class="formgrid">' +
          '<div class="field"><label for="fd-r">Box reference</label><input id="fd-r" name="ref" required data-label="the box reference" placeholder="8 characters" autocapitalize="characters"></div>' +
          '<div class="field"><label for="fd-b">Building</label><select id="fd-b" name="buildingId">' + bopts + '</select></div>' +
          '<div class="field"><label for="fd-u">Unit</label><input id="fd-u" name="unit" required data-label="the unit number"></div>' +
          '<div class="field"><label for="fd-o">Fibre box (ONT) serial</label><input id="fd-o" name="ont"></div>' +
          '<div class="field"><label for="fd-s">Router serial</label><input id="fd-s" name="router"></div>' +
          '<div class="field"><label for="fd-l">Router location</label><input id="fd-l" name="location" placeholder="For example: lounge, TV unit"></div>' +
          '<div class="field wide"><label for="fd-n">Installation notes</label><textarea id="fd-n" name="notes"></textarea></div>' +
          '<div class="wide"><button class="btn">Save and mark unit as connected</button></div></div>' +
          (B.ui.fieldSaved ? '<div class="note ok" id="field-done" tabindex="-1"><p>Saved. Box <b class="num">' + B.ui.fieldSaved + '</b> now opens that unit. <a href="#box-' + B.ui.fieldSaved.toLowerCase() + '">Open the box page</a></p></div>' : '') + '</form></div></div>' +

      '<div class="grid3">' +
        '<div class="stack"><h2>Building interest</h2>' + (demand.length ? '<div class="tablewrap"><table><thead><tr><th>Building</th><th>Verified</th><th>Managers</th></tr></thead><tbody>' + demand.map(function (g) { return '<tr><td><b>' + esc(g.building) + '</b><br><span class="muted">' + esc(g.address) + '</span></td><td class="num">' + g.count + '</td><td class="num">' + g.managers + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="muted">One record per building. None yet.</p>') + '</div>' +
        '<div class="stack"><h2>Enquiries</h2>' + (enq.length ? '<div class="tablewrap"><table><thead><tr><th>Ref</th><th>From</th><th>Team</th></tr></thead><tbody>' + enq.map(function (e) { return '<tr><td class="num">' + e.ref + '</td><td>' + esc(e.name) + '<br><span class="muted">' + esc(e.where) + '</span></td><td>' + (e.kind === 'business' ? 'Business' : 'Estates') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="muted">Business and estate enquiries land here. None yet.</p>') + '</div>' +
        '<div class="stack"><h2>Fault reports</h2>' + (faults.length ? '<div class="tablewrap"><table><thead><tr><th>Ticket</th><th>Where</th><th>Scope</th></tr></thead><tbody>' + faults.map(function (f) { var b = S.building(f.buildingId); return '<tr><td class="num">' + f.ref + '</td><td>' + esc(b ? b.name : '') + ' ' + esc(f.unit || '') + '</td><td>' + ({ one: 'One device', all: 'All devices', room: 'One room' }[f.scope]) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="muted">Accepted fault reports show here. None yet.</p>') + '</div>' +
      '</div></div></section>' };
  };
  F.notice = function (d) {
    var b = S.building(d.buildingId), now = Date.now();
    S.publishNotice({ type: d.type, buildingIds: [d.buildingId], area: b.name + ', ' + d.area, title: d.type === 'outage' ? 'Outage at ' + b.name : 'Planned maintenance at ' + b.name, impact: d.impact,
      started: d.type === 'outage' ? now : now + 24 * 3600000, ends: now + 26 * 3600000, next: d.next ? now + parseInt(d.next, 10) * 60000 : null });
    B.rerender(); B.toast('Notice published');
  };
  A.noRestore = function (el) { S.patchNotice(el.getAttribute('data-id'), { type: 'restored', title: 'Service restored', next: null }); B.rerender(); };
  A.noRemove = function (el) { S.removeNotice(el.getAttribute('data-id')); B.rerender(); };
  A.simFeed = function (el) { S.setSim({ statusFeed: el.checked ? 'down' : 'ok' }); B.toast(el.checked ? 'Status feed set to unavailable' : 'Status feed restored'); };
  A.simTicket = function (el) { S.setSim({ ticketSystem: el.checked ? 'down' : 'ok' }); B.toast(el.checked ? 'Fault reports will be rejected' : 'Fault reports will be accepted'); };
  F.monitor = function (d) { S.raiseSuspected(d.buildingId); B.rerender(); B.toast('Alert raised for staff review'); };
  A.susPublish = function (el) {
    var x = S.suspected().filter(function (s) { return s.id === el.getAttribute('data-id'); })[0], b = S.building(x.buildingId);
    S.publishNotice({ type: 'outage', buildingIds: [b.id], area: b.name, title: 'Outage at ' + b.name, impact: 'We are investigating a loss of service in this building.', started: x.at, next: Date.now() + 30 * 60000 });
    S.clearSuspected(x.id); B.rerender();
  };
  A.susDismiss = function (el) { S.clearSuspected(el.getAttribute('data-id')); B.rerender(); };
  F.field = function (d) {
    var ref = S.normBox(d.ref); if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(ref)) return { ref: 'A box reference has 8 letters and numbers, for example 7K2M-Q4HX.' };
    var unit = S.normUnit(d.unit);
    S.setBox(ref, { buildingId: d.buildingId, unit: unit, ont: d.ont, router: d.router, location: d.location, notes: d.notes, verifiedAt: Date.now() });
    S.setUnit(d.buildingId, unit, { state: 'existing' });
    B.ui.fieldSaved = ref; B.rerender('field-done');
  };

  /* ---------- demo page: checklist, QR samples, staff controls, register ---------- */
  V.demo = function () {
    var flyerUrl = B.link('flyer-lighthouse-court'), boxUrl = B.link('box-7k2m-q4hx');
    var checklist = [
      ['Scan a noticeboard flyer', 'Open <a href="#flyer-lighthouse-court">Lighthouse Court</a> (or scan the sample flyer below). Enter unit 102, pick a plan, read the full cost.'],
      ['Sign up end to end', 'Continue to signup, enter your details, use the on-screen SMS code, then authorise the debit order and choose <b>Approved</b>.'],
      ['Try all four debit-order outcomes', 'On the application page choose Declined, retry, choose Expired, retry, leave one Pending, then Approved. The reference never changes.'],
      ['Interrupt a signup and come back', 'Copy your application link, go to the home page, then open the link again. Reset the demo data to see the SMS check on return.'],
      ['Check a unit by hand', 'At Lighthouse Court enter unit 204 (needs a check) or 999 (not on record). Save, then confirm the unit in the <a href="#staff">staff demo</a> and resume.'],
      ['Survey and permission', 'Enter unit 306. Save the application, send a surveyed cost and mark permission received in the staff demo, then accept the cost as the customer.'],
      ['Scan a fibre-box sticker', 'Open <a href="#box-7k2m-q4hx">box 7K2M-Q4HX</a> or type it under Check Coverage. Confirm the unit, then try both buttons.'],
      ['Register building interest', 'Search for a building that is not listed, or open <a href="#building-palm-crest-estate">Palm Crest Estate</a>. Add your name and copy the share link.'],
      ['Look up an outage in two taps', 'From the home page tap <b>Check an outage</b>. Ridge Gardens has a sample outage. Pick a building to filter.'],
      ['Log a fault', 'Tap <b>Report a fault</b>, choose Lighthouse Court, pick what is affected, and log it. You get a ticket reference. Then switch on “Support system rejects fault reports” in the staff demo and try again.'],
      ['Open My Account', 'Tap <b>My Account</b>. The portal button explains where the live link will go.']
    ];
    var staffControls = [
      ['Application review queue with coverage, authorisation, owner and next step', 'Represented'],
      ['Confirm a unit: fibre point on record, new installation, or survey needed', 'Represented'],
      ['Record a surveyed cost and permission received', 'Represented'],
      ['Create or match the customer in Splynx', 'Represented (sample reference only)'],
      ['Confirm remote activation or a technician visit', 'Represented'],
      ['Publish outage and maintenance notices by building; mark restored', 'Represented'],
      ['Review suspected outages raised by monitoring before they go public', 'Represented (alert is simulated)'],
      ['Technician field update: box reference, serials, router location, notes', 'Represented'],
      ['Building-interest demand, grouped per building', 'Represented'],
      ['Business and estate enquiry inbox', 'Represented (list only)'],
      ['Staff sign-in, roles and audit trail', 'Pending'],
      ['Editing buildings, units, plans and prices on screen (today: edit js/data.js)', 'Pending'],
      ['Approved alternatives to debit order, recorded by Sameera', 'Pending'],
      ['Live Splynx, Netcash, SMS and support-system connections', 'Pending separate approval'],
      ['Publishing by area across several buildings; scheduled maintenance times', 'Pending'],
      ['Automatic public outage and restoration updates', 'Pending BBN verification and release approval']
    ];
    var reg = B.register;
    return { title: 'Demo and open items', html: B.pageHead('Demo and open items', 'How to test this preview, the sample QR codes, what staff controls exist, and everything BBN still needs to confirm.') +
      '<section class="section"><div class="wrap stack-lg">' +
      '<div class="note demo"><h3>What this preview is</h3><p class="muted">A private preview with sample buildings, sample prices and simulated services. It does not touch the live BBN website, Splynx, Netcash or any customer record. No SMS, email or WhatsApp message is sent. What you type is stored only in this browser.</p>' +
        '<div class="row">' + (B.ui.resetAsk ? '<span><b>Clear everything you entered in this preview?</b></span><button class="btn sm" data-act="resetDo">Yes, reset</button><button class="btn sm ghost" data-act="resetNo">Keep it</button>' : '<button class="btn sm ghost" id="reset-btn" data-act="resetAsk">Reset demo data</button>') + '</div></div>' +

      '<div class="stack"><h2>Demo checklist</h2><ol class="steps">' + checklist.map(function (c) { return '<li><div class="body"><h3>' + c[0] + '</h3><p class="muted">' + c[1] + '</p></div></li>'; }).join('') + '</ol></div>' +

      '<div class="stack"><h2>Sample QR codes</h2><p class="muted">Print these or scan them from a second screen. ' + (B.config.previewUrl ? 'They open this preview.' : 'They point at the address this page was opened from.') + ' The permanent address format for printed codes is still to be decided: ' + tc('SITE_DOMAIN_AND_QR_URLS') + '</p>' +
        '<div class="row" style="align-items:flex-start;gap:32px">' +
          '<div class="stack-sm"><p class="flabel">Noticeboard flyer</p><div class="flyer"><div class="top"><p style="font:700 12px/16px var(--display);letter-spacing:.08em;text-transform:uppercase;color:#9fd3ff">Lighthouse Court residents</p><h3>Fibre we own. Speed you feel.</h3><p style="color:#c9d3ea">Scan to see the plans and prices for this building.</p></div>' +
            '<div class="mid"><div class="qr">' + B.qr(flyerUrl) + '</div><p style="font-size:14px;color:#4b5a70">Enter your unit number on the page that opens.</p><img src="assets/bbn-logo-primary.svg" alt="Big Bully Networx"><p style="font-size:12px;color:#4b5a70">Sample flyer. Not for print.</p></div></div>' +
            '<a href="#flyer-lighthouse-court">Simulate this scan</a></div>' +
          '<div class="stack-sm"><p class="flabel">Fibre-box sticker</p><div class="sticker"><img src="assets/bbn-logo-icon.svg" alt="" width="36" height="36"><div class="qr">' + B.qr(boxUrl) + '</div><p style="font-size:12px;color:#4b5a70">Scan, or type this reference</p><p class="ref num">7K2M-Q4HX</p></div>' +
            '<a href="#box-7k2m-q4hx">Simulate this scan</a><p class="small muted" style="max-width:220px">The code holds only a box reference. No name, account or billing detail.</p>' +
            '<p class="small muted" style="max-width:220px">Other sample references: 9D3F-T8RW (unit needs a check), 4P6C-L2NV (Ridge Gardens).</p></div>' +
        '</div></div>' +

      '<div class="stack"><h2>Staff controls</h2><div class="tablewrap"><table><thead><tr><th>Control</th><th>In this preview</th></tr></thead><tbody>' + staffControls.map(function (c) { return '<tr><td>' + c[0] + '</td><td>' + (c[1].indexOf('Represented') === 0 ? '<span class="pill ok">' : '<span class="pill warn">') + c[1] + '</span></td></tr>'; }).join('') + '</tbody></table></div><a class="btn ghost" href="#staff" style="justify-self:start">Open the staff demo</a></div>' +

      '<div class="stack"><h2>Open-item register</h2><p class="muted">' + reg.length + ' items. This table is generated from <code>site/js/register.js</code>, the single place to edit them. Each key appears on the site as a placeholder like ' + tc('HOME_PLAN_PRICES') + '.</p>' +
        '<div class="tablewrap"><table><thead><tr><th>Placeholder key</th><th>Q no.</th><th>What is needed</th><th>Owner</th><th>Status</th><th>Source</th><th>Affected pages</th></tr></thead><tbody>' +
        reg.map(function (r) { return '<tr><td><code>' + esc(r.key) + '</code></td><td>' + (r.q || '<span class="muted">Not mapped</span>') + '</td><td>' + esc(r.field) + '</td><td>' + esc(r.owner) + '</td><td>' + esc(r.status) + '</td><td>' + esc(r.source) + '</td><td>' + esc(r.pages) + '</td></tr>'; }).join('') +
        '</tbody></table></div></div>' +
      '</div></section>' };
  };
  A.resetAsk = function () { B.ui.resetAsk = true; B.rerender(); };
  A.resetNo = function () { B.ui.resetAsk = false; B.rerender('reset-btn'); };
  A.resetDo = function () { S.reset(); B.ui = { sel: {} }; B.rerender(); B.toast('Demo data reset'); };
})();
