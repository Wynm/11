import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "ملصق فاتورا — للطباعة",
  robots: { index: false, follow: false },
};

/**
 * A5-ish A4 flyer, black-on-cream so it prints cheaply on any office printer.
 * Three tear-off tabs at the bottom (classic "roommate wanted" mechanic) because
 * most first customers come from physical places: coworkings, cafés, workshops.
 */
export default async function FlyerPage() {
  const [arabic, latin] = await Promise.all([
    readFile(join(process.cwd(), "node_modules/@fontsource/tajawal/files/tajawal-arabic-400-normal.woff2")).then((b) => b.toString("base64")),
    readFile(join(process.cwd(), "node_modules/@fontsource/tajawal/files/tajawal-arabic-700-normal.woff2")).then((b) => b.toString("base64")),
  ]);

  const url = `${BUSINESS.site.replace(/\/$/, "")}?ref=flyer`;
  const qr = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0B5D50", light: "#FFFFFF" },
  });

  const tabs = ["فاتورة صحيحة من أول مرة", "جرّبها بلا حساب", "شعارك على الفاتورة"];

  return (
    <>
      <style>{`
        @font-face{font-family:TajawalFlyer;src:url(data:font/woff2;base64,${arabic}) format('woff2');font-weight:400;font-display:swap}
        @font-face{font-family:TajawalFlyer;src:url(data:font/woff2;base64,${latin}) format('woff2');font-weight:700;font-display:swap}
        .flyer{font-family:TajawalFlyer,system-ui,sans-serif}
        @page{size:A4;margin:10mm}
        @media print{
          .no-print{display:none!important}
          .flyer{box-shadow:none!important;border:0!important;width:100%!important;min-height:0!important;margin:0!important}
        }
      `}</style>

      <main className="min-h-screen bg-[#EAE4D8] px-4 py-8 print:bg-white print:p-0">
        <div className="mx-auto mb-4 flex max-w-[860px] flex-wrap items-center justify-between gap-2 print:hidden">
          <p className="text-[13px] font-bold text-ink/70">اطبع (Ctrl/⌘ + P) — A4، بلا هوامش إضافية.</p>
          <div className="flex gap-2 text-[12px] font-bold">
            <a href={`/pro`} className="rounded-lg border border-line bg-white px-3 py-1.5">صفحة برو</a>
            <a href={BUSINESS.site} className="rounded-lg bg-pine px-3 py-1.5 text-white">فتح الموقع</a>
          </div>
        </div>

        <article
          className="flyer mx-auto flex w-full max-w-[860px] flex-col overflow-hidden rounded-[18px] border border-line bg-paper shadow-lift"
          style={{ minHeight: "1080px" }}
        >
          {/* header */}
          <div className="flex items-center justify-between gap-4 border-b-2 border-ink px-10 py-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pine text-[24px] font-bold text-white">ف</div>
              <div>
                <div className="text-[22px] font-bold leading-none text-ink">فاتورا</div>
                <div className="mt-1 text-[11px] text-muted">فواتير المستقلين المغاربة</div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-[11px] text-muted" style={{ direction: "ltr" }}>fatoura.ma</div>
              <div className="text-[11px] text-muted" style={{ direction: "ltr" }}>AR · FR · PDF</div>
            </div>
          </div>

          {/* hero */}
          <div className="grid flex-1 gap-8 px-10 py-9 md:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="mb-4 inline-flex rounded-full bg-pine-soft px-3 py-1 text-[12px] font-bold text-pine">
                مجاني · بلا حساب · بياناتك عندك
              </div>
              <h1 className="text-[44px] font-bold leading-[1.15] text-ink">
                فاتورة تُقبل
                <br />
                من أول مرة.
              </h1>
              <p className="mt-4 max-w-[380px] text-[14px] leading-relaxed text-muted">
                ICE، IF، TVA، ترقيم متسلسل، ومبلغ بالحروف — فحص قانوني يمنع رفض فاتورتك، ثم PDF أنيق يليق بعميلك.
                بالعربية أو الفرنسية.
              </p>

              <ul className="mt-6 space-y-2.5 text-[13px] text-ink/80">
                {[
                  "9 شروط تُفحص قبل التصدير — لا تُرسل مستندًا ناقصًا",
                  "مبلغ بالحروف يُكتب تلقائيًا بلا أخطاء",
                  "رابط مشاركة مجمّد: عميلك يرى الفاتورة، لا بياناتك",
                  "تذكير أداء جاهز (عربي/فرنسي) عندما يتأخر الدفع",
                  "برو: شعارك وألوانك، وبلا حد للمستندات",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-pine text-[9px] font-bold text-white">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* right card */}
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-white px-6 py-7 text-center">
              <div
                className="h-[168px] w-[168px] [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qr }}
              />
              <div className="text-[13px] font-bold text-ink">امسح وابدأ الآن</div>
              <p className="text-[11.5px] leading-relaxed text-muted">
                لا تحميل، لا تسجيل.
                <br />
                أول فاتورة في أقل من دقيقة.
              </p>
              <div className="mt-1 w-full rounded-xl bg-saffron px-3 py-2.5 text-[12.5px] font-bold text-ink">
                برو: {BUSINESS.price.yearly} د.م/سنة
              </div>
              {BUSINESS.launch ? (
                <div className="w-full rounded-xl border border-dashed border-pine/40 bg-pine-tint px-3 py-2 text-[11.5px] font-bold text-pine">
                  {BUSINESS.launch.label} · {BUSINESS.launch.price} د.م
                </div>
              ) : null}
            </div>
          </div>

          {/* why-now band */}
          <div className="mx-10 rounded-xl bg-ink px-6 py-4 text-white">
            <p className="text-[13px] leading-relaxed text-white/85">
              <b className="text-saffron">فاتورة مرفوضة = أسبوعان تأخير في الدفع.</b> كل عنصر ناقص يعيدك إلى الصفر مع محاسب
              عميلك. فاتورا تمنع ذلك مجانًا، وتُنجز المستند في نصف دقيقة.
            </p>
          </div>

          {/* tear-off tabs */}
          <div className="mt-6 grid grid-cols-3 gap-0 border-t border-dashed border-ink/30 px-10 pb-6 pt-4">
            {tabs.map((t) => (
              <div key={t} className="border-l border-dashed border-ink/20 px-3 first:border-l-0">
                <div className="text-[11px] font-bold text-ink">{t}</div>
                <div className="mt-1 text-[10.5px] text-muted" style={{ direction: "ltr" }}>
                  {BUSINESS.site.replace(/^https?:\/\//, "")}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line px-10 py-4 text-[10.5px] text-muted">
            <span>
              واتساب: <span style={{ direction: "ltr" }}>+{BUSINESS.whatsapp}</span> · {BUSINESS.email}
            </span>
            <span>ICES · IF · RC · CNSS · TVA — أداة مستقلة، المستند الرسمي تحت مسؤولية مستعمله.</span>
          </div>
        </article>
      </main>
    </>
  );
}
