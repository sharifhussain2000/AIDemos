// api/research.js
// Vercel Serverless Function (Node.js, ESM).
// Moves ALL Anthropic API calls to the server. The browser never sees the API key.
//
// Flow (mirrors the original artifact exactly):
//   1) web-search grounded call  -> provenance "web"   (+ sources)
//   2) model-only fallback        -> provenance "model"
//   3) if both fail               -> { ok:false }  (frontend then uses Quick Estimate)
//
// Returns the SAME JSON structure the frontend expects: { ok, provenance, result, sources }.

// ---------- single place for model + tool + version ----------
const MODEL            = process.env.ANTHROPIC_MODEL             || "claude-sonnet-5";
const WEB_SEARCH_TOOL  = process.env.ANTHROPIC_WEB_SEARCH_TOOL   || "web_search_20260318";
const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_URL     = "https://api.anthropic.com/v1/messages";

// ---------- single place for the research prompt ----------
const RUBRIC = "Score each 1-5 (1 weak, 5 strong). A.scale=scheme size/longevity; A.intensity=crop & input-spend density of the geography; A.gov=empanelment ease; A.channel=Bayer dealer reach. B.seed=Bayer seed relevancy; B.cp=Bayer crop-protection relevancy; B.overlap=focus-crop overlap with Bayer strongholds (corn/rice/cotton/veg/oilseed); B.white=competitive whitespace vs Syngenta/BASF/Corteva/UPL/FMC. Golden Triangle: T.cash=payment speed/working capital (DBT<30d=5, 90-day reimbursement=1); T.cost=low cost-to-serve=5; T.margin=net margin after price caps & GST=5.";
const SCHEMA = 'Return ONLY one JSON object as your final output — no prose, no markdown fences — with keys: lvl ("Central"/"State"), st (coverage), g (array of four 0/1 = [CP/seed permissible, seed eligibility, compliance clear, payment solvent]; 0 = FAILS that gate), A{scale,intensity,gov,channel}, B{seed,cp,overlap,white}, T{cash,cost,margin} (integers 1-5), lag (int payment-lag days), costL (int cost-to-serve Rs lakh), mpct (decimal 0-1 net margin), base (int eligible base thousands), spend (int seed+CP spend Rs/unit), share (decimal 0-1 Bayer share), mode (participation route), sp (focus Bayer seed products), cp (focus Bayer CP products), risk (risk flags), notes (3-4 sentence summary of what you found, with what is verified vs estimated), sources (array of {title,url} you actually used).';

function buildAsk(f) {
  const hints = `${f.st ? ("Region/hint: " + f.st + ". ") : ""}${f.crops ? ("Crops hint: " + f.crops + ". ") : ""}${f.notes ? ("User notes: " + f.notes + ". ") : ""}`;
  const task = `You are scoring Indian government agriculture schemes for Bayer CropScience, judged ONLY on its seeds & crop-protection business. Research the scheme below: find its sponsoring department, level (central/state), focus crops, payment mechanism and payment track record (delays / PFMS), annual outlay, which agri-input companies have participated, and any chemical-free / restricted-molecule aspects. Then judge participation. ${RUBRIC} ${SCHEMA} If a fact cannot be verified, make a conservative estimate and say which in notes. Be honest about uncertainty.`;
  return `${task}\nScheme to assess: "${f.name}". ${hints}`;
}

// ---------- security config ----------
const ALLOWED_ORIGINS = [
  "https://ai.kabirdesaisharif.com",
  "https://sharifhussain2000.github.io",
  "http://localhost:3000",
];
const MAX_BODY_BYTES = 8 * 1024;   // 8 KB
const RATE_MAX = 20;               // requests
const RATE_WINDOW_MS = 60 * 1000;  // per minute, per IP (best-effort, per warm instance)

// ---------- helpers ----------
function extractJSON(txt) {
  txt = String(txt || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const a = txt.indexOf("{"), b = txt.lastIndexOf("}");
  if (a < 0 || b < 0) throw new Error("no json in model output");
  return JSON.parse(txt.slice(a, b + 1));
}

function collectSources(content) {
  const out = [];
  for (const b of content || []) {
    if (b && b.type === "web_search_tool_result" && Array.isArray(b.content)) {
      for (const x of b.content) if (x && x.url) out.push({ title: x.title || x.url, url: x.url });
    }
    if (b && b.type === "text" && Array.isArray(b.citations)) {
      for (const c of b.citations) if (c && c.url) out.push({ title: c.title || c.url, url: c.url });
    }
  }
  const seen = new Set();
  return out.filter(s => (seen.has(s.url) ? false : (seen.add(s.url), true))).slice(0, 6);
}

async function callAnthropic(payload, ms = 55000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const j = await r.json();
    if (!r.ok) throw new Error((j && j.error && j.error.message) || ("anthropic " + r.status));
    return j;
  } finally {
    clearTimeout(timer);
  }
}

// web search can return stop_reason:"pause_turn" — resend the assistant turn to continue.
async function runWebSearch(ask) {
  let messages = [{ role: "user", content: ask }];
  let all = [];
  for (let i = 0; i < 4; i++) {
    const data = await callAnthropic({
      model: MODEL,
      max_tokens: 3000,
      tools: [{ type: WEB_SEARCH_TOOL, name: "web_search", max_uses: 5 }],
      messages,
    });
    all = all.concat(data.content || []);
    if (data.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: data.content });
      continue;
    }
    break;
  }
  return all;
}

function clientIp(req) {
  const xff = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xff || (req.socket && req.socket.remoteAddress) || "unknown";
}

function rateLimited(ip) {
  const store = (globalThis.__RL = globalThis.__RL || new Map());
  const now = Date.now();
  const hits = (store.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return true;
  hits.push(now);
  store.set(ip, hits);
  return false;
}

function sanitize(body) {
  const s = (v, n) => (v == null ? "" : String(v)).slice(0, n);
  return {
    name:     s(body.name, 200),
    st:       s(body.st, 120),
    lvl:      body.lvl === "Central" || body.lvl === "State" ? body.lvl : "",
    type:     s(body.type, 80),
    pay:      s(body.pay, 80),
    crops:    s(body.crops, 300),
    chemfree: !!body.chemfree,
    privseed: body.privseed === false ? false : true,
    base:     s(body.base, 12),
    spend:    s(body.spend, 12),
    sharePct: s(body.sharePct, 12),
    notes:    s(body.notes, 2000),
  };
}

// ---------- handler ----------
export default async function handler(req, res) {
  // --- CORS ---
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  // --- size guard ---
  const len = Number(req.headers["content-length"] || 0);
  if (len && len > MAX_BODY_BYTES) return res.status(413).json({ ok: false, error: "payload_too_large" });

  // --- rate limit ---
  if (rateLimited(clientIp(req))) return res.status(429).json({ ok: false, error: "rate_limited" });

  // --- config guard ---
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ ok: false, error: "server_misconfigured", detail: "ANTHROPIC_API_KEY is not set" });
  }

  // --- parse + validate ---
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!body || typeof body !== "object") body = {};
  const f = sanitize(body);
  if (!f.name.trim()) return res.status(400).json({ ok: false, error: "missing_name" });

  const ask = buildAsk(f);

  // 1) web-search grounded
  try {
    const content = await runWebSearch(ask);
    const txt = content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    const result = extractJSON(txt);
    const sources = Array.isArray(result.sources) && result.sources.length
      ? result.sources.filter(s => s && s.url).slice(0, 6)
      : collectSources(content);
    return res.status(200).json({ ok: true, provenance: "web", result, sources });
  } catch (eWeb) {
    // 2) model-only fallback (no web tool)
    try {
      const data = await callAnthropic({
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: "user", content: ask + "\n(Web search is unavailable — use your own knowledge and flag uncertainty in notes; sources may be empty.)" }],
      });
      const txt = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
      const result = extractJSON(txt);
      const sources = Array.isArray(result.sources) ? result.sources.filter(s => s && s.url).slice(0, 6) : [];
      return res.status(200).json({ ok: true, provenance: "model", result, sources });
    } catch (eModel) {
      // 3) let the frontend fall back to Quick Estimate
      return res.status(200).json({ ok: false, error: "research_failed", detail: String(eModel && eModel.message || eModel) });
    }
  }
}
