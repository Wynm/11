"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";

export function ToolShell({
  eyebrow,
  title,
  intro,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-7 sm:px-6">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="فاتورا">
          <Brand />
        </Link>
        <Link href="/new" className="btn-primary !px-3.5 !py-2 text-[12.5px]">
          <Sparkles className="h-3.5 w-3.5" />
          أنشئ فاتورة
        </Link>
      </div>

      <header className="mt-12 max-w-2xl">
        <span className="chip">{eyebrow}</span>
        <h1 className="mt-4 text-[30px] font-extrabold leading-tight tracking-tight sm:text-[38px]">{title}</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{intro}</p>
      </header>

      <div className={aside ? "mt-9 grid gap-5 lg:grid-cols-[1.3fr_1fr]" : "mt-9"}>
        <div>{children}</div>
        {aside ? <div className="space-y-5">{aside}</div> : null}
      </div>

      <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[12.5px] text-muted">
        <span>حسابات تقديرية للاستعانة — لا تُغني عن محاسبك.</span>
        <Link href="/new" className="flex items-center gap-1.5 font-bold text-pine hover:underline">
          أتمّ العملية في فاتورا <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </footer>
    </main>
  );
}

export function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="text-[15px] font-extrabold">{title}</h2>
      <div className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-muted">{children}</div>
    </div>
  );
}
