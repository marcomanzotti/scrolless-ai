// Backend serverless per Scrolless AI.
// Funziona su Vercel (cartella /api) o come handler generico (req, res).
// La API key di Anthropic NON è mai esposta al browser: vive solo qui,
// letta da process.env.ANTHROPIC_API_KEY.

import Anthropic from "@anthropic-ai/sdk";
import { FAQ } from "./faq.js";

const client = new Anthropic(); // legge ANTHROPIC_API_KEY dall'ambiente

const SYSTEM_PROMPT = `Sei "Scrolless AI", l'assistente di supporto clienti di Scrolless, un'app iOS che protegge gli occhi dall'affaticamento digitale tramite pause di riposo basate sulla scienza.

REGOLE:
- Rispondi SOLO basandoti sulle FAQ qui sotto. È la tua unica fonte di verità.
- Se la risposta non è nelle FAQ, dillo con onestà e invita a contattare info@scrolless.com (o il modulo di supporto). Non inventare funzionalità, prezzi o piattaforme.
- Rispondi nella stessa lingua dell'utente (italiano o inglese).
- Tono caldo, calmo e rassicurante, in linea con il brand wellness di Scrolless. Risposte brevi e dirette (2-4 frasi). Niente emoji eccessive.
- Per problemi tecnici, dai i passaggi concreti dalle FAQ.
- Scrolless è solo per iPhone al momento; non promettere Android/Mac/Windows.
- Scrolless non gestisce rimborsi/cancellazioni: quelli passano da Apple.

=== FAQ SCROLLESS ===
${FAQ}
=== FINE FAQ ===`;

export default async function handler(req, res) {
  // CORS — per il prototipo permettiamo tutte le origini.
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

    // Validazione minima: solo ruoli user/assistant, contenuto stringa.
    const safeMessages = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
      .slice(-20); // teniamo solo gli ultimi 20 turni

    if (safeMessages.length === 0 || safeMessages[safeMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "last message must be from user" });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      // cache_control sul system: dalla 2ª richiesta le FAQ costano ~0.1×.
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: safeMessages,
    });

    const reply = response.content.find((b) => b.type === "text")?.text ?? "";
    return res.status(200).json({ reply });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "Troppe richieste, riprova tra poco." });
    }
    console.error("Scrolless AI error:", err);
    return res.status(500).json({ error: "Errore interno. Riprova." });
  }
}
