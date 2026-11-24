import http from "node:http";
import { readFile, stat, realpath } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { RsvpStore, RsvpError } from "./rsvp-store.mjs";

const require = createRequire(import.meta.url);
const defaultConfig = require("../js/config.js");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon", ".woff2": "font/woff2" };
function json(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  response.end(JSON.stringify(body));
}
async function readJson(request) {
  if (!/^application\/json(?:;|$)/i.test(request.headers["content-type"] || "")) throw new RsvpError("Please send the reply as JSON.", 415);
  if (Number(request.headers["content-length"]) > 16384) {
    request.resume();
    throw new RsvpError("Your reply is too long. Please shorten your note.", 413);
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16384) throw new RsvpError("Your reply is too long. Please shorten your note.", 413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new RsvpError("Your reply could not be read. Please try again."); }
}
export function createWeddingServer({ rootDirectory, dataDirectory = path.join(rootDirectory, ".data"), config = defaultConfig } = {}) {
  const store = new RsvpStore(dataDirectory, config);
  // Keep a failed persistence check from producing an unhandled rejection.
  store.ready.catch(() => {});
  const root = path.resolve(rootDirectory);
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      if (pathname === "/api/rsvp/status") {
        if (request.method !== "GET") { response.setHeader("Allow", "GET"); json(response, 405, { error: "Method not allowed." }); return; }
        try { await store.ready; json(response, store.available ? 200 : 503, { available: store.available, protocol: "wedding-rsvp-v1", endpoint: "/api/rsvp" }); }
        catch { json(response, 503, { available: false, protocol: "wedding-rsvp-v1" }); }
        return;
      }
      if (pathname === "/api/rsvp") {
        if (request.method !== "POST") { response.setHeader("Allow", "POST"); json(response, 405, { error: "Method not allowed." }); return; }
        const origin = request.headers.origin;
        if (origin && new URL(origin).host !== request.headers.host) { json(response, 403, { error: "Please send your reply from the wedding website." }); return; }
        const receipt = await store.save(await readJson(request));
        json(response, receipt.duplicate ? 200 : 201, { ok: true, protocol: "wedding-rsvp-v1", ...receipt });
        return;
      }
      if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed"); return; }
      // Publish the invitation only. Guest records, server code, scripts and dotfiles are private.
      const parts = pathname.split("/").filter(Boolean);
      if (pathname.includes("\\") || parts.some(part => part.startsWith(".")) ||
          !(pathname === "/" || pathname === "/index.html" || /^(?:assets|css|js)$/.test(parts[0] || ""))) {
        response.writeHead(404).end("Not found"); return;
      }
      const file = path.resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
      const resolved = await realpath(file);
      if (!resolved.startsWith(root + path.sep) || !(await stat(resolved)).isFile() || !types[path.extname(resolved).toLowerCase()]) {
        response.writeHead(404).end("Not found"); return;
      }
      const body = await readFile(resolved);
      response.writeHead(200, { "Content-Type": types[path.extname(resolved).toLowerCase()], "Content-Length": body.length, "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff" });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (error) {
      if (response.headersSent) { response.end(); return; }
      if (error instanceof RsvpError) { json(response, error.status, { ok: false, error: error.message }); return; }
      if (["ENOENT", "ENOTDIR"].includes(error.code) || error instanceof URIError) { response.writeHead(404).end("Not found"); return; }
      json(response, 503, { ok: false, error: "We could not save your reply. Please try again or use the email option." });
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return { server, store };
}
