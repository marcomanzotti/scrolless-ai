// Serverless backend for Scrolless AI.
// Works on Vercel (api/ folder) or as a generic (req, res) handler.
// The Anthropic API key is NEVER exposed to the browser: it only lives here,
// read from process.env.ANTHROPIC_API_KEY.
//
// This version is RAG-backed: for each question we search a local vector store
// (built from the PDFs in kb/sources/) and answer ONLY from what we retrieve.

import Anthropic from "@anthropic-ai/sdk";
import { retrieve, buildContext } from "./rag.js";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const SUPPORT_EMAIL = "info@scrolless.com";

// The system prompt is assembled per-request with the retrieved context.
function buildSystemPrompt(context) {
  return `You are "Scrolless AI", the customer-support assistant for Scrolless, an iOS app that protects users' eyes from digital strain through science-backed rest breaks.

You answer using ONLY the CONTEXT passages below, which were retrieved from Scrolless's official knowledge base for this specific question.

RULES — follow them strictly:
- Be precise. Base every claim strictly on the CONTEXT. Never invent, guess, generalize, or add features, prices, platforms, or steps that are not written in the CONTEXT.
- If the CONTEXT does not clearly contain the answer, do NOT attempt an answer. Reply that you don't have that information and tell the user to contact the Scrolless team at ${SUPPORT_EMAIL}.
- If the CONTEXT is empty, that means nothing relevant was found — again, direct the user to ${SUPPORT_EMAIL}.
- Reply in the same language the user writes in (e.g. English or Italian).
- Tone: warm, calm, reassuring — consistent with Scrolless's wellness brand. Keep answers short and direct (2-4 sentences). No excessive emoji.
- Do not mention the words "context", "passages", or "knowledge base" to the user — just answer naturally or redirect them.

=== CONTEXT ===
${context || "(no relevant information was found for this question)"}
=== END CONTEXT ===`;
}

export default async function handler(req, res) {
  // CORS — open to all origins for the prototype.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    // Minimal validation: only user/assistant roles, string content.
    const safeMessages = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
      .slice(-20); // keep only the last 20 turns

    if (safeMessages.length === 0 || safeMessages[safeMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "last message must be from user" });
    }

    // --- RAG: retrieve the most relevant passages for the latest question ---
    const question = safeMessages[safeMessages.length - 1].content;
    const hits = await retrieve(question);
    const context = buildContext(hits);

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: buildSystemPrompt(context),
      messages: safeMessages,
    });

    const reply = response.content.find((b) => b.type === "text")?.text ?? "";
    return res.status(200).json({ reply });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "Too many requests, please try again shortly." });
    }
    console.error("Scrolless AI error:", err);
    return res.status(500).json({ error: "Internal error. Please try again." });
  }
}
