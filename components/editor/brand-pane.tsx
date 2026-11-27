"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, Lock, Sparkles, Trash2 } from "lucide-react";
import type { Invoice } from "@/lib/invoice";
import { DEFAULT_BRANDING } from "@/lib/invoice";
import { Field } from "./fields";

const ACCENTS = ["#0B5D50", "#12171D", "#1D4ED8", "#7C3AED", "#B45309", "#9F1239", "#0369A1", "#166534"];

/** Branding controls. When locked, everything stays visible but disabled — free users see the value. */
export function BrandPane({
  inv,
  set,
  locked,
}: {
  inv: Invoice;
  set: (patch: Partial<Invoice>) => void;
  locked: boolean;
}) {
  const branding = inv.branding ?? DEFAULT_BRANDING;
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const patch = (p: Partial<typeof branding>) => set({ branding: { ...branding, ...p } });

  const onLogo = (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) {
      setError("اختر صورة PNG أو JPG أو WebP أو SVG.");
      return;
    }
    if (file.size > 300_000) {
      setError("حجم الشعار كبير — صغّره إلى أقل من 300 كيلوبايت.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patch({ logo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className={locked ? "pointer-events-none select-none opacity-55" : ""}>
      {locked ? (
        <div className="pointer-events-auto mb-4 flex items-center justify-between gap-3 rounded-xl border border-saffron/40 bg-saffron-soft/50 px-3.5 py-2.5">
          <p className="text-[12.5px] font-bold leading-snug text-ink/80">
            هوية المستند ميزة <b>برو</b> — جرّب الألوان والشعار في المعاينة، ثم فعّلها لتصديرها.
          </p>
          <Link href="/pro" className="shrink-0 rounded-lg bg-ink px-2.5 py-1.5 text-[11.5px] font-extrabold text-white">
            تفعيل
          </Link>
        </div>
      ) : null}

      <div className="space-y-5">
        <div>
          <div className="mb-2 text-[12px] font-bold text-muted">اللون الرئيسي</div>
          <div className="flex flex-wrap items-center gap-2">
            {ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => patch({ accent: c })}
                className={`h-9 w-9 rounded-full border-2 transition ${branding.accent.toLowerCase() === c.toLowerCase() ? "border-ink ring-2 ring-ink/10" : "border-white shadow-sm"}`}
                style={{ background: c }}
                aria-label={c}
              />
            ))}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-muted">
              مخصّص
              <input
                type="color"
                value={branding.accent}
                onChange={(e) => patch({ accent: e.target.value })}
                className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
              />
            </label>
          </div>
        </div>

        <Field label="شعارك" hint="يظهر أعلى الفاتورة بدل الحرف الأول من اسمك">
          <div className="flex items-center gap-2.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
              {branding.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logo} alt="الشعار" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-5 w-5 text-muted/60" />
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => onLogo(e.target.files?.[0])}
            />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost !py-2 text-[12.5px]">
              <ImagePlus className="h-4 w-4" />
              اختيار صورة
            </button>
            {branding.logo ? (
              <button
                type="button"
                onClick={() => patch({ logo: "" })}
                className="btn-ghost !border-clay/30 !px-2.5 !py-2 text-[12.5px] !text-clay"
                aria-label="إزالة الشعار"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          {error ? <p className="mt-1.5 text-[11.5px] font-bold text-clay">{error}</p> : null}
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-3.5">
          <input
            type="checkbox"
            checked={branding.hideFooter}
            onChange={(e) => patch({ hideFooter: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-pine"
          />
          <span>
            <span className="flex items-center gap-1.5 text-[13px] font-extrabold">
              إخفاء سطر «أُنجز بواسطة فاتورا»
              <Lock className="h-3 w-3 text-muted/50" />
            </span>
            <span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted">
              يجعل المستند يحمل علامتك وحدها — مفيد إن كنت توقّع فواتير باسم استوديو.
            </span>
          </span>
        </label>

        <p className="flex items-start gap-2 rounded-xl bg-pine-tint p-3 text-[11.5px] leading-relaxed text-pine">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          الشعار يُحفظ داخل متصفحك مع المستند، ويُضمَّن في PDF والرابط المشترك. لا يُرفع إلى أي خادم.
        </p>
      </div>
    </div>
  );
}
