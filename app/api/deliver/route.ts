import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Optional email delivery through Gmail.
 * Configure GMAIL_REFRESH_TOKEN + GMAIL_SENDER (or GMAIL_ACCESS_TOKEN) to enable.
 */
async function accessToken(): Promise<string | null> {
  if (process.env.GMAIL_ACCESS_TOKEN) return process.env.GMAIL_ACCESS_TOKEN;
  const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = process.env;
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

const encodeRaw = (msg: string) =>
  Buffer.from(msg, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const header = (value: string) => value.replace(/[\r\n]+/g, " ").slice(0, 900);

export async function POST(req: Request) {
  const token = await accessToken();
  const sender = process.env.GMAIL_SENDER;
  if (!token || !sender) {
    return NextResponse.json(
      {
        error: "mail_not_configured",
        message: "إرسال البريد غير مفعّل في هذه النسخة — يمكنك مشاركة الرابط أو فتح Gmail يدويًا.",
      },
      { status: 503 },
    );
  }

  let body: { to?: string; subject?: string; text?: string; html?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const to = String(body.to ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json({ error: "invalid_email", message: "بريد المستلم غير صحيح." }, { status: 422 });
  }

  const boundary = `f_${crypto.randomUUID().replace(/-/g, "")}`;
  const subject = header(body.subject ?? "فاتورة");
  const text = String(body.text ?? "").slice(0, 8000);
  const html = String(body.html ?? "").slice(0, 60000);

  const mime = [
    `From: ${sender}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodeRaw(text),
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodeRaw(html),
    "",
    `--${boundary}--`,
  ].join("\r\n");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: encodeRaw(mime) }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "send_failed", message: "رفض مزوّد البريد الإرسال.", detail: detail.slice(0, 300) },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
