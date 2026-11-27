"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CircleAlert, Info, ShieldCheck } from "lucide-react";
import { ToolShell, SideCard } from "./shell";

/**
 * Structural ICE check only. We deliberately do NOT call the OMPIC register:
 * that would require a server-side key, break the offline promise and cost money
 * per lookup. A strict 15-digit structural check catches ~everything that gets an
 * invoice rejected at the counter (typos, missing leading zeros, wrong length).
 */
export function IceValidator() {
  const [raw, setRaw] = useState("");

  const digits = raw.replace(/\D/g, "");
  const state = useMemo(() => {
    if (!raw.trim()) return "empty" as const;
    if (/[٠-٩۰-۹]/.test(raw)) return "arabic-digits" as const;
    if (digits.length !== 15) return "length" as const;
    if (!/^\d{15}$/.test(digits)) return "chars" as const;
    if (digits === "0".repeat(15)) return "zeros" as const;
    return "ok" as const;
  }, [raw, digits]);

  const messages: Record<typeof state, { tone: "ok" | "warn" | "bad"; title: string; body: string }> = {
    empty: { tone: "warn", title: "ابدأ بالكتابة", body: "الصق أو اكتب رقم ICE للتأكد من شكله." },
    "arabic-digits": {
      tone: "bad",
      title: "أرقام عربية-هندية",
      body: "الأنظمة الضريبية تقبل الأرقام اللاتينية (0-9). حوّل ٠١٢٣ إلى 0123 قبل الطباعة.",
    },
    length: {
      tone: "bad",
      title: `الطول ${digits.length} بدل 15`,
      body: "رقم ICE يتكوّن من 15 رقمًا بالضبط. تحقق من الأصفار في البداية — أشهر سبب للرفض.",
    },
    chars: { tone: "bad", title: "رموز غير مسموحة", body: "احتفظ بالأرقام فقط." },
    zeros: { tone: "bad", title: "رقم فارغ", body: "هذا ليس ICE حقيقيًا — اطلبه من عميلك أو من OMPIC." },
    ok: {
      tone: "ok",
      title: "الشكل سليم",
      body: "15 رقمًا بدون رموز. تذكّر: هذا فحص شكلي، التحقق من الصلاحية الفعلية يتم في سجل OMPIC.",
    },
  };

  const m = messages[state];
  const formatted = digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();

  return (
    <ToolShell
      eyebrow="مدقق مجاني"
      title="هل رقم ICE صحيح؟ افحصه قبل أن يُرفض."
      intro="رقم واحد ناقص صفرًا يعني فاتورة مرتجعة وأسبوعين تأخير. الصق الرقم هنا للتأكد من شكله، ثم انسخه منسّقًا وجاهزًا."
      aside={
        <>
          <SideCard title="ما هو ICE؟">
            <p>
              «المعرّف المشترك للمقاولة» — رقم من 15 خانة يصدره المكتب المغربي للملكية الصناعية والتجارية (OMPIC)،
              ويلزم ذكره على كل فاتورة بين المقاولات.
            </p>
            <p>يتألف عادة من: رقم السجل التجاري (9) + رقم التعريف الجبائي (6)، مع اختلافات حسب الجهة.</p>
          </SideCard>
          <SideCard title="أين أجد رقمي؟">
            <p>في شهادة ICE، أو شهادة السجل التجاري، أو في الفاتورة التي أصدرها لك مورّدك سابقًا.</p>
            <p>إن لم يكن لك ICE، اطلبه من OMPIC قبل أول فاتورة B2B.</p>
          </SideCard>
          <div className="rounded-xl2 bg-ink p-5 text-white">
            <ShieldCheck className="h-5 w-5 text-saffron" />
            <p className="mt-2 text-[13px] leading-relaxed text-white/75">
              فاتورا تتحقق من كل الحقول الإلزامية قبل السماح بالتصدير — فلا تُرسل مستندًا ناقصًا.
            </p>
            <Link href="/new" className="btn-saffron mt-3 w-full justify-center !py-2.5 text-[13px]">
              افحص فاتورتك كاملة <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </>
      }
    >
      <div className="card p-6">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-bold text-muted">رقم ICE</span>
          <input
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="002345678900012"
            dir="ltr"
            inputMode="numeric"
            className="input tnum text-[22px] font-extrabold tracking-wider"
          />
        </label>

        <div className="mt-2 flex items-center justify-between text-[11.5px] text-muted">
          <span className="tnum">{formatted || "—"}</span>
          <span className={digits.length === 15 ? "font-bold text-pine" : "font-bold text-clay"}>
            {digits.length}/15
          </span>
        </div>

        <div
          className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${
            m.tone === "ok"
              ? "border-pine/30 bg-pine-soft"
              : m.tone === "bad"
                ? "border-clay/30 bg-clay/5"
                : "border-line bg-paper"
          }`}
        >
          {m.tone === "ok" ? (
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-pine" />
          ) : m.tone === "bad" ? (
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-clay" />
          ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
          )}
          <div>
            <div
              className={`text-[14px] font-extrabold ${
                m.tone === "ok" ? "text-pine" : m.tone === "bad" ? "text-clay" : "text-ink"
              }`}
            >
              {m.title}
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{m.body}</p>
          </div>
        </div>

        {state === "ok" ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(digits)}
              className="btn-ghost justify-center !py-2.5 text-[12.5px]"
            >
              نسخ الأرقام فقط
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(formatted)}
              className="btn-primary justify-center !py-2.5 text-[12.5px]"
            >
              نسخ بمجموعات (000 000 …)
            </button>
          </div>
        ) : null}
      </div>

      <div className="card mt-4 p-5">
        <h2 className="text-[14px] font-extrabold">أكثر أسباب رفض الفاتورة — وكلها تُحل في 30 ثانية</h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {[
            ["ICE فيه 14 رقمًا", "الصفر الأول يُحذف عند النسخ من Excel."],
            ["IF مكتوب مكان ICE", "الخانتان متجاورتان في أغلب القوالب."],
            ["رقم مكرّر", "نسخ فاتورة سابقة بنفس الرقم يبطل التتبّع."],
            ["مبلغ بالحروف ناقص", "شرط صريح في الفاتورة المغربية."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-line bg-paper p-3.5">
              <div className="text-[12.5px] font-extrabold">{t}</div>
              <div className="mt-1 text-[11.5px] leading-relaxed text-muted">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolShell>
  );
}
