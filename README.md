# Scrolless AI — Customer-support chat prototype

An AI customer-support chat for [Scrolless](https://www.scrolless.com) that answers
using the site's **real FAQ** as its knowledge base. One shared backend, three clients
(**Web · iOS · Android**).

- **Model:** Claude Haiku 4.5 (fast, low cost)
- **Knowledge base:** the 18 real FAQ entries, injected into the system prompt
  (with prompt caching, so the FAQ cost ~0.1× after the first request)
- **Security:** the Anthropic API key is **never** in this repo or in any client.
  It lives only on the server (production) or in a local `.env` file (your demo).

---

## ⚠️ About the API key (read this first)

This repo is meant to be **public on GitHub with no key inside**, for the Scrolless
IT team to deploy. The key is supplied at runtime via the `ANTHROPIC_API_KEY`
environment variable:

- **Production:** the IT team sets `ANTHROPIC_API_KEY` in the server's environment
  (e.g. Vercel project settings). Clients only ever talk to `/api/chat`.
- **Local demo (your machine):** you put the key in a `.env` file. **`.env` is
  gitignored** — it never gets committed. See [Local demo](#local-demo-for-your-boss).

`git` will refuse to track `.env` thanks to [`.gitignore`](.gitignore). Only
`.env.example` (a placeholder, no real key) is committed.

---

## Repository layout

```
scrolless-ai/
├── api/
│   ├── chat.js        # Serverless backend — hides the key, calls Claude
│   └── faq.js         # Knowledge base: the 18 real FAQ entries
├── clients/
│   ├── web/           # Embeddable web widget (bottom-right bubble)
│   ├── ios/           # Native SwiftUI app  (see clients/ios/README.md)
│   └── android/       # Native Compose app  (see clients/android/README.md)
├── server.js          # Local server for the demo (serves web + /api/chat)
├── Demo (double-click).command   # macOS one-click demo launcher
├── .env.example       # Copy to .env and add your key (local only)
└── .gitignore         # Ensures .env / node_modules are never committed
```

---

## How it works

1. A client (web widget, iOS, or Android app) sends the chat history to
   `POST /api/chat`.
2. The backend puts the FAQ in the **system prompt** (cached) and calls
   **Claude Haiku 4.5**.
3. Claude answers **only** from the FAQ; if it doesn't know, it points the user
   to `info@scrolless.com`. It replies in the user's language (Italian or English).

The same `/api/chat` endpoint serves all three clients. The key is never exposed.

---

## Local demo (for your boss)

A one-click demo on macOS: it opens **Safari** on a page that looks like the
Scrolless site, with a **fully working** chat — so you can show how it'd look live.
This uses your key locally and never touches the public repo.

1. **Double-click `Demo (double-click).command`** in Finder.
   - On the **first run** it asks for your Anthropic API key and saves it
     locally to `.env` (gitignored — never uploaded). Next runs start straight away.
   - It starts the local backend, waits for it to be ready,
   - and opens Safari at `http://localhost:3000`.
2. Click the chat bubble in the bottom-right and try it.
3. Close the Terminal window to stop the demo.

> First run installs dependencies automatically (needs [Node.js](https://nodejs.org) LTS).
> Prefer the terminal? `npm install && npm start`, then open `http://localhost:3000`.

---

## The three clients

### Web — `clients/web/`
Drop-in widget. One line on any page:
```html
<script src="scrolless-widget.js" data-api="https://<backend>/api/chat"></script>
```
Renders a bubble in the bottom-right that opens the chat. UI matches the
Scrolless palette (cream / brown / tan).

### iOS — `clients/ios/` (SwiftUI)
A floating chat button that opens a native chat screen calling `/api/chat`.
See [`clients/ios/README.md`](clients/ios/README.md) for opening it in Xcode and
pointing it at the backend.

### Android — `clients/android/` (Kotlin + Jetpack Compose)
Same as iOS, native to Android. See
[`clients/android/README.md`](clients/android/README.md) for Android Studio setup.

**All three contain no API key** and talk only to `/api/chat`.

---

## Deploying the backend (for the Scrolless IT team)

`api/chat.js` is a standard serverless handler.

**Vercel (simplest):**
1. Import this repo into Vercel.
2. Add an env var `ANTHROPIC_API_KEY` = the Anthropic key.
3. Deploy. The endpoint is then `https://<your-project>.vercel.app/api/chat`.
4. Point each client's API URL at that endpoint:
   - Web: `data-api="https://…/api/chat"`
   - iOS: `Config.chatEndpoint` in `ChatService.swift`
   - Android: `Config.CHAT_ENDPOINT` in `ChatService.kt`

Works on Netlify / Cloudflare with minor handler tweaks. CORS is open in the
prototype — restrict `Access-Control-Allow-Origin` to the Scrolless domain in
production.

---

## Cost (prototype estimate)

Claude Haiku 4.5: $1 / 1M input tokens, $5 / 1M output. With the FAQ cached, a
typical conversation costs a fraction of a cent. For a demo: negligible.

## When to move to a real vector database

Only once the FAQ grow to hundreds of entries: replace `api/faq.js` with
embeddings + semantic search and inject only the top few relevant chunks. With
18 FAQ, putting them all in the prompt is the right call.
