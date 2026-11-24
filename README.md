# Pabitra & Asmita — A beautiful beginning

A responsive liquid glass wedding invitation in maroon, warm ivory, and antique gold, featuring Pattachitra-inspired artwork. The ceremony is **26 January 2027, 7:30 PM IST**, in **Dharmanagar, Tripura**; celebrations run January 24–26.

## Run the website

With Node.js 20 or newer, open a terminal in `website3`:

```powershell
node dev-server.mjs
```

Visit **http://127.0.0.1:3003**. The server serves the invitation and records RSVPs. There are no runtime packages to install and no build step. `npm.cmd start` is equivalent on Windows.

Opening `index.html` directly or using a static server also works. On those versions the form offers an email reply, because there is no RSVP storage service. A guest must send that email; the site never presents an email draft as a received RSVP.

## Publish updates without stale assets

The local stylesheet, JavaScript, favicon, and hero preload URLs in `index.html` include a release query string (`?v=20261124-2`). When publishing a change to these files, update the version in all of those URLs to a new value (for example, the release date plus a sequence number). Browsers then request the new asset URLs instead of reusing cached copies. If you replace other images, use the same version on their URLs too. This does not publish the site; commit/push the changed files to the GitHub Pages source as usual.

## Personalise the invitation

Edit **`js/config.js`** for names, dates, the countdown, event copy, RSVP deadline, location, contact information, and social links. These values populate the page, calendar downloads, and reply labels. HTML contains readable fallback content for JavaScript-disabled browsers; update those fallback values if you change core wedding details.

- `venue.name`, `venue.address`, `venue.mapUrl`: add all three once confirmed. The directions button then appears. No venue or address has been invented.
- `contactEmail`: the family enquiry address and email RSVP destination.
- `contactPhone`: optional family phone number; its call button stays hidden until set.
- `whatsappCommunity`, `instagram`, `youtube`: the supplied links are connected. Empty or invalid URLs hide their card; the section hides if no links are available.
- `events`: ceremony dates, names, descriptions, and optional times. The wedding uses `weddingDate` for its confirmed time. Earlier timings remain awaiting confirmation.

The single stylesheet **`css/styles.css`** groups component rules and responsive breakpoints. Colours are defined with `--primary`, `--primary-dark`, `--primary-soft`, `--gold`, `--ivory`, and other tokens at its top. Main text and controls are larger, with a mobile form and reduced-motion support.

## RSVP collection and export

The included Node server saves validated replies to **`.data/rsvps.jsonl`**, then returns a confirmation reference. The form shows success only after a confirmed write. Retries of the same submission reuse the receipt, and saved drafts survive a failed submission. Guest records and server files are not served publicly.

To export the replies privately:

```powershell
node scripts/export-rsvps.mjs
```

The default output is `.data/rsvps.csv`. To keep an earlier export, choose a new filename:

```powershell
node scripts/export-rsvps.mjs .data/rsvps-2027-01-10.csv
```

The export refuses to overwrite existing files. `.data/` and ordinary RSVP exports are ignored by Git.

**For real guest collection online**, host the Node server with a persistent writable volume. Set `HOST=0.0.0.0`, use the hosting platform's `PORT`, and point `RSVP_DATA_DIR` at that volume. Run one server process against a given journal. Retain a backup of the journal. Static hosting keeps the email fallback unless connected to a compatible RSVP service.

An optional external service can be configured with `rsvpEndpoint` and `rsvpStatusEndpoint`. It must provide HTTPS/CORS support and this protocol:

- Status GET: `{ "available": true, "protocol": "wedding-rsvp-v1" }`.
- Reply POST JSON: `submissionId`, `name`, `email`, `attendance` (`yes`/`no`), `guests`, `diet`, `ceremonies` (IDs `blessings`, `haldi`, `wedding`), and `note`.
- Successful reply: `{ "ok": true, "protocol": "wedding-rsvp-v1", "receiptId": "unique-reference", "receivedAt": "ISO timestamp" }`, returned only after storage. Duplicate submission IDs with identical data must return the original receipt.

## Calendar and images

**Save our wedding date** downloads the timed ceremony, with a reminder one hour beforehand. **Save all three celebration days** downloads January 24–26 as an all-day block. Times convert correctly from India Standard Time; no ceremony duration has been assumed.

The page uses local responsive WebP artwork. The eight largest image variants total approximately **1.93 MB**, compared with **20.94 MB** for their original files. Browsers choose smaller variants for smaller displays. Originals remain in `assets/` for future editing, but are not requested by the page. The gallery now uses matching Pattachitra illustrations rather than unrelated stock photography.

[PHOTO_GUIDE.md](PHOTO_GUIDE.md) contains matching artwork prompts and image replacement guidance. [assets/CREDITS.md](assets/CREDITS.md) records current source artwork and archived photo credits. Optional image re-encoding uses `scripts/optimize-images.mjs` with a separately installed Sharp module; no encoder is needed to run the site. Google Fonts require an internet connection, with system font fallbacks.

## Verification

```powershell
node --test tests/rsvp.test.mjs
```

The checks cover input validation, durable storage, duplicate protection after retries and restart, private routes, and calendar dates and formatting. Browser checks also exercise mobile layouts, filters, lightbox controls, both RSVP delivery modes, and the configured social links.
