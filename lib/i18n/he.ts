/**
 * Hebrew i18n dictionary for the GEO/AEO tracker.
 *
 * Hebrew-only MVP — no language toggle. This module is the single source of
 * truth for the most reused, centralized labels (tab names, country names,
 * schedule options) so translations stay consistent across the app.
 *
 * Brand names (ChatGPT, Gemini, Perplexity, Copilot) are intentionally kept in
 * Latin — they are product names, not translatable UI copy.
 */

export const he = {
  // ── Tab names ────────────────────────────────────────────────
  "tabs.projectSettings": "הגדרות פרויקט",
  "tabs.promptHub": "מרכז שאילתות",
  "tabs.personaFanOut": "פרסונות",
  "tabs.nicheExplorer": "חוקר נישות",
  "tabs.responses": "תשובות",
  "tabs.visibilityAnalytics": "ניתוח נראות",
  "tabs.citations": "אזכורים",
  "tabs.citationOpportunities": "הזדמנויות אזכור",
  "tabs.battlecards": "מתחרים",
  "tabs.aeoAudit": "ביקורת AEO",
  "tabs.sroAnalysis": "ניתוח SRO",
  "tabs.automation": "אוטומציה",
  "tabs.documentation": "תיעוד",

  // ── Countries (Bright Data geolocation) ──────────────────────
  "country.US": "ארצות הברית",
  "country.GB": "בריטניה",
  "country.CA": "קנדה",
  "country.AU": "אוסטרליה",
  "country.DE": "גרמניה",
  "country.FR": "צרפת",
  "country.ES": "ספרד",
  "country.IT": "איטליה",
  "country.NL": "הולנד",
  "country.BR": "ברזיל",
  "country.IN": "הודו",
  "country.JP": "יפן",
  "country.MX": "מקסיקו",
  "country.IL": "ישראל",

  // ── Schedule options ─────────────────────────────────────────
  "schedule.hourly.label": "כל שעה",
  "schedule.hourly.desc": "הרצה פעם בשעה",
  "schedule.6h.label": "כל 6 שעות",
  "schedule.6h.desc": "4 הרצות ביום",
  "schedule.12h.label": "כל 12 שעות",
  "schedule.12h.desc": "2 הרצות ביום",
  "schedule.daily.label": "יומי",
  "schedule.daily.desc": "פעם ביום",
} as const;

export type I18nKey = keyof typeof he;

export const t = (key: I18nKey): string => he[key];
