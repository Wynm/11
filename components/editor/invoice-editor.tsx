"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Banknote,
  Check,
  CircleAlert,
  Download,
  FileDown,
  FileText,
  Link2,
  Loader2,
  Mail,
  MoreHorizontal,
  Printer,
  Receipt,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { Invoice } from "@/lib/invoice";
import { EMPTY_ISSUER, newInvoice, totals } from "@/lib/invoice";
import { num, percentLabel } from "@/lib/format";
import { complianceChecks, isCompliant } from "@/lib/compliance";
import { store } from "@/lib/storage";
import { downloadPDF, printInvoice } from "@/lib/pdf";
import { createShare, deliverByEmail } from "@/lib/share";
import { SheetPreview } from "./sheet-preview";
import { ClientPane, ItemsPane, MyDataPane, TermsPane } from "./panes";
import { CopyButton, Modal, Section, StatusPill, Toast } from "./fields";
import { LogoMark } from "@/components/brand";

type Tab = "data" | "client" | "items" | "terms" | "check";

export function InvoiceEditor({
  initialKind,
  fromNumber,
  editKey,
}: {
  initialKind: Invoice["kind"];
  fromNumber: string | null;
  editKey: number | null;
}) {
  const [ready, setReady] = useState(false);
  const [inv, setInv] = useState<Invoice | null>(null);
  const [prevNumber, setPrevNumber] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("items");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<null | { loading: boolean; url?: string; error?: string; expiresAt?: string; mode?: "server" | "self" }>(null);
  const [emailModal, setEmailModal] = useState(false);
  const [email, setEmail] = useState({ to: "", subject: "", message: "السلام عليكم،\n\nتجدون رفقته الفاتورة المطلوبة. شكرًا لثقتكم.", sending: false, error: "" });
  const [toolsOpen, setToolsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const savedIssuer = store.issuer();
    const rows = store.list();
    const existing = editKey ? rows.find((r) => r.createdAt === editKey) : undefined;
    const base = fromNumber ? rows.find((r) => r.number === fromNumber) : undefined;

    if (existing) {
      setInv(existing);
      if (!existing.issuer.name) setTab("data");
    } else if (base && fromNumber) {
      // Duplicate an existing document as a fresh draft.
      const copy = { ...base, createdAt: Date.now(), number: newInvoice(base.kind, rows, base.issuer).number, status: "draft" as const, paidAt: null };
      store.save(copy);
      setInv(copy);
      setPrevNumber(fromNumber);
    } else {
      const issuer = savedIssuer.name ? savedIssuer : EMPTY_ISSUER;
      const fresh = newInvoice(initialKind, rows, issuer);
      store.save(fresh);
      setInv(fresh);
      if (!issuer.name) setTab("data");
    }
    setReady(true);
  }, [initialKind, fromNumber, editKey]);

  const update = useCallback((patch: Partial<Invoice>) => {
    setInv((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      store.save(next);
      if (patch.issuer) store.setIssuer(next.issuer);
      return next;
    });
  }, []);

  const checks = useMemo(() => (inv ? complianceChecks(inv) : []), [inv]);
  const allOk = inv ? isCompliant(inv) : false;
  const failing = checks.filter((c) => !c.ok);

  const doPrint = async () => {
    if (!inv) return;
    const ok = await printInvoice(inv);
    if (!ok) setToast("اسمح بالنوافذ المنبثقة لفتح نسخة الطباعة.");
  };

  const doPdf = async () => {
    if (!inv) return;
    setDownloading(true);
    try {
      await downloadPDF(inv);
      update({ status: inv.status === "draft" ? "sent" : inv.status });
      setToast("تم تنزيل ملف PDF.");
    } catch {
      setToast("تعذّر إنشاء PDF على هذا المتصفح — استعمل «طباعة» ثم «حفظ كـ PDF».");
    } finally {
      setDownloading(false);
      setToolsOpen(false);
    }
  };

  const openShare = async () => {
    if (!inv) return;
    setShareModal({ loading: true });
    try {
      const ref = await createShare(inv);
      setShareModal({ loading: false, url: ref.url, expiresAt: ref.expiresAt, mode: ref.mode });
      if (inv.status === "draft") update({ status: "sent" });
    } catch (e) {
      setShareModal({ loading: false, error: (e as Error).message });
    }
  };

  const openGmail = async () => {
    if (!inv) return;
    if (!allOk) {
      setToast("أكمل الشروط الناقصة قبل الإرسال الرسمي.");
      setTab("check");
      return;
    }
    const t = totals(inv);
    const subject = `${inv.kind === "quote" ? "عرض ثمن" : "فاتورة"} ${inv.number} — ${inv.issuer.name}`;
    const text = `السلام عليكم،\n\nرفقة هذا البريد ${inv.kind === "quote" ? "عرض الثمن" : "الفاتورة"} رقم ${inv.number} بمبلغ ${num(t.total)} درهم.\nتاريخ الاستحقاق: ${inv.dueDate}.\n\nشكرًا لثقتكم،\n${inv.issuer.name}`;
    setEmail({
      to: inv.client.email,
      subject,
      message: text,
      sending: false,
      error: "",
    });
    setEmailModal(true);
    setToolsOpen(false);
  };

  const sendEmail = async () => {
    if (!inv) return;
    setEmail((e) => ({ ...e, sending: true, error: "" }));
    const res = await deliverByEmail({
      to: email.to,
      subject: email.subject,
      text: email.message,
      html: `<div dir="rtl" style="font-family:Tajawal,Arial,sans-serif;line-height:1.9;color:#12171D">${email.message
        .split("\n")
        .map((l) => `<p style="margin:0 0 8px">${l.replace(/</g, "&lt;")}</p>`)
        .join("")}</div>`,
    });
    if (res.ok) {
      setEmail((e) => ({ ...e, sending: false }));
      setEmailModal(false);
      update({ status: inv.status === "draft" ? "sent" : inv.status });
      setToast("أُرسلت الفاتورة إلى بريد العميل.");
      return;
    }
    if (res.fallback) {
      const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.to)}&su=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.message)}`;
      window.open(gmail, "_blank", "noopener");
      setEmail((e) => ({ ...e, sending: false }));
      setEmailModal(false);
      setToast("فُتح Gmail بمسودة جاهزة — أضف الرابط ثم أرسل.");
      return;
    }
    setEmail((e) => ({ ...e, sending: false, error: res.message }));
  };

  const removeDoc = () => {
    if (!inv) return;
    store.remove(inv.createdAt);
    window.location.href = "/invoices";
  };

  if (!ready || !inv) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex items-center gap-2 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-[14px] font-bold">نُجهّز المحرّر…</span>
        </div>
      </div>
    );
  }

  const t = totals(inv);
  const isQuote = inv.kind === "quote";
  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: "data", label: "بياناتي", icon: Receipt },
    { id: "client", label: "العميل", icon: FileText },
    { id: "items", label: "الخدمات", icon: Banknote },
    { id: "terms", label: "الشروط", icon: FileDown },
    { id: "check", label: "الجاهزية", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:border-b-0 max-lg:border-t max-lg:pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-3 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/" className="shrink-0" aria-label="الرئيسية"><LogoMark className="h-8 w-8" /></Link>
            <div className="seg hidden sm:inline-flex">
              <button
                type="button"
                data-active={inv.kind === "invoice"}
                onClick={() => update({ kind: "invoice", number: inv.number.replace(/^DEV/, "FAC") })}
              >
                فاتورة
              </button>
              <button
                type="button"
                data-active={inv.kind === "quote"}
                onClick={() => update({ kind: "quote", number: inv.number.replace(/^FAC/, "DEV") })}
              >
                عرض ثمن
              </button>
            </div>
            <div className="hidden min-w-0 items-center gap-2 md:flex">
              <span className="truncate text-[13.5px] font-extrabold text-ink">{inv.number}</span>
              <span className={`hidden items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-bold ${
                failing.length === 0
                  ? "border-pine/20 bg-pine-soft text-pine"
                  : "border-saffron/30 bg-saffron-soft text-[#9A6A15]"
              }`}>
                {failing.length === 0 ? <Check className="h-3 w-3" strokeWidth={3.5} /> : <CircleAlert className="h-3 w-3" />}
                {failing.length === 0 ? "جاهزة" : `${checks.length - failing.length}/${checks.length}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={doPrint} className="btn-ghost !px-2.5 sm:!px-4" title="طباعة">
              <Printer className="h-4 w-4" />
              <span className="hidden lg:inline">طباعة</span>
            </button>
            <button onClick={doPdf} className="btn-ghost !px-2.5 sm:!px-4" title="PDF" disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className="hidden lg:inline">PDF</span>
            </button>
            <button
              onClick={() => {
                if (!allOk) {
                  setToast(`بقي ${failing.length} شرطًا — راجعه في «الجاهزية».`);
                  setTab("check");
                  return;
                }
                openShare();
              }}
              className="btn-primary !px-3 !py-2.5 sm:!px-4"
            >
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">مشاركة الرابط</span>
            </button>
            <div className="relative">
              <button onClick={() => setToolsOpen((o) => !o)} className="btn-ghost !px-2" aria-label="المزيد">
                <MoreHorizontal className="h-[18px] w-[18px]" />
              </button>
              {toolsOpen ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setToolsOpen(false)} />
                  <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-52 overflow-hidden rounded-xl border border-line bg-white p-1 shadow-lift">
                    <button onClick={openGmail} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-right text-[13px] font-bold hover:bg-paper">
                      <Mail className="h-4 w-4 text-pine" /> إرسال إلى العميل
                    </button>
                    <Link href="/invoices" className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-bold hover:bg-paper">
                      <Receipt className="h-4 w-4 text-pine" /> كل فواتيري
                    </Link>
                    <button
                      onClick={() => {
                        update({ status: inv.status === "paid" ? "sent" : "paid", paidAt: inv.status === "paid" ? null : Date.now() });
                        setToolsOpen(false);
                        setToast(inv.status === "paid" ? "أُعيدت إلى «مُرسلة»." : "سُجّلت كـ «مُؤدّاة».");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-right text-[13px] font-bold hover:bg-paper"
                    >
                      <Check className="h-4 w-4 text-pine" /> {inv.status === "paid" ? "إلغاء الأداء" : "تحديد كـ مُؤدّاة"}
                    </button>
                    <button
                      onClick={() => {
                        setToolsOpen(false);
                        if (confirm("حذف هذه المسودة نهائيًا من متصفحك؟")) removeDoc();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-right text-[13px] font-bold text-clay hover:bg-clay/5"
                    >
                      <Trash2 className="h-4 w-4" /> حذف المسودة
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-3 py-5 pb-28 sm:px-5 lg:grid-cols-[minmax(400px,470px)_1fr] lg:py-7 lg:pb-7">
        {/* form column */}
        <div className={`${mobilePreview ? "hidden lg:block" : "block"}`}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[13px] font-bold text-muted">
              <StatusPill status={inv.status} />
              <span className="tnum">{percentLabel(inv.vatRate ?? 0)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="seg !p-0.5">
                {(["ar", "fr"] as const).map((l) => (
                  <button key={l} data-active={inv.language === l} onClick={() => update({ language: l })}>
                    {l === "ar" ? "عربي" : "Français"}
                  </button>
                ))}
              </div>
              <button onClick={() => setMobilePreview(true)} className="btn-ghost !px-2.5 !py-1.5 text-[12px] lg:hidden">
                معاينة
              </button>
            </div>
          </div>

          <nav className="no-scrollbar -mx-1 mb-3 flex gap-1 overflow-x-auto px-1">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-[12.5px] font-extrabold transition ${
                  tab === tb.id ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
                <tb.icon className="h-3.5 w-3.5" />
                {tb.label}
                {tb.id === "check" && failing.length > 0 ? (
                  <span className="rounded-full bg-saffron px-1.5 text-[10px] text-ink">{failing.length}</span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="card overflow-hidden">
            {tab === "data" && (
              <Section title="بياناتك كمُصدِر" sub="تُحفظ للفواتير القادمة" right={<span className="chip !py-0.5">تلقائي</span>}>
                <MyDataPane inv={inv} set={update} />
              </Section>
            )}
            {tab === "client" && (
              <Section title="بيانات العميل" sub="اتركها فارغة إن أردت الفاتورة لصالحك">
                <ClientPane inv={inv} set={update} />
              </Section>
            )}
            {tab === "items" && (
              <Section title="الخدمات والمبالغ" sub={`${inv.items.length} سطر · ${num(t.total)} د.م`}>
                <ItemsPane inv={inv} set={update} />
              </Section>
            )}
            {tab === "terms" && (
              <Section title="الشروط والتواريخ" sub="الاستحقاق، ملاحظات، والحساب البنكي">
                <TermsPane inv={inv} set={update} />
              </Section>
            )}
            {tab === "check" && (
              <Section title="فاحص الجاهزية القانونية" sub={allOk ? "كل الشروط مستوفاة" : `${failing.length} شرطًا يحتاج انتباهك`}>
                <ul className="space-y-2">
                  {checks.map((c) => (
                    <li key={c.id} className={`flex items-start gap-2.5 rounded-xl border p-3 ${c.ok ? "border-line bg-white" : "border-saffron/40 bg-saffron-soft/40"}`}>
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${c.ok ? "bg-pine text-white" : "bg-saffron text-ink"}`}>
                        {c.ok ? <Check className="h-3 w-3" strokeWidth={3.5} /> : <CircleAlert className="h-3 w-3" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-extrabold leading-snug">{c.label}</div>
                        <div className="mt-0.5 text-[11.5px] leading-snug text-muted">{c.detail}</div>
                      </div>
                      {!c.ok && c.fix ? (
                        <button
                          onClick={() => setTab(c.id === "client" ? "client" : c.id === "amount" || c.id === "vat" ? "items" : c.id === "dates" ? "terms" : "data")}
                          className="shrink-0 rounded-lg bg-white px-2 py-1 text-[11px] font-extrabold text-pine shadow-sm"
                        >
                          إصلاح
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 rounded-xl bg-pine-tint p-3 text-[11.5px] leading-relaxed text-pine">
                  هذه فحوص تقنية مبنية على العناصر المعتادة في الفاتورة المغربية. تبقى مسؤولية صحة البيانات والتصريح الضريبي على المفوتر.
                </div>
              </Section>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={openShare} className="btn-ghost flex-1 !py-2.5 text-[13px]">
              <Link2 className="h-4 w-4" /> رابط للعميل
            </button>
            <button onClick={openGmail} className="btn-ghost flex-1 !py-2.5 text-[13px]">
              <Mail className="h-4 w-4" /> إرسال بالبريد
            </button>
            <button onClick={doPdf} className="btn-ink flex-1 !py-2.5 text-[13px]" disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} تحميل PDF
            </button>
          </div>
        </div>

        {/* preview column */}
        <div className={`${mobilePreview ? "block" : "hidden lg:block"}`}>
          <div className="sticky top-[84px]">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] font-bold text-muted">
                <Sparkles className="h-3.5 w-3.5 text-saffron" />
                معاينة حية · A4
                {prevNumber ? <span className="chip !py-0.5">نسخة من {prevNumber}</span> : null}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMobilePreview(false)} className="btn-ghost !px-2.5 !py-1.5 text-[12px] lg:hidden">
                  تعديل
                </button>
                <button onClick={doPrint} className="btn-ghost !px-2.5 !py-1.5 text-[12px]" title="طباعة">
                  <Printer className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="max-h-[calc(100vh-150px)] overflow-y-auto rounded-2xl bg-[#EDE9E1]/70 p-3 shadow-inner sm:p-5">
              <SheetPreview inv={inv} maxWidth={794} />
            </div>
          </div>
        </div>
      </div>

      {/* share modal */}
      <Modal open={!!shareModal} onClose={() => setShareModal(null)} title="رابط مشاركة آمن" width="max-w-lg">
        {shareModal?.loading ? (
          <div className="flex items-center gap-2 py-6 text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> نُنشئ رابطًا فريدًا…
          </div>
        ) : shareModal?.error ? (
          <div className="space-y-3">
            <p className="rounded-xl bg-clay/10 p-3 text-[13px] font-bold text-clay">{shareModal.error}</p>
            <button className="btn-primary w-full" onClick={openShare}>إعادة المحاولة</button>
          </div>
        ) : shareModal?.url ? (
          <div className="space-y-4">
            <p className="text-[13px] leading-relaxed text-muted">
              أرسل هذا الرابط إلى عميلك. يرى الفاتورة كاملة ويمكنه تحميلها — دون كشف بياناتك الأخرى.
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-paper p-2">
              <input readOnly value={shareModal.url} className="input !border-0 !bg-transparent !p-1.5 text-[12px] text-pine" style={{ direction: "ltr" }} />
              <CopyButton text={shareModal.url} />
            </div>
            <a href={shareModal.url} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full">
              فتح الرابط <ArrowRight className="h-4 w-4" />
            </a>
            <p className="text-center text-[11px] leading-relaxed text-muted">
              {shareModal.mode === "self"
                ? "الفاتورة مضغوطة داخل الرابط نفسه — لا تُخزّن على أي خادم، وصلاحيته لا تنتهي طالما حافظت على الرابط."
                : `الرابط صالح حتى ${new Date(shareModal.expiresAt || "").toLocaleDateString("ar-MA")} — نسخة مجمّدة لا تتغير مع تعديلاتك.`}
            </p>
          </div>
        ) : null}
      </Modal>

      {/* email modal */}
      <Modal open={emailModal} onClose={() => setEmailModal(false)} title="إرسال الفاتورة بالبريد" width="max-w-lg">
        <div className="space-y-3">
          <label className="label">بريد العميل</label>
          <input type="email" className="input text-left" style={{ direction: "ltr" }} value={email.to} onChange={(e) => setEmail((s) => ({ ...s, to: e.target.value }))} placeholder="client@company.ma" />
          <label className="label">الموضوع</label>
          <input className="input" value={email.subject} onChange={(e) => setEmail((s) => ({ ...s, subject: e.target.value }))} />
          <label className="label">النص</label>
          <textarea className="input min-h-[120px] resize-y" value={email.message} onChange={(e) => setEmail((s) => ({ ...s, message: e.target.value }))} />
          {email.error ? <p className="rounded-lg bg-clay/10 p-2 text-[12px] font-bold text-clay">{email.error}</p> : null}
          <div className="flex gap-2 pt-1">
            <button onClick={sendEmail} disabled={email.sending || !email.to} className="btn-primary flex-1">
              {email.sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              إرسال
            </button>
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.to)}&su=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              فتح Gmail
            </a>
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            إرسال مباشر من الأداة يتطلب تهيئة خادم البريد. في النسخة الحالية، يُفتح Gmail بمسودة جاهزة — ألصق رابط المشاركة ثم أرسل.
          </p>
        </div>
      </Modal>

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
