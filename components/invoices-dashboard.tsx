"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Check,
  CircleAlert,
  Clock3,
  Copy,
  FilePlus2,
  FileText,
  Inbox,
  Link2,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import type { Invoice } from "@/lib/invoice";
import { totals } from "@/lib/invoice";
import { num } from "@/lib/format";
import { store } from "@/lib/storage";
import { isCompliant } from "@/lib/compliance";
import { createShare } from "@/lib/share";
import { StatusPill, Toast } from "./editor/fields";
import { Brand } from "./brand";

type Filter = "all" | "draft" | "sent" | "paid" | "late";

const money = (n: number) => num(n);

function Stat({
  label,
  value,
  sub,
  tone = "ink",
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "ink" | "pine" | "saffron" | "clay";
  icon: typeof Banknote;
}) {
  const tones = {
    ink: "bg-ink text-white",
    pine: "bg-pine text-white",
    saffron: "bg-saffron text-ink",
    clay: "bg-clay text-white",
  } as const;
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-bold text-muted">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" strokeWidth={2.3} />
        </span>
      </div>
      <div className="tnum mt-3 text-[26px] font-extrabold leading-none" style={{ direction: "ltr", textAlign: "right" }}>
        {value}
        <span className="ms-1 text-[12px] font-bold text-muted">د.م</span>
      </div>
      {sub ? <div className="mt-1.5 text-[11.5px] text-muted">{sub}</div> : null}
    </div>
  );
}

export function InvoicesDashboard() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [sharing, setSharing] = useState<string | null>(null);

  const load = useCallback(() => setRows(store.list()), []);

  useEffect(() => {
    load();
    setReady(true);
  }, [load]);

  const withTotals = useMemo(
    () =>
      rows
        .map((r) => {
          const t = totals(r);
          const late = r.status !== "paid" && r.dueDate < new Date().toISOString().slice(0, 10);
          return { ...r, _t: t, _late: late, _ok: isCompliant(r) };
        })
        .sort((a, b) => b.createdAt - a.createdAt),
    [rows],
  );

  const stats = useMemo(() => {
    const paid = withTotals.filter((r) => r.status === "paid").reduce((s, r) => s + r._t.total, 0);
    const sent = withTotals.filter((r) => r.status === "sent").reduce((s, r) => s + r._t.total, 0);
    const late = withTotals.filter((r) => r._late).reduce((s, r) => s + r._t.total, 0);
    const drafts = withTotals.filter((r) => r.status === "draft").length;
    const total = withTotals.filter((r) => r.kind === "invoice").length;
    return { paid, sent, late, drafts, total, collected: paid + sent > 0 ? Math.round((paid / (paid + sent)) * 100) : 0 };
  }, [withTotals]);

  const filtered = useMemo(() => {
    let list = withTotals;
    if (filter === "all") list = withTotals;
    else if (filter === "late") list = withTotals.filter((r) => r._late);
    else list = withTotals.filter((r) => r.status === filter);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.number.toLowerCase().includes(needle) ||
          (r.client.company || r.client.name).toLowerCase().includes(needle) ||
          r.items.some((i) => i.description.toLowerCase().includes(needle)),
      );
    }
    return list;
  }, [withTotals, filter, q]);

  const togglePaid = (r: Invoice) => {
    const next = { ...r, status: r.status === "paid" ? ("sent" as const) : ("paid" as const), paidAt: r.status === "paid" ? null : Date.now() };
    store.save(next);
    load();
    setToast(next.status === "paid" ? "سُجّلت الفاتورة كمُؤدّاة." : "أُعيدت إلى «مُرسلة».");
  };

  const share = async (r: Invoice) => {
    setSharing(r.number);
    try {
      const ref = await createShare(r);
      try {
        await navigator.clipboard.writeText(ref.url);
        setToast("نُسخ رابط المشاركة — أرسله لعميلك.");
      } catch {
        window.prompt("انسخ الرابط:", ref.url);
      }
    } catch (e) {
      setToast((e as Error).message);
    } finally {
      setSharing(null);
    }
  };

  const remove = (r: Invoice) => {
    if (!confirm(`حذف ${r.number} نهائيًا من متصفحك؟`)) return;
    store.remove(r.createdAt);
    load();
    setToast("حُذفت المسودة.");
  };

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "الكل" },
    { id: "draft", label: "مسودات" },
    { id: "sent", label: "مُرسلة" },
    { id: "paid", label: "مُؤدّاة" },
    { id: "late", label: "متأخرة" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden text-[13px] font-bold text-muted hover:text-ink sm:block">الرئيسية</Link>
            <Link href="/new" className="btn-primary !px-4 !py-2.5">
              <Plus className="h-4 w-4" /> فاتورة جديدة
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight sm:text-[34px]">فواتيري</h1>
            <p className="mt-1 text-[13.5px] text-muted">
              {ready && withTotals.length === 0
                ? "لم تبدأ بعد — أول فاتورة تستغرق أقل من دقيقة."
                : `${withTotals.length} مستندًا محفوظًا في هذا المتصفح.`}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="input !pr-9"
              placeholder="ابحث برقم أو عميل أو خدمة…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="بحث"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="المُحصّل" value={money(stats.paid)} sub={`${stats.collected}٪ من قيمة الفواتير المرسلة`} tone="pine" icon={Banknote} />
          <Stat label="في انتظار الأداء" value={money(stats.sent)} sub={`${withTotals.filter((r) => r.status === "sent").length} فاتورة مُرسلة`} tone="saffron" icon={Clock3} />
          <Stat label="متأخر عن الاستحقاق" value={money(stats.late)} sub={`${withTotals.filter((r) => r._late).length} فاتورة تجاوزت أجلها`} tone="clay" icon={CircleAlert} />
          <Stat label="مسودات غير مرسلة" value={String(stats.drafts)} sub={`${withTotals.filter((r) => !r._ok).length} تحتاج إكمالًا`} tone="ink" icon={ReceiptText} />
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-3 py-1.5 text-[12.5px] font-extrabold transition ${
                  filter === f.id ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Link href="/new?kind=quote" className="text-[12.5px] font-bold text-pine hover:underline">
            + عرض ثمن
          </Link>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl2 border border-line bg-white shadow-card">
          {!ready ? null : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper text-muted">
                {withTotals.length === 0 ? <Inbox className="h-6 w-6" /> : <Search className="h-6 w-6" />}
              </span>
              <h2 className="mt-4 text-[17px] font-extrabold">
                {withTotals.length === 0 ? "لا شيء هنا بعد — لنبدأ" : "لا نتائج مطابقة"}
              </h2>
              <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-muted">
                {withTotals.length === 0
                  ? "أنشئ فاتورتك الأولى، وستظهر هنا مع حالتها تلقائيًا."
                  : "جرّب رقمًا آخر، أو اسم عميل مختلف، أو أزل الفلاتر."}
              </p>
              {withTotals.length === 0 ? (
                <Link href="/new" className="btn-primary mt-5">
                  <FilePlus2 className="h-4 w-4" /> إنشاء فاتورة
                </Link>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-line/80">
              {filtered.map((r) => (
                <li key={`${r.createdAt}-${r.number}`} className="group flex flex-col gap-3 px-4 py-3.5 transition hover:bg-[#FCFAF6] sm:flex-row sm:items-center sm:px-5">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${r.kind === "quote" ? "bg-ink/[0.06] text-ink" : "bg-pine-soft text-pine"}`}>
                      {r.kind === "quote" ? <FileText className="h-[18px] w-[18px]" /> : <ReceiptText className="h-[18px] w-[18px]" />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tnum text-[13.5px] font-extrabold">{r.number}</span>
                        <StatusPill status={r.status} />
                        {r._late ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-clay/20 bg-clay/10 px-2 py-0.5 text-[10.5px] font-extrabold text-clay">
                            <Clock3 className="h-3 w-3" /> متأخرة
                          </span>
                        ) : null}
                        {!r._ok ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-saffron/30 bg-saffron-soft px-2 py-0.5 text-[10.5px] font-extrabold text-[#9A6A15]">
                            <CircleAlert className="h-3 w-3" /> تحتاج إكمالًا
                          </span>
                        ) : r.kind === "invoice" ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-pine/70">
                            <BadgeCheck className="h-3 w-3" /> مطابقة
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 truncate text-[12.5px] text-muted">
                        {r.client.company || r.client.name || (r.kind === "quote" ? "عرض بدون عميل" : "فاتورة بدون عميل")}
                        <span className="mx-1.5 text-line">·</span>
                        {r.issueDate}
                      </div>
                    </div>
                  </div>

                  <div className="tnum flex items-baseline gap-1 text-right sm:w-32 sm:justify-end" style={{ direction: "ltr" }}>
                    <span className="text-[15px] font-extrabold text-ink">{money(r._t.total)}</span>
                    <span className="text-[10.5px] font-bold text-muted">MAD</span>
                  </div>

                  <div className="flex items-center gap-1 sm:opacity-70 sm:transition sm:group-hover:opacity-100">
                    <button onClick={() => togglePaid(r)} className="rounded-lg p-2 text-muted transition hover:bg-pine-soft hover:text-pine" title={r.status === "paid" ? "إلغاء الأداء" : "تحديد كمُؤدّاة"}>
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => share(r)} disabled={sharing === r.number} className="rounded-lg p-2 text-muted transition hover:bg-pine-soft hover:text-pine" title="نسخ رابط المشاركة">
                      <Link2 className="h-4 w-4" />
                    </button>
                    <Link href={`/new?kind=${r.kind}&from=${encodeURIComponent(r.number)}`} className="rounded-lg p-2 text-muted transition hover:bg-saffron-soft hover:text-[#9A6A15]" title="نسخ كجديد">
                      <Copy className="h-4 w-4" />
                    </Link>
                    <Link href={`/new?kind=${r.kind}&edit=${r.createdAt}`} className="rounded-lg p-2 text-muted transition hover:bg-paper hover:text-ink" title="فتح المحرر">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <button onClick={() => remove(r)} className="rounded-lg p-2 text-muted transition hover:bg-clay/10 hover:text-clay" title="حذف">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-line bg-white/70 px-4 py-3 text-[12px] leading-relaxed text-muted">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-pine" />
          الأرقام محسوبة من مستندات هذا المتصفح فقط. للاحتفاظ بنسخة احتياطية، صدّر PDF لكل فاتورة أو استعمل رابط المشاركة.
        </div>
      </main>

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
