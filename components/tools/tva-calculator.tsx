"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Copy, Check } from "lucide-react";
import { num } from "@/lib/format";
import { ToolShell, SideCard } from "./shell";

type Mode = "add" | "extract";

const RATES = [20, 14, 10, 7, 0];

export function TvaCalculator() {
  const [mode, setMode] = useState<Mode>("add");
  const [rate, setRate] = useState(20);
  const [amount, setAmount] = useState("1000");
  const [copied, setCopied] = useState(false);

  const value = Math.max(0, Number(amount.replace(",", ".")) || 0);

  const result = useMemo(() => {
    const r = rate / 100;
    if (mode === "add") {
      const ht = value;
      const tva = Math.round(ht * r * 100) / 100;
      return { ht, tva, ttc: Math.round((ht + tva) * 100) / 100, base: ht };
    }
    const ttc = value;
    const ht = Math.round((ttc / (1 + r)) * 100) / 100;
    const tva = Math.round((ttc - ht) * 100) / 100;
    return { ht, tva, ttc, base: ttc };
  }, [mode, rate, value]);

  const copy = async () => {
    const text =
      mode === "add"
        ? `HT: ${num(result.ht)} MAD\nTVA ${rate}%: ${num(result.tva)} MAD\nTTC: ${num(result.ttc)} MAD`
        : `TTC: ${num(result.ttc)} MAD\nTVA ${rate}%: ${num(result.tva)} MAD\nHT: ${num(result.ht)} MAD`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <ToolShell
      eyebrow="حاسبة مجانية"
      title="احسب الضريبة على القيمة المضافة بدقة — درهمًا بدرهم."
      intro="بلّغ عن مبلغ HT ليُضاف إليه TVA، أو ادخل TTC لاستخراج الضريبة منه. نفس método المستخدم في فاتورا وفي التصاريح الشهرية."
      aside={
        <>
          <SideCard title="أي نسبة تنطبق عليّ؟">
            <p>
              <b className="text-ink">20٪</b> هي النسبة العادية على معظم الخدمات التجارية.
            </p>
            <p>
              <b className="text-ink">10٪</b> لبعض الأنشطة السياحية والنقل، و<b className="text-ink">7٪</b> لما يحدده
              القانون (منها قطاعات إبداعية معيّنة). راجع مدير الضرائب أو محاسبك قبل استعمال نسبة مخفضة.
            </p>
          </SideCard>
          <SideCard title="المقاول الذاتي معفى؟">
            <p>
              بموجب النظام الخاص للمقاولين الذاتيين، المهمة تخضع généralement لاقتطاع 1٪ بدلًا من TVA. إن كنت
              خاضعًا للضريبة العادية فعليك احتسابها وإعلانها كل شهر.
            </p>
          </SideCard>
          <div className="rounded-xl2 bg-ink p-5 text-white">
            <p className="text-[13px] leading-relaxed text-white/75">
              الحساب جاهز — حوّله إلى فاتورة مطابقة بأرقامك وشعارك في دقيقة.
            </p>
            <Link href="/new" className="btn-saffron mt-3 w-full justify-center !py-2.5 text-[13px]">
              أنشئ الفاتورة <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </>
      }
    >
      <div className="card p-6">
        <div className="seg w-full">
          <button type="button" data-active={mode === "add"} onClick={() => setMode("add")} className="flex-1">
            أضف TVA إلى المبلغ
          </button>
          <button type="button" data-active={mode === "extract"} onClick={() => setMode("extract")} className="flex-1">
            استخرج TVA من TTC
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-muted">
              {mode === "add" ? "المبلغ قبل الضريبة (HT)" : "المبلغ تامًّا مع الضريبة (TTC)"}
            </span>
            <div className="relative">
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input tnum pl-16 text-[20px] font-extrabold"
                dir="ltr"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-muted">
                MAD
              </span>
            </div>
          </label>
          <div>
            <span className="mb-1.5 block text-[12px] font-bold text-muted">النسبة</span>
            <div className="flex flex-wrap gap-1.5">
              {RATES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRate(r)}
                  className={`rounded-lg border px-3 py-2 text-[13px] font-extrabold transition ${
                    rate === r ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-ink/30"
                  }`}
                >
                  {r}٪
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-paper p-4">
            <div className="text-[11.5px] font-bold text-muted">المبلغ HT</div>
            <div className="tnum mt-1 text-[20px] font-extrabold">{num(result.ht)}</div>
          </div>
          <div className="rounded-xl border border-saffron/40 bg-saffron-soft/60 p-4">
            <div className="text-[11.5px] font-bold text-[#8A5A12]">الضريبة TVA {rate}٪</div>
            <div className="tnum mt-1 text-[20px] font-extrabold text-[#8A5A12]">{num(result.tva)}</div>
          </div>
          <div className="rounded-xl border border-pine/30 bg-pine-soft p-4">
            <div className="text-[11.5px] font-bold text-pine">المجموع TTC</div>
            <div className="tnum mt-1 text-[20px] font-extrabold text-pine">{num(result.ttc)}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-[11.5px] text-muted">يُحتسب بالدرهم والسنتيم دون كسور مفقودة.</span>
          <button type="button" onClick={copy} className="btn-ghost !py-2 text-[12px]">
            {copied ? <Check className="h-3.5 w-3.5 text-pine" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "نُسخ" : "نسخ النتيجة"}
          </button>
        </div>
      </div>

      <div className="card mt-5 p-6">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-pine" />
          <h2 className="text-[15px] font-extrabold">جدول سريع لـ 1000 درهم</h2>
        </div>
        <table className="mt-3 w-full text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11.5px] text-muted">
              <th className="py-2 text-right font-bold">النسبة</th>
              <th className="py-2 text-left font-bold">HT</th>
              <th className="py-2 text-left font-bold">TVA</th>
              <th className="py-2 text-left font-bold">TTC</th>
            </tr>
          </thead>
          <tbody>
            {RATES.filter((r) => r > 0).map((r) => (
              <tr key={r} className="border-b border-line/60 last:border-0">
                <td className="py-2 font-extrabold">{r}٪</td>
                <td className="tnum py-2 text-left">1.000,00</td>
                <td className="tnum py-2 text-left text-[#8A5A12]">{num((1000 * r) / 100)}</td>
                <td className="tnum py-2 text-left font-bold text-pine">{num(1000 + (1000 * r) / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ToolShell>
  );
}
