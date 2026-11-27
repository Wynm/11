import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "فاتورا — فاتورتك الرسمية في نصف دقيقة";

const font = (weight: 400 | 700 | 800, script: "arabic" | "latin" = "arabic") =>
  readFile(join(process.cwd(), `node_modules/@fontsource/tajawal/files/tajawal-${script}-${weight}-normal.woff`));

/** Latin runs (digits, ICE, MAD…) use the Latin subset so satori never needs a network fallback. */
const L = { fontFamily: "Tajawal Latin" } as const;

/**
 * Satori inflates the space glyph inside Arabic runs, so every phrase is laid out as
 * explicit flex items in reverse order with a fixed gap. Deterministic, no reflow.
 */
function Ar({
  words,
  gap = 10,
  size: fontSize,
  weight = 400,
  color = "#12171D",
  lineHeight = 1,
}: {
  words: string[];
  gap?: number;
  size: number;
  weight?: 400 | 700 | 800;
  color?: string;
  lineHeight?: number;
}) {
  // satori adds ~0.34em of phantom trailing advance per Arabic run — pull neighbours back.
  const squeeze = Math.round(fontSize * 0.2);
  return (
    <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "baseline", lineHeight }}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          style={{
            fontSize,
            fontWeight: weight,
            color,
            whiteSpace: "nowrap",
            marginRight: i === 0 ? 0 : gap - squeeze,
            marginLeft: i === words.length - 1 ? 0 : gap - squeeze,
          }}
        >
          {w}
        </span>
      ))}
    </div>
  );
}

export default async function OpengraphImage() {
  const [regular, bold, black, latinRegular, latinBold, latinBlack] = await Promise.all([
    font(400),
    font(700),
    font(800),
    font(400, "latin"),
    font(700, "latin"),
    font(800, "latin"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FBF7F0",
          fontFamily: "Tajawal",
          padding: 52,
          gap: 40,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", right: -120, top: -150, width: 430, height: 430, borderRadius: 999, background: "#E7F0EC" }} />
        <div style={{ position: "absolute", left: -100, bottom: -130, width: 330, height: 330, borderRadius: 999, background: "#FBF1DE" }} />

        {/* left: message */}
        <div style={{ width: 560, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", zIndex: 1, overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: "#12171D" }}>فاتورا</span>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#0B5D50", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800 }}>ف</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-end" }}>
            <div style={{ display: "flex", background: "#E7F0EC", color: "#0B5D50", borderRadius: 999, padding: "9px 18px" }}>
              <Ar words={["للمقاول", "الذاتي", "والمستقل", "المغربي"]} size={20} weight={700} color="#0B5D50" gap={8} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
              <Ar words={["فاتورتك", "الرسمية"]} size={50} weight={800} gap={12} />
              <Ar words={["في", "نصف", "دقيقة"]} size={50} weight={800} gap={12} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <Ar words={["مبلغ", "بالحروف", "وفحص", "قانوني"]} size={21} color="#5B6672" gap={8} />
              <Ar words={["قبل", "التصدير", "·", "بلا", "حساب"]} size={21} color="#5B6672" gap={8} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "row-reverse", gap: 10 }}>
            {[
              { w: ["بلا", "حساب"], bg: "#fff", fg: "#0B5D50", border: "#E7DFD2" },
              { w: ["بياناتك", "عندك"], bg: "#fff", fg: "#0B5D50", border: "#E7DFD2" },
              { w: ["مجانًا"], bg: "#E0A03C", fg: "#12171D", border: "#E0A03C" },
            ].map((chip) => (
              <div key={chip.w.join()} style={{ display: "flex", background: chip.bg, border: `1px solid ${chip.border}`, borderRadius: 12, padding: "9px 15px" }}>
                <Ar words={chip.w} size={18} weight={700} color={chip.fg} gap={6} />
              </div>
            ))}
          </div>
        </div>

        {/* right: mini invoice */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            border: "1px solid #E7DFD2",
            borderRadius: 18,
            boxShadow: "0 30px 60px -30px rgba(11,93,80,.35)",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #12171D", paddingBottom: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Ar words={["يوسف", "بنعلي"]} size={22} weight={800} gap={7} />
              <Ar words={["تصوير", "ومحتوى", "بصري"]} size={14} color="#5B6672" gap={5} />
              <span style={{ ...L, fontSize: 14, color: "#5B6672" }}>ICE 002345678900012</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "#0B5D50" }}>فاتورة</span>
              <span style={{ ...L, fontSize: 14, color: "#5B6672" }}>FAC-2026-014</span>
            </div>
          </div>

          <div style={{ display: "flex", background: "#0B5D50", color: "#fff", borderRadius: 8, padding: "10px 14px", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>البيان</span>
            <span style={{ ...L, fontSize: 14, fontWeight: 700, color: "#fff" }}>2.800,00</span>
          </div>

          {[
            { d: ["جلسة", "تصوير", "منتجات"], v: "2.800,00" },
            { d: ["مونتاج", "فيديو"], v: "1.400,00" },
            { d: ["ترخيص", "صور"], v: "0,00" },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: i % 2 ? "#FCFAF6" : "#fff",
                padding: "7px 6px",
                borderBottom: "1px solid #EFEAE1",
              }}
            >
              <Ar words={row.d} size={15} gap={6} />
              <span style={{ ...L, fontSize: 15 }}>{row.v}</span>
            </div>
          ))}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Ar words={["المجموع", "قبل", "الضريبة"]} size={15} color="#5B6672" gap={5} />
              <span style={{ ...L, fontSize: 15, color: "#5B6672" }}>4.200,00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...L, fontSize: 15, color: "#5B6672" }}>TVA 20%</span>
              <span style={{ ...L, fontSize: 15, color: "#5B6672" }}>840,00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FBF1DE", borderRadius: 10, padding: "11px 14px" }}>
              <Ar words={["المجموع", "للدفع"]} size={16} weight={700} gap={6} />
              <span style={{ ...L, fontSize: 23, fontWeight: 800, color: "#0B5D50" }}>5.040,00 MAD</span>
            </div>
            <div style={{ display: "flex", background: "#0B5D50", color: "#E0A03C", borderRadius: 8, padding: "9px 12px", justifyContent: "center" }}>
              <Ar words={["خمسة", "آلاف", "وأربعون", "درهمًا", "فقط"]} size={14} weight={700} color="#E0A03C" gap={6} />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Tajawal", data: regular, weight: 400, style: "normal" },
        { name: "Tajawal", data: bold, weight: 700, style: "normal" },
        { name: "Tajawal", data: black, weight: 800, style: "normal" },
        { name: "Tajawal Latin", data: latinRegular, weight: 400, style: "normal" },
        { name: "Tajawal Latin", data: latinBold, weight: 700, style: "normal" },
        { name: "Tajawal Latin", data: latinBlack, weight: 800, style: "normal" },
      ],
    },
  );
}
