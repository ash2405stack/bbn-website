/* BBN website preview: EDITABLE DEMO DATA.
   Everything in this file is sample data for the private preview. None of it is approved BBN data.
   Replace it with approved records before production (see js/register.js and tools/check-production.mjs).
   One data source holds buildings, aliases, units, box references, networks and plan eligibility. */
window.BBN = window.BBN || {};

BBN.config = {
  demo: true,                      // must be false in production; the production check fails while true
  previewUrl: '',                  // set to the published preview address so the sample QR codes open it
  productionUrl: '',               // [TO CONFIRM: SITE_DOMAIN_AND_QR_URLS]
  splynxPortalUrl: '',             // [TO CONFIRM: SPLYNX_PORTAL_LINKS]
  vatRate: 0.15,
  verificationMinutes: 30,         // [TO CONFIRM: SMS_VERIFICATION_RULES]
  termsVersion: 'DEMO-0.1',        // [TO CONFIRM: SERVICE_TERMS_VERSION]
  legalLine: 'Big Bully Networx (Pty) Ltd · Reg. 2019/519743/07' // from the brand kit; see LEGAL_ENTITY_DETAILS
};

/* Standard plan catalogue. Prices and fees are SAMPLE figures so the cost layout can be tested. */
BBN.plans = [
  { id: 'h50',   down: 50,   up: 50,   monthlyIncVat: 500,  sample: true },
  { id: 'h100',  down: 100,  up: 100,  monthlyIncVat: 700,  sample: true },
  { id: 'h200',  down: 200,  up: 200,  monthlyIncVat: 900,  sample: true },
  { id: 'h500',  down: 500,  up: 500,  monthlyIncVat: 1200, sample: true },
  { id: 'h1000', down: 1000, up: 1000, monthlyIncVat: 1500, sample: true }
];
BBN.fees = {                        // SAMPLE once-off fees, including VAT
  activation: 500,                  // unit with an existing fibre point on record
  installation: 1500                // confirmed new installation with a standard price
};

/* Buildings. offer: 'bbn' = BBN-owned fibre, 'partner' = approved partner network, 'none' = no approved offer yet.
   Unit states: 'existing' = fibre point on record, 'new' = confirmed new installation, 'check' = BBN must check first.
   Any unit number that is not listed is treated as 'check'. A missing QR sticker never changes the state or the fee. */
BBN.buildings = [
  { id: 'lighthouse-court', name: 'Lighthouse Court', address: '12 Sample Crescent, Umhlanga Ridge', area: 'Umhlanga Ridge',
    aliases: ['lighthouse', 'lh court', '12 sample crescent'], offer: 'bbn',
    plans: ['h50', 'h100', 'h200', 'h500', 'h1000'],
    units: {
      '101': { state: 'existing' }, '102': { state: 'existing' }, '203': { state: 'existing' },
      '204': { state: 'check' },
      '305': { state: 'new' },
      '306': { state: 'new', survey: true, consent: true }
    } },
  { id: 'ridge-gardens', name: 'Ridge Gardens', address: '48 Example Road, Umhlanga Ridge', area: 'Umhlanga Ridge',
    aliases: ['ridge gdns', '48 example road'], offer: 'bbn',
    plans: ['h50', 'h100', 'h200'], priceOverrides: { h100: 650 },
    units: { 'A1': { state: 'existing' }, 'B4': { state: 'existing' }, 'B7': { state: 'check' } } },
  { id: 'marine-terraces', name: 'Marine Terraces', address: '5 Placeholder Drive, Durban North', area: 'Durban North',
    aliases: ['marine terrace', '5 placeholder drive'], offer: 'partner', partner: 'PARTNER_NETWORK_NAME',
    plans: ['h50', 'h100'],
    units: { '1': { state: 'existing' }, '2': { state: 'check' } } },
  { id: 'palm-crest-estate', name: 'Palm Crest Estate', address: '200 Demo Avenue, Durban', area: 'Durban',
    aliases: ['palm crest', '200 demo avenue'], offer: 'none', plans: [], units: {} }
];

/* Termination-box references. Opaque: the reference only identifies a location, never a person or an account. */
BBN.boxes = {
  '7K2M-Q4HX': { buildingId: 'lighthouse-court', unit: '102' },
  '9D3F-T8RW': { buildingId: 'lighthouse-court', unit: '204' },
  '4P6C-L2NV': { buildingId: 'ridge-gardens', unit: 'B4' }
};

/* Network notices. Times are set relative to "now" so the preview always looks current. */
(function () {
  var now = Date.now(), min = 60000, hr = 3600000;
  BBN.notices = [
    { id: 'n-demo-1', type: 'outage', buildingIds: ['ridge-gardens'], area: 'Ridge Gardens, Block B',
      title: 'Internet down in Block B', impact: 'Units in Block B have no internet. Other blocks are not affected.',
      started: now - 55 * min, updated: now - 12 * min, next: now + 30 * min },
    { id: 'n-demo-2', type: 'maintenance', buildingIds: ['lighthouse-court'], area: 'Lighthouse Court',
      title: 'Planned maintenance', impact: 'Your internet may drop for up to 15 minutes during this window. You do not need to do anything.',
      started: now + 30 * hr, ends: now + 32 * hr, updated: now - 3 * hr, next: null },
    { id: 'n-demo-3', type: 'restored', buildingIds: ['marine-terraces'], area: 'Marine Terraces',
      title: 'Service restored', impact: 'The fault reported yesterday has been fixed. Restart your router if you are still offline.',
      started: now - 26 * hr, updated: now - 21 * hr, next: null }
  ];
})();

/* Activities for the speed guide. "need" is a planning guide in Mbps, not a measurement or a guarantee. */
BBN.guide = [
  { id: 'browse', label: 'Browsing and email', need: 5,  per: true },
  { id: 'hd',     label: 'HD streaming',       need: 8,  per: true },
  { id: 'uhd',    label: '4K streaming',       need: 25, per: false },
  { id: 'calls',  label: 'Video calls',        need: 6,  per: true },
  { id: 'game',   label: 'Online gaming',      need: 15, per: false },
  { id: 'upload', label: 'Big uploads or CCTV', need: 30, per: false }
];
