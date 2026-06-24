// Local server to run the prototype: serves the web widget + the /api/chat endpoint.
// Reads ANTHROPIC_API_KEY from a local .env file (which is gitignored).
//   node server.js   ->  http://localhost:3000
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Load .env (simple loader, no dependency) ---
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// chat.js reads the key at call time, so import AFTER loading .env
const { default: chatHandler } = await import("./api/chat.js");

const WEB = path.join(__dirname, "clients", "web");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/chat") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    try { req.body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}; }
    catch { req.body = {}; }
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (obj) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); return res; };
    return chatHandler(req, res);
  }

  const file = path.join(WEB, url.pathname === "/" ? "index.html" : url.pathname);
  if (file.startsWith(WEB) && fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
    return fs.createReadStream(file).pipe(res);
  }
  res.statusCode = 404;
  res.end("Not found");
});

server.listen(3000, () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key.");
  }
  console.log("✅ Scrolless AI demo → http://localhost:3000");
});
