/*
 * Scrolless AI — widget chat embeddabile.
 * Uso: <script src="scrolless-widget.js" data-api="https://tuo-backend/api/chat"></script>
 * Inietta bottone + pannello in basso a destra. UI coerente col sito (cream/brown, sans-serif).
 */
(function () {
  "use strict";

  const SCRIPT = document.currentScript;
  const API_URL = (SCRIPT && SCRIPT.dataset.api) || "/api/chat";

  // --- Palette coerente col sito Scrolless ---
  const C = {
    cream: "#F4F1EA",
    brown: "#5A4632",
    tan: "#C8A57E",
    tanDark: "#B08D63",
    text: "#3A2E22",
    bubbleUser: "#5A4632",
    bubbleBot: "#FFFFFF",
    border: "#E2DACB",
  };

  const css = `
    .sl-fab{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border:none;border-radius:50%;
      background:${C.brown};color:${C.cream};cursor:pointer;box-shadow:0 6px 20px rgba(90,70,50,.35);
      display:flex;align-items:center;justify-content:center;z-index:99999;transition:transform .2s ease}
    .sl-fab:hover{transform:scale(1.06)}
    .sl-fab svg{width:28px;height:28px}
    .sl-panel{position:fixed;bottom:96px;right:24px;width:360px;max-width:calc(100vw - 32px);height:520px;
      max-height:calc(100vh - 120px);background:${C.cream};border:1px solid ${C.border};border-radius:18px;
      box-shadow:0 16px 48px rgba(90,70,50,.28);display:none;flex-direction:column;overflow:hidden;z-index:99999;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:${C.text}}
    .sl-panel.sl-open{display:flex;animation:sl-in .22s ease}
    @keyframes sl-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    .sl-head{background:${C.brown};color:${C.cream};padding:16px 18px;display:flex;align-items:center;gap:10px}
    .sl-head h3{margin:0;font-size:15px;font-weight:600}
    .sl-head p{margin:2px 0 0;font-size:12px;opacity:.8}
    .sl-dot{width:8px;height:8px;border-radius:50%;background:${C.tan};flex:0 0 auto}
    .sl-x{margin-left:auto;background:none;border:none;color:${C.cream};font-size:20px;cursor:pointer;opacity:.85;line-height:1}
    .sl-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
    .sl-msg{max-width:82%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.45;word-wrap:break-word}
    .sl-user{align-self:flex-end;background:${C.bubbleUser};color:${C.cream};border-bottom-right-radius:4px}
    .sl-bot{align-self:flex-start;background:${C.bubbleBot};color:${C.text};border:1px solid ${C.border};border-bottom-left-radius:4px}
    .sl-typing{align-self:flex-start;display:flex;gap:4px;padding:12px 14px}
    .sl-typing span{width:7px;height:7px;border-radius:50%;background:${C.tan};animation:sl-bounce 1s infinite}
    .sl-typing span:nth-child(2){animation-delay:.15s}.sl-typing span:nth-child(3){animation-delay:.3s}
    @keyframes sl-bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
    .sl-foot{padding:12px;border-top:1px solid ${C.border};display:flex;gap:8px;background:${C.cream}}
    .sl-input{flex:1;border:1px solid ${C.border};border-radius:22px;padding:10px 14px;font-size:14px;outline:none;
      font-family:inherit;color:${C.text};background:#fff}
    .sl-input:focus{border-color:${C.tan}}
    .sl-send{border:none;background:${C.tan};color:#fff;border-radius:50%;width:40px;height:40px;cursor:pointer;flex:0 0 auto;
      display:flex;align-items:center;justify-content:center;transition:background .2s}
    .sl-send:hover{background:${C.tanDark}}
    .sl-send:disabled{opacity:.5;cursor:not-allowed}
    .sl-send svg{width:18px;height:18px}
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // --- DOM ---
  const fab = document.createElement("button");
  fab.className = "sl-fab";
  fab.setAttribute("aria-label", "Apri Scrolless AI");
  fab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;

  const panel = document.createElement("div");
  panel.className = "sl-panel";
  panel.innerHTML = `
    <div class="sl-head">
      <span class="sl-dot"></span>
      <div><h3>Scrolless AI</h3><p>Qui per aiutarti con i tuoi occhi</p></div>
      <button class="sl-x" aria-label="Chiudi">&times;</button>
    </div>
    <div class="sl-body" id="sl-body"></div>
    <form class="sl-foot" id="sl-form">
      <input class="sl-input" id="sl-input" type="text" placeholder="Scrivi la tua domanda…" autocomplete="off" maxlength="500" />
      <button class="sl-send" type="submit" aria-label="Invia">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>`;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const body = panel.querySelector("#sl-body");
  const form = panel.querySelector("#sl-form");
  const input = panel.querySelector("#sl-input");
  const sendBtn = panel.querySelector(".sl-send");

  // Storico conversazione (inviato al backend ad ogni turno).
  const history = [];
  let opened = false;

  function addMsg(role, text) {
    const el = document.createElement("div");
    el.className = "sl-msg " + (role === "user" ? "sl-user" : "sl-bot");
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "sl-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function togglePanel() {
    panel.classList.toggle("sl-open");
    if (!opened && panel.classList.contains("sl-open")) {
      opened = true;
      addMsg("assistant", "Ciao! Sono Scrolless AI. Chiedimi pure di prezzi, come funziona l'app, privacy o problemi tecnici. 👋");
      input.focus();
    }
  }

  fab.addEventListener("click", togglePanel);
  panel.querySelector(".sl-x").addEventListener("click", togglePanel);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMsg("user", text);
    history.push({ role: "user", content: text });
    input.value = "";
    sendBtn.disabled = true;

    const typing = showTyping();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      typing.remove();

      if (!res.ok) throw new Error(data.error || "errore");

      const reply = data.reply || "Mi dispiace, non ho una risposta. Scrivi a info@scrolless.com.";
      addMsg("assistant", reply);
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      typing.remove();
      addMsg("assistant", "Ops, qualcosa è andato storto. Riprova o contatta info@scrolless.com.");
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  });
})();
