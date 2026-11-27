# BBN website (private preview)

New website for Big Bully Networx. This repository holds a **private preview**: both customer journeys work end to end on sample data and simulated services.

**Nothing here is connected to the live BBN website, Splynx, Netcash, an SMS gateway or any customer record.** Public launch, live integrations, real payment mandates, live messages, production access and changes to the existing site each need Ash's separate approval.

## Run it

No build step and nothing to install beyond Node.

```bash
npx http-server site -p 4173 -c-1
```

Open http://localhost:4173/ . To test on a phone on the same Wi-Fi, open `http://<your computer's IP>:4173/`.

## What is in the preview

| Journey | Start here |
|---|---|
| New customer: flyer QR, unit check, plans, full cost, signup, debit order, booking | `#flyer-lighthouse-court` |
| Fibre-box sticker QR | `#box-7k2m-q4hx` |
| Building not connected: register interest, share link | `#interest` |
| Subscriber: outage lookup, troubleshooter, fault report, My Account | `#status`, `#fault`, `#account` |
| Staff demo: review queue, notices, field updates | `#staff` |
| Demo checklist, sample QR codes, staff-control list, open-item register | `#demo` |

Sample units at Lighthouse Court: `102` fibre point on record, `204` needs a check, `305` new installation, `306` survey and permission needed. Any other number is treated as "needs a check".

## Where things live

| Path | What it is |
|---|---|
| `site/js/data.js` | **Editable demo data**: buildings, aliases, units, box references, networks, plans, fees, notices |
| `site/js/register.js` | **Open-item register** (single source). Shown on the `#demo` page and exported to `docs/OPEN-ITEMS.md` |
| `site/js/store.js` | Browser storage and the simulated services (SMS code, Netcash result, Splynx match, fault ticket, status feed) |
| `site/js/core.js` | Router, form validation, form recovery |
| `site/js/views-*.js` | Pages: public, journeys, staff and demo |
| `site/css/app.css` | Styles, on BBN Brand Kit v2.1 tokens (light and dark) |
| `tests/journeys.mjs` | 81 automated checks of both journeys, layout, keyboard, reduced motion and slow data |
| `tools/` | Preview build, register export, production gate |
| `docs/ACCEPTANCE-CHECKS.md` | What was actually tested, and what still needs a real device |

## Commands

```bash
node tests/journeys.mjs
```
Runs the checks against http://localhost:4173/ (start the server first).

```bash
node tools/export-register.mjs
```
Refreshes `docs/OPEN-ITEMS.md` after editing the register.

```bash
node tools/build-preview.mjs
```
Builds `dist/bbn-preview.html`, the single-file version used for the hosted private preview. Pass the preview address as an argument so the sample QR codes point at it.

```bash
node tools/check-production.mjs
```
Production gate. It **fails on purpose** while sample data, placeholders or open register items remain.

## Placeholders

Anything BBN has not confirmed appears on the site as `[TO CONFIRM: KEY]`. Each key is a row in the register. Sample prices and addresses carry a "Sample" tag. Neither may reach production; the production gate checks for both.

## How the preview stores data

Applications, interest, enquiries and fault reports are kept in the visitor's own browser (localStorage). A second phone will not see them. The live site needs a server and a database; that design is not part of this delivery.

## Hosted private preview

https://claude.ai/artifact/7GKQNPcTuTDD7rhddv2eFh (private to Ash's Claude account unless shared). To refresh it after a change:

```bash
node tools/build-preview.mjs https://claude.ai/artifact/7GKQNPcTuTDD7rhddv2eFh
```

Then republish `dist/bbn-preview.html` with the four logo files under `assets/`.
