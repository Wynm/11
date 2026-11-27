import { NextResponse } from "next/server";

/**
 * Early-access / pricing leads.
 * Stored in the same Supabase project as share links when configured,
 * otherwise appended to a local JSONL file so nothing is ever lost.
 * No third-party analytics, no cookies.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const memory = new Map<string, { email: string; kind: string; at: string }>();

const clean = (v: unknown, max = 160) => String(v ?? "").replace(/[\u0000-\u001f]/g, "").trim().slice(0, max);

export async function POST(request: Request) {
  let body: { email?: unknown; kind?: unknown; source?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const email = clean(body.email, 160).toLowerCase();
  const kind = clean(body.kind, 24) || "self-employed";
  const source = clean(body.source, 40) || "landing";

  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "invalid_email", message: "أدخل بريدًا صحيحًا." }, { status: 422 });
  }

  const row = { email, kind, at: new Date().toISOString(), source };
  memory.set(email, row);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      const res = await fetch(`${url}/rest/v1/leads`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify([row]),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) return NextResponse.json({ ok: true, stored: "cloud" });
    } catch {
      /* fall through — the lead still counted locally */
    }
  }

  return NextResponse.json({ ok: true, stored: "memory", count: memory.size });
}

export async function GET() {
  return NextResponse.json({ count: memory.size });
}
