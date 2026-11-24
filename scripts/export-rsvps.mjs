// Private, local export. Run: node scripts/export-rsvps.mjs [output.csv]
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const directory = process.env.RSVP_DATA_DIR ? path.resolve(process.env.RSVP_DATA_DIR) : path.join(root, ".data");
const output = path.resolve(process.argv[2] || path.join(directory, "rsvps.csv"));
const fields = ["receiptId", "receivedAt", "name", "email", "attendance", "guests", "diet", "ceremonies", "note"];
function csv(value) {
  let string = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  // Guest input must remain text when opened in a spreadsheet.
  if (/^[\s]*[=+@-]/.test(string)) string = `'${string}`;
  return `"${string.replace(/"/g, '""')}"`;
}
try {
  const contents = await readFile(path.join(directory, "rsvps.jsonl"), "utf8");
  const records = contents.split("\n").filter(Boolean).map(line => JSON.parse(line));
  const body = [fields.map(csv).join(","), ...records.map(record => fields.map(field => csv(record[field])).join(","))].join("\r\n") + "\r\n";
  await writeFile(output, "\ufeff" + body, { encoding: "utf8", flag: "wx", mode: 0o600 });
  console.log(`Exported ${records.length} replies to ${output}`);
} catch (error) {
  console.error(error.code === "EEXIST" ? "That export already exists. Choose a new output filename." : `Could not export replies: ${error.message}`);
  process.exitCode = 1;
}
