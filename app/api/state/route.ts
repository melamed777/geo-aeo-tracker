import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { isCloudStorageConfigured } from "@/lib/server/supabase";
import { kvGet, kvSet, kvDelete } from "@/lib/server/kv-store";

// supabase-js requires Node APIs — stay on the Node runtime.
export const runtime = "nodejs";
// State mutations should always read the latest row; opt out of caching.
export const dynamic = "force-dynamic";

const keySchema = z.string().min(1).max(512);
const putBodySchema = z.object({
  key: keySchema,
  value: z.unknown(),
});

function notConfigured() {
  return NextResponse.json(
    { error: "Cloud storage is not configured on this deployment." },
    { status: 501 },
  );
}

/**
 * The KV store is backed by the Supabase service-role key (bypasses RLS), so
 * the route MUST authenticate every request or it becomes an open read/write/
 * delete proxy to all stored data. We require a shared secret: the deployer
 * sets STATE_SYNC_SECRET in the environment and enters the same value in the
 * app's Cloud Sync card, which sends it as `x-sync-secret`.
 *
 * If STATE_SYNC_SECRET is NOT set, the auth check is skipped and the route
 * trusts the network layer in front of it (e.g. oauth2-proxy) to authenticate
 * users. This is the mode used when the app is deployed behind an auth proxy —
 * cloud sync then works with no per-browser passphrase.
 */
function checkAuth(req: NextRequest): NextResponse | null {
  const expected = process.env.STATE_SYNC_SECRET;
  if (!expected) {
    // No shared secret configured — rely on the upstream auth proxy.
    return null;
  }
  const provided = req.headers.get("x-sync-secret") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  if (!isCloudStorageConfigured()) return notConfigured();
  const unauthorized = checkAuth(req);
  if (unauthorized) return unauthorized;

  const key = req.nextUrl.searchParams.get("key");
  const parsed = keySchema.safeParse(key);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid `key` param." },
      { status: 400 },
    );
  }

  const res = await kvGet(parsed.data);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ key: parsed.data, value: res.value });
}

export async function PUT(req: NextRequest) {
  if (!isCloudStorageConfigured()) return notConfigured();
  const unauthorized = checkAuth(req);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = putBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body: expected {key, value}." },
      { status: 400 },
    );
  }

  const res = await kvSet(parsed.data.key, parsed.data.value);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isCloudStorageConfigured()) return notConfigured();
  const unauthorized = checkAuth(req);
  if (unauthorized) return unauthorized;

  const key = req.nextUrl.searchParams.get("key");
  const parsed = keySchema.safeParse(key);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid `key` param." },
      { status: 400 },
    );
  }

  const res = await kvDelete(parsed.data);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
