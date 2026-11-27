/* BBN website preview: the two customer journeys.
   New customers: building page, unit check, plans, signup, debit order, booking, building interest.
   Subscribers: network status, troubleshooting, fault report, My Account. */
(function () {
  var B = window.BBN, S = B.store, V = B.V, A = B.A, F = B.F, esc = B.esc, tc = B.tc, R = B.R, SAMPLE = B.sampleTag;

  /* ================= shared pieces ================= */
  function noticeCard(n) {
    var kind = { outage: ['bad', 'Outage'], maintenance: ['warn', 'Planned maintenance'], restored: ['ok', 'Restored'] }[n.type];
    return '<div class="note ' + kind[0] + '"><div class="spread"><h3>' + esc(n.title) + '</h3><span class="pill ' + kind[0] + '"><span class="dot"></span>' + kind[1] + '</span></div>' +
      '<p><b>' + esc(n.area) + '</b></p><p class="muted">' + esc(n.impact) + '</p>' +
      '<p class="small muted">' + (n.type === 'maintenance' ? 'Window: ' + B.time(n.started) + ' to ' + B.time(n.ends) + '. ' : n.type === 'outage' ? 'Started: ' + B.time(n.started) + '. ' : '') +
      'Last update: ' + B.time(n.updated) + '. ' + (n.type === 'outage' ? 'Next update: ' + (n.next ? 'by ' + B.time(n.next) : 'not known yet') + '.' : '') +
      (n.staff ? '' : ' ' + SAMPLE) + '</p></div>';
  }
  B.noticeCard = noticeCard;

  function unitFees(u) {       // fees come from the unit record only, never from whether a QR code was scanned
    if (!u || u.state === 'check') return { known: false, label: 'Confirmed after we check your unit', amount: null };
    if (u.state === 'existing') return { known: true, label: 'Activation fee (fibre point already in the unit)', amount: B.fees.activation };
    if (u.survey) return u.finalCost != null ? { known: true, label: 'Installation (priced after survey)', amount: u.finalCost } : { known: false, label: 'Installation: priced after a survey. You accept the cost before you commit.', amount: null };
    return { known: true, label: 'Installation fee (new fibre point)', amount: B.fees.installation };
  }
  function costSummary(b, u, plan) {
    var f = unitFees(u), ex = plan ? plan.monthlyIncVat / (1 + B.config.vatRate) : 0;
    return '<div class="costs" id="costs">' +
      (plan ? '<div class="line"><span>' + B.speed(plan.down) + ' down, ' + B.speed(plan.up) + ' up</span><span class="num">' + R(plan.monthlyIncVat) + ' pm ' + SAMPLE + '</span></div>' +
        '<div class="line small muted"><span>Of which VAT at 15%</span><span class="num">' + R(plan.monthlyIncVat - ex) + '</span></div>' : '<div class="line"><span>Plan</span><span>Not chosen yet</span></div>') +
      '<div class="line"><span>' + f.label + '</span><span class="num">' + (f.known ? R(f.amount) + ' once ' + SAMPLE : 'To be confirmed') + '</span></div>' +
      '<div class="line"><span>Contract term</span><span>' + tc('CONTRACT_TERM') + '</span></div>' +
      '<div class="line"><span>Equipment and returns</span><span>' + tc('EQUIPMENT_AND_RETURNS') + '</span></div>' +
      (plan ? '<div class="line total"><span>You pay each month</span><span class="num">' + R(plan.monthlyIncVat) + ' incl. VAT</span></div>' +
        '<div class="line total" style="padding-top:0"><span>You pay once</span><span class="num">' + (f.known ? R(f.amount) + ' incl. VAT' : 'To be confirmed') + '</span></div>' : '') +
      '</div>';
  }
  function planOf(b, id) { return S.plansFor(b).filter(function (p) { return p.id === id; })[0] || null; }
  function unitResult(b, u) {
    if (u.state === 'existing') return '<div class="note ok" id="unit-result" tabindex="-1"><h3>Unit ' + esc(u.unit) + ' has a BBN fibre point on record</h3><p class="muted">You can sign up online now. Only an activation fee applies.</p></div>';
    if (u.state === 'new' && (u.survey || u.consent)) return '<div class="note warn" id="unit-result" tabindex="-1"><h3>Unit ' + esc(u.unit) + ' needs a new installation, with a few things to settle first</h3><ul class="plain muted">' +
      (u.survey ? '<li>' + (u.finalCost != null ? 'Installation priced at ' + R(u.finalCost) + ' after survey.' : 'A survey to price the installation.') + '</li>' : '') +
      (u.consent ? '<li>' + (u.consentReceived ? 'Permission received.' : 'Permission from the owner or body corporate.') + '</li>' : '') +
      '</ul><p class="muted">Save your application now. You only commit after you accept the final cost.</p></div>';
    if (u.state === 'new') return '<div class="note ok" id="unit-result" tabindex="-1"><h3>Unit ' + esc(u.unit) + ' is confirmed for a new installation</h3><p class="muted">You can sign up online now. A standard installation fee applies.</p></div>';
    return '<div class="note warn" id="unit-result" tabindex="-1"><h3>We need to check unit ' + esc(u.unit) + ' first</h3><p class="muted">Our records for this unit are not complete. Leave your name and mobile number and BBN will confirm whether it can be connected. You can still compare plans now.</p></div>';
  }
  function planCards(b, selId, need) {
    var plans = S.plansFor(b), fit = need ? plans.filter(function (p) { return p.down >= need; })[0] : null;
    return '<fieldset style="border:0;padding:0;margin:0"><legend class="flabel" style="margin-bottom:10px">Choose a plan</legend><div class="plans">' + plans.map(function (p) {
      return '<label class="plan"><input type="radio" name="plan" id="plan-' + p.id + '" value="' + p.id + '" data-change="pickPlan"' + (selId === p.id ? ' checked' : '') + '>' +
        '<span class="speed num">' + (p.down >= 1000 ? p.down / 1000 : p.down) + '<small>' + (p.down >= 1000 ? 'Gbps' : 'Mbps') + '</small></span>' +
        '<span class="small muted">' + B.speed(p.down) + ' download, ' + B.speed(p.up) + ' upload</span>' +
        '<span class="price num">' + R(p.monthlyIncVat) + ' pm <span class="small muted">incl. VAT</span></span>' +
        '<span>' + SAMPLE + (p.buildingPrice ? ' <span class="small muted">Price for this building</span>' : '') + '</span>' +
        (fit && fit.id === p.id ? '<span class="fit">Fits what you told the speed guide</span>' : '') + '</label>';
    }).join('') + '</div></fieldset>';
  }

  /* ================= building page (also the noticeboard flyer landing) ================= */
  V.building = function (id) {
    var b = S.building(id); if (!b) return null;
    if (B.ui.sel.buildingId !== id) B.setSel({ buildingId: id, unit: '', planId: null, boxRef: null, source: 'search' });
    var sel = B.ui.sel, u = sel.unit ? S.unit(id, sel.unit) : null, plan = planOf(b, sel.planId);
    var notices = S.sim().statusFeed === 'ok' ? S.noticesFor(id).filter(function (n) { return n.type !== 'restored'; }) : [];
    var net = b.offer === 'bbn' ? '<span class="pill info">BBN-owned fibre</span>' : b.offer === 'partner' ? '<span class="pill info">Partner network</span>' : '<span class="pill mute">Not connected yet</span>';
    var head = B.pageHead(esc(b.name), esc(b.address) + ' ' + SAMPLE, '<a href="#coverage">Check Coverage</a>');
    if (b.offer === 'none') return { title: b.name, nav: 'home-fibre', html: head + '<section class="section"><div class="wrap narrow stack">' + net +
      '<h2>BBN does not have an offer for this building yet</h2><p class="lede">If enough residents ask, we will look at connecting it. Add your name, then share the link with neighbours or building management.</p>' +
      '<div class="row"><a class="btn" href="#interest-' + b.id + '">Bring BBN fibre to my building</a><a class="btn ghost" href="#estates">I manage this building</a></div></div></section>' };

    var need = B.ui.guideOpen ? B.guideNeed() : null, plans = S.plansFor(b);
    var fit = need ? plans.filter(function (p) { return p.down >= need; })[0] : null;
    var cheaper = plan && fit && fit.monthlyIncVat < plan.monthlyIncVat ? fit : null;
    var cta;
    if (!u) cta = '<p class="muted" id="cta">Enter your unit number above to continue.</p>';
    else if (u.state === 'check') cta = '<a class="btn" id="cta" href="#signup">Ask BBN to check my unit</a>';
    else if (!plan) cta = '<p class="muted" id="cta">Choose a plan to continue.</p>';
    else if (u.state === 'new' && (u.survey || u.consent)) cta = '<a class="btn" id="cta" href="#signup">Save my application</a>';
    else cta = '<a class="btn" id="cta" href="#signup">Sign up for ' + B.speed(plan.down) + '</a>';

    return { title: b.name, nav: 'home-fibre', html: head +
      '<section class="section"><div class="wrap stack-lg">' +
        '<div class="row">' + net + (b.offer === 'partner' ? '<span class="small muted">Service here runs on a partner network: ' + tc(b.partner) + '. BBN is still your provider and your support.</span>' : '<span class="small muted">BBN built and runs the fibre in this building.</span>') + '</div>' +
        (notices.length ? '<div class="stack">' + notices.map(noticeCard).join('') + '</div>' : '') +
        '<div class="grid2">' +
          '<div class="stack"><h2>1. Your unit</h2>' +
            '<form data-form="unit" novalidate><div class="field"><label for="unit">Unit number</label><div class="inline"><input id="unit" name="unit" required data-label="your unit number" value="' + esc(sel.unit || '') + '" autocomplete="off" inputmode="text" placeholder="For example 102"><button class="btn ghost">Check unit</button></div>' +
            '<p class="hint">Try 102, 204, 305 or 306 at Lighthouse Court, or any other number. ' + SAMPLE + '</p></div></form>' +
            (u ? unitResult(b, u) : '') +
            '<details><summary>Scan or type your fibre-box reference (optional)</summary><div class="body full"><p class="muted">If there is a BBN sticker on the fibre box in your unit, scan its QR code with your phone camera, or type the short reference printed under it. No sticker? No problem. It makes no difference to the price.</p>' +
              '<form data-form="boxref" novalidate><div class="field"><label for="bx2">Box reference</label><div class="inline"><input id="bx2" name="ref" required data-label="the box reference" placeholder="For example 7K2M-Q4HX" autocapitalize="characters" autocomplete="off"><button class="btn ghost">Use this reference</button></div></div></form></div></details>' +
            '<div class="stack" style="margin-top:16px"><h2>2. Plans in this building</h2>' + planCards(b, sel.planId, need) +
          '<details' + (B.ui.guideOpen ? ' open' : '') + ' data-guide><summary data-act="guideOpen">Help me choose a speed</summary><div class="body full">' + B.guideControls() +
            '<p class="muted">Suggested: <b class="num">' + B.guideNeed() + ' Mbps or more</b>. ' + (fit ? 'The ' + B.speed(fit.down) + ' plan is the lowest-cost plan here that fits.' : 'The fastest plan here is the closest fit.') + ' This is a guide, not a guarantee.</p></div></details>' +
          '<p class="small muted">Promotions: ' + tc('PROMOTIONS') + '</p></div>' +
          '</div>' +
          '<div class="stack sticky"><h2>3. Your full cost</h2><div class="card">' + costSummary(b, u, plan) + '</div>' +
            (cheaper ? '<div class="note" id="cheaper"><h3>A lower-cost plan would also fit</h3><p class="muted">' + B.speed(cheaper.down) + ' at ' + R(cheaper.monthlyIncVat) + ' pm covers what you told the speed guide.</p><button class="linkbtn" data-act="pickPlanId" data-id="' + cheaper.id + '">Switch to ' + B.speed(cheaper.down) + '</button></div>' : '') +
            cta + '<p class="small muted">We only ask for your contact details on the next step.</p></div>' +
        '</div>' +
      '</div></section>' };
  };
  /* A noticeboard flyer QR opens the same public building page; we only remember that the visit came from a flyer. */
  V.flyer = function (id) {
    if (!S.building(id)) return null;
    if (B.ui.sel.buildingId !== id || B.ui.sel.source !== 'flyer') B.setSel({ buildingId: id, unit: '', planId: null, boxRef: null, source: 'flyer' });
    return V.building(id);
  };
  F.unit = function (d) { B.setSel({ unit: S.normUnit(d.unit), source: B.ui.sel.source || 'search' }); B.rerender('unit-result'); };
  A.pickPlan = function (el) { B.setSel({ planId: el.value }); B.rerender('plan-' + el.value); };
  A.pickPlanId = function (el) { var id = el.getAttribute('data-id'); B.setSel({ planId: id }); B.rerender('plan-' + id); };
  A.guideOpen = function (el, e) { e.preventDefault(); B.ui.guideOpen = !B.ui.guideOpen; B.rerender(); };

  /* ================= termination-box QR landing ================= */
  V.box = function (ref) {
    var box = S.box(ref);
    if (!box) return { title: 'Box reference', html: B.pageHead('We do not recognise that box reference', 'The sticker may not be registered yet. You can still check your unit by searching for your building.') +
      '<section class="section"><div class="wrap row"><a class="btn" href="#coverage">Search for my building</a></div></section>' };
    var b = S.building(box.buildingId);
    return { title: 'Fibre box ' + box.ref, nav: 'home-fibre', html:
      B.pageHead('Is this your unit?', 'You scanned the BBN sticker on a fibre box. The sticker tells us where the box is. It does not tell us who you are.') +
      '<section class="section"><div class="wrap narrow stack">' +
        '<div class="card"><dl class="kv"><dt>Building</dt><dd>' + esc(b.name) + '</dd><dt>Address</dt><dd>' + esc(b.address) + '</dd><dt>Unit</dt><dd>' + esc(box.unit) + '</dd><dt>Box reference</dt><dd class="num">' + box.ref + '</dd></dl>' +
          '<p class="small muted">We never show who lives here or any account details on this page. For anything on an existing account, the usual checks still apply.</p></div>' +
        '<div class="row"><button class="btn" data-act="boxConnect" data-ref="' + box.ref + '">Get connected</button><button class="btn ghost" data-act="boxHelp" data-ref="' + box.ref + '">Get help with my connection</button></div>' +
        '<p><a href="#building-' + b.id + '">This is not my unit</a></p></div></section>' };
  };
  A.boxConnect = function (el) { var x = S.box(el.getAttribute('data-ref')); B.setSel({ buildingId: x.buildingId, unit: x.unit, planId: null, boxRef: x.ref, source: 'box' }); B.go('building-' + x.buildingId); };
  A.boxHelp = function (el) { var x = S.box(el.getAttribute('data-ref')); B.ui.fault = { buildingId: x.buildingId, unit: x.unit, boxRef: x.ref }; B.go('fault'); };

  /* ================= SMS verification (simulated) ================= */
  function otpPanel() {
    var o = B.ui.otp;
    return '<form class="card" data-form="otp" novalidate id="otp-panel"><h2 tabindex="-1" id="otp-title">Check your phone</h2>' +
      '<p class="muted">We sent a 6-digit code by SMS to <b>' + B.maskMobile(o.mobile) + '</b>. Enter it to continue.</p>' +
      '<div class="sim"><b>Preview only: no SMS was sent</b><p>Your code is <b class="num" id="demo-code">' + o.code + '</b>. On the live site this arrives by SMS. ' + tc('SMS_VERIFICATION_RULES') + '</p></div>' +
      '<div class="field"><label for="otp">6-digit code</label><input id="otp" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required data-label="the 6-digit code" data-nodraft></div>' +
      '<div class="row"><button class="btn">Verify</button><button type="button" class="btn quiet" data-act="otpResend">Send a new code</button><button type="button" class="btn quiet" data-act="otpCancel">Change number</button></div></form>';
  }
  function startOtp(mobile, purpose, payload) { B.ui.otp = { mobile: mobile, purpose: purpose, payload: payload, code: S.sendCode(mobile) }; B.rerender('otp-title'); }
  F.otp = function (d) {
    var o = B.ui.otp, r = S.checkCode(o.mobile, d.code);
    if (r === 'wrong') return { code: 'That code does not match. Check the SMS and try again.' };
    if (r !== 'ok') return { code: 'That code has expired. Send a new code.' };
    B.ui.otp = null; B.OTP[o.purpose](o.payload, o.mobile);
  };
  A.otpResend = function () { var o = B.ui.otp; o.code = S.sendCode(o.mobile); B.rerender('otp'); B.toast('New code sent'); };
  A.otpCancel = function () { B.ui.otp = null; B.rerender(); };

  /* ================= signup (short form, carried from the building page) ================= */
  V.signup = function () {
    var sel = B.ui.sel, b = sel.buildingId && S.building(sel.buildingId), u = b && sel.unit ? S.unit(b.id, sel.unit) : null;
    if (!b || !u) return { title: 'Sign up', html: B.pageHead('Start with your building', 'We need your building and unit before you can sign up.') + '<section class="section"><div class="wrap"><a class="btn" href="#coverage">Check Coverage</a></div></section>' };
    var plan = planOf(b, sel.planId);
    var mode = u.state === 'check' ? 'check' : (u.state === 'new' && (u.survey || u.consent)) ? 'save' : 'full';
    if (mode === 'full' && !plan) return { title: 'Sign up', html: B.pageHead('Choose a plan first', '') + '<section class="section"><div class="wrap"><a class="btn" href="#building-' + b.id + '">Back to ' + esc(b.name) + '</a></div></section>' };
    var title = mode === 'check' ? 'Ask BBN to check your unit' : mode === 'save' ? 'Save your application' : 'Sign up';
    var lede = mode === 'check' ? 'We will confirm whether unit ' + esc(u.unit) + ' can be connected. Then you finish signing up from the same link.' :
      mode === 'save' ? 'We will settle the survey and permissions, then you accept the final cost before you commit.' : 'Three details and you are done. Your address, plan and price are carried over.';
    var form = B.ui.otp && B.ui.otp.purpose === 'signup' ? otpPanel() :
      '<form class="card" data-form="signup" data-draft="signup" novalidate><h2>Your details</h2><div class="formgrid">' +
        '<div class="field wide"><label for="su-name">Full name</label><input id="su-name" name="name" required data-label="your full name" autocomplete="name"></div>' +
        '<div class="field"><label for="su-mobile">Mobile number</label><input id="su-mobile" name="mobile" type="tel" inputmode="tel" required data-kind="mobile" data-label="your mobile number" autocomplete="tel"><p class="hint">We send a code by SMS to confirm it is yours.</p></div>' +
        '<div class="field"><label for="su-email">Email' + (mode === 'check' ? ' (optional for now)' : '') + '</label><input id="su-email" name="email" type="email"' + (mode === 'check' ? '' : ' required') + ' data-label="your email address" autocomplete="email"></div>' +
        (mode === 'full' ? '<label class="check wide"><input type="checkbox" id="su-terms" name="terms" required data-msg="Tick the box to accept the service terms."><span>I accept the BBN service terms (version ' + esc(B.config.termsVersion) + ') and the costs shown here. <a href="#legal">Read the terms and privacy notice</a>. ' + tc('SERVICE_TERMS_VERSION') + '</span></label>' :
          '<p class="wide small muted">You are not committing to anything yet. Privacy notice: ' + tc('PRIVACY_NOTICE') + '</p>') +
        '<div class="wide"><button class="btn">' + (mode === 'full' ? 'Continue to debit order' : 'Verify my number and save') + '</button></div></div></form>';
    return { title: title, nav: 'home-fibre', html: B.pageHead(title, lede, '<a href="#building-' + b.id + '">' + esc(b.name) + '</a>') +
      '<section class="section"><div class="wrap grid2"><div>' + form + '</div>' +
        '<div class="card"><h3>' + esc(b.name) + ', unit ' + esc(u.unit) + '</h3><p class="small muted">' + esc(b.address) + ' <a href="#building-' + b.id + '">Change</a></p>' + costSummary(b, u, plan) + '</div></div></section>' };
  };
  F.signup = function (d) {
    var sel = B.ui.sel, mobile = S.normMobile(d.mobile);
    var payload = { buildingId: sel.buildingId, unit: sel.unit, planId: sel.planId, source: sel.source, boxRef: sel.boxRef, name: d.name, email: d.email,
      terms: d.terms ? { version: B.config.termsVersion, at: Date.now() } : null };
    if (S.isVerified(mobile)) return B.OTP.signup(payload, mobile);      // reuse a verification that is still valid
    startOtp(mobile, 'signup', payload);
  };
  B.OTP.signup = function (p, mobile) {       // the application is only created once the mobile number is verified
    p.mobile = mobile; var a = S.createApp(p);
    if (!a.email && p.email) a.email = p.email; if (!a.planId && p.planId) a.planId = p.planId; if (!a.terms && p.terms) a.terms = p.terms;
    S.saveApp(a); B.clearDraft('signup'); B.go('apply-' + a.ref.toLowerCase());
  };

  /* ================= application page: resume, debit order, what happens next ================= */
  var MANDATE = { none: ['mute', 'Not started'], pending: ['warn', 'Pending'], approved: ['ok', 'Approved'], declined: ['bad', 'Declined'], expired: ['bad', 'Expired'] };
  V.apply = function (param) {
    var a = S.app(String(param).toUpperCase());
    if (!a) return { title: 'Application', html: B.pageHead('We cannot find that application here', 'In this preview, applications are stored in the browser where they were started. Open the link in that browser, or start again.') + '<section class="section"><div class="wrap"><a class="btn" href="#coverage">Check Coverage</a></div></section>' };
    var b = S.building(a.buildingId);
    if (!S.isVerified(a.mobile)) return { title: 'Resume application', html: B.pageHead('Welcome back', 'To open application ' + a.ref + ', confirm the mobile number ending ' + a.mobile.slice(-2) + '.') +
      '<section class="section"><div class="wrap narrow">' + (B.ui.otp && B.ui.otp.purpose === 'resume' ? otpPanel() : '<button class="btn" data-act="resumeVerify" data-ref="' + a.ref + '">Send me a code</button>') + '</div></section>' };

    var n = S.needs(a), u = n.unit, plan = planOf(b, a.planId), m = a.mandate, next = S.nextStep(a);
    var unitDone = !n.coverage && !n.survey && !n.consent && !n.costAccept, detailsDone = unitDone && !n.details, payDone = m.status === 'approved';
    var cls = function (done, now) { return done ? 'done' : now ? 'now' : ''; };

    var s1 = unitDone ? '<p class="muted">' + (u.state === 'existing' ? 'Fibre point on record. Activation only.' : 'Confirmed for a new installation.') + '</p>' :
      '<p>We are still working on:</p><ul class="plain">' +
        (n.coverage ? '<li>Checking whether unit ' + esc(a.unit) + ' can be connected.</li>' : '') +
        (n.survey ? '<li>A survey to price the installation.</li>' : '') +
        (n.consent ? '<li>Permission from the owner or body corporate.</li>' : '') + '</ul>' +
      (n.costAccept ? '<div class="note warn" id="cost-accept" tabindex="-1"><h3>Final installation cost: ' + R(u.finalCost) + ' incl. VAT</h3><p class="muted">This is the surveyed cost for your unit. You only go ahead if you accept it.</p><div class="row"><button class="btn" data-act="acceptCost" data-ref="' + a.ref + '">Accept ' + R(u.finalCost) + '</button></div></div>' :
        '<p class="muted">You do not need to do anything. Come back with this link and we will show the latest.</p><div class="note demo"><p class="small">Preview: open the <a href="#staff">staff demo</a> to confirm this unit, then return here.</p></div>');

    var s2 = detailsDone ? '<p class="muted">' + (plan ? B.speed(plan.down) + ' at ' + R(plan.monthlyIncVat) + ' pm. ' : '') + 'Terms version ' + esc(a.terms.version) + ' accepted ' + B.time(a.terms.at) + '.</p>' :
      !unitDone ? '<p class="muted">Opens once your unit is confirmed.</p>' :
      '<form data-form="finish" data-draft="finish-' + a.ref + '" novalidate class="stack"><input type="hidden" name="ref" value="' + a.ref + '">' +
        '<div class="field"><label for="fi-plan">Plan</label><select id="fi-plan" name="planId" required data-label="a plan">' + S.plansFor(b).map(function (p) { return '<option value="' + p.id + '"' + (p.id === a.planId ? ' selected' : '') + '>' + B.speed(p.down) + ' · ' + R(p.monthlyIncVat) + ' pm incl. VAT (sample)</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label for="fi-email">Email</label><input id="fi-email" name="email" type="email" required data-label="your email address" value="' + esc(a.email) + '" autocomplete="email"></div>' +
        costSummary(b, u, plan || S.plansFor(b)[0]) +
        '<label class="check"><input type="checkbox" name="terms" required data-msg="Tick the box to accept the service terms."><span>I accept the BBN service terms (version ' + esc(B.config.termsVersion) + ') and the costs for the plan I selected. <a href="#legal">Read the terms</a>.</span></label>' +
        '<div><button class="btn">Accept and continue</button></div></form>';

    var s3;
    if (!detailsDone) s3 = '<p class="muted">Opens once your details and terms are done.</p>';
    else if (m.status === 'approved') s3 = '<div class="note ok" id="mandate" tabindex="-1"><h3>Debit order authorised</h3><p class="muted">Reference <span class="num">' + m.ref + '</span>. BBN holds only this reference and its status.</p></div>';
    else if (m.status === 'pending') s3 = '<div class="note warn" id="mandate" tabindex="-1"><h3>Waiting for the authorisation</h3><p class="muted">' + (m.payer ? 'We sent the authorisation link to ' + esc(m.payer.name) + ' (' + B.maskMobile(m.payer.mobile) + ').' : 'Finish the authorisation with Netcash.') + ' Reference <span class="num">' + m.ref + '</span>. A second request cannot be opened while this one is waiting.</p></div>' +
      '<div class="sim"><b>Simulated Netcash result</b><p class="small">On the live site the result comes from Netcash. Pick one to test: ' + tc('Q14_NETCASH_AUTHORIZATION') + '</p><div class="row">' +
        ['approved', 'declined', 'expired'].map(function (o) { return '<button class="btn sm ghost" data-act="mandateResolve" data-ref="' + a.ref + '" data-out="' + o + '">' + o.charAt(0).toUpperCase() + o.slice(1) + '</button>'; }).join('') +
        '<button class="btn sm quiet" data-act="mandateStay">Leave it pending</button></div></div>';
    else s3 = (m.status === 'declined' ? '<div class="note bad" id="mandate" tabindex="-1"><h3>The authorisation was declined</h3><p class="muted">No debit order was set up. You can try again, use a different payer, or ask BBN for help. Your application is saved.</p></div>' :
      m.status === 'expired' ? '<div class="note bad" id="mandate" tabindex="-1"><h3>The authorisation request expired</h3><p class="muted">It was not completed in time. No debit order was set up. You can start a new request on the same application.</p></div>' : '') +
      '<form data-form="mandate" novalidate class="stack"><input type="hidden" name="ref" value="' + a.ref + '">' +
        '<p class="muted">Home fibre is paid by debit order. You authorise it with Netcash, our payment partner. BBN never asks for bank details or payment codes on this site, by email or on WhatsApp.</p>' +
        '<fieldset style="border:0;padding:0;margin:0" class="stack-sm"><legend class="flabel">Who pays the account?</legend>' +
          '<label class="check"><input type="radio" name="who" value="me"' + (B.ui.payerOther ? '' : ' checked') + ' data-change="payerWho"><span>I do</span></label>' +
          '<label class="check"><input type="radio" name="who" value="other" id="payer-other"' + (B.ui.payerOther ? ' checked' : '') + ' data-change="payerWho"><span>Someone else pays. Send the authorisation to them.</span></label></fieldset>' +
        (B.ui.payerOther ? '<div class="formgrid"><div class="field"><label for="py-name">Payer’s full name</label><input id="py-name" name="payerName" required data-label="the payer’s full name"></div>' +
          '<div class="field"><label for="py-mobile">Payer’s mobile number</label><input id="py-mobile" name="payerMobile" type="tel" inputmode="tel" required data-kind="mobile" data-label="the payer’s mobile number"><p class="hint">They authorise directly with Netcash. We do not ask you for their bank details.</p></div></div>' : '') +
        '<div class="row"><button class="btn">' + (m.attempts ? 'Try the authorisation again' : 'Authorise debit order') + '</button>' +
          (a.help ? '<span class="pill info">Help requested</span>' : '<button type="button" class="btn quiet" data-act="askHelp" data-ref="' + a.ref + '">I need help with this</button>') + '</div>' +
        '<p class="small muted">Help with debit orders goes to Sameera at BBN: ' + tc('BILLING_HELP_CONTACT') + '. Other ways to pay need BBN’s approval.</p></form>';

    var pref = a.preferred ? '<div class="note"><h3>Your preferred time: ' + esc(a.preferred.date) + ', ' + esc(a.preferred.window) + '</h3><p class="muted"><b>Awaiting confirmation.</b> This is a request, not a booking. BBN will confirm the actual date.</p><button class="linkbtn" data-act="prefClear" data-ref="' + a.ref + '">Change</button></div>' :
      '<form data-form="preferred" novalidate class="stack"><input type="hidden" name="ref" value="' + a.ref + '"><p class="flabel">Suggest a date and time that suits you (optional)</p><div class="formgrid">' +
        '<div class="field"><label for="pf-date">Preferred date</label><input id="pf-date" name="date" type="date" required data-label="a preferred date" min="' + new Date(Date.now() + 86400000).toISOString().slice(0, 10) + '"></div>' +
        '<div class="field"><label for="pf-win">Time of day</label><select id="pf-win" name="window"><option>Morning</option><option>Afternoon</option><option>No preference</option></select></div></div>' +
        '<div><button class="btn ghost">Send my preference</button></div></form>';
    var s4;
    if (!detailsDone) s4 = '<p class="muted">We confirm your activation once the steps above are complete.</p>';
    else if (a.booking.status === 'confirmed') s4 = '<div class="note ok"><h3>Confirmed: ' + (a.booking.type === 'remote' ? 'remote activation' : 'technician visit') + '</h3><p class="muted">' + (a.booking.when ? 'Scheduled for ' + esc(a.booking.when) + '. ' : '') + 'BBN will contact you on ' + B.maskMobile(a.mobile) + ' if anything changes.</p></div>';
    else s4 = '<p class="muted">' + (payDone ? 'Your debit order is authorised. BBN now reviews your application and confirms either a remote activation or a technician visit.' : 'BBN confirms a booking only after the debit order is approved, or another arrangement is agreed with BBN.') + ' Lead times: ' + tc('INSTALL_PERMISSIONS_AND_LEAD_TIMES') + '</p>' + pref;

    var mail = detailsDone ? '<details><summary>Confirmation email preview</summary><div class="body full"><div class="mail"><header>To: ' + esc(a.email) + '<br>Subject: We have your BBN application ' + a.ref + '</header>' +
      '<p>Hi ' + esc(a.name.split(' ')[0]) + ',</p><p>Thanks for applying for BBN fibre at ' + esc(b.name) + ', unit ' + esc(a.unit) + '.</p>' +
      '<p>Plan: ' + (plan ? B.speed(plan.down) + ' at ' + R(plan.monthlyIncVat) + ' per month including VAT (sample price)' : '') + '<br>Debit order: ' + MANDATE[m.status][1] + '<br>Next step: ' + esc(next.text) + '</p>' +
      '<p>Open your application at any time: ' + esc(B.link('apply-' + a.ref.toLowerCase())) + '</p><p>BBN will never ask for bank details or payment codes by email.</p><p class="muted">' + esc(B.config.legalLine) + '</p></div>' +
      '<p class="small muted">Preview only. No email was sent.</p></div></details>' : '';

    return { title: 'Application ' + a.ref, nav: 'home-fibre', html:
      B.pageHead('Your application', esc(b.name) + ', unit ' + esc(a.unit) + '. Keep this reference: <b class="num">' + a.ref + '</b>') +
      '<section class="section"><div class="wrap grid2"><div class="stack">' +
        '<ol class="steps">' +
          '<li class="' + cls(unitDone, !unitDone) + '"><div class="body"><h3>Your unit</h3>' + s1 + '</div></li>' +
          '<li class="' + cls(detailsDone, unitDone && !detailsDone) + '"><div class="body"><h3>Details and terms</h3>' + s2 + '</div></li>' +
          '<li class="' + cls(payDone, detailsDone && !payDone) + '"><div class="body"><h3>Debit order</h3>' + s3 + '</div></li>' +
          '<li class="' + cls(a.booking.status === 'confirmed', payDone && a.booking.status !== 'confirmed') + '"><div class="body"><h3>What happens next</h3>' + s4 + '</div></li>' +
        '</ol>' + mail + '</div>' +
        '<div class="stack"><div class="card"><p class="eyebrow">Reference</p><p class="refbox num">' + a.ref + '</p>' +
          '<dl class="kv"><dt>Next step</dt><dd>' + esc(next.text) + '</dd><dt>With</dt><dd>' + (next.owner === 'Customer' ? 'You' : next.owner === 'Done' ? 'Complete' : 'BBN') + '</dd><dt>Debit order</dt><dd><span class="pill ' + MANDATE[m.status][0] + '">' + MANDATE[m.status][1] + '</span></dd></dl>' +
          '<p class="small muted">Come back any time with this link. We will ask for an SMS code if your last check has expired.</p>' +
          '<button class="btn ghost sm" data-act="copyLink" data-hash="apply-' + a.ref.toLowerCase() + '">Copy my application link</button></div>' +
          '<div class="note demo"><p class="small"><b>Test an interrupted signup:</b> close this tab, reopen the preview and paste your link, or use the staff demo to move the application along.</p></div></div>' +
      '</div></section>' };
  };
  A.resumeVerify = function (el) { var a = S.app(el.getAttribute('data-ref')); startOtp(a.mobile, 'resume', { ref: a.ref }); };
  B.OTP.resume = function () { B.rerender('page-title'); };
  A.acceptCost = function (el) { var a = S.app(el.getAttribute('data-ref')); a.costAccepted = S.needs(a).unit.finalCost; S.saveApp(a); B.rerender('page-title'); };
  F.finish = function (d) { var a = S.app(d.ref); a.planId = d.planId; a.email = d.email; a.terms = { version: B.config.termsVersion, at: Date.now() }; S.saveApp(a); B.clearDraft('finish-' + a.ref); B.rerender('page-title'); };
  A.payerWho = function (el) { B.ui.payerOther = el.value === 'other'; B.rerender(B.ui.payerOther ? 'py-name' : null); };
  F.mandate = function (d) {
    var a = S.app(d.ref), payer = null;
    if (d.who === 'other') payer = { name: d.payerName, mobile: S.normMobile(d.payerMobile) };
    S.startMandate(a, payer); B.ui.payerOther = false; B.rerender('mandate');
  };
  A.mandateResolve = function (el) { S.resolveMandate(S.app(el.getAttribute('data-ref')), el.getAttribute('data-out')); B.rerender('mandate'); };
  A.mandateStay = function () { B.toast('Still pending. You can leave and come back with your link.'); };
  A.askHelp = function (el) { var a = S.app(el.getAttribute('data-ref')); a.help = true; S.saveApp(a); B.rerender(); B.toast('BBN has been asked to help (simulated)'); };
  F.preferred = function (d) { var a = S.app(d.ref); a.preferred = { date: d.date, window: d.window }; S.saveApp(a); B.rerender(); };
  A.prefClear = function (el) { var a = S.app(el.getAttribute('data-ref')); a.preferred = null; S.saveApp(a); B.rerender('pf-date'); };
  A.copyLink = function (el) { B.copy(B.link(el.getAttribute('data-hash')), 'Link copied'); };

  /* ================= bring BBN fibre to my building ================= */
  V.interest = function (key) {
    var b = key && S.building(key), known = key && S.demand().filter(function (g) { return g.key === key; })[0];
    var name = b ? b.name : known ? known.building : (B.ui.interestName || ''), addr = b ? b.address : known ? known.address : '';
    var rc = B.ui.interestReceipt;
    var body;
    if (rc) {
      var share = B.link('interest-' + rc.key);
      body = '<div class="note ok" id="int-done" tabindex="-1"><h3>Your interest is recorded</h3><p>Reference <b class="num">' + rc.ref + '</b> for <b>' + esc(rc.building) + '</b>.</p>' +
        '<p class="muted">This is not a promise that BBN will connect your building. We look at how many residents ask, how close our network is, and whether management agrees. If we go ahead, we will contact you on ' + B.maskMobile(rc.mobile) + '.</p></div>' +
        '<div class="card"><h3>Get your neighbours to add their names</h3><p class="muted">Every verified resident counts towards the same building record. Share this link with neighbours or building management.</p>' +
          '<input readonly value="' + esc(share) + '" aria-label="Link to share" onfocus="this.select()"><div class="row"><button class="btn" data-act="copyLink" data-hash="interest-' + rc.key + '">Copy link</button><a class="btn ghost" href="#estates" data-act="toEstates" data-addr="' + esc(rc.building + ', ' + rc.address) + '">I manage this building: request a call or survey</a></div>' +
          '<p class="small muted">Rewards for referrals: ' + tc('REFERRAL_REWARDS') + '</p></div>' +
        '<button class="linkbtn" data-act="interestAgain">Register another building</button>';
    } else if (B.ui.otp && B.ui.otp.purpose === 'interest') body = otpPanel();
    else body = '<form class="card" data-form="interest" data-draft="interest" novalidate><input type="hidden" name="buildingId" value="' + (b ? b.id : '') + '"><div class="formgrid">' +
      '<div class="field wide"><label for="in-b">Building or estate name</label><input id="in-b" name="building" required data-label="the building name" value="' + esc(name) + '"></div>' +
      '<div class="field wide"><label for="in-a">Street address</label><input id="in-a" name="address" required data-label="the street address" value="' + esc(addr) + '" autocomplete="street-address"></div>' +
      '<div class="field"><label for="in-n">Your name</label><input id="in-n" name="name" required data-label="your name" autocomplete="name"></div>' +
      '<div class="field"><label for="in-m">Mobile number</label><input id="in-m" name="mobile" type="tel" inputmode="tel" required data-kind="mobile" data-label="your mobile number" autocomplete="tel"><p class="hint">We confirm it by SMS so every name counts once.</p></div>' +
      '<div class="field wide"><label for="in-r">I am a</label><select id="in-r" name="role"><option value="resident">Resident</option><option value="manager">Building manager, trustee or managing agent</option></select></div>' +
      '<label class="check wide"><input type="checkbox" name="consent" required data-msg="Tick the box so we may contact you about this building."><span>BBN may contact me about fibre for this building. Privacy notice: ' + tc('PRIVACY_NOTICE') + '</span></label>' +
      '<div class="wide"><button class="btn">Add my name</button></div></div></form>';
    return { title: 'Bring BBN fibre to my building', nav: 'home-fibre', html:
      B.pageHead('Bring BBN fibre to my building', 'Not connected yet? Tell us where you live. We group every request by building, so the more neighbours ask, the stronger the case.') +
      '<section class="section"><div class="wrap narrow stack">' + body + '</div></section>' };
  };
  F.interest = function (d) {
    var mobile = S.normMobile(d.mobile); d.mobile = mobile; delete d.consent;
    if (S.isVerified(mobile)) return B.OTP.interest(d, mobile);
    startOtp(mobile, 'interest', d);
  };
  B.OTP.interest = function (d) { var r = S.addInterest(d); B.clearDraft('interest'); B.ui.interestReceipt = r; B.rerender('int-done'); };
  A.interestAgain = function () { B.ui.interestReceipt = null; B.ui.interestName = ''; B.go('interest'); };
  A.toEstates = function (el) { B.ui.estateAddr = el.getAttribute('data-addr'); B.go('estates'); };

  /* ================= network status ================= */
  function buildingSelect(id, value, act) {
    return '<select id="' + id + '" name="buildingId" data-change="' + act + '"><option value="">All buildings</option>' + B.buildings.filter(function (b) { return b.offer !== 'none'; }).map(function (b) {
      return '<option value="' + b.id + '"' + (value === b.id ? ' selected' : '') + '>' + esc(b.name) + '</option>'; }).join('') + '</select>';
  }
  V.status = function () {
    var down = S.sim().statusFeed !== 'ok', bid = B.ui.statusBuilding || '', b = bid && S.building(bid);
    var all = S.notices(), list = bid ? all.filter(function (n) { return n.buildingIds.indexOf(bid) >= 0; }) : all;
    var live = list.filter(function (n) { return n.type !== 'restored'; }), restored = list.filter(function (n) { return n.type === 'restored'; });
    var body;
    if (down) body = '<div class="note warn" id="status-result" tabindex="-1"><h3>We cannot load network status right now</h3><p class="muted">This does not mean the network is clear, and it does not mean there is an outage. We simply cannot confirm either at the moment.</p>' +
      '<div class="row"><a class="btn" href="#fault">Report a fault</a><button class="btn ghost" data-act="statusRetry">Try again</button></div></div>';
    else body = '<div id="status-result" tabindex="-1" class="stack">' +
      (live.length ? live.map(noticeCard).join('') : '<div class="note ok"><h3>No known issues' + (b ? ' at ' + esc(b.name) : '') + '</h3><p class="muted">Status checked ' + B.time(Date.now()) + '. If your internet is down, the problem may be inside your unit.</p><div class="row"><a class="btn ghost" href="#fault">Troubleshoot or report a fault</a></div></div>') +
      (restored.length ? '<h2 style="margin-top:16px">Recently restored</h2>' + restored.map(noticeCard).join('') : '') + '</div>';
    return { title: 'Network Status', nav: 'support', html:
      B.pageHead('Network Status', 'Known outages and planned maintenance on the BBN network.', '<a href="#support">Subscriber Help</a>') +
      '<section class="section"><div class="wrap narrow stack">' +
        '<div class="field"><label for="st-b">Show notices for</label>' + buildingSelect('st-b', bid, 'statusPick') + '</div>' + body +
        '<p class="small muted">Outage notices are published by BBN’s network team. Source of outage data: ' + tc('OUTAGE_SOURCE') + '</p></div></section>' };
  };
  A.statusPick = function (el) { B.ui.statusBuilding = el.value; B.rerender('st-b'); };
  A.statusRetry = function () { B.rerender('status-result'); };

  /* ================= troubleshoot and report a fault ================= */
  var TIPS = {
    one: ['Turn that device’s Wi-Fi off and on again.', 'Restart the device.', 'Check whether other devices work in the same spot. If they do, the problem is with that device.'],
    all: ['Check the lights on the fibre box and the router. A red light or no light on the fibre box points to a line fault.', 'Switch the router and the fibre box off at the wall, wait 30 seconds, and switch them on again. Give them three minutes.', 'Plug a laptop into the router with a network cable, if you can. If that also has no internet, report a fault.'],
    room: ['This is usually Wi-Fi coverage, not your fibre line.', 'Move the router out of any cupboard and away from thick walls, mirrors and the TV.', 'Test next to the router. If it is fast there and slow in that room, the room is too far from the router. BBN can advise on placement.']
  };
  V.fault = function () {
    var f = B.ui.fault = B.ui.fault || {}, b = f.buildingId && S.building(f.buildingId);
    if (f.result) {
      return { title: 'Report a fault', nav: 'support', html: B.pageHead('Report a fault', '', '<a href="#support">Subscriber Help</a>') + '<section class="section"><div class="wrap narrow stack">' +
        (f.result.accepted ? '<div class="note ok" id="fault-done" tabindex="-1"><h3>Fault logged</h3><p>Your ticket reference is</p><p class="refbox num">' + f.result.ref + '</p><p class="muted">BBN’s support system accepted this report. We will contact you on ' + B.maskMobile(f.result.mobile) + '. We cannot promise a response time on this page: ' + tc('RESPONSE_COMMITMENTS') + '</p>' +
          '<p class="muted">Track this ticket: ' + tc('TICKET_FLOW') + '</p><p class="small muted">Preview only. Nothing was sent to BBN’s support system. The acceptance is simulated.</p></div>' :
          '<div class="note bad" id="fault-done" tabindex="-1"><h3>We could not log your fault</h3><p class="muted">Our support system did not accept the report, so there is no ticket and no reference. Nothing you typed has been lost.</p><p class="muted">Please contact BBN directly: ' + tc('SUPPORT_CONTACTS') + '</p><div class="row"><button class="btn" data-act="faultBack">Try again</button></div></div>') +
        '<div class="row"><a class="btn ghost" href="#status">Network Status</a><button class="linkbtn" data-act="faultReset">Report a different problem</button></div></div></section>' };
    }
    var feedDown = S.sim().statusFeed !== 'ok';
    var outage = b && !feedDown ? S.noticesFor(b.id).filter(function (n) { return n.type === 'outage'; }) : [];
    var step2 = b && (!outage.length || f.continued);
    var html = '<div class="stack"><h2>1. Where are you?</h2><div class="formgrid">' +
      '<div class="field"><label for="ft-b">Building</label>' + buildingSelect('ft-b', f.buildingId || '', 'faultBuilding').replace('All buildings', 'Choose your building') + '</div>' +
      '<div class="field"><label for="ft-u">Unit number</label><input id="ft-u" value="' + esc(f.unit || '') + '" data-change="faultUnit" autocomplete="off"></div></div>' +
      (b && feedDown ? '<div class="note warn"><p>We cannot check for known outages right now. You can still carry on.</p></div>' : '') +
      (outage.length ? outage.map(noticeCard).join('') + '<div class="note" id="outage-known" tabindex="-1"><h3>We already know about this outage</h3><p class="muted">You do not need to report it. Updates appear on Network Status.</p>' +
        (f.continued ? '' : '<div class="row"><a class="btn" href="#status">Follow updates</a><button class="btn ghost" data-act="faultContinue">My problem is different, or it is still there after the fix</button></div>') + '</div>' : '') +
      (b && !outage.length && !feedDown ? '<p class="muted small">No known outage at ' + esc(b.name) + '. Checked ' + B.time(Date.now()) + '.</p>' : '') + '</div>';
    if (step2) html += '<div class="stack" id="scope" tabindex="-1"><h2>2. What is affected?</h2><div class="toggles" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">' +
      [['one', 'One device'], ['all', 'All devices'], ['room', 'One room']].map(function (s) { return '<button type="button" class="tog" id="sc-' + s[0] + '" data-act="faultScope" data-id="' + s[0] + '" aria-pressed="' + (f.scope === s[0]) + '">' + s[1] + '</button>'; }).join('') + '</div>' +
      (f.scope ? '<div class="card"><h3>Try this first</h3><ol class="plain">' + TIPS[f.scope].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol></div>' : '') + '</div>';
    if (step2 && f.scope) html += '<form class="card" data-form="fault" data-draft="fault" novalidate><h2>3. Still not working? Report it</h2><div class="formgrid">' +
      '<div class="field"><label for="ft-n">Your name</label><input id="ft-n" name="name" required data-label="your name" autocomplete="name"></div>' +
      '<div class="field"><label for="ft-m">Mobile number</label><input id="ft-m" name="mobile" type="tel" inputmode="tel" required data-kind="mobile" data-label="your mobile number" autocomplete="tel"></div>' +
      '<div class="field wide"><label for="ft-d">What is happening?</label><textarea id="ft-d" name="detail" required data-label="a short description of the problem" placeholder="For example: red light on the fibre box since this morning"></textarea></div>' +
      '<p class="wide small muted">You can report a fault at any hour. Staffed hours: ' + tc('SUPPORT_HOURS') + '. We do not ask for account numbers or passwords here.</p>' +
      '<div class="wide"><button class="btn">Log my fault</button></div></div></form>';
    return { title: 'Report a fault', nav: 'support', html: B.pageHead('Troubleshoot or report a fault', 'Three short steps. We check for a known outage first, so you do not report something we are already fixing.', '<a href="#support">Subscriber Help</a>') +
      '<section class="section"><div class="wrap narrow stack-lg">' + html + '</div></section>' };
  };
  A.faultBuilding = function (el) { B.ui.fault.buildingId = el.value; B.ui.fault.continued = false; B.rerender('ft-b'); };
  A.faultUnit = function (el) { B.ui.fault.unit = S.normUnit(el.value); };
  A.faultContinue = function () { B.ui.fault.continued = true; B.rerender('scope'); };
  A.faultScope = function (el) { B.ui.fault.scope = el.getAttribute('data-id'); B.rerender('sc-' + B.ui.fault.scope); };
  F.fault = function (d) {
    var f = B.ui.fault, u = document.getElementById('ft-u'); if (u) f.unit = S.normUnit(u.value);
    var mobile = S.normMobile(d.mobile);
    var res = S.submitFault({ buildingId: f.buildingId, unit: f.unit, scope: f.scope, boxRef: f.boxRef || null, name: d.name, mobile: mobile, detail: d.detail });
    res.mobile = mobile; f.result = res; if (res.accepted) B.clearDraft('fault'); B.rerender('fault-done');
  };
  A.faultBack = function () { B.ui.fault.result = null; B.rerender('ft-n'); };
  A.faultReset = function () { B.ui.fault = {}; B.clearDraft('fault'); B.go('fault'); };

  /* ================= Subscriber Help and My Account ================= */
  function portalButton(label) {
    return B.config.splynxPortalUrl ? '<a class="btn" href="' + esc(B.config.splynxPortalUrl) + '" rel="noopener">' + label + '</a>' :
      '<button class="btn" data-act="portalDemo">' + label + '</button>';
  }
  A.portalDemo = function () { B.ui.portalMsg = true; B.rerender('portal-msg'); };
  V.support = function () {
    return { title: 'Subscriber Help', html: B.pageHead('Subscriber Help', 'Already with BBN? Start here.') +
      '<section class="section"><div class="wrap stack-lg"><div class="grid3">' +
        '<a class="card" href="#status" style="text-decoration:none;color:inherit"><h3>Check an outage</h3><p class="muted">See known outages and planned maintenance for your building.</p><span class="linkbtn">Network Status</span></a>' +
        '<a class="card" href="#fault" style="text-decoration:none;color:inherit"><h3>Report a fault</h3><p class="muted">A short troubleshooter, then a fault report with a ticket reference.</p><span class="linkbtn">Troubleshoot or report</span></a>' +
        '<a class="card" href="#account" style="text-decoration:none;color:inherit"><h3>My Account</h3><p class="muted">Invoices, payments, contact details, upgrades, moves and cancellations.</p><span class="linkbtn">Go to My Account</span></a></div>' +
        '<div class="grid2"><div class="stack"><h2>Talk to BBN</h2><dl class="kv"><dt>Phone and WhatsApp</dt><dd>' + tc('SUPPORT_CONTACTS') + '</dd><dt>Email</dt><dd>' + tc('SUPPORT_CONTACTS') + '</dd><dt>Staffed hours</dt><dd>' + tc('SUPPORT_HOURS') + '</dd><dt>After hours</dt><dd>You can log a fault on this site at any time.</dd></dl></div>' +
        '<div class="stack"><h2>Guides and policies</h2><ul class="plain"><li><a href="#guides">Fibre is not Wi-Fi: fix slow rooms</a></li><li><a href="#legal">Service terms, privacy and Acceptable Use Policy</a></li><li><a href="#legal">Lawful use and streaming FAQ</a></li><li><a href="#legal">Complaints procedure</a></li></ul></div></div>' +
      '</div></section>' };
  };
  V.account = function () {
    return { title: 'My Account', html: B.pageHead('My Account', 'Your account lives in BBN’s customer portal. Sign in there to see invoices, pay and update your details.') +
      '<section class="section"><div class="wrap stack-lg">' +
        '<div class="card"><div class="row">' + portalButton('Open the BBN customer portal') + '</div>' +
          (B.ui.portalMsg ? '<div class="note demo" id="portal-msg" tabindex="-1"><p>This preview is not connected to the portal. On the live site this button opens BBN’s Splynx customer portal in a new tab. Portal address: ' + tc('SPLYNX_PORTAL_LINKS') + '</p></div>' : '') +
          '<p class="small muted">The portal is run on Splynx, BBN’s billing system. This website does not show account or billing information.</p></div>' +
        '<div class="grid2"><div class="stack"><h2>In the portal</h2><ul class="plain"><li>View and download invoices</li><li>Make a payment</li><li>Update your contact details</li><li>See your open tickets</li></ul>' +
          '<p class="small muted">Changing the main contact on an account needs a verification step. Which tasks the portal supports: ' + tc('SPLYNX_PORTAL_LINKS') + '</p></div>' +
        '<div class="stack"><h2>Changes to your service</h2>' +
          '<details><summary>Upgrade or change my plan</summary><div class="body"><p>See the plans for your building on its page, then ask BBN to change your plan. How to request it: ' + tc('SPLYNX_CAPABILITIES') + '</p><p><a href="#coverage">Find my building’s plans</a></p></div></details>' +
          '<details><summary>I am moving</summary><div class="body"><p>A move starts with coverage at your new address. If BBN is there, we arrange the move. If not, you can register interest for the new building.</p><p><a href="#coverage" data-act="startMove">Check my new address</a></p></div></details>' +
          '<details><summary>Change my debit order</summary><div class="body"><p>Debit-order changes are handled by Sameera at BBN, with our payment partner. Never send bank details by email or WhatsApp. ' + tc('BILLING_HELP_CONTACT') + '</p></div></details>' +
          '<details><summary>Cancel my service</summary><div class="body"><p>Notice period and what happens to the equipment: ' + tc('CONTRACT_TERM') + ' ' + tc('EQUIPMENT_AND_RETURNS') + '</p><p>How to cancel: ' + tc('SPLYNX_CAPABILITIES') + '</p></div></details></div></div>' +
      '</div></section>' };
  };
  A.startMove = function () { B.ui.move = true; B.go('coverage'); };
})();
