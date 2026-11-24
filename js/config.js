/* Personalise the wedding here. This file contains public invitation details only. */
(function (root) {
  "use strict";
  const config = Object.freeze({
    couple: "Pabitra & Asmita",
    partner1: "Pabitra",
    partner2: "Asmita",
    timeZone: "Asia/Kolkata",
    timeZoneLabel: "IST",
    weddingDate: "2027-01-26T19:30:00+05:30",
    calendarStart: "20270124",
    calendarEndExclusive: "20270204",
    location: "Dharmanagar, Tripura",
    venue: Object.freeze({ name: "", address: "", mapUrl: "" }),
    contactEmail: "sonu.psahoo@gmail.com",
    contactPhone: "",
    rsvpDeadline: "2027-01-10",
    storyMilestoneDate: "2026-05-15",
    // Empty uses the included server when available, and email on static hosting.
    // An external endpoint must support the documented wedding-rsvp-v1 protocol.
    rsvpEndpoint: "",
    rsvpStatusEndpoint: "",
    whatsappCommunity: "https://chat.whatsapp.com/E0GXi3MzmeOLgxEFNqdHP4",
    instagram: "https://www.instagram.com/statistically_significant_duo?vrfl=MWcwcWhiazB4eWU1MA==",
    youtube: "https://www.youtube.com/@PabismitaStatisticallysign-p5b",
    draftStorageKey: "pabitra-asmita-website3-rsvp",
    events: Object.freeze([
      Object.freeze({
        id: "blessings", day: "24", date: "2027-01-24", name: "Blessings & beginnings",
        shortName: "Blessings", filterName: "Nirbandha", tradition: "NIRBANDHA · MANGALACHARAN",
        description: "We begin with the blessings of our families, sacred rituals, and the warmth of being together.",
        time: "", venue: ""
      }),
      Object.freeze({
        id: "haldi", day: "25", date: "2027-01-25", name: "Haldi & happy hearts",
        shortName: "Haldi", tradition: "MANGANA · GAI HALUD",
        description: "Golden turmeric, marigold moments, and a happy kind of mess. Come ready to laugh with us.",
        time: "", venue: ""
      }),
      Object.freeze({
        id: "wedding", day: "26", date: "2027-01-26", name: "Our forever, together",
        shortName: "Wedding", tradition: "SUBHA BIBAHA · BIYE",
        description: "Sacred vows, two beautiful traditions, and a celebration of love, food, and family.",
        time: "weddingDate", venue: ""
      }),
      Object.freeze({
        id: "reception", day: "03", date: "2027-02-03", name: "A warm reception",
        shortName: "Reception", tradition: "RECEPTION · CELEBRATION",
        description: "Join us as we celebrate our wedding with family and friends.",
        time: "7:30 PM onwards", venue: "Jharsuguda, Odisha"
      })
    ])
  });
  if (typeof module === "object" && module.exports) module.exports = config;
  else root.WEDDING_CONFIG = config;
})(typeof window === "object" ? window : globalThis);
