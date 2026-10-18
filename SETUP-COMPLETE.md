# SETUP-COMPLETE — geo-aeo-tracker (Israeli SMB GEO MVP)

> Part 1 handoff artifact. Forked, wired, and **IL+HE routing verified end-to-end**.

**Date:** 2026-10-18

---

## 1. Fork + clone status

- **Upstream:** `https://github.com/danishashko/geo-aeo-tracker` (MIT, branch `main`)
- **Fork:** `https://github.com/melamed777/geo-aeo-tracker`
- **Local clone:** `/Users/tomer/Documents/ai_geo/geo-aeo-tracker` (branch `main`, tracking the fork)
- **Node:** v26.10.0 · **npm:** 469 packages installed · **Supabase CLI:** v2.121.0 (installed via `npm i -g supabase`)

---

## 2. Environment — keys configured

| Variable | Status |
|---|---|
| `BRIGHT_DATA_KEY` | ✅ configured |
| `OPENROUTER_KEY` | ⏭️ skipped (analysis layer — optional) |
| `GEMINI_API_KEY` | ⏭️ skipped (SRO grounding only — optional) |
| `SUPABASE_URL` | ✅ `https://jhgsmcwxhmxlvnljgvuv.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ configured (server-side only, never committed) |
| `NEXT_PUBLIC_CLOUD_STORAGE_ENABLED` | ✅ `true` |
| `STATE_SYNC_SECRET` | ✅ configured (`openssl rand -hex 24`) |

> Secret values are **not** reproduced here. `.env` is gitignored (`.env*` rule, only `.env.example` is committed).

---

## 3. Command results

| Command | Result |
|---|---|
| `npm install` | ✅ 469 packages (16 audit findings are pre-existing upstream deps) |
| `npm run dev` | ✅ `http://localhost:3000` → HTTP 200 |
| `npm run lint` | ✅ ESLint clean |
| `npm run build` | ✅ Next.js 16.2.9 (Turbopack) compiled, TypeScript clean |
| `npm run test:scraper` | ✅ **live** — returned `snapshot_id: sd_mvdqqqif2rdfsw5fwf` (ChatGPT dataset) |

> Note: `test:scraper` initially failed with Bright Data `400 "Customer is not active"`. This was an account-level issue (new/free account not yet activated — email verification / onboarding / payment-method activation). After the account was activated, `test:scraper` succeeded.

---

## 4. IL + HE verification (THE differentiator) ✅

**Method:** ran the Hebrew query through the app's live `/api/scrape` route (full pipeline → Bright Data → poll → download → normalize), with `country: "IL"`.

**Query (Hebrew):** `עורך דין מומלץ בחיפה - תן לי המלצות עם מקורות`

### ChatGPT — ✅ Hebrew answer + Israeli citations
- **Language:** Hebrew (full answer).
- **Answer content:** recommended lawyers **in Haifa**, e.g. עו״ד רינה פוליטי (דיני משפחה, שדרות הפלי״ם 15), עו״ד רועי סבג (דיני עבודה, שדרות הפלי״ם 2), שחר־חן (נזקי גוף, רחוב הנמל 33), הדר ארבל (מקרקעין, שדרות מוריה 30).
- **Citations (Israeli/local):** `d.co.il` (דפי זהב), `din.co.il`, `lawreviews.co.il`, `advocato.co.il`, `hkn.co.il`.
- **Outgoing request confirmed:** `"country":"IL"` in the scraper `input` record.

### Gemini — ✅ Hebrew answer + Israeli/local firms
- **Language:** Hebrew (full answer).
- **Answer content:** Haifa lawyers by practice area, e.g. עו״ד תמי אולמן (פלילי), עו״ד ליאור וימן (נזיקין), אבי גולדהמר ושות׳ (מקרקעין), פומרנץ פריבס / בן־ארי פיש פלדמן (ליטיגציה).

**Conclusion:** A Hebrew query returns a Hebrew answer with geo-relevant Israeli citations on **both** ChatGPT and Gemini. IL+HE routing works.

> Screenshot note: verification was performed via direct `curl` against the running app (evidence = response payloads above). When reviewing in a browser, capture a screenshot of the dashboard run for the client-facing record.

---

## 5. Files changed for Israeli routing

| File | Change | Line |
|---|---|---|
| `lib/server/brightdata-platforms.ts` | `country: "US"` → `country: "IL"` (5-platform citation scraper) | 143 |
| `components/dashboard/types.ts` | Added `{ code: "IL", label: "Israel" }` to `COUNTRIES` | 113 |
| `components/sovereign-dashboard.tsx` | Default `country` `"US"` → `"IL"` | 177 |

### Language-field finding (verified)
Bright Data's AI-scraper datasets accept `{ url, prompt, country }` (Gemini additionally accepts `additional_prompt`, `web_search`, `geolocation`). There is **no `language` input field** on these datasets — `language` exists only on Bright Data's separate SERP/search API and CLI. Therefore no `language: "he"` field was added; **Hebrew prompts + `country: "IL"`** is the reliable path to Hebrew answers (confirmed working above).

---

## 6. Supabase cloud sync — ✅ enabled & working

- Project: `jhgsmcwxhmxlvnljgvuv` ("melamed777's Project", region `ap-southeast-2`, Postgres 17).
- Migration `supabase/migrations/001_kv_store.sql` applied via CLI (`supabase db push --linked`) → created `kv_store` table with RLS.
- `supabase init` generated `supabase/config.toml` + `supabase/.gitignore` (ignores `.temp`, `.branches`).
- **Verified round-trip** against `/api/state`:
  - `PUT` → `{"ok":true}` (200)
  - `GET` → returned the stored value (200)
  - `DELETE` → `{"ok":true}` (200)
  - wrong `x-sync-secret` → `{"error":"Unauthorized."}` (401) — auth gate works
- To enable in-app sync: open **Project Settings → Cloud Sync** and paste the `STATE_SYNC_SECRET` value (stored in `.env`) as the "Sync passphrase".

---

## 7. Open questions / next steps → Part 2 (Hebrew RTL UI)

- [ ] `<html dir="rtl" lang="he">` + logical CSS properties (`margin-inline-*`, etc.).
- [ ] Hebrew font stack (Heebo / Rubik / Noto Sans Hebrew) + correct bidi for mixed Hebrew/Latin/numbers.
- [ ] Translate all UI strings into Hebrew agency terminology (not just labels).
- [ ] Seed Hebrew keywords in project settings (e.g. `רופא שיניים בתל אביב`, `שיפוצניק באזור המרכז`).
- [ ] Wire OpenRouter (`OPENROUTER_KEY`) + Gemini (`GEMINI_API_KEY`) to enable the analysis layer (scoring, SRO, battlecards) — intentionally skipped in Part 1.
- [ ] Deploy to Vercel (Part 4); regenerate the client-facing "AI visibility audit" report.

---

## 8. Gotchas recorded (for future parts)

- **`google_ai` = Google AI Mode** (`udm=50`), **not** AI Overviews. Be precise in client messaging.
- **`SUPABASE_SERVICE_ROLE_KEY`** has full DB access — server-side only; never in the client bundle.
- **Single-tenant** by design: one deployment = one Supabase project = one dataset. Multi-user auth is future work.
- **Supabase free tier** pauses after ~1 week idle (first request after pause is slow).
- All env vars optional — a missing key must never crash the app (verified: boots on demo data with empty `.env`).
