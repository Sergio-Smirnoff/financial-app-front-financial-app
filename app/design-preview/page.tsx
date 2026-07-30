"use client";

import { useTheme } from "next-themes";

const accentSteps = [
  "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950",
];

export default function DesignPreviewPage() {
  const { theme, setTheme } = useTheme();
  return (
    <main className="mx-auto max-w-4xl space-y-10 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Design tokens</h1>
        <button
          className="rounded-md border border-border px-3 py-1.5 text-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          Toggle theme
        </button>
      </div>

      <section className="space-y-2">
        <p className="section-head">Accent ramp</p>
        <div className="flex gap-1">
          {accentSteps.map((step) => (
            <div
              key={step}
              className="flex h-14 flex-1 items-end justify-center rounded-sm pb-1 text-[10px]"
              style={{ background: `var(--accent-${step})` }}
            >
              {step}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className="section-head">Money semantics — text, pills, never fills</p>
        <div className="flex items-center gap-6">
          <span className="n text-lg">$1.284.000,00</span>
          <span className="n" style={{ color: "var(--gain)" }}>+4,80&nbsp;%</span>
          <span className="n" style={{ color: "var(--loss)" }}>−2,15&nbsp;%</span>
          <span
            className="tag n"
            style={{ background: "var(--gain-tint)", color: "var(--gain-pill-text)" }}
          >
            ▲ +$12.500,00
          </span>
          <span
            className="tag n"
            style={{ background: "var(--loss-tint)", color: "var(--loss-pill-text)" }}
          >
            ▼ −$8.300,00
          </span>
        </div>
      </section>

      <section className="space-y-2">
        <p className="section-head">Rules and elevation</p>
        <hr className="fade-rule" />
        <div className="flex gap-4 pt-2">
          <div className="elev-sm rounded-lg bg-card p-4 text-sm">elev-sm</div>
          <div className="elev-md rounded-lg bg-card p-4 text-sm">elev-md</div>
          <div className="elev-lg rounded-lg bg-card p-4 text-sm">elev-lg</div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="section-head">Tags, segmented control, status dots</p>
        <div className="flex items-center gap-3">
          <span className="tag tag-accent">Categoría</span>
          <span className="tag tag-neutral">Neutral</span>
          <span className="tag tag-outline">Outline</span>
          <fieldset className="seg">
            {["1M", "3M", "1A"].map((label, index) => (
              <label key={label} className="seg-option relative">
                <input type="radio" name="range" defaultChecked={index === 0} />
                {label}
              </label>
            ))}
          </fieldset>
          <span className="status-dot status-dot-ok">Al día</span>
          <span className="status-dot status-dot-warn">51 d</span>
        </div>
      </section>

      <section className="space-y-2">
        <p className="kicker">Kicker · 11px · 0.14em</p>
        <p className="section-head">Section head · 12px</p>
        <p className="text-[26px] font-medium tracking-[-0.02em]">Page title 26px</p>
      </section>
    </main>
  );
}
