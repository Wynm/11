"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import type { Client, Invoice, InvoiceItem, Issuer } from "@/lib/invoice";
import { lineTotal, totals } from "@/lib/invoice";
import { num, percentLabel } from "@/lib/format";
import { BUSINESS_GROUPS } from "@/lib/business-lines";
import { Field, MoneyInput } from "./fields";

type Setter = (patch: Partial<Invoice>) => void;

const CASABLANCA_UP = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan"];
const CITIES = [...CASABLANCA_UP, "Salé", "Temara", "Safi", "El Jadida", "Beni Mellal", "Nador", "Khouribga", "Mohammedia", "Essaouira", "Laâyoune", "Dakhla"];

function DataList({ id, options }: { id: string; options: string[] }) {
  return (
    <datalist id={id}>
      {options.map((o) => (
        <option key={o} value={o} />
      ))}
    </datalist>
  );
}

export function MyDataPane({ inv, set }: { inv: Invoice; set: Setter }) {
  const issuer: Issuer = inv.issuer;
  const upd = (patch: Partial<Issuer>) => set({ issuer: { ...issuer, ...patch } });
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4">
      <Field label="الاسم الكامل أو اسم المقاولة" hint="كما هو في شهادة المقاول الذاتي أو السجل التجاري.">
        <input className="input" value={issuer.name} onChange={(e) => upd({ name: e.target.value })} placeholder="مثال: يوسف بنعلي" />
      </Field>
      <Field label="النشاط" hint="يظهر تحت اسمك في رأس الفاتورة.">
        <input className="input" value={issuer.activity} onChange={(e) => upd({ activity: e.target.value })} placeholder="مصوّر منتجات / مطوّر ويب" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="المعرّف المقاولاتي ICE" hint="15 رقمًا إلزاميًا.">
          <input
            className="input tnum text-left"
            style={{ direction: "ltr" }}
            value={issuer.ice}
            onChange={(e) => upd({ ice: e.target.value.replace(/[^\d]/g, "").slice(0, 15) })}
            placeholder="002345678900012"
            aria-invalid={issuer.ice.length > 0 && issuer.ice.length !== 15}
          />
        </Field>
        <Field label="المعرّف الجبائي IF">
          <input className="input tnum text-left" style={{ direction: "ltr" }} value={issuer.if} onChange={(e) => upd({ if: e.target.value })} placeholder="458670123" />
        </Field>
        <Field label="السجل التجاري RC (اختياري)">
          <input className="input tnum text-left" style={{ direction: "ltr" }} value={issuer.rc} onChange={(e) => upd({ rc: e.target.value })} placeholder="55287" />
        </Field>
        <Field label="رقم الضمان الاجتماعي (اختياري)">
          <input className="input tnum text-left" style={{ direction: "ltr" }} value={issuer.cnss} onChange={(e) => upd({ cnss: e.target.value })} placeholder="1234567" />
        </Field>
      </div>

      <Field label="العنوان المهني">
        <textarea className="input min-h-[64px] resize-y" value={issuer.address} onChange={(e) => upd({ address: e.target.value })} placeholder="حي النخيل، شارع الحسن الثاني، فاس" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="البريد الإلكتروني">
          <input className="input text-left" style={{ direction: "ltr" }} type="email" value={issuer.email} onChange={(e) => upd({ email: e.target.value })} placeholder="you@example.com" />
        </Field>
        <Field label="الهاتف">
          <input className="input text-left" style={{ direction: "ltr" }} value={issuer.phone} onChange={(e) => upd({ phone: e.target.value })} placeholder="+212 6 00 00 00 00" />
        </Field>
      </div>

      <div className="rounded-xl bg-pine-tint p-3.5">
        <div className="flex items-start gap-2 text-[12px] leading-relaxed text-pine">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            تُحفظ بياناتك تلقائيًا في هذا المتصفح فقط، وتُستعمل في كل فاتورة لاحقة. لا تُرسل إلى أي خادم.
          </span>
        </div>
      </div>

      <button
        type="button"
        className="btn-ghost w-full"
        onClick={() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 1800);
        }}
      >
        {saved ? <><Check className="h-4 w-4 text-pine" /> محفوظة</> : "تأكيد الحفظ"}
      </button>
    </div>
  );
}

export function ClientPane({ inv, set }: { inv: Invoice; set: Setter }) {
  const client: Client = inv.client;
  const upd = (patch: Partial<Client>) => set({ client: { ...client, ...patch } });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="اسم الشركة (اختياري)">
          <input className="input" value={client.company} onChange={(e) => upd({ company: e.target.value })} placeholder="Studio Nord SARL" />
        </Field>
        <Field label="الشخص المسؤول (اختياري)">
          <input className="input" value={client.name} onChange={(e) => upd({ name: e.target.value })} placeholder="سارة المنصوري" />
        </Field>
      </div>
      <Field label="المعرّف المقاولاتي ICE للعميل" hint="إلزامي إذا كان العميل شركة.">
        <input
          className="input tnum text-left"
          style={{ direction: "ltr" }}
          value={client.ice}
          onChange={(e) => upd({ ice: e.target.value.replace(/[^\d]/g, "").slice(0, 15) })}
          placeholder="001234567800034"
        />
      </Field>
      <Field label="البريد الإلكتروني" hint="يُستعمل لإنشاء مسودة الإرسال بدقة.">
        <input className="input text-left" style={{ direction: "ltr" }} type="email" value={client.email} onChange={(e) => upd({ email: e.target.value })} placeholder="client@company.ma" />
      </Field>
      <Field label="العنوان" hint="اختياري — يكفي المدينة عادة.">
        <textarea className="input min-h-[60px] resize-y" value={client.address} onChange={(e) => upd({ address: e.target.value })} placeholder="حي المعاريف، الدار البيضاء" />
      </Field>
      <div className="flex flex-wrap gap-1.5">
        {CITIES.slice(0, 10).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => upd({ address: client.address.includes(c) ? client.address : [client.address, c].filter(Boolean).join("، ") })}
            className="rounded-full border border-line bg-white px-2.5 py-1 text-[11.5px] font-bold text-muted transition hover:border-pine/40 hover:text-pine"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ItemsPane({
  inv,
  set,
  onInserted,
}: {
  inv: Invoice;
  set: Setter;
  onInserted?: () => void;
}) {
  const [group, setGroup] = useState<string>("photo");
  const [openPicker, setOpenPicker] = useState(false);
  const active = BUSINESS_GROUPS.find((g) => g.id === group) ?? BUSINESS_GROUPS[0];
  const t = totals(inv);

  const updItem = (id: string, patch: Partial<InvoiceItem>) =>
    set({ items: inv.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });

  const addItem = (seed?: Partial<InvoiceItem>) => {
    set({
      items: [
        ...inv.items,
        { id: `i${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, description: seed?.description ?? "", qty: seed?.qty ?? 1, unitPrice: seed?.unitPrice ?? 0 },
      ],
    });
    onInserted?.();
  };

  const insertLine = (desc: string, price: number) => {
    const last = inv.items[inv.items.length - 1];
    if (last && !last.description && last.unitPrice === 0) {
      updItem(last.id, { description: desc, unitPrice: price });
    } else {
      addItem({ description: desc, unitPrice: price });
    }
    setOpenPicker(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-[#FCFAF6] p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-ink">
            <Wand2 className="h-4 w-4 text-pine" />
            ابدأ بسطر جاهز
          </div>
          <button type="button" className="text-[11.5px] font-bold text-pine hover:underline" onClick={() => setOpenPicker((o) => !o)}>
            {openPicker ? "إخفاء" : "كل المهن"}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {BUSINESS_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setGroup(g.id);
                setOpenPicker(true);
              }}
              className={`rounded-lg border px-2 py-1 text-[11.5px] font-bold transition ${
                group === g.id && openPicker ? "border-pine bg-pine text-white" : "border-line bg-white text-muted hover:border-pine/40 hover:text-pine"
              }`}
            >
              <span className="me-1">{g.icon}</span>
              {g.title}
            </button>
          ))}
        </div>
        {openPicker ? (
          <div className="mt-2.5 space-y-1.5">
            {active.lines.map((l) => (
              <button
                key={l.t}
                type="button"
                onClick={() => insertLine(l.t, l.p)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-white px-2.5 py-2 text-right transition hover:border-pine/50 hover:bg-pine-tint"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-bold text-ink">{l.t}</span>
                  <span className="block text-[10.5px] text-muted">{l.desc ? `${l.desc} · ` : ""}بالـ{l.u ?? "وحدة"}</span>
                </span>
                <span className="tnum shrink-0 rounded-md bg-paper px-2 py-0.5 text-[11.5px] font-extrabold text-pine">{num(l.p)}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-2.5">
        {inv.items.map((it, idx) => (
          <div key={it.id} className="rounded-xl border border-line bg-white p-2.5">
            <div className="flex items-start gap-2">
              <span className="mt-2.5 w-4 shrink-0 text-center text-[11px] font-extrabold text-muted tnum">{idx + 1}</span>
              <input
                className="input !py-2 flex-1"
                placeholder="وصف الخدمة — مثال: جلسة تصوير منتجات"
                value={it.description}
                onChange={(e) => updItem(it.id, { description: e.target.value })}
                aria-label={`وصف السطر ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => {
                  const rest = inv.items.filter((x) => x.id !== it.id);
                  set({ items: rest.length ? rest : [{ id: `i${Date.now()}`, description: "", qty: 1, unitPrice: 0 }] });
                }}
                className="mt-0.5 rounded-lg p-2 text-muted transition hover:bg-clay/10 hover:text-clay"
                aria-label={`حذف السطر ${idx + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-[72px_1fr_auto] items-end gap-2 ps-6">
              <div>
                <span className="mb-1 block text-[10.5px] font-bold text-muted">الكمية</span>
                <input
                  inputMode="decimal"
                  className="input tnum !py-1.5 text-center"
                  style={{ direction: "ltr" }}
                  value={it.qty === 0 ? "" : it.qty}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value.replace(",", "."));
                    updItem(it.id, { qty: Number.isFinite(v) ? Math.max(0, v) : 0 });
                  }}
                  aria-label={`كمية السطر ${idx + 1}`}
                />
              </div>
              <div>
                <span className="mb-1 block text-[10.5px] font-bold text-muted">الثمن الفردي</span>
                <MoneyInput value={it.unitPrice} onChange={(n) => updItem(it.id, { unitPrice: n })} ariaLabel={`ثمن السطر ${idx + 1}`} />
              </div>
              <div className="min-w-[74px] text-left">
                <span className="mb-1 block text-[10.5px] font-bold text-muted">المجموع</span>
                <div className="tnum rounded-xl bg-paper px-2 py-2 text-[13px] font-extrabold text-ink" style={{ direction: "ltr" }}>
                  {num(lineTotal(it))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => addItem()} className="btn-ghost w-full border-dashed">
        <Plus className="h-4 w-4" />
        إضافة سطر
      </button>

      <div className="rounded-xl border border-line bg-[#FCFAF6] p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[12.5px] font-extrabold">الأسعار المدخلة</span>
          <div className="seg !p-0.5">
            {(["HT", "TTC"] as const).map((m) => (
              <button key={m} data-active={inv.taxMode === m} onClick={() => set({ taxMode: m })} type="button">
                {m === "HT" ? "بدون ضريبة" : "تشمل الضريبة"}
              </button>
            ))}
          </div>
        </div>
        <span className="label">نسبة الضريبة على القيمة المضافة</span>
        <div className="flex flex-wrap gap-1.5">
          {[20, 10, 7].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => set({ vatRate: r })}
              className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-extrabold transition ${
                inv.vatRate === r ? "border-pine bg-pine text-white" : "border-line bg-white text-ink hover:border-pine/40"
              }`}
            >
              {percentLabel(r)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => set({ vatRate: 0 })}
            className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-extrabold transition ${
              inv.vatRate === 0 ? "border-pine bg-pine text-white" : "border-line bg-white text-ink hover:border-pine/40"
            }`}
          >
            غير خاضع
          </button>
        </div>
        {inv.vatRate === null ? (
          <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-snug text-clay">
            <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            اختر نسبة الضريبة حتى تُعتبر الفاتورة جاهزة قانونيًا.
          </p>
        ) : null}
        <div className="mt-3 space-y-1 border-t border-line pt-2.5 text-[12.5px]">
          <div className="flex justify-between text-muted">
            <span>المجموع قبل الضريبة</span>
            <span className="tnum font-bold" style={{ direction: "ltr" }}>{num(t.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>الضريبة</span>
            <span className="tnum font-bold" style={{ direction: "ltr" }}>{inv.vatRate === null ? "—" : num(t.tax)}</span>
          </div>
          <div className="flex justify-between text-[14px] font-extrabold text-pine">
            <span>المجموع للدفع</span>
            <span className="tnum" style={{ direction: "ltr" }}>{num(t.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TermsPane({ inv, set }: { inv: Invoice; set: Setter }) {
  const presets = useMemo(
    () => [
      "الدفع بالتحويل البنكي خلال 30 يومًا من تاريخ الفاتورة، مع ذكر رقم الفاتورة في خانة البيان.",
      "الدفع نقدًا عند التسليم. المرجو التنسيق قبل 24 ساعة.",
      "50٪ تسبيقًا عند الطلب، والباقي عند التسليم.",
      "الدفع عبر الشيك أو التحويل خلال 15 يومًا.",
    ],
    [],
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="تاريخ الإصدار">
          <input type="date" className="input tnum" value={inv.issueDate} onChange={(e) => set({ issueDate: e.target.value })} />
        </Field>
        <Field label="تاريخ الاستحقاق">
          <input type="date" className="input tnum" value={inv.dueDate} min={inv.issueDate} onChange={(e) => set({ dueDate: e.target.value })} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[0, 15, 30, 45, 60].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              const base = new Date(`${inv.issueDate}T12:00:00Z`);
              base.setUTCDate(base.getUTCDate() + d);
              set({ dueDate: base.toISOString().slice(0, 10) });
            }}
            className="rounded-full border border-line bg-white px-2.5 py-1 text-[11.5px] font-bold text-muted transition hover:border-pine/40 hover:text-pine"
          >
            {d === 0 ? "فوري" : `${d} يومًا`}
          </button>
        ))}
      </div>

      <Field label="شروط الأداء" hint="تظهر أسفل الفاتورة، بجانب حسابك البنكي.">
        <textarea className="input min-h-[92px] resize-y" value={inv.paymentTerms} onChange={(e) => set({ paymentTerms: e.target.value })} />
      </Field>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => set({ paymentTerms: p })}
            className="max-w-full truncate rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-bold text-muted transition hover:border-pine/40 hover:text-pine"
            title={p}
          >
            {p.slice(0, 34)}…
          </button>
        ))}
      </div>

      <Field label="ملاحظات" hint="اختياري: شكرًا، تفاصيل تسليم، أو أي شرط إضافي.">
        <textarea className="input min-h-[76px] resize-y" value={inv.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="شكرًا لثقتكم." />
      </Field>

      <Field label="الحساب البنكي (RIB)" hint="يُعرض أسفل الفاتورة لتسهيل التحويل.">
        <input className="input tnum text-left" style={{ direction: "ltr" }} value={inv.issuer.rib} onChange={(e) => set({ issuer: { ...inv.issuer, rib: e.target.value.replace(/[^\d\s]/g, "").slice(0, 26) } })} placeholder="007 780 0001234567890123 45" />
      </Field>
      <Field label="البنك">
        <select className="input" value={inv.issuer.bankName} onChange={(e) => set({ issuer: { ...inv.issuer, bankName: e.target.value } })}>
          <option value="">اختر البنك…</option>
          {["Attijariwafa Bank", "Banque Populaire", "BMCE / Bank of Africa", "Société Générale", "CIH Bank", "Crédit Agricole", "CFG Bank", "Al Barid Bank"].map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </Field>
      <DataList id="cities" options={CITIES} />
    </div>
  );
}
