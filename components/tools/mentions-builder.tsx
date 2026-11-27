"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, FileText } from "lucide-react";
import { ToolShell, SideCard } from "./shell";

type Fields = {
  legalName: string;
  activity: string;
  address: string;
  ice: string;
  ifn: string;
  rc: string;
  cnss: string;
  patente: string;
  email: string;
  phone: string;
  bank: string;
  rib: string;
};

const EMPTY: Fields = {
  legalName: "",
  activity: "",
  address: "",
  ice: "",
  ifn: "",
  rc: "",
  cnss: "",
  patente: "",
  email: "",
  phone: "",
  bank: "",
  rib: "",
};

const ORDER: { key: keyof Fields; label: string; hint?: string; example: string }[] = [
  { key: "legalName", label: "الاسم القانوني / التجاري", example: "Youssef Benali Studio" },
  { key: "activity", label: "النشاط", example: "تصوير ومحتوى بصري" },
  { key: "address", label: "العنوان", example: "شارع الحسن الثاني، فاس" },
  { key: "ice", label: "ICE", hint: "15 رقمًا", example: "002345678900012" },
  { key: "ifn", label: "IF", hint: "رقم التعريف الجبائي", example: "458670123" },
  { key: "rc", label: "RC", hint: "السجل التجاري", example: "55287" },
  { key: "cnss", label: "CNSS", example: "7712345" },
  { key: "patente", label: "الضريبة المهنية", example: "34567890" },
  { key: "email", label: "البريد الإلكتروني", example: "contact@studio.ma" },
  { key: "phone", label: "الهاتف", example: "+212 6 61 23 45 67" },
  { key: "bank", label: "البنك", example: "Attijariwafa Bank" },
  { key: "rib", label: "RIB", hint: "24 رقمًا", example: "007780000123456789012345" },
];

const clean = (v: string) => v.replace(/\s+/g, " ").trim();
const digits = (v: string) => v.replace(/\D/g, "");

export function MentionsBuilder() {
  const [f, setF] = useState<Fields>(EMPTY);
  const [lang, setLang] = useState<"ar" | "fr">("ar");
  const [copied, setCopied] = useState(false);
  const [logo, setLogo] = useState("");

  const set = (k: keyof Fields, v: string) => setF((prev) => ({ ...prev, [k]: v }));

  const text = useMemo(() => {
    const row = (label: string, value: string) => (clean(value) ? `${label} : ${clean(value)}` : null);
    const ribFormatted = f.rib ? clean(f.rib).replace(/(\d{4})(?=\d)/g, "$1 ") : "";
    const lines = [
      clean(f.legalName),
      clean(f.activity),
      clean(f.address),
      "",
      row("ICE", digits(f.ice)),
      row("IF", clean(f.ifn)),
      row("RC", clean(f.rc)),
      row("CNSS", clean(f.cnss)),
      row("Patente", clean(f.patente)),
      row("Tél", clean(f.phone)),
      row("Email", clean(f.email)),
      "",
      f.bank ? `${lang === "ar" ? "الحساب البنكي" : "Banque"} : ${clean(f.bank)}` : null,
      ribFormatted ? `RIB : ${ribFormatted}` : null,
    ];
    return lines.filter((l) => l !== null && l !== undefined).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }, [f, lang]);

  const missing = ORDER.filter((r) => !clean(f[r.key])).map((r) => r.label);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const onLogo = (file?: File) => {
    if (!file || file.size > 300_000) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <ToolShell
      eyebrow="أداة مجانية"
      title="مكوّنات الفاتورة: اكتبها مرة، والصقها في كل مستند."
      intro="العناصر الإلزامية في الفاتورة المغربية موزّعة بين الترويسة والتذييل — ونسيان واحد منها يعيدها إليك. املأ الحقول مرة واحدة وانسخ القالب الجاهز إلى قوالبك في Word أو Google Docs."
      aside={
        <>
          <SideCard title="ما الذي يُفحص عادة؟">
            <ul className="list-inside list-disc space-y-1.5">
              <li>اسم المفوتر وعنوانه ورقم ICE (15 رقمًا)</li>
              <li>رقم IF أو رقم التعريف الجبائي</li>
              <li>ترقيم متسلسل دون فجوات</li>
              <li>تاريخ الإصدار وتاريخ الاستحقاق</li>
              <li>البيان المفصّل، الكمية، الثمن الفردي</li>
              <li>المبلغ قبل الضريبة، الضريبة، والمجموع</li>
              <li>المبلغ بالحروف + طريقة الأداء</li>
            </ul>
          </SideCard>
          <div className="rounded-xl2 bg-pine p-5 text-white">
            <p className="text-[13px] leading-relaxed text-white/80">
              كل هذه العناصر تُدمج تلقائيًا في فاتورا، مع فحص يمنع التصدير إن نقص شرط.
            </p>
            <Link href="/new" className="btn-saffron mt-3 w-full justify-center !py-2.5 text-[13px]">
              جرّبها الآن مجانًا <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </>
      }
    >
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-extrabold">بياناتك</h2>
          <div className="seg">
            <button type="button" data-active={lang === "ar"} onClick={() => setLang("ar")}>
              عربي
            </button>
            <button type="button" data-active={lang === "fr"} onClick={() => setLang("fr")}>
              Français
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ORDER.map((r) => (
            <label key={r.key} className={`block ${r.key === "legalName" || r.key === "address" ? "sm:col-span-2" : ""}`}>
              <span className="mb-1 flex items-baseline justify-between text-[11.5px] font-bold text-muted">
                {r.label}
                {r.hint ? <span className="text-[10px] font-normal text-muted/70">{r.hint}</span> : null}
              </span>
              <input
                value={f[r.key]}
                onChange={(e) => set(r.key, e.target.value)}
                placeholder={r.example}
                dir="auto"
                className="input !py-2 text-[13px]"
              />
            </label>
          ))}
        </div>

        <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-line bg-paper px-3.5 py-3">
          <span className="text-[12.5px] font-bold text-muted">
            شعار (اختياري) — يدخل في نسخة الفاتورة الجاهزة
          </span>
          <span className="flex items-center gap-2">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-8 w-8 rounded border border-line object-cover" />
            ) : null}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onLogo(e.target.files?.[0])}
            />
            <span className="rounded-lg bg-white px-2.5 py-1.5 text-[11.5px] font-extrabold text-pine shadow-sm">
              اختيار
            </span>
          </span>
        </label>
      </div>

      <div className="card mt-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[15px] font-extrabold">
            <FileText className="h-4 w-4 text-pine" />
            القالب الجاهز
          </h2>
          <button type="button" onClick={copy} disabled={!text} className="btn-ghost !py-2 text-[12px]">
            {copied ? <Check className="h-3.5 w-3.5 text-pine" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "نُسخ" : "نسخ"}
          </button>
        </div>
        <pre
          dir={lang === "ar" ? "rtl" : "ltr"}
          className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-paper p-4 text-[12.5px] leading-[1.9]"
        >
          {text || "املأ الحقول أعلاه ليظهر القالب هنا…"}
        </pre>
        {missing.length ? (
          <p className="mt-2 text-[11.5px] text-muted">
            ناقص: {missing.slice(0, 4).join("، ")}
            {missing.length > 4 ? ` و${missing.length - 4} أخرى` : ""}
          </p>
        ) : (
          <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-bold text-pine">
            <Check className="h-3.5 w-3.5" /> كل العناصر الأساسية مكتملة.
          </p>
        )}
      </div>
    </ToolShell>
  );
}
