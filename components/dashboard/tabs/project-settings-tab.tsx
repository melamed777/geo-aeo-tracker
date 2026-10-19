import { useState, useSyncExternalStore } from "react";
import type { BrandConfig } from "@/components/dashboard/types";
import {
  isCloudAvailable,
  isCloudEnabledByUser,
  setCloudEnabledByUser,
  getSyncSecret,
  setSyncSecret,
} from "@/lib/client/cloud-mode";

type SyncState = {
  status: "idle" | "saving" | "saved" | "error" | "loading";
  at: string | null;
};

type ProjectSettingsTabProps = {
  brand: BrandConfig;
  onBrandChange: (patch: Partial<BrandConfig>) => void;
  onReset?: () => void;
  syncState: SyncState;
  onSaveNow: () => void;
  onRefresh: () => void;
};

export function ProjectSettingsTab({
  brand,
  onBrandChange,
  onReset,
  syncState,
  onSaveNow,
  onRefresh,
}: ProjectSettingsTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-3 text-base font-semibold text-th-text">
          מותג ואתר
        </div>
        <p className="mb-4 text-sm leading-relaxed text-th-text-muted">
          הגדר את המותג שלך כך שכל שאילתה, ביקורת וניתוח יהיו ממוקדים באתר שלך.
          הנתונים נשמרים מקומית בדפדפן — או ב-Supabase אם הסנכרון לענן מופעל למטה.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Field
          label="שם מותג / חברה"
          placeholder="Acme Corp"
          value={brand.brandName}
          onChange={(v) => onBrandChange({ brandName: v })}
        />
        <Field
          label="כינויים של המותג (מופרדים בפסיקים)"
          placeholder="ACME, Acme Inc, acme.com"
          value={brand.brandAliases}
          onChange={(v) => onBrandChange({ brandAliases: v })}
        />
        <div className="xl:col-span-2">
          <WebsiteListField
            websites={brand.websites}
            onChange={(websites) => onBrandChange({ websites })}
          />
        </div>
        <Field
          label="ענף / תחום"
          placeholder="B2B SaaS, E-commerce, Healthcare…"
          value={brand.industry}
          onChange={(v) => onBrandChange({ industry: v })}
        />
        <Field
          label="מילות מפתח יעד (מופרדות בפסיקים)"
          placeholder="AI analytics, answer engine optimization, GEO tools"
          value={brand.keywords}
          onChange={(v) => onBrandChange({ keywords: v })}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-th-text-muted">
          תיאור המותג
        </label>
        <textarea
          value={brand.description}
          onChange={(e) => onBrandChange({ description: e.target.value })}
          placeholder="תיאור קצר של המוצר/השירות שלך כדי שמודלי AI יוכלו להעריך רלוונטיות…"
          className="bd-input h-28 w-full rounded-lg p-2.5 text-sm"
        />
      </div>

      {/* Quick status */}
      <div className="grid gap-2 sm:grid-cols-3">
        <StatusChip label="שם מותג" ok={brand.brandName.trim().length > 0} />
        <StatusChip
          label="אתר"
          ok={
            brand.websites.length > 0 &&
            brand.websites.some((w) => w.trim().length > 0)
          }
        />
        <StatusChip label="מילות מפתח" ok={brand.keywords.trim().length > 0} />
      </div>

      <CloudSyncCard
        syncState={syncState}
        onSaveNow={onSaveNow}
        onRefresh={onRefresh}
      />

      {/* Danger zone */}
      {onReset && (
        <div className="rounded-lg border border-th-danger/30 bg-th-danger-soft p-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-th-danger">
            אזור מסוכן
          </div>
          <p className="mb-3 text-sm text-th-danger/70">
            מחיקת כל הנתונים השמורים כולל הרצות, שאילתות, הגדרות ותוצאות ביקורת.
            לא ניתן לבטל פעולה זו.
          </p>
          <button
            onClick={onReset}
            className="rounded-lg border border-th-danger/40 bg-th-danger-soft px-4 py-2 text-sm font-medium text-th-danger hover:bg-th-danger/20"
          >
            איפוס כל הנתונים
          </button>
        </div>
      )}
    </div>
  );
}

function subscribeToCloudPref(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === "sovereign-cloud-sync") callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function CloudSyncCard({
  syncState,
  onSaveNow,
  onRefresh,
}: {
  syncState: SyncState;
  onSaveNow: () => void;
  onRefresh: () => void;
}) {
  const enabled = useSyncExternalStore(
    subscribeToCloudPref,
    () => isCloudEnabledByUser(),
    () => true,
  );
  const available = useSyncExternalStore(
    () => () => {},
    () => isCloudAvailable(),
    () => false,
  );
  const [secret, setSecret] = useState(getSyncSecret);

  if (!available) {
    return (
      <div className="rounded-lg border border-th-border bg-th-card p-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-th-text-muted">
          סנכרון לענן
        </div>
        <p className="text-sm leading-relaxed text-th-text-muted">
          אחסון בענן אינו מוגדר בפריסה זו. הנתונים שלך נשמרים מקומית בדפדפן
          (IndexedDB). כדי להפעיל סנכרון לענן, הגדר{" "}
          <code className="rounded bg-th-card-alt px-1 py-0.5 text-xs">
            SUPABASE_URL
          </code>
          ,{" "}
          <code className="rounded bg-th-card-alt px-1 py-0.5 text-xs">
            SUPABASE_SERVICE_ROLE_KEY
          </code>
          , ו-{" "}
          <code className="rounded bg-th-card-alt px-1 py-0.5 text-xs">
            NEXT_PUBLIC_CLOUD_STORAGE_ENABLED=true
          </code>{" "}
          בסביבת הפריסה שלך. ראה את ה-README להנחיות הגדרה.
        </p>
      </div>
    );
  }

  function toggle() {
    const next = !enabled;
    setCloudEnabledByUser(next);
    // Reload so useSyncExternalStore re-reads and every consumer picks up the new mode.
    if (typeof window !== "undefined") window.location.reload();
  }

  return (
    <div className="rounded-lg border border-th-border bg-th-card p-4">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-th-text-muted">
        סנכרון לענן
      </div>
      <p className="mb-3 text-sm leading-relaxed text-th-text-muted">
        {enabled
          ? "הנתונים שלך מסונכרנים ל-Supabase ויישמרו בין מכשירים ודפדפנים."
          : "הסנכרון לענן מושבת. הנתונים נשמרים רק מקומית בדפדפן זה."}
      </p>
      <button
        onClick={toggle}
        className="rounded-lg border border-th-border bg-th-card-alt px-4 py-2 text-sm font-medium text-th-text hover:bg-th-card"
      >
        {enabled ? "השבת סנכרון לענן (מקומי בלבד)" : "הפעל סנכרון לענן"}
      </button>
      <p className="mt-2 text-xs text-th-text-muted">
        החלפת המצב תטען מחדש את הדף. הנתונים המקומיים הקיימים נשמרים בעת החלפת
        מצבים, אך ייתכן שלא יסונכרנו אוטומטית לחנות האחרת.
      </p>
      {enabled && (
        <div className="mt-4 border-t border-th-border pt-3">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-th-text-muted">
            ביטוי סיסמה לסנכרון
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value);
              setSyncSecret(e.target.value);
            }}
            placeholder="Matches STATE_SYNC_SECRET"
            autoComplete="off"
            className="bd-input w-full rounded-lg p-2.5 text-sm"
          />
          <p className="mt-1 text-xs text-th-text-muted">
            חייב להיות שווה ל-{" "}
            <code className="rounded bg-th-card-alt px-1 py-0.5 text-xs">
              STATE_SYNC_SECRET
            </code>{" "}
            שהוגדר בפריסה שלך. בלעדיו ה-API של הסנכרון לענן ידחה כל בקשה. נשמר
            רק בדפדפן זה.
          </p>
        </div>
      )}

      {/* Data sync status + manual controls */}
      <div className="mt-4 border-t border-th-border pt-3">
        <div className="mb-2 flex items-center gap-2 text-sm">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              syncState.status === "saved"
                ? "bg-th-success"
                : syncState.status === "error"
                  ? "bg-th-danger"
                  : syncState.status === "idle"
                    ? "bg-th-text-muted"
                    : "bg-th-accent animate-pulse"
            }`}
          />
          <span className="text-th-text">
            {syncState.status === "saved" && "מסונכרן למסד הנתונים"}
            {syncState.status === "saving" && "שומר…"}
            {syncState.status === "loading" && "טוען ממסד הנתונים…"}
            {syncState.status === "error" && "השמירה נכשלה"}
            {syncState.status === "idle" && "עדיין לא מסונכרן"}
          </span>
          {syncState.at && (
            <span className="text-xs text-th-text-muted">
              {new Date(syncState.at).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSaveNow}
            disabled={syncState.status === "saving"}
            className="rounded-lg bg-th-accent px-4 py-2 text-sm font-medium text-white hover:bg-th-accent-hover disabled:opacity-50"
          >
            שמור עכשיו
          </button>
          <button
            onClick={onRefresh}
            disabled={syncState.status === "loading"}
            className="rounded-lg border border-th-border bg-th-card-alt px-4 py-2 text-sm font-medium text-th-text hover:bg-th-card"
          >
            רענון
          </button>
        </div>
      </div>
    </div>
  );
}

function WebsiteListField({
  websites,
  onChange,
}: {
  websites: string[];
  onChange: (websites: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addUrl() {
    const url = draft.trim();
    if (!url) return;
    onChange([...websites, url]);
    setDraft("");
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-th-text-muted">
        כתובות אתר
      </label>
      {websites.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {websites.map((url, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full bg-th-card-alt border border-th-border px-3 py-1 text-sm text-th-text"
            >
              {url.replace(/^https?:\/\//, "")}
              <button
                onClick={() => onChange(websites.filter((_, j) => j !== i))}
                className="rounded-full p-0.5 hover:bg-th-danger-soft hover:text-th-danger"
                title="הסר"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="https://acme.com"
          className="bd-input flex-1 rounded-lg p-2.5 text-sm"
        />
        <button
          onClick={addUrl}
          disabled={!draft.trim()}
          className="rounded-lg bg-th-accent px-4 py-2 text-sm font-medium text-white hover:bg-th-accent-hover disabled:opacity-50"
        >
          הוסף
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-th-text-muted">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bd-input w-full rounded-lg p-2.5 text-sm"
      />
    </div>
  );
}

function StatusChip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-th-border bg-th-card-alt px-3 py-2.5">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-th-success" : "bg-th-text-muted"}`}
      />
      <span className="text-sm text-th-text-secondary">{label}</span>
      <span
        className={`ms-auto text-xs font-medium ${ok ? "text-th-success" : "text-th-text-muted"}`}
      >
        {ok ? "הוגדר" : "חסר"}
      </span>
    </div>
  );
}
