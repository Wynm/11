"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Copy, X } from "lucide-react";
import type { Invoice } from "@/lib/invoice";

export function Field({
  label,
  hint,
  children,
  className = "",
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="label">{label}</label>
      {children}
      {hint ? <p className="mt-1 text-[11.5px] leading-snug text-muted">{hint}</p> : null}
    </div>
  );
}

export function Section({
  title,
  sub,
  children,
  right,
  defaultOpen = true,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-line/80 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-3 px-5 py-4 text-right"
      >
        <span className="min-w-0">
          <span className="block text-[14.5px] font-extrabold text-ink">{title}</span>
          {sub ? <span className="mt-0.5 block text-[11.5px] font-medium text-muted">{sub}</span> : null}
        </span>
        <span className="flex items-center gap-2">
          {right}
          <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition group-hover:text-ink ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open ? <div className="px-5 pb-5">{children}</div> : null}
    </section>
  );
}

export function MoneyInput({
  value,
  onChange,
  placeholder = "0,00",
  suffix = "د.م",
  ariaLabel,
  invalid,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  suffix?: string;
  ariaLabel?: string;
  invalid?: boolean;
}) {
  const [text, setText] = useState(value ? String(value).replace(".", ",") : "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value ? String(value).replace(".", ",") : "");
  }, [value, focused]);

  return (
    <div className="relative">
      <input
        inputMode="decimal"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className="input tnum !pl-12 text-left"
        style={{ direction: "ltr" }}
        value={text}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          const parsed = parseFloat(text.replace(/[\s,]/g, ".").replace(/\.(?=.*\.)/g, ""));
          onChange(Number.isFinite(parsed) ? Math.max(0, parsed) : 0);
          setText(value ? String(value).replace(".", ",") : "");
        }}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d.,]/g, "");
          setText(next);
          const parsed = parseFloat(next.replace(/[\s,]/g, ".").replace(/\.(?=.*\.)/g, ""));
          if (Number.isFinite(parsed)) onChange(Math.max(0, parsed));
        }}
      />
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11.5px] font-bold text-muted">
        {suffix}
      </span>
    </div>
  );
}

export function StatusPill({ status }: { status: Invoice["status"] }) {
  const map = {
    draft: { l: "مسودة", c: "bg-ink/[0.06] text-muted border-ink/10" },
    sent: { l: "مُرسلة", c: "bg-saffron-soft text-[#9A6A15] border-saffron/30" },
    paid: { l: "مُؤدّاة", c: "bg-pine-soft text-pine border-pine/20" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-extrabold ${map.c}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "paid" ? "bg-pine" : status === "sent" ? "bg-saffron" : "bg-muted"}`} />
      {map.l}
    </span>
  );
}

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-bold text-white shadow-lift">
        <Check className="h-4 w-4 text-saffron" strokeWidth={3} />
        {message}
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${width} rounded-t-3xl border border-line bg-white p-6 shadow-lift sm:rounded-2xl`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-[17px] font-extrabold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-paper hover:text-ink" aria-label="إغلاق">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CopyButton({ text, label = "نسخ" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const el = document.createElement("textarea");
          el.value = text;
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          el.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="btn-ghost !py-2"
    >
      {copied ? <Check className="h-4 w-4 text-pine" /> : <Copy className="h-4 w-4" />}
      {copied ? "نُسخ" : label}
    </button>
  );
}
