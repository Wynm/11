import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles, Lock, Languages } from "lucide-react";

function MiniInvoice() {
  return (
    <div className="relative animate-rise">
      <div className="absolute -inset-6 -z-10 rounded-[36px] bg-gradient-to-br from-saffron/25 via-pine/10 to-transparent blur-2xl" />
      <div className="card overflow-hidden shadow-sheet">
        <div className="flex items-center justify-between border-b border-line/80 bg-white px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F0B4A3]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#F4D8A0]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#B9DCCB]" />
          </div>
          <span className="chip !border-pine/20 !bg-pine-tint !text-pine">
            <span className="h-1.5 w-1.5 rounded-full bg-pine" />
            فاتورة جاهزة
          </span>
        </div>

        <div className="relative bg-[#FDFBF7] px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-pine">فاتورة</div>
              <div className="mt-1 text-[22px] font-extrabold leading-none text-ink">FAC‑2026‑014</div>
              <div className="mt-1.5 text-[11.5px] text-muted">أُصدرت في 27 نونبر 2026 · استحقاق 27 دجنبر</div>
            </div>
            <div className="rounded-xl border border-line bg-white px-3 py-2 text-center">
              <div className="text-[10px] font-bold text-muted">المجموع</div>
              <div className="tnum mt-0.5 text-[17px] font-extrabold text-pine">4 200,00</div>
              <div className="text-[9.5px] font-bold text-muted">درهم</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-[11.5px]">
            <div className="rounded-xl border border-line bg-white px-3 py-2.5">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-muted">العميل</div>
              <div className="mt-1 font-extrabold text-ink">Studio Nord SARL</div>
              <div className="text-muted">ICE 0024587 90123 45</div>
            </div>
            <div className="rounded-xl border border-line bg-white px-3 py-2.5">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-muted">المصدِر</div>
              <div className="mt-1 font-extrabold text-ink">يوسف بنعلي</div>
              <div className="text-muted">IF 45867 0123 · RC 55287</div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line bg-pine px-3 py-2 text-[9.5px] font-extrabold text-white">
              <span>البيان</span>
              <span>الكمية</span>
              <span className="tnum">المجموع</span>
            </div>
            {[
              ["جلسة تصوير منتجات — 12 صورة", "1", "2 800,00"],
              ["المونتاج والتسليم الرقمي", "2", "1 400,00"],
            ].map(([d, q, a]) => (
              <div key={d} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line/60 px-3 py-2 text-[11.5px] last:border-0">
                <span className="font-medium text-ink">{d}</span>
                <span className="tnum text-muted">{q}</span>
                <span className="tnum font-bold text-ink">{a}</span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-[#FCFAF6] px-3 py-2 text-[11px]">
              <span className="text-muted">الضريبة (20٪)</span>
              <span className="tnum font-bold">700,00</span>
            </div>
            <div className="flex items-center justify-between border-t-2 border-ink px-3 py-2.5">
              <span className="text-[11.5px] font-extrabold">المجموع للدفع</span>
              <span className="tnum text-[15px] font-extrabold text-pine">4 200,00 د.م</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-pine px-3.5 py-2.5 text-[11px] leading-relaxed text-white/95">
            <span className="font-bold text-saffron">أُوقفت هذه الفاتورة على مبلغ: </span>
            أربعة آلاف ومئتان درهمًا فقط.
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-4 hidden animate-floaty items-center gap-2 rounded-2xl border border-line bg-white px-3.5 py-2.5 shadow-lift sm:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pine text-white">
          <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <span className="text-[12px] font-extrabold text-ink">9/9 شروط قانونية</span>
      </div>
      <div className="absolute -top-4 -right-3 hidden items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[11.5px] font-bold text-muted shadow-card md:flex">
        <Lock className="h-3.5 w-3.5 text-pine" />
        بياناتك لا تخرج من جهازك
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="paper-bg relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-24">
        <div className="animate-rise">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pine/15 bg-white/80 px-3 py-1.5 text-[12.5px] font-bold text-pine shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            مصمّمة للمقاول الذاتي والرائد المغربي
          </div>
          <h1 className="text-[40px] font-extrabold leading-[1.12] tracking-tight text-ink sm:text-[54px] lg:text-[60px]">
            فاتورتك الرسمية،
            <br />
            <span className="relative inline-block text-pine">
              قبل أن ينتهي قهوتك.
              <svg className="absolute -bottom-2 right-0 h-3 w-full text-saffron" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden>
                <path d="M2 9C70 2 150 2 298 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.9] text-muted">
            30 ثانية تكفي: تكتب الخدمة، تختار العميل، وتُخرج فاتورة عربية نظيفة تحترم كل شروط
            <span className="font-bold text-ink"> ICE وIF والضريبة</span> — ثم تُرسلها برابط أو PDF.
            بدون تسجيل، وبياناتك تبقى في متصفحك.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/new" className="btn-primary !px-6 !py-3.5 !text-[16px]">
              أنشئ فاتورتك الآن
              <ArrowLeft className="h-[18px] w-[18px]" />
            </Link>
            <Link href="/new?kind=quote" className="btn-ghost !px-5 !py-3.5">
              عرض ثمن (Devis)
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-bold text-muted">
            <li className="flex items-center gap-1.5"><span className="text-pine">✓</span> بدون حساب ولا بطاقة</li>
            <li className="flex items-center gap-1.5"><span className="text-pine">✓</span> عربي وفرنسي</li>
            <li className="flex items-center gap-1.5"><Languages className="h-4 w-4 text-pine" /> مبلغ بالحروف تلقائيًا</li>
          </ul>

          <div className="mt-10 flex items-center gap-4 rounded-2xl border border-line bg-white/70 px-4 py-3 backdrop-blur-sm sm:max-w-md">
            <div className="flex -space-x-2 -space-x-reverse">
              {["ي", "س", "أ", "م"].map((c, i) => (
                <span
                  key={c}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[12px] font-extrabold text-white"
                  style={{ background: ["#0B5D50", "#B4482F", "#E0A03C", "#12171D"][i] }}
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="text-[12.5px] leading-snug text-muted">
              <span className="font-extrabold text-ink">مصمّمة من واقع المقاول الذاتي المغربي</span>
              <br />
              مصورون، مطورون، أساتذة، مستشارون… فاتورة كل واحد تُنجز في دقيقة.
            </p>
          </div>
        </div>

        <div className="lg:pl-4">
          <MiniInvoice />
        </div>
      </div>
    </section>
  );
}
