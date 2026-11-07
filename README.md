# Pabitra & Asmita — Liquid glass wedding website

A standalone, responsive wedding invitation in maroon, red, warm ivory, yellow, and gold. Built with HTML, CSS, and vanilla JavaScript. No dependencies or build step.

## Open the website

Open `index.html` in your browser, or use VS Code Live Server on this folder. A small optional local server is included:

```powershell
node dev-server.mjs
```

Then visit `http://localhost:3003`. Press Ctrl+C to stop it.

## Personalise

- `index.html`: names, invitation copy, dates, ceremony descriptions, guest details, and RSVP deadline. Existing wedding details were carried over from `website2`; venue and ceremony timings are clearly marked as awaiting confirmation.
- `js/config.js`: countdown target, calendar dates, and the RSVP email address. The current email was carried over from the existing site's configuration. Update it before sharing if needed.
- `css/styles.css`: the five main colours and all layout styles. The core palette is ivory `#fbf1dc`, maroon `#6f1d1d`, red `#8c2d2d`, gold `#c69232`, and warm rose `#c96b5b`.
- `assets/`: all site images are stored locally. Replace the existing files using the same names to swap photography without editing code.
- [PHOTO_GUIDE.md](PHOTO_GUIDE.md): photo suggestions, six ready-to-use AI image prompts, recommended crops, and replacement filenames.
- [assets/CREDITS.md](assets/CREDITS.md): atmospheric photo credits. The inspiration photos are not presented as the couple's actual venue or wedding memories. The couple illustration comes from the supplied project assets.

## Included

Floating glass navigation and mobile menu, real date countdown in Indian time, calendar invitation download, ceremony date filters, full-screen photo lightbox, accessible FAQ disclosures, and an RSVP form with a saved browser draft. Animations respect reduced-motion preferences, and blur has a fallback. Images and core content work offline; Google Fonts require an internet connection and fall back to system fonts.

## RSVP delivery

The RSVP button prepares an email in the guest's email app. **The guest must send the email to confirm.** There is no automatic server delivery or shared RSVP database. A download link lets guests save the reply as text if they do not have an email app configured. Drafts are saved only in that browser when storage is available.

The calendar entry covers January 24–26, 2027 as an all-day celebration. The wedding ceremony is listed for 7:30 PM IST on January 26, and the countdown targets that exact time.
