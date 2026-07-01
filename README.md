# Scrolless AI — Customer-support chat

A customer-support chat prototype for [Scrolless](https://www.scrolless.com)
(an iOS app for digital eye strain) that answers using a **RAG pipeline over a
local vector database** built from Scrolless's official help-center documents,
powered by Claude Haiku 4.5.

**This repo contains no API key, anywhere.** It's meant to be cloned, read,
and deployed by the Scrolless team with their own Anthropic key.

---

## What's in this repo

```
scrolless-ai/
├── api/
│   ├── chat.js          # The backend: the ONLY place that talks to Claude
│   ├── rag.js           # Vector search: embeds the question, finds top passages
│   └── embedder.js      # Local embeddings (Transformers.js, all-MiniLM-L6-v2)
├── kb/
│   ├── sources/         # Source documents (PDFs) — the input to the vector DB
│   └── kb-vectors.json  # The vector database (committed; built from sources/)
├── scripts/
│   └── build-kb.mjs     # Builds kb-vectors.json from kb/sources/ (offline)
├── clients/
│   ├── web/             # ✅ Runnable demo: a full page + the embeddable widget
│   │   ├── index.html
│   │   ├── scrolless-widget.js
│   │   └── assets/hero-background.png
│   ├── ios/              # 📋 SwiftUI plugin (4 files) — not a runnable app
│   └── android/          # 📋 Compose plugin (2 files) — not a runnable app
├── server.js             # Tiny local server, for trying the web demo on your machine
├── package.json
├── .env.example           # Copy to .env and add your key — .env is never committed
└── .gitignore
```

Three pieces, one backend:

1. **The backend** (`api/`) — a single serverless function. For each question
   it searches a local **vector database** (`kb/kb-vectors.json`) for the most
   relevant passages, injects only those into Claude's prompt, and answers
   strictly from them. **The Anthropic API key lives only here**, read from an
   environment variable. No client ever sees it.
2. **The web demo** (`clients/web/`) — a real, runnable page you can open in
   a browser today. It's also the actual widget you'd embed on
   scrolless.com — same files, no build step.
3. **The iOS/Android plugins** (`clients/ios/`, `clients/android/`) — not
   apps, just the handful of source files (a chat button + chat screen +
   networking) meant to be copied into Scrolless's existing native apps.
   See the README inside each folder.

---

## How it works

1. A client (the web widget, or the iOS/Android plugin) sends the
   conversation so far to `POST /api/chat`.
2. The backend ([`api/rag.js`](api/rag.js)) embeds the latest question with the
   **same local model** used to build the vector DB, then ranks every stored
   passage by cosine similarity and keeps the top matches. Off-topic questions
   match nothing (filtered by a similarity threshold).
3. [`api/chat.js`](api/chat.js) injects only those passages into Claude's
   system prompt. Claude (`claude-haiku-4-5`) answers **precisely and only**
   from them. If nothing relevant was found (or the passages don't contain the
   answer), it tells the user to contact the Scrolless team at
   `info@scrolless.com`. It replies in whatever language the user wrote in.
4. The reply goes back to the client as `{ "reply": "..." }`.

The same endpoint serves every client — web, iOS, Android all just POST to
`/api/chat`.

---

## How to make it work

### 1. Try the web demo locally

```bash
cp .env.example .env        # then put your Anthropic key in .env
npm install
npm run build-kb            # builds the vector DB from kb/sources/ (offline, one-time)
npm start                   # -> http://localhost:3000
```

`npm run build-kb` is only needed if you change the source documents — the
built `kb/kb-vectors.json` is committed, so a fresh clone runs without it.

`.env` is in `.gitignore` — it will never be committed. Open
`http://localhost:3000`: it's the real widget, running against the real
backend, with a screenshot of scrolless.com as the page so you can see how
it'd look live.

### 2. Deploy the backend (for production)

`api/chat.js` is written as a standard `(req, res)` handler — it works as-is
on **Vercel** (the `api/` folder convention):

1. Import this repo into Vercel.
2. Add an environment variable `ANTHROPIC_API_KEY` with the real key, in the
   Vercel project settings (never in code).
3. Deploy. The endpoint is `https://<your-project>.vercel.app/api/chat`.

(Netlify or Cloudflare Workers work too, with minor handler-signature
tweaks.) In production, also restrict
`Access-Control-Allow-Origin` in `api/chat.js` to the Scrolless domain — it's
open (`*`) here only for ease of prototyping.

### 3. Embed the web widget on scrolless.com

One line, anywhere on the page:

```html
<script src="scrolless-widget.js" data-api="https://<your-backend>/api/chat"></script>
```

It injects a floating chat button (bottom-right) and panel — no other
markup needed. Palette is already matched to the site (dark slate +
warm peach/amber accent).

### 4. Add the chat to the iOS / Android apps

See [`clients/ios/README.md`](clients/ios/README.md) and
[`clients/android/README.md`](clients/android/README.md) — each explains
exactly which files to copy in and which one line to change (the backend
URL).

---

## Security model

- The Anthropic API key is **read from `process.env.ANTHROPIC_API_KEY`** in
  exactly one file: [`api/chat.js`](api/chat.js#L9). It is never hardcoded,
  never sent to a client, never logged.
- `.env` (your real key, for local testing) is git-ignored — see
  [`.gitignore`](.gitignore). Only [`.env.example`](.env.example), an empty
  placeholder, is committed.
- In production the key lives in your hosting provider's environment
  variable settings (e.g. Vercel project settings) — never in a file at all.
- Web/iOS/Android clients only ever talk to your own `/api/chat` endpoint.
  They contain zero secrets and can be safely embedded in a public app or
  website.

---

## Cost

Claude Haiku 4.5: $1 / 1M input tokens, $5 / 1M output. Because each question
only injects the few most relevant passages (not the whole knowledge base), a
typical conversation costs a fraction of a cent. Embeddings run locally, so
they cost nothing.

## The vector database

- **Sources** live in [`kb/sources/`](kb/sources/) — drop in PDFs.
- **Build** with `npm run build-kb`: each PDF is extracted (locally, via
  `pdf-parse`), split into one chunk per FAQ question, and embedded with
  `all-MiniLM-L6-v2` (via [Transformers.js](https://github.com/xenova/transformers.js) —
  runs on-device, **no embeddings API and no extra key**). The result is
  written to [`kb/kb-vectors.json`](kb/kb-vectors.json).
- **Add more documents** later by dropping another PDF into `kb/sources/` and
  re-running `npm run build-kb`. This first document is just the start of the
  knowledge base.
- To tune retrieval, adjust `topK` / `minScore` in
  [`api/rag.js`](api/rag.js) — a lower `minScore` retrieves more loosely; a
  higher one makes the bot redirect to support more readily.
