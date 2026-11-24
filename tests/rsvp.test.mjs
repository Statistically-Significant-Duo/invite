import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { RsvpStore, validateReply } from "../server/rsvp-store.mjs";
import { createWeddingServer } from "../server/app.mjs";

const require = createRequire(import.meta.url);
const config = require("../js/config.js");
const { makeCalendar, invitationText, eventText } = require("../js/wedding-utils.js");
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
function reply(overrides = {}) {
  return { submissionId: randomUUID(), name: "Test Guest", email: "guest@example.com", attendance: "yes", guests: "2", diet: "Vegetarian", ceremonies: ["blessings", "wedding"], note: "A test reply, not a real guest.", ...overrides };
}
async function temporaryDirectory(t) {
  const directory = await mkdtemp(path.join(tmpdir(), "wedding-rsvp-test-"));
  t.after(async () => {
    const resolved = path.resolve(directory);
    assert.ok(resolved.startsWith(path.resolve(tmpdir()) + path.sep + "wedding-rsvp-test-"));
    await rm(resolved, { recursive: true, force: true });
  });
  return directory;
}

test("validation rejects invalid guest counts, unchosen events and oversized notes", () => {
  assert.throws(() => validateReply(reply({ guests: "7" }), config), /between 1 and 6/);
  assert.throws(() => validateReply(reply({ ceremonies: [] }), config), /at least one/);
  assert.throws(() => validateReply(reply({ ceremonies: ["not-a-wedding-event"] }), config), /chosen celebrations/);
  assert.throws(() => validateReply(reply({ email: "invalid" }), config), /valid email/);
  assert.throws(() => validateReply(reply({ note: "x".repeat(1501) }), config), /your note/);
  const declined = validateReply(reply({ attendance: "no", guests: "6", ceremonies: ["wedding"] }), config);
  assert.equal(declined.guests, 0);
  assert.deepEqual(declined.ceremonies, []);
});

test("durable replies are idempotent across concurrent retries and server restarts", async t => {
  const directory = await temporaryDirectory(t);
  const store = new RsvpStore(directory, config);
  const input = reply();
  const results = await Promise.all([store.save(input), store.save(input), store.save(input)]);
  assert.equal(new Set(results.map(result => result.receiptId)).size, 1);
  assert.equal(results.filter(result => !result.duplicate).length, 1);
  const records = (await readFile(path.join(directory, "rsvps.jsonl"), "utf8")).trim().split("\n").map(JSON.parse);
  assert.equal(records.length, 1);
  assert.equal(records[0].name, input.name);
  const restarted = new RsvpStore(directory, config);
  const receipt = await restarted.save(input);
  assert.equal(receipt.receiptId, results[0].receiptId);
  assert.equal(receipt.duplicate, true);
  await assert.rejects(restarted.save({ ...input, guests: "3" }), error => error.status === 409);
});

test("HTTP API saves replies without exposing guest records or server files", async t => {
  const directory = await temporaryDirectory(t);
  const { server } = createWeddingServer({ rootDirectory: root, dataDirectory: directory });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const status = await fetch(`${base}/api/rsvp/status`).then(response => response.json());
  assert.equal(status.available, true);
  assert.equal(status.protocol, "wedding-rsvp-v1");
  assert.deepEqual(Object.keys(status).sort(), ["available", "endpoint", "protocol"]);
  for (const resource of ["/.data/rsvps.jsonl", "/server/rsvp-store.mjs", "/scripts/export-rsvps.mjs", "/tests/rsvp.test.mjs", "/.git/config"]) {
    assert.equal((await fetch(base + resource)).status, 404, resource);
  }
  assert.equal((await fetch(`${base}/index.html`)).status, 200);
  assert.equal((await fetch(`${base}/js/config.js`)).status, 200);
  assert.equal((await fetch(`${base}/api/rsvp`)).status, 405);
  const invalid = await fetch(`${base}/api/rsvp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reply({ ceremonies: [] })) });
  assert.equal(invalid.status, 400);
  const oversized = await fetch(`${base}/api/rsvp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reply({ note: "x".repeat(20000) })) });
  assert.equal(oversized.status, 413);
  const input = reply();
  const response = await fetch(`${base}/api/rsvp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  assert.equal(response.status, 201);
  const receipt = await response.json();
  assert.equal(receipt.ok, true);
  assert.ok(receipt.receiptId.startsWith("RSVP-"));
  assert.equal(receipt.name, undefined);
  const retry = await fetch(`${base}/api/rsvp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  assert.equal((await retry.json()).receiptId, receipt.receiptId);
  const crossOrigin = await fetch(`${base}/api/rsvp`, { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://unrelated.example" }, body: JSON.stringify(reply()) });
  assert.equal(crossOrigin.status, 403);
});

test("calendar uses the real ceremony instant, one-hour reminder and inclusive celebration days", () => {
  const ceremony = makeCalendar(config, "ceremony", "2026-11-09T00:00:00Z");
  assert.ok(ceremony.includes("DTSTART:20270126T140000Z\r\n"));
  assert.ok(ceremony.includes("TRIGGER:-PT1H\r\n"));
  assert.ok(!ceremony.includes("DTEND"));
  const celebrations = makeCalendar(config, "celebrations");
  assert.ok(celebrations.includes("DTSTART;VALUE=DATE:20270124\r\n"));
  assert.ok(celebrations.includes("DTEND;VALUE=DATE:20270204\r\n"));
  assert.ok(celebrations.includes("Dharmanagar\\, Tripura"));
  assert.ok(celebrations.includes("Jharsuguda\\, Odisha"));
  assert.ok(!celebrations.includes("VALARM"));
  const long = makeCalendar({ ...config, couple: "বিবাহ ❤️ ".repeat(30) });
  for (const line of long.split("\r\n")) assert.ok(Buffer.byteLength(line, "utf8") <= 75);
  const copy = invitationText(config);
  assert.equal(copy.weddingTimeZone, "7:30 PM IST");
  assert.equal(copy.celebrationDates, "24 January 2027 — 3 February 2027");
  assert.equal(copy.celebrationLocations, "Dharmanagar, Tripura · Jharsuguda, Odisha");
  const reception = eventText(config.events.find(event => event.id === "reception"), config);
  assert.equal(reception.venue, "Jharsuguda, Odisha");
  assert.equal(reception.timeWithZone, "7:30 PM onwards");
  assert.ok(celebrations.replace(/\r\n /g, "").includes("7:30 PM onwards"));
  assert.equal(copy.rsvpDeadlineLong, "10 January 2027");
});
