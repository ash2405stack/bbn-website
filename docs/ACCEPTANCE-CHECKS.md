# Acceptance checks

Last run: 27 November 2026, headless Chromium (Playwright), against `site/` served locally.
Result: **81 of 81 automated checks passed** (`node tests/journeys.mjs`).

## What was actually run (automated, desktop Chromium)

| Area | Checked |
|---|---|
| New customer | Search, flyer route, unit states, plans before contact details, full cost, signup validation, SMS code (wrong and right), application reference, terms version recorded |
| Debit order | Declined, expired, pending, approved, on one application; duplicate request blocked while pending; different payer |
| Interrupted signup | Typed details survive a reload; application resumes from its link; SMS code asked again once verification expires |
| Units | Unknown unit treated as "needs a check" with no fee assumed; staff confirmation unlocks signup; surveyed cost must be accepted before commitment; same unit and mobile reuse one application |
| Box QR | Prefills building and unit, shows no personal data; unregistered reference explains the manual route; hand-typed reference in any spacing or case |
| Interest | Unlisted building, receipt without a coverage promise, share link, one demand record per building |
| Subscriber | Status reached in one tap, filtered in two; unavailable feed not shown as clear; known outage shown before the fault form; accepted fault gives a reference; rejected fault gives none and keeps what was typed |
| Layout | No sideways scrolling on 17 pages at 320, 390, 373, 690 and 1280 px wide |
| Keyboard | Skip link first, visible focus ring on every control tabbed, search to unit to plan with keyboard only |
| Reduced motion | The one animation is switched off |
| Slow data | Throttled to about 400 kbit/s with 400 ms latency and fonts blocked: headline and actions visible in about 6 s, uncompressed. Site code is about 46 KB when compressed, so a host with compression should be much faster. Not yet measured on a real host |

## What was looked at by eye (screenshots)

Home, building page and demo page, phone and desktop, light and dark.

## Not run: needs a real device

Tick these on the hosted preview.

### Ash's iPhone (Safari)
- [ ] Headline, "Check my building" and the three Subscriber Help links are all on the first screen without scrolling
- [ ] Home to Network Status takes one tap; choosing a building is the second
- [ ] At Lighthouse Court, unit 102: you can state the monthly cost and the once-off cost in under a minute
- [ ] Typing in any field does not zoom the page
- [ ] The SMS-code field offers the number keypad
- [ ] Sticky header does not hide the notch or status bar area
- [ ] Rotate to landscape: nothing is cut off
- [ ] Scan the sample flyer QR and the sample sticker QR from another screen with the Camera app
- [ ] Switch the phone to dark mode: all text is readable
- [ ] Settings > Accessibility > Motion > Reduce Motion on: the hero line stops moving
- [ ] With mobile data on a weak signal, the home page is usable before the fonts arrive

### Galaxy Z Fold7, folded (cover screen)
- [ ] Same first-screen check as the iPhone
- [ ] Navigation row scrolls sideways under the logo; "Check Coverage" stays visible
- [ ] Plan cards and the cost table read cleanly at the narrow width

### Galaxy Z Fold7, unfolded
- [ ] Layout uses the wider screen sensibly (the test used 690 px as an estimate; the real width may differ)
- [ ] Folding and unfolding mid-signup keeps what was typed
- [ ] Nothing important sits on the hinge line

### Other
- [ ] Screen reader pass (VoiceOver and TalkBack): headings, form errors and status messages are announced
- [ ] Colour contrast measured with a tool on the final approved imagery
- [ ] A person outside BBN reads the cost summary and explains it back (plain-English check)
