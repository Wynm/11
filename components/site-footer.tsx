import Link from "next/link";
import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-white/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted">
            فواتير نظيفة وقانونية، مصمّمة للمقاول الذاتي والرائد المغربي. بدون حساب، وبدون أن تخرج بياناتك من متصفحك.
          </p>
        </div>
        <nav className="text-[13.5px]">
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-muted">الأداة</p>
          <ul className="space-y-2 font-bold text-ink/80">
            <li><Link href="/new" className="hover:text-pine">فاتورة جديدة</Link></li>
            <li><Link href="/new?kind=quote" className="hover:text-pine">عرض ثمن</Link></li>
            <li><Link href="/invoices" className="hover:text-pine">فواتيري</Link></li>
          </ul>
        </nav>
        <nav className="text-[13.5px]">
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-muted">تعرّف</p>
          <ul className="space-y-2 font-bold text-ink/80">
            <li><Link href="/pro" className="hover:text-pine">فاتورا برو</Link></li>
            <li><Link href="/#pricing" className="hover:text-pine">الأثمنة</Link></li>
            <li><Link href="/#faq" className="hover:text-pine">الأسئلة الشائعة</Link></li>
          </ul>
        </nav>
        <nav className="text-[13.5px]">
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-muted">أدوات مجانية</p>
          <ul className="space-y-2 font-bold text-ink/80">
            <li><Link href="/tools/tva" className="hover:text-pine">حاسبة TVA</Link></li>
            <li><Link href="/tools/mentions" className="hover:text-pine">مكوّنات الفاتورة</Link></li>
            <li><Link href="/tools/ice" className="hover:text-pine">مدقق ICE</Link></li>
          </ul>
        </nav>
        <div className="text-[13.5px]">
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-muted">ملاحظة قانونية</p>
          <p className="leading-relaxed text-muted">
            فاتورا أداة مستقلة ولا تتبع الإدارة العامة للضرائب. المعلومات هنا إرشادية، والمستند الرسمي يبقى تحت مسؤولية مستعمله.
          </p>
        </div>
      </div>
      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-[12px] text-muted sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} فاتورا · صُنع في المغرب بجدية.</span>
          <span className="tnum">ICE · IF · RC · CNSS · TVA</span>
        </div>
      </div>
    </footer>
  );
}
