import { randomUUID, createHash } from "node:crypto";
import { mkdir, readFile, open } from "node:fs/promises";
import path from "node:path";

export class RsvpError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

function text(value, label, maximum, required = false) {
  if (typeof value !== "string") throw new RsvpError(`Please check ${label}.`);
  const result = value.trim();
  if ((required && !result) || result.length > maximum || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(result)) {
    throw new RsvpError(`Please check ${label}.`);
  }
  return result;
}

export function validateReply(input, config) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new RsvpError("Please check your reply.");
  const submissionId = text(input.submissionId, "the reply reference", 100, true);
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(submissionId)) throw new RsvpError("Please refresh the page and try again.");
  const name = text(input.name, "your name", 100, true);
  const email = text(input.email, "your email address", 180, true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email)) throw new RsvpError("Please enter a valid email address.");
  if (!["yes", "no"].includes(input.attendance)) throw new RsvpError("Please tell us whether you can attend.");
  const note = text(input.note ?? "", "your note", 1500);
  let guests = 0, diet = "", ceremonies = [];
  if (input.attendance === "yes") {
    if (!/^[1-6]$/.test(String(input.guests))) throw new RsvpError("Please choose between 1 and 6 guests.");
    guests = Number(input.guests);
    diet = text(input.diet, "your dietary preference", 40, true);
    if (!["Vegetarian", "Non-vegetarian", "Vegan", "No preference"].includes(diet)) throw new RsvpError("Please choose a dietary preference.");
    if (!Array.isArray(input.ceremonies) || input.ceremonies.length < 1 || input.ceremonies.length > config.events.length) {
      throw new RsvpError("Please choose at least one celebration.");
    }
    const eventIds = input.ceremonies.map(value => {
      if (typeof value !== "string") throw new RsvpError("Please check your chosen celebrations.");
      const event = config.events.find(item => item.id === value || item.day === value || `${item.shortName} · ${Number(item.day)} January` === value);
      if (!event) throw new RsvpError("Please check your chosen celebrations.");
      return event.id;
    });
    ceremonies = config.events.filter(item => eventIds.includes(item.id)).map(item => item.id);
  }
  return { submissionId, name, email, attendance: input.attendance, guests, diet, ceremonies, note };
}

function fingerprint(reply) {
  return createHash("sha256").update(JSON.stringify(reply)).digest("hex");
}

export class RsvpStore {
  constructor(directory, config) {
    this.file = path.join(directory, "rsvps.jsonl");
    this.directory = directory;
    this.config = config;
    this.receipts = new Map();
    this.available = false;
    this.queue = Promise.resolve();
    this.ready = this.initialize();
  }
  async initialize() {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    let contents = "";
    try { contents = await readFile(this.file, "utf8"); } catch (error) { if (error.code !== "ENOENT") throw error; }
    for (const line of contents.split("\n").filter(Boolean)) {
      const record = JSON.parse(line);
      if (!record.submissionId || !record.receiptId || !record.fingerprint) throw new Error("The RSVP journal needs repair before accepting replies.");
      this.receipts.set(record.submissionId, record);
    }
    // Check that persistence is available before advertising online delivery.
    const handle = await open(this.file, "a", 0o600);
    try { await handle.sync(); } finally { await handle.close(); }
    this.available = true;
  }
  async save(input) {
    const reply = validateReply(input, this.config);
    await this.ready;
    const operation = this.queue.then(async () => {
      if (!this.available) throw new RsvpError("Reply storage is temporarily unavailable. Please contact the family or try again later.", 503);
      const hash = fingerprint(reply);
      const existing = this.receipts.get(reply.submissionId);
      if (existing) {
        if (existing.fingerprint !== hash) throw new RsvpError("This reply reference was already used. Please refresh before sending a changed reply.", 409);
        return { receiptId: existing.receiptId, receivedAt: existing.receivedAt, duplicate: true };
      }
      const record = {
        version: 1, ...reply, fingerprint: hash,
        receiptId: `RSVP-${randomUUID()}`,
        receivedAt: new Date().toISOString()
      };
      let handle;
      try {
        handle = await open(this.file, "a", 0o600);
        await handle.writeFile(`${JSON.stringify(record)}\n`, "utf8");
        await handle.sync();
      } catch (error) {
        // An uncertain disk write must not be retried as a second append.
        // Restarting reloads any complete record and preserves its original receipt.
        this.available = false;
        throw error;
      } finally { if (handle) await handle.close(); }
      this.receipts.set(reply.submissionId, record);
      return { receiptId: record.receiptId, receivedAt: record.receivedAt, duplicate: false };
    });
    this.queue = operation.catch(() => {});
    return operation;
  }
}
