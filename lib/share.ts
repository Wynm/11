"use client";

import type { Invoice } from "./invoice";

export type ShareRef = {
  token: string;
  url: string;
  expiresAt: string;
  mode: "server" | "self";
};

const b64url = (bytes: Uint8Array) => {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const unb64url = (s: string) => {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

/** Compress the document into a URL-safe payload (~700 chars for a typical invoice). */
export async function encodeDoc(inv: Invoice): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(inv));
  if (typeof CompressionStream !== "undefined") {
    const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("deflate-raw"));
    const buf = new Uint8Array(await new Response(stream).arrayBuffer());
    return `z${b64url(buf)}`;
  }
  return `p${b64url(json)}`;
}

export async function decodeDoc(payload: string): Promise<Invoice> {
  const kind = payload.slice(0, 1);
  const bytes = unb64url(payload.slice(1));
  let json: Uint8Array;
  if (kind === "z") {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    json = new Uint8Array(await new Response(stream).arrayBuffer());
  } else {
    json = bytes;
  }
  return JSON.parse(new TextDecoder().decode(json)) as Invoice;
}

/** Self-contained link: the whole document lives in the URL hash and never reaches a server. */
async function selfLink(inv: Invoice): Promise<ShareRef> {
  const payload = await encodeDoc(inv);
  const url = `${window.location.origin}/i/self#d=${payload}`;
  return {
    token: "self",
    url,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    mode: "self",
  };
}

export async function createShare(inv: Invoice): Promise<ShareRef> {
  try {
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc: inv }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json().catch(() => ({}))) as Partial<ShareRef> & { message?: string };
    if (res.ok && data.url) {
      return { token: data.token!, url: data.url, expiresAt: data.expiresAt!, mode: "server" };
    }
    if (res.status === 422) throw new Error(data.message || "أكمل بيانات الفاتورة أولًا.");
    // 503 / 429 / 5xx → fall through to the serverless link
  } catch (e) {
    if ((e as Error).message?.startsWith("أكمل")) throw e as Error;
  }
  return selfLink(inv);
}

export async function fetchShare(token: string): Promise<{ inv: Invoice; createdAt: string; mode: ShareRef["mode"] }> {
  const res = await fetch(`/api/share/${token}`, { cache: "no-store" });
  if (!res.ok) {
    const err = new Error(res.status === 404 ? "not_found" : "unavailable") as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  const data = (await res.json()) as { doc: Invoice; createdAt: string };
  return { inv: data.doc, createdAt: data.createdAt, mode: "server" };
}

export async function deliverByEmail(payload: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; message: string; fallback: boolean }> {
  try {
    const res = await fetch("/api/deliver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    return {
      ok: false,
      message: data.message || "تعذّر إرسال البريد من هذه النسخة.",
      fallback: data.error === "mail_not_configured" || res.status === 503,
    };
  } catch {
    return { ok: false, message: "تعذّر الاتصال بالخادم.", fallback: true };
  }
}
