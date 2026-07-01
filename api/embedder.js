// Local text embeddings via Transformers.js (all-MiniLM-L6-v2, 384-dim).
// No embeddings API and no extra key — the model runs on the machine/server.
// Used by both the build script (scripts/build-kb.mjs) and the retrieval layer
// (api/rag.js), so the query and the stored chunks are embedded the same way.

import { pipeline, env } from "@xenova/transformers";

// Don't look for local model files; download from the Hub and cache.
env.allowLocalModels = false;
// On serverless (Vercel/Lambda) only /tmp is writable, so cache the model there.
// Locally this is unset and Transformers.js uses its default node_modules cache.
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  env.cacheDir = "/tmp/transformers-cache";
}

const MODEL = "Xenova/all-MiniLM-L6-v2";

let _extractor = null;
async function getExtractor() {
  if (!_extractor) {
    _extractor = await pipeline("feature-extraction", MODEL);
  }
  return _extractor;
}

// Embed an array of strings → array of normalized vectors (number[][]).
// Mean pooling + L2 normalization is the standard recipe for this model, which
// makes a plain dot product equal to cosine similarity.
export async function embedTexts(texts) {
  const extractor = await getExtractor();
  const out = [];
  for (const text of texts) {
    const tensor = await extractor(text, { pooling: "mean", normalize: true });
    out.push(Array.from(tensor.data));
  }
  return out;
}

export async function embedOne(text) {
  return (await embedTexts([text]))[0];
}
