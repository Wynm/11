"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Check,
  Copy,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { Invoice } from "@/lib/invoice";
import { totals } from "@/lib/invoice";
import { num } from "@/lib/format";
import { store } from "@/lib/storage";
import { isCompliant } from "@/lib/compliance";
import {
  dueTone,
  gmailLink,
  reminderFor,
  REMINDER_LABELS,
  whatsappLink,
  type ReminderTone,
} from "@/lib/reminders";
import { Toast } from "./editor/fields";
import { Brand } from "./brand";

type Row = Invoice & { _total: number; _days: number | null; _tone: ReminderTone | null; _ok: boolean };

const TONES: ReminderTone[] = ["before", "due", "late", "final"];

/** Normalises a client name so "Studio Nord SARL" and "studio nord" collapse together. */
const clientKey = (inv: Invoice) =>
  (inv.client.company || inv.client.name || "").toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, "");

export function Collections() {
  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [tone, setTone] = useState<ReminderTone>("late");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const list = store.list().filter((i) => i.kind === "invoice" && i.status !== "paid");
    const today = new Date().toISOString().slice(0, 10);
    const mapped: Row[] = list.map((i) => ({
      ...i,
      _total: totals(i).total,
      _days: Math.round(
        (new Date(`${i.dueDate}T12:00:00Z`).getTime() - new Date(`${today}T12:00:00Z`).getTime()) / 86_400_000,
      ),
      _tone: dueTone(i),
      _ok: isCompliant(i),
    }));
    mapped.sort((a, b) => (a._days ?? 0) - (b._days ?? 0));
    setRows(mapped);
    setReady(true);
    const first = mapped.find((r) => r._tone);
    if (first) {
      setOpen(first.createdAt);
      setTone(first._tone as ReminderTone);
    }
  }, []);

  const stats = useMemo(() => {
    const late = rows.filter((r) => (r._days ?? 0) < 0);
    const soon = rows.filter((r) => (r._days ?? 0) >= 0 && (r._days ?? 0) <= 7);
    return {
      late: late.reduce((s, r) => s + r._total, 0),
      lateCount: late.length,
      soon: soon.reduce((s, r) => s + r._total, 0),
      soonCount: soon.length,
      open: rows.reduce((s, r) => s + r._total, 0),
    };
  }, [rows]);

  const current = rows.find((r) => r.createdAt === open) || null;
  const text = current ? reminderFor(current, tone, "email") : "";
  const messageOnly = text.split("\n").slice(2).join("\n");

  const copy = async () => {
    await navigator.clipboard.writeText(messageOnly);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
    setToast("نُسخت الرسالة — أرسلها كما هي، أو عدّلها.");
  };

  const byClient = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number; worst: number }>();
    for (const r of rows) {
      const k = clientKey(r) || "—";
      const entry = map.get(k) ?? { name: r.client.company || r.client.name || "—", total: 0, count: 0, worst: 0 };
      entry.total += r._total;
      entry.count += 1;
      entry.worst = Math.min(entry.worst, r._days ?? 0);
      map.set(k, entry);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [rows]);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2">
            <Link href="/invoices" className="btn-ghost !px-3 !py-2 text-[12.5px]">
              كل المستندات
            </Link>
            <Link href="/new" className="btn-primary !px-4 !py-2.5">
              فاتورة جديدة
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="chip">
              <TrendingUp className="h-3.5 w-3.5 text-pine" />
              التحصيل
            </span>
            <h1 className="mt-3 text-[28px] font-extrabold tracking-tight sm:text-[34px]">فلوسك عند الآخرين.</h1>
            <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-muted">
              الفواتير لا تُدفع لأن أحدًا لم يذكّر بها. هنا كل ما لم يُؤدَّ بعد، مرتّبًا بالأقدم، مع رسالة جاهزة
              بضغطة — بالعربية أو الفرنسية، بمرجعها القانوني.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="إجمالي غير المحصّل" value={`${num(stats.open)} د.م`} tone="ink" icon={Banknote} />
          <Metric label="متأخر عن الأجل" value={`${num(stats.late)} د.م`} sub={`${stats.lateCount} فاتورة`} tone="clay" icon={AlarmClock} />
          <Metric label="يستحق هذا الأسبوع" value={`${num(stats.soon)} د.م`} sub={`${stats.soonCount} فاتورة`} tone="saffron" icon={BadgeCheck} />
          <Metric
            label="يحتاج تذكيرًا اليوم"
            value={String(rows.filter((r) => r._tone).length)}
            sub="جاهز للإرسال"
            tone="pine"
            icon={MessageCircle}
          />
        </div>

        {!ready ? null : rows.length === 0 ? (
          <div className="card mt-6 p-10 text-center">
            <BadgeCheck className="mx-auto h-10 w-10 text-pine/30" />
            <h2 className="mt-3 text-[17px] font-extrabold">لا شيء معلّقًا.</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
              كل فاتورة أصدرتها مؤدّاة، أو لم تصدر بعد. اصنع فاتورة جديدة وستظهر هنا حتى تُدفع.
            </p>
            <Link href="/new" className="btn-primary mx-auto mt-5 w-fit">
              فاتورة جديدة <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_1fr]">
            <div className="space-y-2.5">
              {rows.map((r) => {
                const late = (r._days ?? 0) < 0;
                const active = open === r.createdAt;
                return (
                  <button
                    key={r.createdAt}
                    onClick={() => {
                      setOpen(r.createdAt);
                      setTone(r._tone ?? (late ? "late" : "due"));
                    }}
                    className={`w-full rounded-xl2 border p-4 text-right transition ${
                      active ? "border-ink bg-white shadow-card" : "border-line bg-white/70 hover:border-ink/25"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[13.5px] font-extrabold">{r.client.company || r.client.name || "بدون عميل"}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
                          <span className="tnum">{r.number}</span>
                          <span>·</span>
                          <span>أجل {r.dueDate}</span>
                          {!r._ok ? <span className="rounded bg-clay/10 px-1.5 py-0.5 font-bold text-clay">ناقصة شرطًا</span> : null}
                        </div>
                      </div>
                      <div className="shrink-0 text-left">
                        <div className="tnum text-[14px] font-extrabold">{num(r._total)}</div>
                        <div
                          className={`mt-0.5 text-[11px] font-bold ${
                            late ? "text-clay" : (r._days ?? 0) <= 7 ? "text-[#8A5A12]" : "text-pine"
                          }`}
                        >
                          {late ? `متأخر ${Math.abs(r._days ?? 0)} يومًا` : `باقٍ ${r._days ?? 0} يومًا`}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {current ? (
              <div className="card h-fit p-5 lg:sticky lg:top-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] font-extrabold">رسالة جاهزة</h2>
                    <p className="mt-0.5 text-[11.5px] text-muted">{REMINDER_LABELS[tone].hint}</p>
                  </div>
                  <span className="rounded-full bg-paper px-2 py-1 text-[10.5px] font-bold text-muted">
                    {current.language === "fr" ? "Français" : "عربي"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`rounded-lg border px-2.5 py-1.5 text-[11.5px] font-extrabold transition ${
                        tone === t ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-ink/30"
                      }`}
                    >
                      {REMINDER_LABELS[t].ar}
                    </button>
                  ))}
                </div>

                <pre
                  dir={current.language === "fr" ? "ltr" : "rtl"}
                  className="mt-3 max-h-[300px] overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-paper p-3.5 text-[12px] leading-[1.85]"
                >
                  {text}
                </pre>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <a href={gmailLink(current, tone)} target="_blank" rel="noopener noreferrer" className="btn-primary justify-center !py-2.5 text-[12.5px]">
                    <Mail className="h-3.5 w-3.5" /> إرسال بالبريد
                  </a>
                  <a href={whatsappLink(current, tone)} target="_blank" rel="noopener noreferrer" className="btn-ghost justify-center !py-2.5 text-[12.5px]">
                    <MessageCircle className="h-3.5 w-3.5" /> واتساب
                  </a>
                  <button onClick={copy} className="btn-ghost justify-center !py-2.5 text-[12.5px]">
                    {copied ? <Check className="h-3.5 w-3.5 text-pine" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "نُسخ" : "نسخ النص"}
                  </button>
                  <Link href={`/new?kind=invoice&edit=${current.createdAt}`} className="btn-ghost justify-center !py-2.5 text-[12.5px]">
                    تعديل الفاتورة
                  </Link>
                </div>

                {!current.client.phone && !current.client.email ? (
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
                    <Phone className="mt-0.5 h-3 w-3 shrink-0" />
                    أضف هاتف العميل أو بريده من تبويب «العميل» ليُرسل التذكير بنقرة واحدة في المرات القادمة.
                  </p>
                ) : null}

                <div className="mt-4 border-t border-line pt-3">
                  <h3 className="text-[12px] font-extrabold text-muted">حالة بعد الإرسال</h3>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        store.save({ ...current, status: "paid", paidAt: Date.now() });
                        setRows((prev) => prev.filter((r) => r.createdAt !== current.createdAt));
                        setOpen(null);
                        setToast("سُجّلت كمؤدّاة — مبروك.");
                      }}
                      className="btn-saffron flex-1 justify-center !py-2.5 text-[12.5px]"
                    >
                      <Check className="h-3.5 w-3.5" /> دُفعت الآن
                    </button>
                    <Link href="/invoices" className="btn-ghost justify-center !py-2.5 text-[12.5px]">
                      اللوحة
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {byClient.length > 1 ? (
          <section className="mt-10">
            <h2 className="text-[17px] font-extrabold">الرصيد لكل عميل</h2>
            <p className="mt-1 text-[12.5px] text-muted">رسالة واحدة لعميل واحد أفضل من خمس رسائل — هذا ما تدين به لك السوق.</p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {byClient.map((c) => (
                <div key={c.name} className="card flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-extrabold">{c.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted">
                      {c.count} فاتورة {c.worst < 0 ? `· أقدمها متأخر ${Math.abs(c.worst)} يومًا` : ""}
                    </div>
                  </div>
                  <div className="tnum shrink-0 text-[14px] font-extrabold text-clay">{num(c.total)}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-line bg-white/70 px-5 py-4">
          <p className="max-w-xl text-[12.5px] leading-relaxed text-muted">
            التذكير المؤدّب يرفع التحصيل فعليًا. وأسرع تذكير هو فاتورة مطابقة من أول مرة — فحص الجاهزية يمنع الرفض قبل
            الإرسال.
          </p>
          <Link href="/pro" className="btn-ghost !py-2 text-[12px]">
            <Sparkles className="h-3.5 w-3.5 text-saffron" /> شعارك على التذكيرات — برو
          </Link>
        </div>
      </main>

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "ink" | "clay" | "saffron" | "pine";
  icon: typeof Banknote;
}) {
  const tones = {
    ink: "bg-ink text-white",
    clay: "bg-clay text-white",
    saffron: "bg-saffron text-ink",
    pine: "bg-pine text-white",
  } as const;
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <span className="text-[11.5px] font-bold text-muted">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2.3} />
        </span>
      </div>
      <div className="tnum mt-2.5 text-[21px] font-extrabold leading-none">{value}</div>
      {sub ? <div className="mt-1 text-[11px] text-muted">{sub}</div> : null}
    </div>
  );
}
