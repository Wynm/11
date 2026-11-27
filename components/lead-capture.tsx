"use client";

import { useState } from "react";
import { ArrowLeft, Check, Loader2, Mail } from "lucide-react";

const TRADES = [
  { id: "designer", label: "تصميم / جرافيك" },
  { id: "developer", label: "تطوير وبرمجة" },
  { id: "photographer", label: "تصوير" },
  { id: "consultant", label: "استشارات" },
  { id: "translator", label: "ترجمة" },
  { id: "other", label: "مهنة أخرى" },
];

/**
 * Lead magnet for people not ready to invoice yet: a checklist that actually solves the
 * "why was my invoice rejected" pain, delivered by email. Doubles as our first revenue list.
 */
export function LeadCapture() {
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState("designer");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    setMessage("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, kind, source: "landing-checklist" }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setState("error");
        setMessage(data.message || "تعذّر التسجيل — حاول مرة أخرى.");
        return;
      }
      setState("done");
    } catch {
      setState("error");
      setMessage("تعذّر الاتصال — تحقق من اتصالك بالإنترنت.");
    }
  };

  return (
    <section id="checklist" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid items-center gap-8 overflow-hidden rounded-[24px] border border-line bg-white/70 p-7 sm:p-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <span className="chip">
            <Mail className="h-3.5 w-3.5 text-pine" />
            هدية مجانية
          </span>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]">
            فاتورة مرفوضة مرة واحدة تكفي.
          </h2>
          <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-muted">
            أرسل لنا بريدك ويصلك <b className="text-ink">«قائمة الفاتورة التي تمر من أول مرة»</b>: 12 بندًا يفحصه
            محاسب الشركة قبل الأداء — ICE، IF، الترقيم، TVA، ومبلغ بالحروف لا يُرفض. مراجعة واحدة، وتصبح فواتيرك
            تُقبل دائمًا.
          </p>
          <ul className="mt-5 grid gap-2 text-[13px] text-ink/75 sm:grid-cols-2">
            {["صيغة PDF عربية/فرنسية", "جدول احتساب الضريبة", "نموذج شروط أداء", "بريدي واحد فقط، بلا إلحاح"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-pine" strokeWidth={3} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-5">
          {state === "done" ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pine text-white">
                <Check className="h-6 w-6" strokeWidth={3} />
              </span>
              <h3 className="mt-4 text-[17px] font-extrabold">وصلنا بريدك.</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                ستصلك القائمة في أول دفعة بريد. وأثناء انتظارك: افتح المحرّر وأنشئ فاتورتك الأولى في دقيقتين.
              </p>
              <a href="/new" className="btn-primary mt-5 w-full justify-center">
                ابدأ الفاتورة الآن <ArrowLeft className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[12px] font-bold text-muted">بريدك الإلكتروني</span>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.ma"
                  className="input text-left"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-bold text-muted">مجالك</span>
                <select value={kind} onChange={(e) => setKind(e.target.value)} className="input">
                  {TRADES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" disabled={state === "busy"} className="btn-primary w-full justify-center">
                {state === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                أرسلوا لي القائمة
              </button>
              {state === "error" ? <p className="text-center text-[12px] font-bold text-clay">{message}</p> : null}
              <p className="text-center text-[10.5px] leading-relaxed text-muted">
                نستعمل بريدك لهذه القائمة وتحديثات المنتج فقط — لا نبيعه ولا نشاركه. إلغاء الاشتراك بنقرة.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
