import Link from "next/link";
import { Brand } from "./brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />
        <nav className="hidden items-center gap-7 text-[14.5px] font-bold text-muted md:flex">
          <Link href="/#how" className="hover:text-ink transition">كيف يعمل</Link>
          <Link href="/#features" className="hover:text-ink transition">المزايا</Link>
          <Link href="/#pricing" className="hover:text-ink transition">الأثمنة</Link>
          <Link href="/#faq" className="hover:text-ink transition">الأسئلة</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/invoices" className="hidden sm:inline-flex btn-ghost">
            فواتيري
          </Link>
          <Link href="/new" className="btn-primary !px-4 !py-2.5">
            ابدأ فاتورتك
          </Link>
        </div>
      </div>
    </header>
  );
}
