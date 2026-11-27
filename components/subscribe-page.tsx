"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Mail,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { activateLicense, priceLabel, PRO_PRICE, proDaysLeft, signOutPro, type ProState } from "@/lib/pro";
import { BUSINESS } from "@/lib/business";
import { usePro } from "@/lib/use-pro";
import { Brand } from "@/components/brand";
import { Toast } from "@/components/editor/fields";

const PRO_FEATURES = [
  "شعارك وألوانك على كل مستند (ترويسة مخصّصة)",
  "إخفاء سطر «أُنجز بواسطة فاتورا» من الفاتورة",
  "مفتاح تفعيل دائم — يعمل دون إنترنت ودون حساب",
  "فواتير وعروض أثمنة غير محدودة (بدون حد 5 مستندات)",
  "تحديثات مجانية خلال مدة الاشتراك",
];

const FAQ = [
  {
    q: "كيف يصلني المفتاح؟",
    a: "بعد التحويل تفتح واتساب أو البريد وتلصق معلومات الطلب ومرفق التحويل. تصلك رسالة فيها المفتاح خلال دقائق في أوقات العمل — وقبل ذلك جرّب النسخة المجانية بكل مزاياها.",
  },
  {
    q: "هل المفتاح يعمل على عدة أجهزة؟",
    a: "المفتاح مرتبط ببريدك لا بجهاز واحد: يمكنك تفعيله على حاسوبك وهاتفك. من يملك المفتاح يستطيع استعماله، لذلك احتفظ به لنفسك.",
  },
  {
    q: "هل أحتاج حسابًا أو إنترنتًا لاستخدامه؟",
    a: "لا. كل شيء يعمل في متصفحك: لا حساب، لا رفع للبيانات. التفعيل نفسه يتحقق من توقيع رقمي محليًا، لذلك يعمل المفتاح حتى دون اتصال.",
  },
  {
    q: "وإذا لم يناسبني؟",
    a: "أبلغنا خلال 14 يومًا باسترداد كامل، بدون أسئلة. نريد مستخدمين راضين لا اشتراكات صامتة.",
  },
];

const WHATSAPP = BUSINESS.whatsapp;
const EMAIL = BUSINESS.email;

export function SubscribePage() {
  const [pro, refresh] = usePro();
  const [busy, setBusy] = useState<"monthly" | "yearly" | null>(null);
  const [key, setKey] = useState("");
  const [activating, setActivating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const orderMessage = (plan: "monthly" | "yearly") =>
    encodeURIComponent(
      `السلام عليكم، أريد تفعيل فاتورا برو — خطة ${plan === "yearly" ? "سنوية" : "شهرية"}.\nالاسم: \nالبريد: \nرقم مرجع التحويل: `,
    );

  const waLink = useMemo(
    () => (plan: "monthly" | "yearly") => `https://wa.me/${WHATSAPP}?text=${orderMessage(plan)}`,
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const onActivate = async () => {
    if (!key.trim()) return;
    setActivating(true);
    const res = await activateLicense(key);
    setActivating(false);
    if (res.ok) {
      setToast("تم التفعيل — كل المزايا مفتوحة الآن.");
      setKey("");
      refresh();
    } else {
      setToast(res.message);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
      <div className="flex items-center justify-between">
        <Brand />
        <Link href="/new" className="btn-ghost">
          العودة للمحرّر
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <section className="mx-auto mt-12 max-w-2xl text-center">
        <span className="chip">
          <Sparkles className="h-3.5 w-3.5 text-saffron" />
          فاتورا برو
        </span>
        <h1 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight sm:text-[44px]">
          فاتورتك، بهويتك.
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
          النسخة المجانية تُنجز العمل. برو يجعل المستند يبدو كأن مكتب محاسبة خلفه: شعارك، ألوانك، وشعور أنك لست
          مستقلًا يجرّب الحظ.
        </p>
      </section>

      {pro.active ? <ProPanel pro={pro} onChange={refresh} /> : null}

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="card p-7">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[19px] font-extrabold">المجاني</h2>
            <span className="text-[28px] font-extrabold text-pine">0 د.م</span>
          </div>
          <p className="mt-1 text-[13.5px] text-muted">إلى الأبد. بدون بطاقة.</p>
          <ul className="mt-6 space-y-3 text-[14px]">
            {["حتى 5 مستندات محفوظة", "فحص مطابقة قانوني كامل", "مبلغ بالحروف + PDF", "روابط مشاركة"].map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-pine" strokeWidth={3} />
                <span className="text-ink/80">{f}</span>
              </li>
            ))}
          </ul>
          <Link href="/new" className="btn-primary mt-8 w-full">
            ابدأ الآن
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-xl2 border border-pine bg-ink p-7 text-white shadow-lift">
          <div className="absolute -left-10 -top-12 h-44 w-44 rounded-full bg-saffron/25 blur-2xl" />
          <div className="flex items-baseline justify-between">
            <h2 className="text-[19px] font-extrabold">فاتورا برو</h2>
            <div className="text-left">
              <span className="text-[28px] font-extrabold text-saffron">{PRO_PRICE.yearly} د.م</span>
              <span className="text-[13px] font-bold text-white/60">/سنة</span>
            </div>
          </div>
          <p className="mt-1 text-[13.5px] text-white/60">
            أو {PRO_PRICE.monthly} د.م/شهر — أقل من ثمن فاتورة واحدة.
          </p>
          <ul className="mt-6 space-y-3 text-[14px]">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-saffron" strokeWidth={3} />
                <span className="text-white/85">{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setBusy("yearly")}
              className="btn-saffron w-full justify-center"
            >
              <CalendarClock className="h-4 w-4" />
              سنوي — {priceLabel("yearly")}
            </button>
            <button
              type="button"
              onClick={() => setBusy("monthly")}
              className="w-full justify-center rounded-lg border border-white/25 px-4 py-2.5 text-[14px] font-bold text-white/90 transition hover:bg-white/10"
            >
              شهري — {priceLabel("monthly")}
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] text-white/40">
            تحويل بنكي أو CashPlus · التفعيل بمفتاح يدوم دون إنترنت
          </p>
        </div>
      </div>

      {busy ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-lift">
            <div className="flex items-start justify-between">
              <h3 className="text-[18px] font-extrabold">تفعيل الخطة {busy === "yearly" ? "السنوية" : "الشهرية"}</h3>
              <button type="button" onClick={() => setBusy(null)} className="text-muted hover:text-ink">
                ✕
              </button>
            </div>
            <ol className="mt-5 space-y-4 text-[13.5px] leading-relaxed">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine text-[12px] font-bold text-white">
                  1
                </span>
                <div>
                  حوّل <b>{busy === "yearly" ? PRO_PRICE.yearly : PRO_PRICE.monthly} د.م</b> إلى الحساب التالي:
                  <div className="mt-2 rounded-lg border border-dashed border-line bg-white px-3 py-2 text-[12.5px] leading-relaxed">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted">RIB</span>
                      <div className="flex items-center gap-2">
                        <code className="tnum text-[12px]">{BUSINESS.bank.display}</code>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(BUSINESS.bank.rib);
                            setCopied(true);
                            window.setTimeout(() => setCopied(false), 2000);
                          }}
                          className="text-muted hover:text-pine"
                          aria-label="نسخ RIB"
                        >
                          {copied ? <Check className="h-3.5 w-3.5 text-pine" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="mt-1">
                      فاتورا — {BUSINESS.bank.holder} · {BUSINESS.bank.name}
                    </div>
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine text-[12px] font-bold text-white">
                  2
                </span>
                <div>أرسل وصل التحويل (أو مرجع العملية) عبر واتساب أو البريد مع بريدك الإلكتروني.</div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine text-[12px] font-bold text-white">
                  3
                </span>
                <div>
                  تصلك رسالة فيها <b>مفتاح التفعيل</b> — تلصقه في الأسفل وتنتهي الحكاية.
                </div>
              </li>
            </ol>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <a
                href={waLink(busy as "monthly" | "yearly")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary justify-center"
              >
                <MessageCircle className="h-4 w-4" />
                واتساب
              </a>
              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(`تفعيل فاتورا برو — ${busy}`)}`}
                className="btn-ghost justify-center"
              >
                <Mail className="h-4 w-4" />
                البريد
              </a>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted">
              استرداد كامل خلال 14 يومًا — بدون أسئلة.
            </p>
          </div>
        </div>
      ) : null}

      <section className="card mt-14 p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-[18px] font-extrabold">
              <KeyRound className="h-4.5 w-4.5 text-pine" />
              عندك مفتاح تفعيل؟
            </h2>
            <p className="mt-1 text-[13px] text-muted">الصقه هنا مرة واحدة — يُخزَّن في متصفحك فقط.</p>
          </div>
          <ShieldCheck className="h-8 w-8 text-pine/20" />
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="eyJzdWIiOiJ...  .  qFNBmD7v..."
            className="input flex-1 font-mono text-[12.5px]"
            dir="ltr"
            spellCheck={false}
          />
          <button type="button" onClick={onActivate} disabled={activating || !key.trim()} className="btn-primary justify-center">
            {activating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
            تفعيل
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted">
          <PackageCheck className="h-3.5 w-3.5" />
          التحقق يتم محليًا بتوقيع Ed25519 — لا يُرسل مفتاحك إلى أي خادم.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-center text-[24px] font-extrabold">أسئلة تُطرح فعلًا</h2>
        <div className="mx-auto mt-7 max-w-3xl space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-xl border border-line bg-white/70 px-5 py-4">
              <summary className="cursor-pointer list-none text-[14.5px] font-bold marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <span className="text-muted transition group-open:rotate-45">＋</span>
                </span>
              </summary>
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mx-auto mt-12 flex max-w-2xl items-start gap-2.5 text-[12px] leading-relaxed text-muted">
        <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-pine" />
        لا اشتراكات صامتة ولا تجديد آلي: تدفع مرة، ويصلك مفتاح لمدة محددة. عند الانتهاء يعود التطبيق للمجاني وتحتفظ
        بكل مستنداتك ومفتاحك القديم.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-[12px]">
        <Link href="/flyer" className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 font-bold text-muted transition hover:text-pine">
          ملصق مطبوع للورشات والمقاهي — اطبع وانشر
        </Link>
      </div>

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </main>
  );
}

function ProPanel({ pro, onChange }: { pro: ProState; onChange: () => void }) {
  const days = proDaysLeft(pro);
  return (
    <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-between gap-4 rounded-xl2 border border-pine/30 bg-pine-soft px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine text-white">
          <BadgeCheck className="h-5 w-5" />
        </span>
        <div>
          <div className="text-[14px] font-extrabold text-pine">فاتورا برو مفعّل</div>
          <div className="text-[12px] text-pine/80">
            {pro.email} · {pro.plan === "lifetime" ? "دائم" : days !== null ? `باقٍ ${days} يومًا` : "—"}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          signOutPro();
          onChange();
        }}
        className="text-[12px] font-bold text-pine/70 underline-offset-4 hover:underline"
      >
        إزالة التفعيل من هذا المتصفح
      </button>
    </div>
  );
}
