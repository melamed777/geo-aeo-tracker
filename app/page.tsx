import { SovereignDashboard } from "@/components/sovereign-dashboard";

// Demo mode has two triggers.
//
// 1. NEXT_PUBLIC_DEMO_ONLY=true — an explicit read-only public preview.
// 2. No BRIGHT_DATA_KEY — nothing can be fetched, so showing the sample
//    dataset beats rendering a live dashboard whose every request 400s.
//
// This is what makes every environment variable optional: a fresh clone or a
// zero-config Vercel deploy lands on a working dashboard, and adding the key
// is what switches it to live data. BRIGHT_DATA_KEY is read here in a server
// component, so it is never shipped to the browser.
//
// `dynamic = "force-dynamic"` is required so the key check reads the RUNTIME
// environment. Without it the "/" route is statically prerendered at build
// time and permanently bakes in the "no-key" demo banner — a problem for
// Docker (and any runtime-secret deploy) where BRIGHT_DATA_KEY is supplied
// via `env_file`/`-e` at run time, not baked into the build.
export const dynamic = "force-dynamic";

export default function Home() {
  const explicitDemo =
    (process.env.NEXT_PUBLIC_DEMO_ONLY ?? "").trim().toLowerCase() === "true";
  const hasBrightDataKey = Boolean((process.env.BRIGHT_DATA_KEY ?? "").trim());

  const isDemoOnly = explicitDemo || !hasBrightDataKey;

  return (
    <SovereignDashboard
      demoMode={isDemoOnly}
      demoReason={!hasBrightDataKey && !explicitDemo ? "no-key" : "explicit"}
    />
  );
}
