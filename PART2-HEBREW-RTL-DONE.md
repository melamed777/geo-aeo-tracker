# PART2-HEBREW-RTL-DONE — geo-aeo-tracker (Israeli SMB GEO MVP)

> Part 2 handoff artifact. The UI is now **Hebrew + RTL**.

**Date:** 2026-10-19

---

## 1. Files changed

| File | Change |
|---|---|
| `lib/i18n/he.ts` | **New** — Hebrew dictionary (`he`) + typed `t(key)` helper (tab names, country names, schedule options). Single source of truth for shared labels. |
| `app/layout.tsx` | `<html lang="he" dir="rtl">`; swapped `Inter` → `Heebo` (`subsets: ["hebrew","latin"]`); Hebrew `<title>` + meta description. |
| `app/globals.css` | `--font-sans: var(--font-heebo)`; body font-family → `'Heebo'`; added `.nav-active` RTL indicator override. |
| `app/demo/page.tsx` | Hebrew metadata title/description for the `/demo` route. |
| `components/dashboard/types.ts` | `COUNTRIES` labels → Hebrew (via `t()`); `SCHEDULE_OPTIONS` labels/descs → Hebrew. `tabs` keys & `PROVIDER_LABELS` left as stable English IDs / Latin brand names. |
| `components/sovereign-dashboard.tsx` | Main shell: `tabMeta` titles/tooltips/details → Hebrew; sidebar, toolbar, KPI strip, scoring explainer, status messages → Hebrew; RTL-safe classes (`start-0`, `border-e`, `me-auto`, `ms-auto`, `text-start`, `rtl:translate-x-full`). |
| `components/dashboard/tabs/project-settings-tab.tsx` | Fully translated (brand form, cloud-sync card, danger zone). |
| `components/dashboard/tabs/prompt-hub-tab.tsx` | Fully translated (library, filter, buttons, confirm dialogs). |
| `components/dashboard/tabs/visibility-analytics-tab.tsx` | Headers/sentiment labels/empty states/buttons → Hebrew; chart wrapper `dir="ltr"`; RTL-safe bars. |
| `…/tabs/aeo-audit-tab.tsx`, `automation-tab-v2.tsx`, `battlecards-tab.tsx`, `citation-opportunities-tab.tsx`, `documentation-tab.tsx`, `fan-out-tab.tsx`, `partner-discovery-tab.tsx`, `reputation-sources-tab.tsx` | RTL-safe logical-property fixes only (`text-start`, `ms-*`, `me-*`, `pe-*`, `start-*`, `end-*`, `rounded-s/e`). Body copy deferred (see §3). |

## 2. Font

- **Heebo** (Google Fonts, `next/font/google`), `subsets: ["hebrew","latin"]`, `display: swap`.
- **Why:** Heebo is a native Hebrew sans-serif that also covers Latin — so a single family serves Hebrew UI copy *and* Latin brand names/URLs, with no tofu. `Inter` was removed entirely (it has no Hebrew glyphs). `JetBrains Mono` kept for code/numbers.

## 3. Translated vs. deferred

**Translated (Hebrew):** tab names, tab tooltips/descriptions, the whole shell chrome (sidebar, workspace picker, toolbar, KPI strip, "Top Movers", scoring explainer, "what this tab does"), all `setMessage` status/error strings, Project Settings (full), Prompt Hub (full), Visibility Analytics (headers + labels + buttons).

**Deferred (still English) — follow-on, per MVP time-box:**
- Tab *body* copy: Fan-Out, Niche Explorer, Battlecards, AEO Audit, Automation, Responses/Reputation Sources, Citations (`partner-discovery-tab`), Citation Opportunities, SRO Analysis.
- `documentation-tab.tsx` (18-section guide).
- LLM prompt templates (battlecard JSON spec, niche-query prompt, `brandCtx`) — intentionally English, sent to the models.
- Seed prompt/keyword defaults in `defaultState`.

**Kept Latin by design:** brand names `ChatGPT`, `Gemini`, `Perplexity`, `Copilot`, `Google AI`, plus env-var names (`BRIGHT_DATA_KEY`, `SUPABASE_URL`, …) and the `AEO Tracker` / Bright Data footer.

## 4. Build / lint / dev results

| Command | Result |
|---|---|
| `npm run build` | ✅ Next.js 16.2.9 (Turbopack) — compiled, TypeScript clean |
| `npm run lint` | ✅ ESLint clean |
| `npm run dev` | ✅ HTTP 200 at `http://localhost:3000` |

Rendered output verified via `curl`:
- `<html lang="he" dir="rtl">` ✅
- `<title>מעקב נראות ב-AI</title>` ✅
- Heebo font class injected on `<body>` ✅

## 5. Screenshots

Not captured in this environment (no browser automation available). Verified programmatically (lang/dir/title/HTTP 200 + production build). **Manual follow-up:** open `http://localhost:3000` (dev) or `https://leto.ddns.net/geo` (prod) and capture desktop + one tab for the client-facing record. Key things to eyeball: sidebar on the right, right-aligned Hebrew, the Visibility Analytics chart axes, and that `42%`-style numbers aren't reversed.

## 6. Redeploy status (ArgoCD)

- Pushed to `origin/main` (`f7d0369..437fcbd`), which triggers ArgoCD auto-sync → live rollout at `https://leto.ddns.net/geo` (behind oauth2-proxy — log in).
- Commit: `437fcbd` (`Part 2: Hebrew RTL UI + string translation`).

## 7. Open items → Part 3

- [ ] Finish tab-body translation (deferred list in §3).
- [ ] Capture RTL screenshots for the client-facing record.
- [ ] Client-facing **"AI visibility audit" report** (HTML/PDF) — the proof/lead-magnet.
- [ ] Wire OpenRouter + Gemini keys (analysis layer: scoring, SRO, battlecards) — intentionally skipped in Part 1.
- [ ] Seed Hebrew tracking keywords in Project Settings.
