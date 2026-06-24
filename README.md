# Scrolless AI — Customer-support chat

A customer-support chat prototype for [Scrolless](https://www.scrolless.com)
(an iOS app for digital eye strain) that answers using the site's **real
FAQ** as its knowledge base, powered by Claude Haiku 4.5.

**This repo contains no API key, anywhere.** It's meant to be cloned, read,
and deployed by the Scrolless team with their own Anthropic key.

---

## What's in this repo

```
scrolless-ai/
├── api/
│   ├── chat.js          # The backend: the ONLY place that talks to Claude
│   └── faq.js           # The knowledge base — Scrolless's real FAQ, as plain text
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

1. **The backend** (`api/`) — a single serverless function. It holds the
   Scrolless FAQ in the system prompt and calls Claude. **The Anthropic API
   key lives only here**, read from an environment variable. No client ever
   sees it.
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
2. The backend ([`api/chat.js`](api/chat.js)) puts the FAQ
   ([`api/faq.js`](api/faq.js)) into Claude's **system prompt**, with
   [prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
   so repeated requests don't re-pay for the FAQ tokens.
3. Claude (`claude-haiku-4-5`) answers **only** from the FAQ. If it doesn't
   know, it says so and points to `info@scrolless.com`. It replies in
   whatever language the user wrote in.
4. The reply goes back to the client as `{ "reply": "..." }`.

The same endpoint serves every client — web, iOS, Android all just POST to
`/api/chat`.

---

## How to make it work

### 1. Try the web demo locally

```bash
cp .env.example .env        # then put your Anthropic key in .env
npm install
npm start                   # -> http://localhost:3000
```

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

Claude Haiku 4.5: $1 / 1M input tokens, $5 / 1M output. With the FAQ cached
([`api/chat.js`](api/chat.js#L55)), a typical conversation costs a fraction
of a cent.

## Keeping the FAQ in sync

[`api/faq.js`](api/faq.js) was checked word-for-word against
[scrolless.com/faq](https://www.scrolless.com/faq). If that page changes,
update this file to match — it's the model's only source of truth, so a
stale FAQ means stale (or wrong) answers.

## When to move to a real vector database

Only once the FAQ grows to hundreds of entries: replace `api/faq.js` with
embeddings + semantic search, and inject only the few most relevant chunks
per question. With ~18 FAQ entries, putting all of them in the prompt (as
done here) is simpler and just as accurate.
