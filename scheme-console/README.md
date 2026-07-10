# Scheme Participation Console — Deployment Guide

A web app for scoring government agriculture schemes on Bayer's **Cash · Cost · Margin** triangle.

- **Frontend** (`index.html`, `styles.css`, `app.js`) — a static site. Hosted on **GitHub Pages**.
- **Backend** (`api/research.js`) — a tiny serverless function that talks to Anthropic. Hosted on **Vercel**.

The backend exists for one reason: to keep your Anthropic API key **on the server**, never in the browser.

> The **only** value you ever edit after deploying is `API_BASE_URL` at the top of `app.js`.

Everything works even without the backend — the **Quick Estimate** button always works offline, and **Research & Score** automatically falls back to it if the backend is unreachable.

---

## What you need (once)

1. A free **GitHub** account — https://github.com
2. A free **Vercel** account — https://vercel.com (sign in with GitHub)
3. An **Anthropic API key** — https://console.anthropic.com → Settings → API Keys

You do **not** need to install anything on your computer. Everything below can be done in the browser.

---

## 1. Upload the project to GitHub

1. Go to https://github.com/new and create a repository, e.g. **`scheme-console`**. Leave it Public (or Private — both work).
2. On the new repo page, click **“uploading an existing file”**.
3. Drag in **all** the files from this project, keeping the folder structure:
   ```
   index.html
   styles.css
   app.js
   vercel.json
   package.json
   .gitignore
   .env.example
   README.md
   api/research.js        <-- keep this inside an "api" folder
   ```
   (To create the `api` folder in GitHub’s uploader, drag the `api` folder in, or type `api/research.js` as the path.)
4. Click **Commit changes**.

> ⚠️ Never upload a real `.env` file or paste your API key anywhere in these files. Only `.env.example` (with a fake key) belongs in git. `.gitignore` already blocks `.env`.

---

## 2. Deploy the backend to Vercel

1. Go to https://vercel.com/new
2. Click **Import** next to your `scheme-console` GitHub repo.
3. Leave all build settings at their defaults (there is no build step). Click **Deploy**.
4. Wait ~30 seconds. Vercel gives you a URL like:
   ```
   https://scheme-console-xxxx.vercel.app
   ```
   **Copy this URL — you need it in step 5.**

---

## 3. Set `ANTHROPIC_API_KEY` on Vercel

1. In your Vercel project, open **Settings → Environment Variables**.
2. Add a variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your real key (`sk-ant-...`)
   - **Environments:** tick **Production**, **Preview**, and **Development**.
3. (Optional) Also add `ANTHROPIC_MODEL` (e.g. `claude-sonnet-5` or `claude-opus-4-8`) and `ANTHROPIC_WEB_SEARCH_TOOL` if you ever need to change them. Defaults are fine.
4. Go to **Deployments → ⋯ → Redeploy** so the new key takes effect.

---

## 4. Get the backend URL

Your backend endpoint is your Vercel URL **plus** `/api/research`:

```
https://scheme-console-xxxx.vercel.app/api/research
```

Quick test in a browser: open just the base Vercel URL — you should see the app load (Vercel also serves the static files). To test the API itself, see step 6.

---

## 5. Update `API_BASE_URL` (the only value you change)

1. In GitHub, open **`app.js`** and click the pencil ✏️ to edit.
2. Near the top you’ll see:
   ```js
   const API_BASE_URL="https://REPLACE-WITH-YOUR-VERCEL-APP.vercel.app";
   ```
3. Replace it with your Vercel base URL **without a trailing slash**:
   ```js
   const API_BASE_URL="https://scheme-console-xxxx.vercel.app";
   ```
4. **Commit changes.**

Now publish the frontend on GitHub Pages:

1. Repo **Settings → Pages**.
2. **Source:** Deploy from a branch. **Branch:** `main` (root). Save.
3. GitHub gives you a URL like `https://<username>.github.io/scheme-console/`.
4. To use your custom domain `https://ai.kabirdesaisharif.com/scheme-console/`, add your domain under **Settings → Pages → Custom domain** and point a DNS `CNAME` for `ai.kabirdesaisharif.com` to `<username>.github.io` (GitHub shows the exact instructions). The app uses **relative paths**, so it works under the `/scheme-console/` subfolder automatically.

> The three allowed origins are already baked into the backend:
> `https://ai.kabirdesaisharif.com`, `https://sharifhussain2000.github.io`, `http://localhost:3000`.
> If you host the frontend somewhere else, add that origin to `ALLOWED_ORIGINS` in `api/research.js` and redeploy.

---

## 6. Test the application

**Frontend:** open your GitHub Pages URL. You should see the console with 12 seeded schemes, the triangle, the map and the ranking. Try switching schemes, dragging sliders, and **Download data (CSV)**.

**Add a scheme:**
- Click **+ New scheme → Quick estimate** — adds instantly (works with no backend at all).
- Click **+ New scheme → Research & score** — calls your backend, which calls Anthropic with live web search, and returns a scored scheme with **sources**. If anything is off, it falls back to a labelled estimate.

**Test the API directly** (optional) using your browser console or a terminal:
```bash
curl -X POST https://scheme-console-xxxx.vercel.app/api/research \
  -H "Content-Type: application/json" \
  -d '{"name":"NFSM","lvl":"Central","crops":"rice, wheat, pulses"}'
```
A healthy response looks like `{"ok":true,"provenance":"web","result":{...},"sources":[...]}`.

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| “Research & score” always says *rule-based estimate* | `API_BASE_URL` still the placeholder, or backend down | Set the real Vercel URL in `app.js` (step 5) |
| API returns `server_misconfigured` | `ANTHROPIC_API_KEY` not set | Add it in Vercel → Environment Variables, then redeploy (step 3) |
| API returns `429 rate_limited` | Too many requests in a minute | Wait a minute; or raise `RATE_MAX` in `api/research.js` |
| Browser console shows a **CORS** error | Frontend origin not allowed | Add your exact origin to `ALLOWED_ORIGINS` in `api/research.js`, redeploy |
| API returns `research_failed` | Web search not enabled on your Anthropic org, or bad model name | Enable web search in the Anthropic Console, or set `ANTHROPIC_MODEL` to a model you can access. The app still works — it falls back to Quick Estimate. |
| Function **timeout** | Web search is slow and your Vercel plan caps duration | On Vercel Hobby, functions may cap at 60s; the model-only fallback is faster. Consider Vercel Pro for longer limits. |
| Page loads but looks unstyled | `styles.css` not uploaded next to `index.html` | Re-upload keeping all files in the same folder |

Open the browser **DevTools → Console** and **Network** tabs to see the exact error.

---

## 8. Updating the application later

- **Change frontend text/logic:** edit `index.html` / `styles.css` / `app.js` in GitHub → Commit. GitHub Pages redeploys automatically in ~1 minute.
- **Change backend logic or prompt:** edit `api/research.js` → Commit. Vercel redeploys automatically.
- **Change the model or tool version:** update the `ANTHROPIC_MODEL` / `ANTHROPIC_WEB_SEARCH_TOOL` env vars in Vercel (no code change needed), then redeploy.
- **Move the backend:** just update `API_BASE_URL` in `app.js`. That is the only coupling between the two.

---

## 9. Security best practices

- **The API key lives only in Vercel.** It is never in `app.js`, never in git, never sent to the browser. `.gitignore` blocks `.env`.
- **CORS is restricted** to your three known origins — random sites cannot call your backend from a browser.
- **POST-only**, with a **request-size cap** and **basic per-IP rate limiting** to blunt abuse.
- **Rotate the key** if it is ever exposed (Anthropic Console → API Keys → Roll).
- **Data caution:** the scheme scores, margins and prize figures are commercial judgement. Confirm Cash (PFMS) and Margin (price-control/GST) with Finance/Commercial before treating any number as final, and decide who should have access before sharing widely.
- For **stronger rate limiting** across all serverless instances, back it with a shared store (e.g. Upstash Redis) instead of the in-memory map — the in-memory limiter is best-effort per warm instance.

---

### Project structure

```
scheme-console/
├── index.html          # markup (loads styles.css + app.js)
├── styles.css          # all styles (unchanged from the original)
├── app.js              # all app logic; calls the backend for research
├── api/
│   └── research.js     # Vercel serverless function -> Anthropic (holds the key)
├── vercel.json         # function config (maxDuration)
├── package.json        # ESM, node >= 18
├── .gitignore          # blocks .env, node_modules, .vercel
├── .env.example        # template for your environment variables
└── README.md           # this file
```
