import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      className={`${className} inline-flex items-center justify-center rounded-xl bg-pine text-white shadow-[0_6px_16px_-8px_rgba(11,93,80,.9)]`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none">
        <path
          d="M6.5 3.5h7L17.5 7v13.5h-11z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="rgba(255,255,255,.12)"
        />
        <path d="M9.5 11h5M9.5 14.5h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="16.4" cy="17.3" r="3.1" fill="#E0A03C" />
        <path d="m15.2 17.3 1 1 1.7-2" stroke="#12171D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group" aria-label="فاتورا — الصفحة الرئيسية">
      <LogoMark />
      {!compact && (
        <span className="leading-none">
          <span className="block text-[19px] font-extrabold tracking-tight text-ink group-hover:text-pine transition">
            فاتورا
          </span>
          <span className="block text-[10.5px] font-medium text-muted mt-1 tracking-wide">FATOURA.MA</span>
        </span>
      )}
    </Link>
  );
}
