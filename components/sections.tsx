import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Banknote,
  Check,
  ChevronDown,
  FileText,
  Fingerprint,
  Gauge,
  Languages,
  Link2,
  Lock,
  ScanLine,
  ShieldCheck,
  Sparkles,
  WifiOff,
  X,
} from "lucide-react";

export function PainStrip() {
  const items = [
    { t: "فاتورة مرفوضة", d: "ناقص فيها ICE أو IF، فترجعها الشركة وتتأخر الدفعة أسبوعين." },
    { t: "جدول Word مقلوب", d: "أعمدة تختلط، أرقام بلا فواصل، وملف يبدو غير مهني أمام عميل يدفع." },
    { t: "متابعة بالذاكرة", d: "مَن دفع؟ مَن تأخر؟ كل شهر تفتح واتساب وتبحث بين الرسائل." },
  ];
  return (
    <section className="border-y border-line bg-white/60">
      <div className="mx-auto grid max-w-6xl gap-px overflow-hidden bg-line px-0 sm:grid-cols-3">
        {items.map((i) => (
          <div key={i.t} className="group bg-white/80 px-6 py-8 transition hover:bg-saffron-soft/40">
            <div className="flex items-center gap-2 text-clay">
              <Ban className="h-4 w-4" strokeWidth={2.4} />
              <h3 className="text-[16px] font-extrabold">{i.t}</h3>
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{i.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { n: "01", t: "املأ بياناتك مرة واحدة", d: "اسمك، ICE، IF، RIB… تُحفظ في متصفحك وتُعاد تلقائيًا في كل فاتورة.", icon: Fingerprint },
    { n: "02", t: "أضف الخدمة والعميل", d: "سطر واحد أو عشرة، بالعربية أو الفرنسية. الحساب والضريبة والمبلغ بالحروف تلقائيًا.", icon: FileText },
    { n: "03", t: "أرسلها أو اطبعها", d: "رابط مشترك للعميل، أو PDF جاهز للطباعة والتوقيع. وحالة الدفع تُتابع في لوحتك.", icon: ScanLine },
  ];
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="chip">كيف يعمل</span>
        <h2 className="mt-4 text-[32px] font-extrabold leading-tight tracking-tight sm:text-[40px]">
          من فكرة إلى فاتورة قابلة للدفع، في ثلاث خطوات.
        </h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
          لا إعداد طويل، لا دروس. تفتح، تكتب، تُخرج. هذا كل شيء.
        </p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {steps.map((s, idx) => (
          <div key={s.n} className="card relative overflow-hidden p-7 transition hover:-translate-y-1 hover:shadow-lift">
            <span className="pointer-events-none absolute -top-4 left-4 text-[80px] font-extrabold leading-none text-ink/[0.04]">
              {s.n}
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine-soft text-pine">
              <s.icon className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <h3 className="mt-5 text-[18px] font-extrabold">{s.t}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.d}</p>
            {idx < 2 && (
              <span className="absolute left-5 top-7 hidden text-line md:block">
                <ArrowLeft className="h-5 w-5" />
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Features() {
  const items = [
    { icon: ShieldCheck, t: "فحص قانوني فوري", d: "تسع نقاط تتحقق آليًا: ICE بـ15 رقمًا، IF، RC، ترقيم متسلسل، تواريخ، وضريبة محددة.", tone: "pine" },
    { icon: Languages, t: "عربي وفرنسي بضغطة", d: "قالب واحد بلغتين. تُرسل للعميل الفرنسي كما ترسلها للعميل المغربي.", tone: "ink" },
    { icon: Banknote, t: "المبلغ بالحروف", d: "«أُوقفت هذه الفاتورة على مبلغ…» تُكتب تلقائيًا بدقة، فتُغلق بابًا من أخطاء الرفض.", tone: "saffron" },
    { icon: Link2, t: "رابط مشاركة أنيق", d: "صفحة فاتورة خاصة برابط عشوائي، تتضمن صورة للتحميل. بدون إرهاق العميل بملفات.", tone: "pine" },
    { icon: Gauge, t: "لوحة متابعة", d: "إجمالي المُحصّل، المعلّق، ونسبة الأداء. تعرف من أين يأتي مالك بدل التخمين.", tone: "ink" },
    { icon: WifiOff, t: "يعمل دون تسجيل", d: "بياناتك في جهازك، لا حساب ولا تفعيل بريد. أَنت ومتصفحك فقط.", tone: "saffron" },
  ];
  const tones: Record<string, string> = {
    pine: "bg-pine-soft text-pine",
    ink: "bg-ink/[0.06] text-ink",
    saffron: "bg-saffron-soft text-[#9A6A15]",
  };
  return (
    <section id="features" className="border-y border-line bg-white/50">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="chip">المزايا</span>
            <h2 className="mt-4 text-[32px] font-extrabold leading-tight tracking-tight sm:text-[40px]">
              ليست مجرّد قالب. إنها طبقة احترافية بينك وبين عميلك.
            </h2>
          </div>
          <Link href="/new" className="btn-ghost shrink-0">
            جرّبها الآن
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <div key={f.t} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lift">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[f.tone]}`}>
                <f.icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <h3 className="mt-4 text-[16.5px] font-extrabold">{f.t}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Compliance() {
  const checks = [
    ["المعرّف المقاولاتي ICE", "15 رقمًا، إلزامي على كل فاتورة"],
    ["المعرّف الجبائي IF", "مع رقم السجل التجاري إن وُجد"],
    ["رقم فاتورة متسلسل", "بلا فجوات، يبدأ من 1 كل سنة"],
    ["تاريخ الإصدار والاستحقاق", "وشرط الدفع المكتوب"],
    ["الضريبة على القيمة المضافة", "20٪ / 10٪ / 7٪ أو «بدون»"],
    ["المبلغ بالحروف", "بالعربية، بدقة السنتيم"],
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="chip">
            <BadgeCheck className="h-3.5 w-3.5 text-pine" />
            مطابقة قانونية
          </span>
          <h2 className="mt-4 text-[32px] font-extrabold leading-tight tracking-tight sm:text-[40px]">
            الشروط التي تُرفض بها الفواتير، محلولة قبل أن تظهر.
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.9] text-muted">
            الفاتورة التي ينقصها ICE أو ترقيم متسلسل تُعتبر غير نظامية، والشركات ترفض أداءها.
            فاتورا تتحقق من كل شرط أثناء الكتابة، وتُظهر لك ما ينقص بلغة واضحة — لا مصطلحات إدارية.
          </p>
          <div className="mt-6 space-y-2.5">
            {checks.slice(0, 3).map(([t]) => (
              <div key={t} className="flex items-center gap-2.5 text-[14px] font-bold text-ink/85">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pine text-white">
                  <Check className="h-3 w-3" strokeWidth={3.5} />
                </span>
                {t}
              </div>
            ))}
            <div className="flex items-center gap-2.5 text-[14px] font-bold text-muted">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-line bg-white">
                <span className="h-1.5 w-1.5 rounded-full bg-line" />
              </span>
              + ثلاثة شروط أخرى تُفحص تلقائيًا
            </div>
          </div>
          <Link href="/new" className="btn-ink mt-8">
            افتح الفاحص مع فاتورتك
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          <div className="absolute -inset-5 -z-10 rounded-[32px] bg-gradient-to-tr from-pine/10 via-saffron/15 to-transparent" />
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-[#FCFAF6] px-5 py-3.5">
              <div className="flex items-center gap-2 text-[13px] font-extrabold">
                <ShieldCheck className="h-4 w-4 text-pine" />
                فاحص الجاهزية
              </div>
              <span className="rounded-full bg-pine px-2.5 py-0.5 text-[11px] font-extrabold text-white">9/9</span>
            </div>
            <ul className="divide-y divide-line/70">
              {checks.map(([t, d], i) => (
                <li key={t} className="flex items-center gap-3 px-5 py-3">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${i === 3 ? "bg-saffron-soft" : "bg-pine"} text-white`}>
                    {i === 3 ? <Check className="h-3 w-3 text-[#9A6A15]" strokeWidth={3.5} /> : <Check className="h-3 w-3" strokeWidth={3.5} />}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-extrabold leading-tight">{t}</div>
                    <div className="text-[11.5px] text-muted">{d}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line bg-pine-tint px-5 py-3 text-[12px] font-bold text-pine">
              جاهزة للإرسال · يمكنك المشاركة أو الطباعة
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function UseCases() {
  const cases = [
    ["مصوّر فوتوغرافي", "جلسات ونشر رقمي", "1 800 د.م"],
    ["مطوّر مواقع", "تطوير وتدريب", "6 500 د.م"],
    ["أستاذ / مكوّن", "دورات ودعم", "450 د.م"],
    ["مهندس معماري", "دراسات ومخططات", "12 000 د.م"],
    ["توصيل مستقل", "طرق وشحن", "120 د.م"],
    ["مستشار تسويق", "مرافقة شهرية", "4 000 د.م"],
  ];
  return (
    <section className="border-y border-line bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-xl text-[30px] font-extrabold leading-tight sm:text-[38px]">
            لأصحاب الدخل الحرّ. كل تخصص، وكل مبلغ.
          </h2>
          <p className="max-w-sm text-[14px] leading-relaxed text-white/60">
            من هندسة معمارية بـ12 ألف درهم إلى توصيل طلب بـ120. الفاتورة تبقى بنفس الأناقة والالتزام.
          </p>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map(([t, d, a], i) => (
            <div key={t} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-saffron/40 hover:bg-white/[0.07]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[15px] font-extrabold">{t}</div>
                  <div className="mt-0.5 text-[12.5px] text-white/55">{d}</div>
                </div>
                <span className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-extrabold text-saffron tnum">{a}</span>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-white/40" style={{ opacity: 0.5 + i * 0.08 }}>
                <span className="h-1 w-full max-w-[86%] rounded bg-white/10">
                  <span className="block h-1 rounded bg-saffron/70" style={{ width: `${40 + i * 9}%` }} />
                </span>
                <span className="tnum">FAC‑2026‑{(i + 3).toString().padStart(3, "0")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="chip">الأثمنة</span>
        <h2 className="mt-4 text-[32px] font-extrabold leading-tight tracking-tight sm:text-[40px]">
          ابدأ مجانًا. وادفع فقط إن احتجت المزيد.
        </h2>
        <p className="mt-3 text-[15.5px] text-muted">
           لا اشتراك إجباري، ولا بطاقة بنكية. الأدوات الأساسية مجانية إلى الأبد.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="card p-8">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[19px] font-extrabold">المجاني</h3>
            <span className="text-[30px] font-extrabold text-pine">0 د.م</span>
          </div>
          <p className="mt-1 text-[13.5px] text-muted">كل ما تحتاجه لبدء الفاتورة الأولى.</p>
          <ul className="mt-6 space-y-3 text-[14px]">
            {[
              "حتى 5 مستندات محفوظة",
              "مبلغ بالحروف + فحص قانوني كامل",
              "رابط مشاركة وطباعة PDF",
              "تخزين محلي دائم في متصفحك",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-pine" strokeWidth={3} />
                <span className="text-ink/80">{f}</span>
              </li>
            ))}
          </ul>
          <Link href="/new" className="btn-primary mt-8 w-full">ابدأ الآن — بلا حساب</Link>
        </div>

        <div className="relative overflow-hidden rounded-xl2 border border-pine bg-ink p-8 text-white shadow-lift">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-saffron/20 blur-2xl" />
          <div className="flex items-baseline justify-between">
            <h3 className="text-[19px] font-extrabold">الاحترافي</h3>
            <span className="text-[30px] font-extrabold text-saffron">49 د.م<span className="text-[14px] font-bold text-white/60">/شهر</span></span>
          </div>
          <p className="mt-1 text-[13.5px] text-white/60">للمستقل الذي يفوتر كل أسبوع.</p>
          <ul className="mt-6 space-y-3 text-[14px]">
            {[
              "شعارك وألوانك على كل مستند",
              "إخفاء شارة «فاتورا» من الفاتورة",
              "مستندات غير محدودة (المجاني: 5)",
              "مفتاح دائم يتحقق محليًا دون إنترنت",
              "تحديثات مجانية خلال مدة الاشتراك",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-saffron" strokeWidth={3} />
                <span className="text-white/85">{f}</span>
              </li>
            ))}
          </ul>
          <Link href="/pro" className="btn-saffron mt-8 w-full">فعّل برو — 399 د.م/سنة</Link>
          <p className="mt-3 text-center text-[11px] text-white/40">
            أو 49 د.م/شهر · مفتاح تفعيل دائم بدون إنترنت · استرداد 14 يومًا
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-2xl items-start gap-2.5 rounded-xl border border-line bg-white/60 px-4 py-3 text-[12.5px] leading-relaxed text-muted">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-pine" />
        ملاحظة صادقة: النسخة الحالية تعمل بالكامل في متصفحك، فلا نرسل بياناتك إلى أي خادم. خاصية الرابط المشترك تُخزّن نسخة مجمّدة من المستند فقط.
      </div>
    </section>
  );
}

export function ProBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[24px] bg-ink px-6 py-9 text-white sm:px-10">
        <div className="absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-pine/40 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-saffron/40 bg-saffron/10 px-2.5 py-1 text-[11px] font-extrabold text-saffron">
              <Sparkles className="h-3 w-3" /> فاتورا برو
            </span>
            <h2 className="mt-3 text-[26px] font-extrabold leading-snug sm:text-[30px]">
              فاتورتك تحمل شعارك — لا شعارنا.
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-white/65">
              ألوانك، شعارك، بلا سطر «أُنجز بواسطة فاتورا»، ومستندات بلا حد. مفتاح دائم يُتحقق منه دون خادم —
              فلا حساب ولا إنترنت مطلوب بعد التفعيل.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Link href="/pro" className="btn-saffron !px-6 !py-3">
              فعّل برو — 399 د.م/سنة <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-[11.5px] text-white/45">أو 49 د.م/شهر · استرداد كامل خلال 14 يومًا</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const qs = [
    {
      q: "هل الفاتورة صادرة عن هذه الأداة قانونية؟",
      a: "الأداة تُنتج مستندًا مطابقًا للعناصر المطلوبة في الفاتورة المغربية (ICE، IF، ترقيم، تواريخ، ضريبة، مبلغ بالحروف). المسؤولية عن صحة المعلومات والتصريح بها تبقى على المفوتر. ننصح دائمًا بالتأكد من التزامك الضريبي مع محاسب.",
    },
    {
      q: "هل تُخزَّن بياناتي في خادم؟",
      a: "لا. كل شيء يُحفظ في ذاكرة متصفحك (localStorage). عند إنشاء رابط مشاركة، تُحفظ نسخة من المستند في قاعدة بياناتنا لمدة 90 يومًا فقط، ويمكنك حذفها بطلب. بدون رابط، لا شيء يخرج من جهازك.",
    },
    {
      q: "ما الفرق بين الفاتورة وعرض الثمن؟",
      a: "عرض الثمن (Devis) هو التزام مبدئي؛ لا يُلزم بالدفع ولا يُحتسب في رقم المعاملات. الفاتورة (Facture) هي المطالبة الرسمية وتدخل في محاسبتك. الأداة تتعامل مع الاثنين بترقيم منفصل: DEV للعروض وFAC للفواتير.",
    },
    {
      q: "ما نسبة الضريبة التي أختار؟",
      a: "المقاول الذاتي الخاضع للضريبة على الدخل قد يفوتر بدون TVA إن كان نطاقه لا يفرضها، بينما الأنشطة التجارية بنسبة 20٪، والنقل والفنادق بنسب مخففة. إن لم تكن متأكدًا، اختر «بدون ضريبة» واستشر محاسبك — الفاحص سيبقى راضيًا.",
    },
    {
      q: "هل يعمل بدون إنترنت؟",
      a: "التحرير والحساب والطباعة تعمل بدون إنترنت بعد فتح الصفحة. إنشاء رابط المشاركة يحتاج اتصالًا لأن المستند يُرفع إلى الخادم.",
    },
  ];
  return (
    <section id="faq" className="border-t border-line bg-white/50">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <span className="chip">الأسئلة الشائعة</span>
          <h2 className="mt-4 text-[32px] font-extrabold tracking-tight sm:text-[38px]">أسئلة يطرحها كل مستقل.</h2>
        </div>
        <div className="mt-10 divide-y divide-line overflow-hidden rounded-xl2 border border-line bg-white">
          {qs.map((q) => (
            <details key={q.q} className="group px-5 py-4 open:bg-[#FCFAF6]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-extrabold">
                {q.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[13.5px] leading-[1.9] text-muted">{q.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProofStrip() {
  const rows = [
    { k: "9", l: "شروط قانونية تُفحص قبل التصدير", sub: "ICE · IF · RC · ترقيم · TVA · مبلغ بالحروف" },
    { k: "60s", l: "من فتح الموقع إلى PDF جاهز", sub: "بلا حساب، بلا بريد، بلا انتظار" },
    { k: "0", l: "بايت من بياناتك يغادر متصفحك", sub: "التخزين محلي، والمشاركة نسخة مجمّدة اختيارية" },
    { k: "AR / FR", l: "مستند واحد بلغتين في نقرة", sub: "بالعربية أو الفرنسية حسب عميلك" },
  ];
  return (
    <section className="border-y border-line bg-white/50">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {rows.map((r) => (
          <div key={r.l} className="flex items-start gap-3">
            <div className="tnum shrink-0 rounded-lg bg-pine-soft px-2 py-1 text-[15px] font-extrabold text-pine" style={{ direction: "ltr" }}>
              {r.k}
            </div>
            <div>
              <div className="text-[13px] font-extrabold leading-snug">{r.l}</div>
              <div className="mt-0.5 text-[11.5px] leading-snug text-muted">{r.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-6 pt-24 sm:px-6">
      <div className="relative overflow-hidden rounded-[28px] bg-pine px-6 py-16 text-center text-white sm:px-12">
        <div className="pointer-events-none absolute inset-0 opacity-[0.13]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-saffron/25 blur-3xl" />
        <div className="relative">
          <Sparkles className="mx-auto h-7 w-7 text-saffron" />
          <h2 className="mx-auto mt-5 max-w-2xl text-[32px] font-extrabold leading-tight sm:text-[44px]">
            أول فاتورة اليوم = أول دفعة أسرع.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">
            لا تنتظر. اكتب، أرسل، وواصل عملك. فاتورا تتولى الباقي.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/new" className="btn-saffron !px-7 !py-3.5 !text-[16px]">
              أنشئ فاتورتك مجانًا
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/invoices" className="btn inline-flex border border-white/20 px-6 py-3.5 text-white hover:bg-white/10">
              تابع فواتيري
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
