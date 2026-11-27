"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, FileWarning, Loader2, Lock, Printer, ShieldCheck, XCircle } from "lucide-react";
import type { Invoice } from "@/lib/invoice";
import { totals } from "@/lib/invoice";
import { num } from "@/lib/format";
import { decodeDoc, fetchShare } from "@/lib/share";
import { downloadPDF, printInvoice } from "@/lib/pdf";
import { SheetPreview } from "./editor/sheet-preview";
import { Brand } from "./brand";
import { Toast } from "./editor/fields";

export function SharedInvoice({ token }: { token: string }) {
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [inv, setInv] = useState<Invoice | null>(null);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [selfMode, setSelfMode] = useState(false);

  useEffect(() => {
    let live = true;
    const self = token === "self";
    setSelfMode(self);

    if (self) {
      const payload = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("d") || "";
      if (!payload) {
        setState("missing");
        return;
      }
      decodeDoc(payload)
        .then((doc) => {
          if (!live) return;
          setInv(doc);
          setCreatedAt(doc.issueDate);
          setState("ready");
        })
        .catch(() => live && setState("missing"));
      return () => {
        live = false;
      };
    }

    fetchShare(token)
      .then(({ inv, createdAt }) => {
        if (!live) return;
        setInv(inv);
        setCreatedAt(createdAt);
        setState("ready");
      })
      .catch((e: Error & { status?: number }) => {
        if (!live) return;
        setState(e.status === 404 ? "missing" : "error");
      });
    return () => {
      live = false;
    };
  }, [token]);

  const onPdf = async () => {
    if (!inv) return;
    setBusy(true);
    try {
      await downloadPDF(inv);
    } catch {
      setToast("تعذّر إنشاء PDF — جرّب زر الطباعة.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDE9E1]">
      <header className="border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Brand />
          {state === "ready" && inv ? (
            <div className="flex items-center gap-2">
              <button onClick={() => printInvoice(inv)} className="btn-ghost !px-3 !py-2 text-[13px]">
                <Printer className="h-4 w-4" /> طباعة
              </button>
              <button onClick={onPdf} disabled={busy} className="btn-primary !px-3 !py-2 text-[13px]">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                PDF
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-9">
        {state === "loading" ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="mt-3 text-[13px] font-bold">نُحضّر المستند…</p>
          </div>
        ) : state === "ready" && inv ? (
          <>
            <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-[20px] font-extrabold">
                  {inv.kind === "quote" ? "عرض ثمن" : "فاتورة"} <span className="tnum text-pine">{inv.number}</span>
                </h1>
                <p className="mt-0.5 text-[12px] text-muted">
                  من {inv.issuer.name} · أُنشئت في{" "}
                  {createdAt && /^\d{4}-\d{2}-\d{2}$/.test(createdAt) && selfMode
                    ? createdAt
                    : createdAt
                      ? new Date(createdAt).toLocaleDateString("ar-MA")
                      : "—"}
                </p>
              </div>
              <div className="chip !border-pine/20 !bg-pine-soft !text-pine">
                <ShieldCheck className="h-3.5 w-3.5" />
                {selfMode ? "رابط ذاتي — لا يمر عبر خادم" : "رابط آمن — 90 يومًا"}
              </div>
            </div>

            <SheetPreview inv={inv} maxWidth={794} />

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-white/80 p-4">
                <div className="text-[11px] font-bold text-muted">المجموع للدفع</div>
                <div className="tnum mt-1 text-[19px] font-extrabold text-pine" style={{ direction: "ltr", textAlign: "right" }}>
                  {num(totals(inv).total)} <span className="text-[11px] text-muted">د.م</span>
                </div>
              </div>
              <div className="rounded-xl border border-line bg-white/80 p-4">
                <div className="text-[11px] font-bold text-muted">تاريخ الاستحقاق</div>
                <div className="tnum mt-1 text-[15px] font-extrabold" style={{ direction: "ltr", textAlign: "right" }}>{inv.dueDate}</div>
              </div>
              <div className="rounded-xl border border-line bg-white/80 p-4">
                <div className="text-[11px] font-bold text-muted">شروط الأداء</div>
                <div className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink/80">{inv.paymentTerms || "—"}</div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-line bg-white/60 px-4 py-3 text-[11.5px] leading-relaxed text-muted">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              هذه نسخة مجمّدة من المستند أُنشئت لحظة المشاركة؛ لا تعرض أي بيانات أخرى من جهاز المُصدِر. للاستفسار، تواصل مباشرة مع {inv.issuer.email || inv.issuer.name}.
            </div>
          </>
        ) : state === "missing" ? (
          <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-clay/10 text-clay">
              <XCircle className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-[19px] font-extrabold">الرابط غير صالح أو منتهٍ</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              ربما انتهت صلاحية الرابط (90 يومًا)، أو كان خطأً في النسخ. اطلب من مُصدِر الفاتورة رابطًا جديدًا.
            </p>
            <Link href="/" className="btn-primary mt-6">إلى فاتورا</Link>
          </div>
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron-soft text-[#9A6A15]">
              <FileWarning className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-[19px] font-extrabold">الخدمة مشغولة مؤقتًا</h2>
            <p className="mt-2 text-[13px] text-muted">أعد تحميل الصفحة بعد لحظات.</p>
            <button onClick={() => location.reload()} className="btn-ghost mt-6">إعادة المحاولة</button>
          </div>
        )}
      </main>

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
