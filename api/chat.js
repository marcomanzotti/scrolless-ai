// Serverless backend for Scrolless AI.
// Works on Vercel (api/ folder) or as a generic (req, res) handler.
// The Anthropic API key is NEVER exposed to the browser: it only lives here,
// read from process.env.ANTHROPIC_API_KEY.

import Anthropic from "@anthropic-ai/sdk";
import { FAQ } from "./faq.js";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const SYSTEM_PROMPT = `You are "Scrolless AI", the customer-support assistant for Scrolless, an iOS app that protects users' eyes from digital strain through science-backed rest breaks.

RULES:
- Answer ONLY based on the FAQ below. It is your single source of truth.
- If the answer isn't in the FAQ, say so honestly and point the user to info@scrolless.com (or the support form). Never invent features, prices, or platforms.
- Reply in the same language the user writes in (e.g. English or Italian).
- Tone: warm, calm, reassuring — consistent with Scrolless's wellness brand. Keep answers short and direct (2-4 sentences). No excessive emoji.
- For technical issues, give the concrete steps from the FAQ.
- Scrolless is iPhone-only for now; do not promise Android/Mac/Windows support.
- Scrolless does not handle refunds/cancellations itself — those go through Apple.

=== SCROLLESS FAQ ===
${FAQ}
=== END FAQ ===`;

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

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      // cache_control on system: from the 2nd request onward the FAQ cost ~0.1x.
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
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
