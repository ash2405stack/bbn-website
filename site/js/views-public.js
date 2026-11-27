/* BBN website preview: public pages (home, Home Fibre, Business, Estates, guides, film, stories, policies). */
(function () {
  var B = window.BBN, S = B.store, V = B.V, A = B.A, F = B.F, esc = B.esc, tc = B.tc;

  /* ---------- building search, shared by the hero, Check Coverage and the move request ---------- */
  B.searchBox = function (id, label) {
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      '<input id="' + id + '" data-search="' + id + '-res" type="search" autocomplete="off" placeholder="Building, estate or street address" value="' + esc(B.ui.q || '') + '">' +
      '<div class="search-results" id="' + id + '-res" aria-live="polite">' + searchResults(B.ui.q || '') + '</div></div>';
  };
  function searchResults(q) {
    q = q.trim(); if (q.length < 2) return '';
    var hits = S.search(q);
    var offer = { bbn: 'BBN fibre', partner: 'Partner network', none: 'Not connected yet' };
    var html = hits.map(function (b) {
      return '<a class="result" href="#building-' + b.id + '"><span><b>' + esc(b.name) + '</b><small>' + esc(b.address) + '</small></span><span class="small">' + offer[b.offer] + '</span></a>';
    }).join('');
    if (!hits.length) html = '<p class="small">We do not list “' + esc(q) + '” yet.</p>';
    return html + '<a class="result" href="#interest" data-act="interestFrom"><span><b>My building is not listed</b><small>Ask us to bring BBN fibre to your building</small></span>' + B.icon('arrow') + '</a>';
  }
  A.searchInput = function (el) { B.ui.q = el.value; document.getElementById(el.getAttribute('data-search')).innerHTML = searchResults(el.value); };
  A.interestFrom = function () { B.ui.interestName = (B.ui.q || '').trim(); B.go('interest'); };

  var heroArt =
    '<svg class="hero-art" viewBox="0 0 1440 620" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
    '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1030"/><stop offset=".62" stop-color="#1a2a6c"/><stop offset="1" stop-color="#2f60c8"/></linearGradient>' +
    '<pattern id="win" width="22" height="26" patternUnits="userSpaceOnUse"><rect x="5" y="6" width="10" height="12" fill="#7fd0ff" opacity=".18"/></pattern>' +
    '<pattern id="winlit" width="22" height="26" patternUnits="userSpaceOnUse"><rect x="5" y="6" width="10" height="12" fill="#bfe6ff" opacity=".85"/></pattern></defs>' +
    '<rect width="1440" height="620" fill="url(#sky)"/>' +
    '<polygon points="1440,0 1440,150 1290,0" fill="#1e5e98" opacity=".5"/><polygon points="1440,150 1340,50 1440,50" fill="#2a88da" opacity=".45"/><polygon points="1290,0 1340,50 1390,0" fill="#2f60c8" opacity=".5"/>' +
    '<g fill="#0d1540"><rect x="560" y="360" width="120" height="260"/><rect x="700" y="300" width="90" height="320"/><rect x="1240" y="330" width="130" height="290"/><rect x="1380" y="400" width="60" height="220"/><rect x="430" y="430" width="110" height="190"/></g>' +
    '<g fill="url(#win)"><rect x="560" y="360" width="120" height="260"/><rect x="700" y="300" width="90" height="320"/><rect x="1240" y="330" width="130" height="290"/><rect x="430" y="430" width="110" height="190"/></g>' +
    '<rect x="880" y="190" width="250" height="430" fill="#101a52" stroke="#7fd0ff" stroke-width="2"/><rect x="890" y="204" width="230" height="400" fill="url(#winlit)"/>' +
    '<polygon points="880,190 1005,150 1130,190" fill="#1e5e98"/>' +
    '<path d="M0 596 H820 Q860 596 860 560 V540 H880" fill="none" stroke="#7fd0ff" stroke-width="3" opacity=".35"/>' +
    '<path class="fibre-run" d="M0 596 H820 Q860 596 860 560 V540 H880" fill="none" stroke="#ffffff" stroke-width="3"/>' +
    '<circle cx="880" cy="540" r="7" fill="#fff"/><rect y="604" width="1440" height="16" fill="#0a1030"/></svg>';

  V.home = function () {
    var html =
      '<section class="hero night"><div>' + heroArt + '</div><div class="hero-shade"></div><div class="wrap"><div class="hero-copy">' +
        '<p class="eyebrow">Umhlanga and Durban</p>' +
        '<h1 tabindex="-1" id="page-title">Fibre we own.<br>Speed you feel.</h1>' +
        '<p class="lede">BBN builds and runs its own fibre, so the people you call are the people who fix it.</p>' +
        '<div class="panel-night">' + B.searchBox('hq', 'Check my building') + '</div>' +
        '<div class="subhelp"><p class="eyebrow">Subscriber Help</p><div class="row">' +
          '<a href="#status">' + B.icon('alert') + 'Check an outage</a>' +
          '<a href="#account">' + B.icon('user') + 'My Account</a>' +
          '<a href="#fault">' + B.icon('tool') + 'Report a fault</a>' +
        '</div></div>' +
      '</div></div><p class="art-tag">Artwork placeholder. Replace with an approved dusk photograph of a connected building.</p></section>' +

      '<section class="section"><div class="wrap grid2">' +
        '<div class="stack"><p class="eyebrow">Our network</p><h2>One company from your router to the internet</h2>' +
          '<p class="lede">Many providers rent a line from another company. In the buildings we connect, BBN laid the fibre and looks after it. When something breaks, one local team finds it and fixes it.</p>' +
          '<div class="row"><a class="btn" href="#coverage">Check Coverage</a><a class="btn ghost" href="#home-fibre">How Home Fibre works</a></div></div>' +
        '<div class="stack">' +
          '<div class="note"><h3>Same speed up and down</h3><p class="muted">Uploads are as fast as downloads, so video calls and cloud backups keep up.</p></div>' +
          '<div class="note"><h3>Uncapped</h3><p class="muted">Use the connection as much as you need. Our fair use policy explains the limits: ' + tc('AUP_AND_LAWFUL_USE') + '</p></div>' +
          '<div class="note"><h3>Clear costs before you sign up</h3><p class="muted">You see the monthly total, every once-off fee and the contract term before we ask for your details.</p></div>' +
        '</div></div></section>' +

      '<section class="section sunk"><div class="wrap grid2">' +
        '<div class="art" role="img" aria-label="Film still placeholder"><div><b>The Only Room With Signal</b>Film still placeholder. The 30 to 45 second film has not been shot yet.<br><br><button class="btn sm" disabled>Play film</button></div></div>' +
        '<div class="stack"><p class="eyebrow">Our new film</p><h2>The Only Room With Signal</h2>' +
          '<p class="lede">A family does everything in the passage, because that is where the Wi-Fi works. A BBN technician finds out why. It is a short film about the difference between your fibre line and your Wi-Fi.</p>' +
          '<div class="row"><a class="btn ghost" href="#film">Read the concept and shot list</a><a class="btn quiet" href="#guides">Fibre and Wi-Fi explained</a></div></div>' +
      '</div></section>' +

      '<section class="section"><div class="wrap stack-lg"><div class="stack-sm"><p class="eyebrow">Quick answers</p><h2>Three things worth knowing first</h2></div>' +
        '<div class="grid3">' +
          '<a class="card" href="#guides" style="text-decoration:none;color:inherit"><h3>How much speed do I need?</h3><p class="muted">Count the people and what they do online. Our guide suggests a plan and tells you if a cheaper one would do.</p><span class="linkbtn">Open the speed guide</span></a>' +
          '<a class="card" href="#guides" style="text-decoration:none;color:inherit"><h3>Fibre is not Wi-Fi</h3><p class="muted">Fibre brings the internet to your unit. Wi-Fi spreads it around your home. Slow Wi-Fi in one room is usually about where the router sits.</p><span class="linkbtn">See the difference</span></a>' +
          '<a class="card" href="#guides" style="text-decoration:none;color:inherit"><h3>What happens on installation day?</h3><p class="muted">What we check first, what the technician does in your unit, and what you need to arrange.</p><span class="linkbtn">Read about installation</span></a>' +
        '</div></div></section>' +

      '<section class="section sunk"><div class="wrap grid2">' +
        '<div class="card"><p class="eyebrow">Resident story</p><h3>A real resident, in their own words</h3><p class="muted">We will publish one resident story here once we have a verified account and written permission.</p><a href="#stories">See the story layout</a></div>' +
        '<div class="card"><p class="eyebrow">Building case study</p><h3>How we connected a building</h3><p class="muted">Working with management, running the cabling, and keeping disruption to residents low. Published only with verified facts and permission.</p><a href="#stories">See the case study layout</a></div>' +
      '</div></section>' +

      '<section class="section"><div class="wrap grid2">' +
        '<div class="card"><h3>For business</h3><p class="muted">Tell us where you operate and what the connection is for. We reply with a quote.</p><a class="btn ghost" href="#business">Business fibre</a></div>' +
        '<div class="card"><h3>For estates and buildings</h3><p class="muted">Body corporates, trustees and managing agents: ask us to assess your building.</p><a class="btn ghost" href="#estates">Estates &amp; Buildings</a></div>' +
      '</div></section>';
    return { title: 'Fibre we own. Speed you feel.', html: html };
  };

  V.coverage = function () {
    var move = B.ui.move;
    return { title: 'Check Coverage', html:
      B.pageHead(move ? 'Check coverage at your new address' : 'Check Coverage', move ? 'A move starts with coverage. Find your new building first.' : 'Find your building to see the plans and prices that apply there.') +
      '<section class="section"><div class="wrap narrow stack-lg">' +
        '<div class="card">' + B.searchBox('cq', 'Search by building, estate or street address') +
          '<p class="hint">Preview buildings: Lighthouse Court, Ridge Gardens, Marine Terraces, Palm Crest Estate. ' + B.sampleTag + '</p></div>' +
        '<div class="card"><h3>Have a BBN sticker on your fibre box?</h3><p class="muted">Type the short reference printed under the QR code. It tells us which unit you are in. It does not identify you or any account.</p>' +
          '<form data-form="boxref" novalidate><div class="field"><label for="bx">Box reference</label><div class="inline"><input id="bx" name="ref" required data-label="the box reference" placeholder="For example 7K2M-Q4HX" autocapitalize="characters" autocomplete="off"><button class="btn ghost">Find my unit</button></div></div></form></div>' +
      '</div></section>' };
  };
  F.boxref = function (d) {
    var box = S.box(d.ref);
    if (!box) return { ref: 'We do not recognise that reference. Check the letters and numbers, or search for your building instead. Your unit can still be checked without it.' };
    B.go('box-' + box.ref.toLowerCase());
  };

  V['home-fibre'] = function () {
    return { title: 'Home Fibre', html:
      B.pageHead('Home Fibre', 'Fibre internet for your home, on a network BBN owns and runs.') +
      '<section class="section"><div class="wrap grid2">' +
        '<div class="stack"><h2>Start with your building</h2><p class="lede">Plans and prices depend on the building. Search for yours and you will see exactly what is on offer there, with the full cost, before we ask who you are.</p>' +
          '<div class="card">' + B.searchBox('fq', 'Check my building') + '</div></div>' +
        '<div class="stack"><h2>How it works</h2><ol class="steps">' +
          '<li><div class="body"><h3>Find your building and unit</h3><p class="muted">Search, scan the flyer on your noticeboard, or scan the sticker on your fibre box.</p></div></li>' +
          '<li><div class="body"><h3>Compare plans and see the full cost</h3><p class="muted">Monthly total with VAT, once-off fees, contract term and equipment.</p></div></li>' +
          '<li><div class="body"><h3>Sign up and authorise your debit order</h3><p class="muted">Name, mobile and email. The debit order is authorised with our payment partner, not on this site.</p></div></li>' +
          '<li><div class="body"><h3>We confirm your activation</h3><p class="muted">BBN confirms a remote activation or a technician visit. Typical lead times: ' + tc('INSTALL_PERMISSIONS_AND_LEAD_TIMES') + '</p></div></li>' +
        '</ol></div></div></section>' +
      '<section class="section sunk"><div class="wrap grid3">' +
        '<div class="card"><h3>Speeds on offer</h3><p class="muted">Every plan has the same speed up and down. The range we offer: ' + tc('SPEED_RANGE') + '</p></div>' +
        '<div class="card"><h3>Contract and cancellation</h3><p class="muted">' + tc('CONTRACT_TERM') + '</p></div>' +
        '<div class="card"><h3>Router and equipment</h3><p class="muted">' + tc('EQUIPMENT_AND_RETURNS') + '</p></div>' +
      '</div></section>' +
      '<section class="section"><div class="wrap row"><a class="btn" href="#guides">Open the speed guide</a><a class="btn ghost" href="#interest">My building is not connected yet</a></div></section>' };
  };

  function enquiryForm(kind) {
    var biz = kind === 'business';
    var sent = B.ui.enquirySent && B.ui.enquirySent.kind === kind ? B.ui.enquirySent : null;
    if (sent) return '<div class="note ok" id="enq-done" tabindex="-1"><h3>We have your enquiry</h3><p>Reference <b class="num">' + sent.ref + '</b>. It goes to the ' + (biz ? 'business' : 'estates') + ' team: ' + tc(biz ? 'BUSINESS_CAPABILITIES' : 'ESTATE_CAPABILITIES') + '</p><p class="muted small">Preview only. Nothing was sent to BBN. This enquiry is stored in this browser and shows in the staff demo.</p><button class="linkbtn" data-act="enquiryAgain">Send another enquiry</button></div>';
    return '<form class="card" data-form="enquiry" data-draft="enq-' + kind + '" novalidate><input type="hidden" name="kind" value="' + kind + '"><h3>' + (biz ? 'Request a business quote' : 'Ask us about your building') + '</h3><div class="formgrid">' +
      '<div class="field"><label for="en">Your name</label><input id="en" name="name" required data-label="your name" autocomplete="name"></div>' +
      '<div class="field"><label for="em">Mobile number</label><input id="em" name="mobile" type="tel" inputmode="tel" required data-kind="mobile" data-label="your mobile number" autocomplete="tel"></div>' +
      '<div class="field wide"><label for="ee">Email</label><input id="ee" name="email" type="email" required data-label="your email address" autocomplete="email"></div>' +
      (biz ?
        '<div class="field wide"><label for="ew">Where does the business operate?</label><input id="ew" name="where" required data-label="where the business operates" placeholder="Building or street address"></div>' +
        '<div class="field wide"><label for="eu">What do you need the connection for?</label><textarea id="eu" name="use" required data-label="what the connection is for" placeholder="For example: 12 staff, cloud accounting, card machines, CCTV"></textarea></div>'
        :
        '<div class="field wide"><label for="ew">Building or estate address</label><input id="ew" name="where" required data-label="the building address" value="' + esc(B.ui.estateAddr || '') + '"></div>' +
        '<div class="field"><label for="ec">Roughly how many units? (if you know)</label><input id="ec" name="units" inputmode="numeric" placeholder="For example 48"></div>' +
        '<div class="field"><label for="er">What would you like?</label><select id="er" name="want"><option>A call</option><option>A site survey</option><option>Information by email</option></select></div>') +
      '<label class="check wide"><input type="checkbox" name="consent" required data-msg="Tick the box so we may reply to you."><span>BBN may use these details to reply to this enquiry. Privacy notice: ' + tc('PRIVACY_NOTICE') + '</span></label>' +
      '<div class="wide"><button class="btn">Send enquiry</button></div></div></form>';
  }
  F.enquiry = function (d) {
    d.mobile = S.normMobile(d.mobile);
    var r = S.addEnquiry(d); B.clearDraft('enq-' + d.kind);
    B.ui.enquirySent = { kind: d.kind, ref: r.ref }; B.rerender('enq-done');
  };
  A.enquiryAgain = function () { B.ui.enquirySent = null; B.rerender(); };

  V.business = function () {
    return { title: 'Business', html:
      B.pageHead('Business', 'Fibre for offices, shops and practices. Every business connection is quoted for the site and the work it has to do.') +
      '<section class="section"><div class="wrap grid2"><div class="stack">' +
        '<h2>Tell us two things</h2><ul class="plain"><li>Where the business operates.</li><li>What the connection has to carry: people, phones, card machines, cameras, cloud systems.</li></ul>' +
        '<p class="muted">We check whether our fibre reaches the site and reply with a quote. Business products and service levels: ' + tc('BUSINESS_CAPABILITIES') + '</p>' +
        '<p class="muted">Published response or restoration times: ' + tc('RESPONSE_COMMITMENTS') + '</p></div>' + enquiryForm('business') + '</div></section>' };
  };
  V.estates = function () {
    return { title: 'Estates & Buildings', html:
      B.pageHead('Estates &amp; Buildings', 'For body corporates, trustees, managing agents and developers who want BBN fibre in their building.') +
      '<section class="section"><div class="wrap grid2"><div class="stack">' +
        '<h2>How a building gets connected</h2><ol class="steps">' +
          '<li><div class="body"><h3>You ask, we assess</h3><p class="muted">Send the address and a rough unit count. We check how close our network is.</p></div></li>' +
          '<li><div class="body"><h3>Survey and proposal</h3><p class="muted">We survey the building and send a written proposal to management. Our offer to estates: ' + tc('ESTATE_CAPABILITIES') + '</p></div></li>' +
          '<li><div class="body"><h3>Cabling, planned with management</h3><p class="muted">Work is agreed with management in advance so residents know what to expect.</p></div></li>' +
          '<li><div class="body"><h3>Residents choose their own plan</h3><p class="muted">Each unit signs up for itself. A flyer on the noticeboard takes residents straight to your building page.</p></div></li></ol>' +
        '<p class="muted">Residents asking for BBN? <a href="#interest">See how residents register interest</a>.</p></div>' + enquiryForm('estates') + '</div></section>' };
  };

  /* ---------- speed guide (also embedded on building pages) ---------- */
  B.guideState = function () { return B.ui.guide || (B.ui.guide = { people: 2, on: { browse: true, hd: true } }); };
  B.guideNeed = function () {
    var g = B.guideState(), need = 0;
    B.guide.forEach(function (a) { if (g.on[a.id]) need += a.per ? a.need * g.people : a.need; });
    return Math.max(10, Math.round(need));
  };
  B.guideControls = function () {
    var g = B.guideState();
    return '<div class="stack"><div class="field"><label for="gp">How many people are online at the same time? <b class="num" id="gpn">' + g.people + '</b></label>' +
      '<input id="gp" type="range" min="1" max="8" value="' + g.people + '" data-change="guidePeople" style="padding:0;border:0;background:transparent"></div>' +
      '<div><p class="flabel" style="margin-bottom:8px">What do they do?</p><div class="toggles">' + B.guide.map(function (a) {
        return '<button type="button" class="tog" id="g-' + a.id + '" data-act="guideToggle" data-id="' + a.id + '" aria-pressed="' + (!!g.on[a.id]) + '">' + a.label + '</button>';
      }).join('') + '</div></div></div>';
  };
  A.guidePeople = function (el) { B.guideState().people = +el.value; B.rerender('gp'); };
  A.guideToggle = function (el) { var g = B.guideState(), id = el.getAttribute('data-id'); g.on[id] = !g.on[id]; B.rerender('g-' + id); };

  V.guides = function () {
    var need = B.guideNeed();
    return { title: 'Guides', html:
      B.pageHead('Guides', 'Short, plain answers about speeds, Wi-Fi and installation.') +
      '<section class="section"><div class="wrap grid2">' +
        '<div class="stack"><p class="eyebrow">Speeds</p><h2>How much speed do I need?</h2>' +
          '<p class="muted">Speed is measured in megabits per second (Mbps). It is how much data can move at once. More people and more video need more of it.</p>' + B.guideControls() + '</div>' +
        '<div class="card"><h3>A sensible starting point</h3><p class="plan"><span class="speed num">' + need + '<small>Mbps or more</small></span></p>' +
          '<p class="muted">This is a planning guide, not a guarantee. When you open your building page we match this to the plans available there and point out a cheaper plan if it fits.</p>' +
          '<a class="btn" href="#coverage">Check my building</a></div></div></section>' +
      '<section class="section sunk"><div class="wrap grid2">' +
        '<div class="stack"><p class="eyebrow">Fibre and Wi-Fi</p><h2>Fibre is not Wi-Fi</h2>' +
          '<p class="muted"><b>Fibre</b> is the cable that brings the internet into your unit. Its speed is the plan you pay for.</p>' +
          '<p class="muted"><b>Wi-Fi</b> is the radio signal your router sends around your home. Walls, cupboards and distance weaken it.</p>' +
          '<p class="muted">If the internet is slow in one room and fine next to the router, the fibre is doing its job. The Wi-Fi is not reaching that room.</p></div>' +
        '<div class="card"><h3>Three checks before you call</h3><ul class="plain"><li>Is the router out in the open, not in a cupboard or behind the TV?</li><li>Is it near the middle of your home, at about table height?</li><li>Does a device plugged into the router with a cable get full speed?</li></ul>' +
          '<p class="muted">Still stuck? <a href="#fault">Use the troubleshooter</a>.</p></div></div></section>' +
      '<section class="section"><div class="wrap grid2">' +
        '<div class="stack"><p class="eyebrow">Installation</p><h2>What happens on installation day</h2><ol class="steps">' +
          '<li><div class="body"><h3>We confirm your unit</h3><p class="muted">Some units already have a fibre point. Others need new work. We tell you which before you commit.</p></div></li>' +
          '<li><div class="body"><h3>Permissions, if needed</h3><p class="muted">If you rent, or the building has rules, permission may be needed first: ' + tc('INSTALL_PERMISSIONS_AND_LEAD_TIMES') + '</p></div></li>' +
          '<li><div class="body"><h3>Activation or a visit</h3><p class="muted">If the fibre point is ready, we can often activate remotely. Otherwise a technician installs the fibre box and router.</p></div></li>' +
          '<li><div class="body"><h3>We test where you use it</h3><p class="muted">The technician places the router well and tests the Wi-Fi in the rooms that matter to you.</p></div></li></ol></div>' +
        '<div class="art" role="img" aria-label="Photo placeholder"><div><b>Photo placeholder</b>A BBN technician fitting a fibre box in a real unit. Needs an approved photograph with permission.</div></div></div></section>' };
  };

  V.film = function () {
    var shots = [
      ['1', 'Passage, evening', 'Wide. A family of four is squeezed into a narrow passage: laptop on an ironing board, a teenager gaming on the floor, a gran streaming on a tablet. Bully the dog is asleep beside a dining chair.', '0:00 to 0:07'],
      ['2', 'Passage', 'Close-ups. A video call freezes when Dad leans towards the lounge. He leans back and it recovers. Nobody comments. This is normal for them.', '0:07 to 0:13'],
      ['3', 'Front door', 'A real BBN technician in a branded shirt steps in, looks down the passage and asks: “Is this where you all prefer to sit?”', '0:13 to 0:18'],
      ['4', 'Fibre box', 'The technician checks the fibre box. On-screen caption: “The fibre is fine. Full speed reaches the unit.”', '0:18 to 0:24'],
      ['5', 'Cupboard', 'He opens a hallway cupboard. The router is behind a stack of towels. He holds it up. Caption: “Wi-Fi was stuck in the cupboard.”', '0:24 to 0:30'],
      ['6', 'Lounge', 'Router moved into the open. He walks through the lounge and a bedroom with a phone, testing the Wi-Fi where the family uses it.', '0:30 to 0:37'],
      ['7', 'Passage, later', 'The passage is empty. The chair is still there. Bully is still asleep beside it. End card: “Fibre we own. Speed you feel.” with the BBN logo.', '0:37 to 0:43']
    ];
    return { title: 'The Only Room With Signal', html:
      B.pageHead('The Only Room With Signal', 'Concept and shot list for BBN’s new 30 to 45 second film. It replaces the Buffer Busters advert.', '<a href="#home">Home</a>') +
      '<section class="section"><div class="wrap grid2">' +
        '<div class="art" role="img" aria-label="Film still placeholder"><div><b>Film still placeholder</b>The site will show a still with an optional play button. Captions are part of the film.<br><br><button class="btn sm" disabled>Play film</button></div></div>' +
        '<div class="stack"><h2>What the film teaches</h2><p class="muted">Fibre brings the internet to your unit. Wi-Fi carries it around your home. When only one spot has signal, the answer is usually router placement, and BBN will help you check.</p>' +
          '<h3>Production notes</h3><ul class="plain"><li>A real BBN technician, local actors and an approved connected building.</li><li>Natural humour. The family is not foolish and the technician is not smug.</li><li>Burned-in captions so it works with the sound off.</li><li>Written permission from everyone on screen and from the building.</li></ul>' +
          '<p class="muted">Status: ' + tc('FILM_SHOOT') + '</p></div></div></section>' +
      '<section class="section sunk"><div class="wrap stack"><h2>Shot list</h2><div class="tablewrap"><table><thead><tr><th>Shot</th><th>Where</th><th>What we see</th><th>Time</th></tr></thead><tbody>' +
        shots.map(function (s) { return '<tr><td class="num">' + s[0] + '</td><td>' + s[1] + '</td><td>' + s[2] + '</td><td class="num" style="white-space:nowrap">' + s[3] + '</td></tr>'; }).join('') +
        '</tbody></table></div></div></section>' };
  };

  V.stories = function () {
    return { title: 'Stories', html:
      B.pageHead('Stories', 'Layouts for one resident story and one building case study. Nothing here is published until BBN has verified facts and written permission.') +
      '<section class="section"><div class="wrap grid2">' +
        '<div class="stack"><p class="eyebrow">Resident story</p><h2>[Resident first name], [building]</h2>' +
          '<div class="art" role="img" aria-label="Portrait placeholder"><div><b>Portrait placeholder</b>The resident at home, natural light. Signed consent needed.</div></div>' +
          '<blockquote style="margin:0;padding-left:16px;border-left:4px solid var(--facet)"><p class="lede">“A short quote in the resident’s own words about what changed for them.”</p></blockquote>' +
          '<dl class="kv"><dt>What they use it for</dt><dd>To be supplied</dd><dt>Before BBN</dt><dd>To be supplied</dd><dt>What changed</dt><dd>To be supplied</dd></dl>' +
          '<p class="muted">Status: ' + tc('CUSTOMER_STORIES') + '</p></div>' +
        '<div class="stack"><p class="eyebrow">Building case study</p><h2>How BBN connected [building]</h2>' +
          '<div class="art" role="img" aria-label="Building photo placeholder"><div><b>Building photo placeholder</b>Exterior of the building, with body corporate permission.</div></div>' +
          '<ol class="steps"><li><div class="body"><h3>Working with management</h3><p class="muted">Who asked, who approved, and how long it took. Facts to be verified.</p></div></li>' +
          '<li><div class="body"><h3>Cabling the building</h3><p class="muted">Where the fibre runs and how each unit is reached. Facts to be verified.</p></div></li>' +
          '<li><div class="body"><h3>Disruption to residents</h3><p class="muted">What residents were told, what work they saw, and what we would do differently.</p></div></li>' +
          '<li><div class="body"><h3>The result</h3><p class="muted">Units connected and what management says now. Published only with permission.</p></div></li></ol></div>' +
      '</div></section>' };
  };

  V.legal = function () {
    return { title: 'Policies', html:
      B.pageHead('Policies', 'Plain-English summaries and drafts. The approved documents replace these before launch.') +
      '<section class="section"><div class="wrap narrow stack-lg">' +
        '<div class="stack"><h2>The short version</h2>' +
          '<dl class="kv"><dt>What you pay</dt><dd>The monthly total and every once-off fee are shown on your building page before signup.</dd>' +
          '<dt>Contract length</dt><dd>' + tc('CONTRACT_TERM') + '</dd><dt>Cancelling</dt><dd>' + tc('CONTRACT_TERM') + '</dd>' +
          '<dt>Equipment</dt><dd>' + tc('EQUIPMENT_AND_RETURNS') + '</dd></dl></div>' +
        '<div><details id="terms"><summary>Service agreement</summary><div class="body"><p>The approved agreement will be shown here and during signup. We record which version you accepted. ' + tc('SERVICE_TERMS_VERSION') + '</p></div></details>' +
          '<details id="privacy"><summary>Privacy notice</summary><div class="body"><p>' + tc('PRIVACY_NOTICE') + '</p><p>BBN never asks for bank details or payment codes on this site. Debit orders are authorised with our payment partner.</p></div></details>' +
          '<details id="complaints"><summary>Complaints procedure</summary><div class="body"><p>' + tc('COMPLAINTS_PROCEDURE') + '</p></div></details></div>' +
        '<div class="stack"><div class="spread"><h2>Acceptable Use Policy</h2><span class="pill warn">Draft for BBN approval</span></div>' +
          '<ol class="plain"><li>BBN provides internet access. You are responsible for how the connection is used, including by other people in your home or business.</li>' +
          '<li>Use the service lawfully. Do not use it to break the law, to infringe copyright, to send spam, to attack or gain unauthorised access to other systems, or to harm other people.</li>' +
          '<li>Do not resell or share the service outside your premises unless BBN has agreed to this in writing.</li>' +
          '<li>The service is uncapped. If one connection uses the network in a way that degrades it for other customers, BBN may manage that traffic. We will tell you if this happens.</li>' +
          '<li>BBN may suspend or restrict a service that is used unlawfully or that puts the network at risk. Where the law allows, we will contact you first.</li>' +
          '<li>BBN complies where a lawful order requires it to restrict access to content or to a service.</li></ol></div>' +
        '<div class="stack"><div class="spread"><h2>Lawful use and streaming</h2><span class="pill warn">Draft for BBN approval</span></div>' +
          '<details><summary>Does BBN sell TV or streaming subscriptions?</summary><div class="body"><p>No. BBN provides internet access. We do not sell IPTV subscriptions or streaming packages.</p></div></details>' +
          '<details><summary>Can BBN help me set up a streaming service?</summary><div class="body"><p>We can help you check that your fibre and Wi-Fi are working properly. We do not assist with unauthorised streaming or any unlawful use of the connection. For help with a streaming service, contact that service.</p></div></details>' +
          '<details><summary>My stream is buffering. Is that BBN?</summary><div class="body"><p>It may be your Wi-Fi, your device or the service you are watching. Our troubleshooter helps you find out, and support can test your fibre line.</p></div></details>' +
          '<details><summary>Will BBN ever block something?</summary><div class="body"><p>BBN complies where a lawful order requires it to restrict access. Outside of that, see the Acceptable Use Policy above.</p></div></details>' +
          '<p class="muted small">Approval status: ' + tc('AUP_AND_LAWFUL_USE') + '</p></div>' +
      '</div></section>' };
  };

  V.notfound = function (h) {
    return { title: 'Page not found', html: B.pageHead('We could not find that page', 'The link may be old or mistyped.') +
      '<section class="section"><div class="wrap row"><a class="btn" href="#home">Go to the home page</a><a class="btn ghost" href="#coverage">Check Coverage</a><a class="btn ghost" href="#support">Subscriber Help</a></div></section>' };
  };
})();
