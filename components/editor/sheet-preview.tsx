"use client";

import { useEffect, useRef, useState } from "react";
import type { Invoice } from "@/lib/invoice";
import { A4_H, A4_W, InvoiceSheet } from "@/components/invoice-sheet";

/** A4 sheet fitted to its container without clipping. */
export function SheetPreview({
  inv,
  maxWidth,
  shadow = true,
  className = "",
}: {
  inv: Invoice;
  maxWidth?: number;
  shadow?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = Math.min(el.clientWidth, maxWidth ?? 794);
      setScale(Math.min(1, w / A4_W));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxWidth]);

  return (
    <div ref={ref} className={`w-full ${className}`}>
      <div
        style={{ height: A4_H * scale, width: A4_W * scale }}
        className={`relative mx-auto overflow-hidden rounded-[6px] bg-white ${shadow ? "shadow-sheet ring-1 ring-black/5" : ""}`}
      >
        <div style={{ position: "absolute", top: 0, left: 0 }} data-invoice-sheet>
          <InvoiceSheet inv={inv} scale={scale} />
        </div>
      </div>
    </div>
  );
}
