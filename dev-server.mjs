// Invitation + durable RSVP server. Run: node dev-server.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createWeddingServer } from "./server/app.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3003);
const host = process.env.HOST || "127.0.0.1";
const dataDirectory = process.env.RSVP_DATA_DIR ? path.resolve(process.env.RSVP_DATA_DIR) : path.join(root, ".data");
const { server } = createWeddingServer({ rootDirectory: root, dataDirectory });
server.on("error", error => { console.error(`Could not start the wedding server: ${error.message}`); process.exitCode = 1; });
server.listen(port, host, () => { console.log(`Wedding website: http://${host}:${port}`); });
