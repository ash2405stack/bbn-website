/* BBN website preview: staff test page.
   Role-based test scripts with a result and a note per step. Results stay in the tester's own browser.
   "Copy my feedback" builds a plain-text summary the tester sends to Ash. Nothing is sent automatically. */
(function () {
  var B = window.BBN, S = B.store, V = B.V, A = B.A, esc = B.esc;
  var ROLES = [
    { id: 'all', name: 'Everyone', who: 'Start here. Test it the way a customer would.', steps: [
      ['a1', 'Sign up as a new resident', 'Open <a href="#flyer-lighthouse-court">Lighthouse Court</a>. Enter unit 102, choose a plan, sign up, use the code shown on screen, then approve the debit order.', 'Was any step confusing? Did you ever not know what to do next?'],
      ['a2', 'Read the full cost', 'On the same building page, choose a plan and look at “Your full cost”.', 'Could you say the monthly cost and the once-off cost within a minute?'],
      ['a3', 'Check an outage', 'From the <a href="#home">home page</a>, tap “Check an outage”, then choose Ridge Gardens.', 'Did you find the outage in two taps? Is the wording clear?'],
      ['a4', 'Report a fault', 'Tap “Report a fault”, choose Lighthouse Court, say what is affected and log it.', 'Is the advice sensible? Did you get a ticket reference?'],
      ['a5', 'Building that is not connected', 'Under Check Coverage, search for a building we do not list and register interest.', 'Is it clear that we are not promising coverage?']
    ] },
    { id: 'ops', name: 'Operations', who: 'Coverage, units, surveys and permissions.', steps: [
      ['o1', 'Unit that needs a check', 'At <a href="#building-lighthouse-court">Lighthouse Court</a> enter unit 204 and save an application. Then open the <a href="#staff">staff demo</a> and confirm the unit.', 'Are the three choices (on record, new, needs survey) the right ones?'],
      ['o2', 'Survey and permission', 'Enter unit 306 and save. In the staff demo send a surveyed cost and mark permission received. Go back to the application and accept the cost.', 'Does this match how surveys and permissions really work?'],
      ['o3', 'Review queue', 'Look at the application queue in the <a href="#staff">staff demo</a>.', 'Is anything missing that you need before you can act on an application?'],
      ['o4', 'Building interest', 'Register interest for the same unlisted building twice with different mobile numbers. Check “Building interest” in the staff demo.', 'Is one record per building useful? What else should it show?']
    ] },
    { id: 'bill', name: 'Billing (Sameera)', who: 'Prices, debit orders, payment wording and Splynx.', steps: [
      ['b1', 'All four debit-order results', 'On an application, start the debit order and choose Declined. Retry and choose Expired. Retry, leave it Pending, then choose Approved.', 'Is the wording for each result correct and fair to the customer?'],
      ['b2', 'A different payer', 'Start a debit order and choose “Someone else pays”.', 'Does this match what Netcash supports for BBN?'],
      ['b3', 'Customer asks for help', 'On the debit-order step tap “I need help with this”, then find it in the <a href="#staff">staff demo</a>.', 'How should these reach you in real life?'],
      ['b4', 'Splynx hand-off', 'After a debit order is approved, use “Create or match in Splynx” in the staff demo.', 'What details do you need on screen to create the customer in Splynx?'],
      ['b5', 'Cost wording', 'Read the cost summary and the placeholders for fees, contract term and equipment on a building page.', 'What are the real figures and wording? Note them in your feedback.']
    ] },
    { id: 'net', name: 'Network team', who: 'Outages, maintenance and fault tickets.', steps: [
      ['n1', 'Publish a notice', 'In the <a href="#staff">staff demo</a>, publish an outage for a building. Check it on <a href="#status">Network Status</a> and on the building page. Then mark it restored.', 'Are the fields the ones you would fill in during a real outage?'],
      ['n2', 'Suspected outage from monitoring', 'Use “Simulate a monitoring alert”, then publish or dismiss it.', 'Is staff review before publishing the right rule?'],
      ['n3', 'Status feed unavailable', 'Tick “Status feed unavailable” and open Network Status.', 'Is the message honest and clear?'],
      ['n4', 'Fault system down', 'Tick “Support system rejects fault reports” and log a fault.', 'Is the customer told what to do instead?']
    ] },
    { id: 'tech', name: 'Technicians', who: 'Fibre-box stickers and installation records.', steps: [
      ['t1', 'Scan a box sticker', 'Open <a href="#box-7k2m-q4hx">box 7K2M-Q4HX</a>, or type the reference under Check Coverage.', 'Would residents understand this page? Is the reference easy to read and type?'],
      ['t2', 'Record a new box', 'In the <a href="#staff">staff demo</a>, fill in “Field update” with a new 8-character reference, building, unit and serials. Then open that box page.', 'Are these the details you record on site? What is missing?'],
      ['t3', 'Router placement advice', 'Read “Fibre is not Wi-Fi” under <a href="#guides">Guides</a>.', 'Is the advice what you tell customers?']
    ] }
  ];
  function st() { return Object.assign({ role: 'all', name: '', res: {}, notes: {}, general: '' }, S.read('test', {})); }
  function save(t) { S.write('test', t); }
  function summary(t) {
    var lines = ['BBN website preview: staff feedback', 'From: ' + (t.name || '(no name)'), 'Date: ' + new Date().toLocaleString('en-ZA'), ''];
    ROLES.forEach(function (r) {
      var done = r.steps.filter(function (s) { return t.res[s[0]] || t.notes[s[0]]; });
      if (!done.length) return;
      lines.push(r.name.toUpperCase());
      done.forEach(function (s) { lines.push('- [' + ({ ok: 'WORKS', bad: 'PROBLEM' }[t.res[s[0]]] || 'NOTE') + '] ' + s[1] + (t.notes[s[0]] ? ': ' + t.notes[s[0]] : '')); });
      lines.push('');
    });
    if (t.general) lines.push('GENERAL', t.general);
    return lines.join('\n').trim();
  }
  V.test = function () {
    var t = st(), role = ROLES.filter(function (r) { return r.id === t.role; })[0] || ROLES[0];
    var count = Object.keys(t.res).length;
    return { title: 'Staff test', html: B.pageHead('Staff test', 'Thank you for testing the new BBN website. Pick your area, work through the steps, and send your feedback to Ash.') +
      '<section class="section"><div class="wrap narrow stack-lg">' +
      '<div class="note demo"><h3>Before you start</h3><ul class="plain muted"><li>This is a test site. Nothing reaches customers, Splynx or Netcash, and no SMS or email is sent.</li>' +
        '<li>Use made-up details: any name, and a mobile number like 082 555 0101. Do not enter real customer details.</li>' +
        '<li>Prices and buildings are samples. They are not BBN’s real prices.</li><li>Your test data stays on your own phone or computer. Other testers cannot see it.</li></ul></div>' +
      '<div class="field"><label for="ts-name">Your name</label><input id="ts-name" value="' + esc(t.name) + '" data-change="testName" autocomplete="name"></div>' +
      '<div><p class="flabel" style="margin-bottom:8px">Your area</p><div class="toggles" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">' + ROLES.map(function (r) {
        return '<button type="button" class="tog" id="role-' + r.id + '" data-act="testRole" data-id="' + r.id + '" aria-pressed="' + (r.id === role.id) + '">' + r.name + '</button>'; }).join('') + '</div></div>' +
      '<div class="stack"><h2>' + role.name + '</h2><p class="muted">' + role.who + '</p>' + role.steps.map(function (s, i) {
        var r = t.res[s[0]] || '';
        return '<div class="card"><h3>' + (i + 1) + '. ' + s[1] + '</h3><p>' + s[2] + '</p><p class="muted"><b>Tell us:</b> ' + s[3] + '</p>' +
          '<div class="row" role="group" aria-label="Result for step ' + (i + 1) + '">' +
            '<button type="button" class="tog" id="res-' + s[0] + '-ok" data-act="testRes" data-id="' + s[0] + '" data-v="ok" aria-pressed="' + (r === 'ok') + '">Works</button>' +
            '<button type="button" class="tog" id="res-' + s[0] + '-bad" data-act="testRes" data-id="' + s[0] + '" data-v="bad" aria-pressed="' + (r === 'bad') + '">Problem</button></div>' +
          '<div class="field"><label for="note-' + s[0] + '">Your notes</label><textarea id="note-' + s[0] + '" data-change="testNote" data-id="' + s[0] + '" style="min-height:72px">' + esc(t.notes[s[0]] || '') + '</textarea></div></div>';
      }).join('') + '</div>' +
      '<div class="stack"><h2>Send your feedback</h2><div class="field"><label for="ts-general">Anything else? What would stop a customer signing up?</label><textarea id="ts-general" data-change="testGeneral">' + esc(t.general) + '</textarea></div>' +
        '<p class="muted">' + count + ' step' + (count === 1 ? '' : 's') + ' marked so far, across all areas. Tap the button, then paste the text into a WhatsApp or email to Ash.</p>' +
        '<div class="row"><button class="btn" data-act="testCopy">Copy my feedback</button><button class="btn ghost" data-act="testShow">Show the text</button></div>' +
        (B.ui.testShow ? '<textarea id="ts-out" readonly style="min-height:220px" aria-label="Feedback text to send to Ash" onfocus="this.select()">' + esc(summary(t)) + '</textarea>' : '') +
        '<p class="small muted">Nothing is sent automatically. Your feedback only reaches Ash when you send it yourself.</p></div>' +
      '</div></section>' };
  };
  A.testName = function (el) { var t = st(); t.name = el.value.trim(); save(t); };
  A.testRole = function (el) { var t = st(); t.role = el.getAttribute('data-id'); save(t); B.rerender('role-' + t.role); };
  A.testRes = function (el) { var t = st(), id = el.getAttribute('data-id'), v = el.getAttribute('data-v'); if (t.res[id] === v) delete t.res[id]; else t.res[id] = v; save(t); B.rerender(el.id); };
  A.testNote = function (el) { var t = st(); t.notes[el.getAttribute('data-id')] = el.value.trim(); save(t); };
  A.testGeneral = function (el) { var t = st(); t.general = el.value.trim(); save(t); };
  A.testShow = function () { B.ui.testShow = true; B.rerender('ts-out'); };
  A.testCopy = function () { B.ui.testShow = true; B.rerender('ts-out'); B.copy(summary(st()), 'Feedback copied. Paste it into a message to Ash.'); };
  B.testSummary = function () { return summary(st()); };
})();
