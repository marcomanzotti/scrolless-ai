// Retrieval for Scrolless AI — the "vector search" half of RAG.
// Loads the committed vector store (kb/kb-vectors.json), embeds the user's
// question with the SAME local model, and returns the most similar chunks.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { embedOne } from "./embedder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_FILE = path.join(__dirname, "..", "kb", "kb-vectors.json");

let _kb = null;
function loadKb() {
  if (_kb) return _kb;
  if (!fs.existsSync(KB_FILE)) {
    throw new Error(
      "kb/kb-vectors.json not found. Run `node scripts/build-kb.mjs` first."
    );
  }
  _kb = JSON.parse(fs.readFileSync(KB_FILE, "utf8"));
  return _kb;
}

// Vectors are normalized at build time, so cosine similarity is just a dot product.
function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// Retrieve the top-k most relevant chunks for a query.
// `minScore` filters out weak matches so an off-topic question retrieves nothing
// (which lets the model honestly say it doesn't know).
export async function retrieve(query, { topK = 4, minScore = 0.25 } = {}) {
  const kb = loadKb();
  const q = await embedOne(query);
  return kb.records
    .map((r) => ({ text: r.text, source: r.source, score: dot(q, r.embedding) }))
    .sort((a, b) => b.score - a.score)
    .filter((r) => r.score >= minScore)
    .slice(0, topK);
}

// Format retrieved chunks into a context block for the system prompt.
export function buildContext(hits) {
  if (hits.length === 0) return "";
  return hits
    .map((h, i) => `[Passage ${i + 1} — source: ${h.source}]\n${h.text}`)
    .join("\n\n");
}
