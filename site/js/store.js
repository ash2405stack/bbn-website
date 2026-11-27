/* BBN website preview: browser storage and SIMULATED services.
   Nothing here talks to Splynx, Netcash, an SMS gateway or any BBN system.
   Each simulated service marks the place where a real integration will go, after separate approval. */
(function () {
  var B = window.BBN, mem = {}, PRE = 'bbn.preview.';

  function read(k, d) {
    try { var v = localStorage.getItem(PRE + k); if (v == null) return k in mem ? mem[k] : d; v = JSON.parse(v); return v == null ? d : v; }
    catch (e) { return k in mem ? mem[k] : d; }
  }
  function write(k, v) { mem[k] = v; try { localStorage.setItem(PRE + k, JSON.stringify(v)); } catch (e) {} }
  function sread(k, d) { try { var v = sessionStorage.getItem(PRE + k); if (v == null) return d; v = JSON.parse(v); return v == null ? d : v; } catch (e) { return d; } }
  function swrite(k, v) { try { sessionStorage.setItem(PRE + k, JSON.stringify(v)); } catch (e) {} }

  var ALPHA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';   // no 0, 1, I or O, so a reference is easy to read aloud and type
  function code(n) { var s = ''; for (var i = 0; i < n; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)]; return s; }

  var S = B.store = {
    read: read, write: write, sread: sread, swrite: swrite, code: code,

    reset: function () {
      mem = {};
      try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(PRE) === 0) localStorage.removeItem(k); }); } catch (e) {}
      try { Object.keys(sessionStorage).forEach(function (k) { if (k.indexOf(PRE) === 0) sessionStorage.removeItem(k); }); } catch (e) {}
    },

    /* ---------- coverage: one lookup used by search, flyers, boxes and staff ---------- */
    building: function (id) { return B.buildings.filter(function (b) { return b.id === id; })[0] || null; },
    search: function (q) {
      q = String(q || '').trim().toLowerCase();
      if (q.length < 2) return [];
      return B.buildings.filter(function (b) {
        return [b.name, b.address, b.area].concat(b.aliases || []).some(function (t) { return t.toLowerCase().indexOf(q) >= 0; });
      });
    },
    normUnit: function (u) { return String(u || '').trim().toUpperCase().replace(/^(UNIT|FLAT|APT|NO\.?)\s*/, '').replace(/\s+/g, ''); },
    unit: function (buildingId, unit) {
      var b = S.building(buildingId), u = S.normUnit(unit);
      if (!b || !u) return null;
      var over = read('units', {})[buildingId + '|' + u];
      var base = (b.units || {})[u];
      var rec = Object.assign({ state: 'check', listed: !!(base || over) }, base || {}, over || {});
      rec.unit = u;
      return rec;
    },
    setUnit: function (buildingId, unit, patch) {
      var all = read('units', {}), k = buildingId + '|' + S.normUnit(unit);
      all[k] = Object.assign({}, all[k] || {}, patch); write('units', all);
    },
    normBox: function (r) {
      var s = String(r || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      return s.length === 8 ? s.slice(0, 4) + '-' + s.slice(4) : s;
    },
    box: function (ref) {
      ref = S.normBox(ref);
      var rec = read('boxes', {})[ref] || B.boxes[ref];
      return rec ? Object.assign({ ref: ref }, rec) : null;
    },
    setBox: function (ref, rec) { var all = read('boxes', {}); all[S.normBox(ref)] = rec; write('boxes', all); },
    plansFor: function (b) {
      return (b.plans || []).map(function (id) {
        var p = B.plans.filter(function (x) { return x.id === id; })[0];
        if (!p) return null;
        var o = (b.priceOverrides || {})[id];
        return Object.assign({}, p, o ? { monthlyIncVat: o, buildingPrice: true } : {});
      }).filter(Boolean);
    },

    /* ---------- SIMULATED SMS verification ---------- */
    normMobile: function (m) {
      var s = String(m || '').replace(/[\s\-()]/g, '');
      if (/^\+27/.test(s)) s = '0' + s.slice(3); else if (/^27\d{9}$/.test(s)) s = '0' + s.slice(2);
      return /^0[6-8]\d{8}$/.test(s) ? s : null;
    },
    sendCode: function (mobile) {         // real site: ask the SMS provider to send a one-time code
      var c = String(Math.floor(100000 + Math.random() * 900000));
      swrite('otp', { mobile: mobile, code: c, sent: Date.now(), tries: 0 });
      return c;
    },
    checkCode: function (mobile, entered) {
      var o = sread('otp', null);
      if (!o || o.mobile !== mobile) return 'none';
      if (Date.now() - o.sent > 10 * 60000) return 'expired';
      if (String(entered).trim() !== o.code) { o.tries++; swrite('otp', o); return 'wrong'; }
      var v = read('verified', {}); v[mobile] = Date.now() + B.config.verificationMinutes * 60000; write('verified', v);
      swrite('otp', null);
      return 'ok';
    },
    isVerified: function (mobile) { var v = read('verified', {}); return !!(mobile && v[mobile] && v[mobile] > Date.now()); },

    /* ---------- applications (the BBN review queue) ---------- */
    apps: function () { return read('apps', []); },
    app: function (ref) { return S.apps().filter(function (a) { return a.ref === ref; })[0] || null; },
    saveApp: function (a) {
      a.updated = Date.now();
      var all = S.apps(), i = all.findIndex(function (x) { return x.ref === a.ref; });
      if (i >= 0) all[i] = a; else all.unshift(a);
      write('apps', all); return a;
    },
    openAppFor: function (buildingId, unit, mobile) {   // reuse an open application for the same unit and mobile
      return S.apps().filter(function (a) { return a.buildingId === buildingId && a.unit === S.normUnit(unit) && a.mobile === mobile && a.status !== 'closed'; })[0] || null;
    },
    createApp: function (d) {
      var existing = S.openAppFor(d.buildingId, d.unit, d.mobile);
      if (existing) return existing;
      var u = S.unit(d.buildingId, d.unit);
      var a = {
        ref: 'BBN-A-' + code(6), status: 'open', created: Date.now(),
        buildingId: d.buildingId, unit: u.unit, planId: d.planId || null, source: d.source || 'search', boxRef: d.boxRef || null,
        name: d.name, mobile: d.mobile, email: d.email || '',
        terms: d.terms || null,                                   // { version, at }
        costAccepted: null,                                       // set when the customer accepts a surveyed installation cost
        mandate: { status: 'none', ref: null, attempts: 0, payer: null },
        preferred: null, booking: { status: 'none' }, splynx: { status: 'none' }, help: false
      };
      return S.saveApp(a);
    },
    /* What still blocks an application. Read from the live unit record, so staff changes show up on resume. */
    needs: function (a) {
      var u = S.unit(a.buildingId, a.unit) || { state: 'check' };
      return {
        unit: u,
        coverage: u.state === 'check',
        survey: u.state === 'new' && !!u.survey && u.finalCost == null,
        consent: u.state === 'new' && !!u.consent && !u.consentReceived,
        costAccept: u.state === 'new' && !!u.survey && u.finalCost != null && a.costAccepted !== u.finalCost,
        details: !a.email || !a.planId || !a.terms
      };
    },
    nextStep: function (a) {
      var n = S.needs(a), m = a.mandate.status;
      if (n.coverage) return { owner: 'Operations', text: 'Check whether unit ' + a.unit + ' is serviceable' };
      if (n.survey) return { owner: 'Operations', text: 'Survey the unit and price the installation' };
      if (n.consent) return { owner: 'Operations', text: 'Get owner or body corporate permission' };
      if (n.costAccept) return { owner: 'Customer', text: 'Accept the final installation cost' };
      if (n.details) return { owner: 'Customer', text: 'Finish signup details and accept the terms' };
      if (a.help && m !== 'approved') return { owner: 'Sameera', text: 'Customer asked for help with the debit order' };
      if (m === 'none' || m === 'declined' || m === 'expired') return { owner: 'Customer', text: 'Authorise the debit order' + (m === 'none' ? '' : ' (last attempt ' + m + ')') };
      if (m === 'pending') return { owner: 'Sameera', text: 'Wait for the Netcash result' };
      if (a.splynx.status === 'none') return { owner: 'Sameera', text: 'Create or match the customer in Splynx' };
      if (a.booking.status !== 'confirmed') return { owner: 'Operations', text: 'Confirm remote activation or book a technician' };
      return { owner: 'Done', text: 'Booked: ' + (a.booking.type === 'remote' ? 'remote activation' : 'technician visit') };
    },

    /* ---------- SIMULATED Netcash debit-order authorisation ----------
       The real flow happens on Netcash's side. BBN keeps only a reference and a status. */
    startMandate: function (a, payer) {
      if (a.mandate.status === 'pending' || a.mandate.status === 'approved') return a;   // never open a second mandate
      a.mandate = { status: 'pending', ref: 'NC-DEMO-' + code(5), attempts: a.mandate.attempts + 1, payer: payer || null, started: Date.now() };
      return S.saveApp(a);
    },
    resolveMandate: function (a, outcome) {
      if (a.mandate.status !== 'pending') return a;
      a.mandate.status = outcome; a.mandate.resolved = Date.now();
      return S.saveApp(a);
    },

    /* ---------- building interest ---------- */
    slug: function (s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); },
    interests: function () { return read('interest', []); },
    addInterest: function (d) {
      var all = S.interests(), key = d.buildingId || S.slug(d.building);
      var dup = all.filter(function (x) { return x.key === key && x.mobile === d.mobile; })[0];
      if (dup) return dup;
      var rec = Object.assign({ ref: 'BBN-I-' + code(6), key: key, at: Date.now() }, d);
      all.unshift(rec); write('interest', all); return rec;
    },
    demand: function () {            // one record per building
      var g = {};
      S.interests().forEach(function (x) {
        g[x.key] = g[x.key] || { key: x.key, building: x.building, address: x.address, count: 0, managers: 0, latest: 0 };
        g[x.key].count++; if (x.role === 'manager') g[x.key].managers++; g[x.key].latest = Math.max(g[x.key].latest, x.at);
      });
      return Object.keys(g).map(function (k) { return g[k]; });
    },

    /* ---------- enquiries ---------- */
    enquiries: function () { return read('enquiries', []); },
    addEnquiry: function (d) { var all = S.enquiries(); var r = Object.assign({ ref: 'BBN-E-' + code(6), at: Date.now() }, d); all.unshift(r); write('enquiries', all); return r; },

    /* ---------- network status ---------- */
    sim: function () { return Object.assign({ statusFeed: 'ok', ticketSystem: 'ok' }, read('sim', {})); },
    setSim: function (patch) { write('sim', Object.assign(S.sim(), patch)); },
    notices: function () {
      var removed = read('noticesRemoved', []), patched = read('noticesPatched', {});
      return read('noticesStaff', []).concat(B.notices).filter(function (n) { return removed.indexOf(n.id) < 0; })
        .map(function (n) { return Object.assign({}, n, patched[n.id] || {}); });
    },
    noticesFor: function (buildingId) { return S.notices().filter(function (n) { return (n.buildingIds || []).indexOf(buildingId) >= 0; }); },
    publishNotice: function (n) { var all = read('noticesStaff', []); n.id = 'n-' + code(5); n.updated = Date.now(); n.staff = true; all.unshift(n); write('noticesStaff', all); return n; },
    patchNotice: function (id, patch) { var p = read('noticesPatched', {}); p[id] = Object.assign({}, p[id] || {}, patch, { updated: Date.now() }); write('noticesPatched', p); },
    removeNotice: function (id) { var r = read('noticesRemoved', []); r.push(id); write('noticesRemoved', r); },
    suspected: function () { return read('suspected', []); },
    raiseSuspected: function (buildingId) {      // real site: raised by network monitoring, for staff review only
      var all = S.suspected(); all.unshift({ id: 's-' + code(5), buildingId: buildingId, at: Date.now() }); write('suspected', all);
    },
    clearSuspected: function (id) { write('suspected', S.suspected().filter(function (x) { return x.id !== id; })); },

    /* ---------- SIMULATED fault ticket hand-off ---------- */
    faults: function () { return read('faults', []); },
    submitFault: function (d) {                   // real site: send to BBN's support system and wait for it to accept
      if (S.sim().ticketSystem !== 'ok') return { accepted: false };
      var rec = Object.assign({ ref: 'BBN-T-' + code(6), at: Date.now() }, d);
      var all = S.faults(); all.unshift(rec); write('faults', all);
      return { accepted: true, ref: rec.ref };
    }
  };
})();
