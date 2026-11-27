/* BBN website preview: shared helpers, router, forms and form recovery. */
(function () {
  var B = window.BBN, S = B.store;
  B.V = {}; B.A = {}; B.F = {}; B.OTP = {};
  B.ui = { sel: S.sread('sel', {}) };

  /* ---------- text helpers ---------- */
  var esc = B.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  B.tc = function (key) { return '<span class="tc">[TO CONFIRM: ' + esc(key) + ']</span>'; };
  B.sampleTag = '<span class="sample">Sample</span>';
  B.R = function (n) { return 'R' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  B.speed = function (mbps) { return mbps >= 1000 ? (mbps / 1000) + ' Gbps' : mbps + ' Mbps'; };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  B.time = function (ts) {
    var d = new Date(ts), n = new Date(), days = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 86400000);
    var day = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days === -1 ? 'Yesterday' :
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] + ' ' + d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
    return day + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  };
  B.maskMobile = function (m) { return m ? m.slice(0, 3) + ' ••• ••' + m.slice(-2) : ''; };
  B.icon = function (name) {
    var p = {
      search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
      alert: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
      tool: '<path d="M14 6a4 4 0 0 0 5 5l-9 9-4-4 9-9"/><path d="M14 6l3-3"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
    }[name] || '';
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">' + p + '</svg>';
  };
  B.baseUrl = function () { return B.config.previewUrl || (location.origin + location.pathname); };
  B.link = function (hash) { return B.baseUrl() + '#' + hash; };
  B.qr = function (text) {
    if (typeof qrcode !== 'function') return '<div class="art">QR library not loaded</div>';
    var q = qrcode(0, 'M'); q.addData(text); q.make();
    var n = q.getModuleCount(), r = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (q.isDark(y, x)) r += 'M' + (x + 2) + ' ' + (y + 2) + 'h1v1h-1z';
    return '<svg viewBox="0 0 ' + (n + 4) + ' ' + (n + 4) + '" role="img" aria-label="QR code"><rect width="100%" height="100%" fill="#fff"/><path d="' + r + '" fill="#0d1337"/></svg>';
  };
  B.setSel = function (patch) { B.ui.sel = Object.assign({}, B.ui.sel, patch); S.swrite('sel', B.ui.sel); };
  B.pageHead = function (title, lede, crumb) {
    return '<div class="pagehead night"><div class="wrap">' + (crumb ? '<p class="crumb">' + crumb + '</p>' : '') +
      '<h1 tabindex="-1" id="page-title">' + title + '</h1>' + (lede ? '<p class="lede">' + lede + '</p>' : '') + '</div></div>';
  };
  B.toast = function (msg) {
    var t = document.getElementById('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(B._tt); B._tt = setTimeout(function () { t.hidden = true; }, 3200);
  };
  B.copy = function (text, okMsg) {
    var done = function () { B.toast(okMsg || 'Copied'); };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
    function fallback() { B.toast('Copy did not work here. Select the text and copy it.'); }
  };

  /* ---------- router: plain #name routes only, so links survive inside the hosted preview ---------- */
  var PREFIX = ['building', 'flyer', 'box', 'apply', 'interest'];
  function parse() {
    var h = (location.hash || '').replace(/^#/, '') || 'home';
    if (B.V[h]) return { name: h, param: null };
    for (var i = 0; i < PREFIX.length; i++) if (h.indexOf(PREFIX[i] + '-') === 0) return { name: PREFIX[i], param: h.slice(PREFIX[i].length + 1) };
    return { name: 'notfound', param: h };
  }
  B.go = function (hash) { if (('#' + hash) === location.hash) render(); else location.hash = hash; };
  function render(opts) {
    opts = opts || {};
    var r = parse(), out = B.V[r.name](r.param) || B.V.notfound(r.param);
    var main = document.getElementById('app');
    main.innerHTML = out.html;
    document.title = (out.title ? out.title + ' · ' : '') + 'Big Bully Networx';
    restoreDrafts(main);
    var navKey = out.nav || r.name;
    document.querySelectorAll('.links a').forEach(function (a) {
      if (a.getAttribute('href') === '#' + navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (opts.focus) { var f = document.getElementById(opts.focus); if (f) { f.focus({ preventScroll: false }); if (opts.scroll !== false) f.scrollIntoView({ block: 'center' }); } }
    else if (!opts.keep) { window.scrollTo(0, 0); var h = document.getElementById('page-title'); if (h && opts.nav) h.focus({ preventScroll: true }); }
  }
  B.rerender = function (focusId) { render({ keep: true, focus: focusId }); };
  window.addEventListener('hashchange', function () { render({ nav: true }); });

  /* ---------- clicks ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    var fn = B.A[el.getAttribute('data-act')];
    if (fn) { if (el.tagName === 'A' || el.tagName === 'BUTTON') e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target.closest('[data-change]');
    if (el && B.A[el.getAttribute('data-change')]) B.A[el.getAttribute('data-change')](el, e);
  });

  /* ---------- forms: inline errors, focus on the first problem, nothing typed is lost ---------- */
  function clearErrors(form) {
    form.querySelectorAll('.ferr').forEach(function (n) { n.remove(); });
    form.querySelectorAll('[aria-invalid]').forEach(function (n) { n.removeAttribute('aria-invalid'); n.removeAttribute('aria-describedby'); });
  }
  function showError(form, name, msg) {
    var el = form.elements[name]; if (!el) return null;
    if (el.length && !el.tagName) el = el[0];
    var holder = el.closest('.field, .check') || el.parentNode;
    var p = document.createElement('p'); p.className = 'ferr'; p.id = 'err-' + (el.id || name); p.textContent = msg;
    holder.appendChild(p); el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', p.id);
    return el;
  }
  B.formErrors = function (form, errs) {
    var first = null;
    Object.keys(errs).forEach(function (k) { var el = showError(form, k, errs[k]); if (!first) first = el; });
    if (first) first.focus();
  };
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-form]'); if (!form) return;
    e.preventDefault(); clearErrors(form);
    var data = {}, errs = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled) return;
      if (el.type === 'checkbox') data[el.name] = el.checked;
      else if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; else if (!(el.name in data)) data[el.name] = ''; }
      else data[el.name] = el.value.trim();
      var label = el.getAttribute('data-label') || 'this field';
      if (el.required && (el.type === 'checkbox' ? !el.checked : !data[el.name]) && el.type !== 'radio') errs[el.name] = el.getAttribute('data-msg') || ('Enter ' + label + '.');
      else if (data[el.name] && el.getAttribute('data-kind') === 'mobile' && !S.normMobile(data[el.name])) errs[el.name] = 'Enter a South African mobile number, for example 082 123 4567.';
      else if (data[el.name] && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[el.name])) errs[el.name] = 'Enter an email address, for example name@example.co.za.';
    });
    if (Object.keys(errs).length) return B.formErrors(form, errs);
    var more = B.F[form.getAttribute('data-form')](data, form);
    if (more && Object.keys(more).length) B.formErrors(form, more);
  });

  /* ---------- form recovery: drafts survive a reload, a wrong turn or a dropped connection ---------- */
  document.addEventListener('input', function (e) {
    var form = e.target.closest('form[data-draft]');
    if (form && e.target.name && e.target.type !== 'password' && !e.target.hasAttribute('data-nodraft')) {
      var k = 'draft.' + form.getAttribute('data-draft'), d = S.sread(k, {});
      d[e.target.name] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; S.swrite(k, d);
    }
    var s = e.target.closest('[data-search]'); if (s) B.A.searchInput(s);
  });
  function restoreDrafts(root) {
    root.querySelectorAll('form[data-draft]').forEach(function (form) {
      var d = S.sread('draft.' + form.getAttribute('data-draft'), null); if (!d) return;
      Object.keys(d).forEach(function (name) {
        var el = form.elements[name]; if (!el) return;
        if (el.length && !el.tagName) { Array.prototype.forEach.call(el, function (r) { r.checked = r.value === d[name]; }); }
        else if (el.type === 'checkbox') el.checked = !!d[name];
        else if (!el.readOnly) el.value = d[name];
      });
    });
  }
  B.clearDraft = function (key) { S.swrite('draft.' + key, null); };

  B.start = function () { render(); };
})();
