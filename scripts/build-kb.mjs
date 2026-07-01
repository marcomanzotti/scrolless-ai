// Build the Scrolless AI vector database.
//
//   node scripts/build-kb.mjs
//
// Steps:
//   1. Read every PDF in kb/sources/.
//   2. Extract the text from each PDF locally (pdf-parse) — no API key needed.
//   3. Split the text into overlapping passages ("chunks").
//   4. Embed each chunk locally with Transformers.js (all-MiniLM-L6-v2) — no
//      external embeddings API, no extra key.
//   5. Write kb/kb-vectors.json — the vector store the chat backend reads at
//      query time. This file IS committed so production doesn't rebuild it.
//
// The whole build runs offline. To add more documents later: drop another PDF
// in kb/sources/ and re-run this.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { embedTexts } from "../api/embedder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCES_DIR = path.join(ROOT, "kb", "sources");
const OUT_FILE = path.join(ROOT, "kb", "kb-vectors.json");

// Extract the text content from a PDF locally.
async function extractPdfText(filePath) {
  const buf = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    const res = await parser.getText();
    return res.text;
  } finally {
    await parser.destroy();
  }
}

// Lines that carry no answer content: page markers, the search box, the header.
const NOISE = [
  /^--\s*\d+\s*of\s*\d+\s*--$/i, // "-- 2 of 12 --"
  /^search:/i,
  /^scrolless help center$/i,
  /^welcome to scrolless support/i,
  /^find answers to common questions/i,
];
const isNoise = (line) => NOISE.some((re) => re.test(line.trim()));
const isQuestion = (line) => /\?\s*$/.test(line.trim()) && line.trim().length < 160;

// Split the FAQ into one chunk per question. A new chunk starts at each question
// line; every following line (the answer) is attached until the next question.
// This keeps each Q&A pair intact — the ideal unit for retrieval.
function chunkText(text) {
  const lines = text.split("\n").map((l) => l.trim());
  const chunks = [];
  let current = null;

  for (const line of lines) {
    if (!line || isNoise(line)) continue;
    if (isQuestion(line)) {
      if (current) chunks.push(current.trim());
      current = line; // start a new Q&A chunk
    } else if (current) {
      current += "\n" + line; // answer line
    }
    // Non-question lines before the first question (section headings) are dropped.
  }
  if (current) chunks.push(current.trim());
  return chunks.filter((c) => c.length > 20);
}

async function main() {
  const files = fs
    .readdirSync(SOURCES_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (files.length === 0) {
    console.error(`❌ No PDFs found in ${SOURCES_DIR}`);
    process.exit(1);
  }

  const records = [];
  for (const file of files) {
    console.log(`📄 Extracting text from ${file} …`);
    const text = await extractPdfText(path.join(SOURCES_DIR, file));
    const chunks = chunkText(text);
    console.log(`   → ${chunks.length} chunks`);
    for (const [i, content] of chunks.entries()) {
      records.push({ id: `${file}#${i}`, source: file, text: content });
    }
  }

  console.log(`🧠 Embedding ${records.length} chunks locally (all-MiniLM-L6-v2)…`);
  const vectors = await embedTexts(records.map((r) => r.text));
  records.forEach((r, i) => (r.embedding = vectors[i]));

  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify({ model: "Xenova/all-MiniLM-L6-v2", dim: vectors[0].length, records }, null, 0)
  );
  console.log(`✅ Wrote ${records.length} vectors → ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
