/* Shared invitation formatting and standards-compliant calendar downloads. */
(function (root) {
  "use strict";
  function dateOnly(value) {
    const date = value.includes("-") ? value : `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    return new Date(`${date}T12:00:00Z`);
  }
  function formatDate(value, config, options = {}) {
    const date = typeof value === "string" && /^\d{4}-?\d{2}-?\d{2}$/.test(value) ? dateOnly(value) : new Date(value);
    return new Intl.DateTimeFormat("en-GB", { timeZone: config.timeZone, ...options }).format(date);
  }
  function formatTime(value, config) {
    return new Intl.DateTimeFormat("en-US", { timeZone: config.timeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(value));
  }
  function invitationText(config) {
    const start = dateOnly(config.calendarStart);
    const end = dateOnly(config.calendarEndExclusive);
    end.setUTCDate(end.getUTCDate() - 1);
    const sameMonth = start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
    const dateOptions = { day: "numeric", month: "long", year: "numeric" };
    const celebrationDates = sameMonth
      ? `${formatDate(start, config, { day: "numeric" })} — ${formatDate(end, config, dateOptions)}`
      : `${formatDate(start, config, dateOptions)} — ${formatDate(end, config, dateOptions)}`;
    const weddingTime = formatTime(config.weddingDate, config);
    const venue = config.venue || {};
    const celebrationLocations = [...new Set(config.events.map(event => event.venue || config.location))].join(" · ");
    return {
      couple: config.couple, partner1: config.partner1, partner2: config.partner2,
      celebrationDates, celebrationDatesUpper: celebrationDates.toUpperCase(),
      celebrationLocations, celebrationLocationsUpper: celebrationLocations.toUpperCase(),
      weddingDateLong: formatDate(config.weddingDate, config, dateOptions),
      weddingTime, weddingTimeZone: `${weddingTime} ${config.timeZoneLabel}`,
      location: config.location, locationUpper: config.location.toUpperCase(),
      venueName: venue.name || config.location,
      venueDescription: venue.address || "Our exact venue and directions are coming soon.",
      rsvpDeadlineLong: formatDate(config.rsvpDeadline, config, dateOptions),
      footerDate: formatDate(config.weddingDate, config, { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "."),
      storyMilestoneDate: formatDate(config.storyMilestoneDate, config, dateOptions).toUpperCase()
    };
  }
  function eventText(event, config) {
    const time = event.time === "weddingDate" ? formatTime(config.weddingDate, config) : (event.time || "Timing to be shared");
    return {
      name: event.name, tradition: event.tradition, description: event.description,
      dateLong: formatDate(event.date, config, { day: "numeric", month: "long", year: "numeric" }),
      dateUpper: formatDate(event.date, config, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase(),
      weekdayUpper: formatDate(event.date, config, { weekday: "long", day: "numeric", month: "short" }).toUpperCase(),
      time, timeWithZone: event.time === "weddingDate" ? `${time} ${config.timeZoneLabel}` : time,
      venue: event.venue || config.venue?.name || config.location
    };
  }
  const icsEscape = value => String(value).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  // RFC 5545 limits each physical content line to 75 UTF-8 octets.
  function foldLine(line) {
    const encoder = new TextEncoder();
    let result = "", current = "", length = 0;
    for (const character of line) {
      const size = encoder.encode(character).length;
      if (length + size > 75) {
        result += `${current}\r\n`;
        current = " "; length = 1;
      }
      current += character; length += size;
    }
    return result + current;
  }
  function utcStamp(value) { return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z"); }
  function makeCalendar(config, kind = "ceremony", now = new Date()) {
    const allDays = kind === "celebrations";
    const description = allDays
      ? config.events.map(event => {
        const details = eventText(event, config);
        return `${details.dateLong} — ${event.shortName} · ${details.venue}${event.time ? ` · ${details.timeWithZone}` : " · timing to be shared"}`;
      }).join("\n")
      : `Wedding ceremony at ${formatTime(config.weddingDate, config)} ${config.timeZoneLabel}.`;
    const venue = allDays
      ? [...new Set(config.events.map(event => eventText(event, config).venue))].join("; ")
      : [config.venue?.name, config.venue?.address, config.location].filter(Boolean).join(", ");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
      `UID:pabitra-asmita-${allDays ? "celebrations" : "ceremony"}-${config.calendarStart}@wedding.local`,
      `DTSTAMP:${utcStamp(now)}`,
      ...(allDays ? [`DTSTART;VALUE=DATE:${config.calendarStart}`, `DTEND;VALUE=DATE:${config.calendarEndExclusive}`] : [`DTSTART:${utcStamp(config.weddingDate)}`]),
      `SUMMARY:${icsEscape(`${config.couple} — ${allDays ? "Wedding celebrations" : "Wedding ceremony"}`)}`,
      `LOCATION:${icsEscape(venue)}`,
      `DESCRIPTION:${icsEscape(`${description}\n${config.venue?.address ? "" : "Exact venue and directions to follow."}`.trim())}`,
      "STATUS:CONFIRMED", `TRANSP:${allDays ? "TRANSPARENT" : "OPAQUE"}`,
      ...(!allDays ? ["BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", "DESCRIPTION:Wedding ceremony begins in one hour", "END:VALARM"] : []),
      "END:VEVENT", "END:VCALENDAR"];
    return lines.map(foldLine).join("\r\n") + "\r\n";
  }
  const api = Object.freeze({ formatDate, formatTime, invitationText, eventText, makeCalendar, foldLine });
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.WeddingUtils = api;
})(typeof window === "object" ? window : globalThis);
