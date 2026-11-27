import { NextResponse } from "next/server";
import { sanitizeInvoice } from "@/lib/invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = { tokens: 12, windowMs: 60 * 60 * 1000 };
const hits = new Map<string, { count: number; reset: number }>();

function limited(ip: string) {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || cur.reset < now) {
    hits.set(ip, { count: 1, reset: now + BUCKET.windowMs });
    return false;
  }
  cur.count += 1;
  return cur.count > BUCKET.tokens;
}

const token = () => {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 18);
};

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Not configured (or still holding example values) → the client falls back to a
  // self-contained link, so this is a normal state, not a failure.
  if (!url || !key || !url.startsWith("https://") || /YOUR_PROJECT|xxx/i.test(key)) {
    return NextResponse.json(
      { error: "cloud_not_configured", message: "التخزين السحابي غير مهيأ — يُنشأ رابط ذاتي." },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";
  if (limited(ip)) {
    return NextResponse.json(
      { error: "slow_down", message: "محاولات كثيرة. جرّب بعد قليل." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const doc = sanitizeInvoice((body as { doc?: unknown })?.doc);
  if (!doc.issuer.name || doc.items.every((i) => !i.description && i.unitPrice === 0)) {
    return NextResponse.json(
      { error: "empty_document", message: "أكمل بياناتك وسطرًا واحدًا على الأقل قبل المشاركة." },
      { status: 422 },
    );
  }

  const id = token();
  const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  let res: Response;
  try {
    res = await fetch(`${url}/rest/v1/invoices`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ id, doc, expires_at: expires }),
      signal: AbortSignal.timeout(7000),
    });
  } catch {
    return NextResponse.json(
      { error: "store_unreachable", message: "خدمة التخزين السحابي غير متاحة — سيُنشأ رابط ذاتي." },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const rateLimited = res.status === 400 && /rate_limited/.test(text);
    return NextResponse.json(
      {
        error: rateLimited ? "slow_down" : "store_failed",
        message: rateLimited ? "خدمة المشاركة مشغولة. جرّب بعد قليل." : "تعذّر إنشاء الرابط.",
      },
      { status: rateLimited ? 429 : 502 },
    );
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  return NextResponse.json({ token: id, url: `${origin}/i/${id}`, expiresAt: expires });
}
