"use client";

import Link from "next/link";
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { IconChevronLeft } from "./icons";

/* ---------- Botão ---------- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "done";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-royal text-on-royal",
  secondary: "bg-surface-2 text-ink",
  ghost: "text-royal",
  danger: "bg-rose/15 text-rose",
  done: "bg-moss text-on-moss",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "md" | "sm" }) {
  const sizing = size === "sm" ? "min-h-10 px-4 text-sm" : "min-h-12 px-5 text-base";
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 ${sizing} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

/** Link com cara de botão. */
export function LinkButton({
  href,
  variant = "secondary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: "md" | "sm";
  className?: string;
  children: ReactNode;
}) {
  const sizing = size === "sm" ? "min-h-10 px-4 text-sm" : "min-h-12 px-5 text-base";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] ${sizing} ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

/* ---------- Cabeçalho de página ---------- */

export function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  right?: ReactNode;
}) {
  return (
    <header className="px-5 pb-4 pt-6">
      {back && (
        <Link
          href={back}
          className="-ml-2 mb-2 inline-flex min-h-10 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-muted"
        >
          <IconChevronLeft width={18} height={18} />
          Voltar
        </Link>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {subtitle && <p className="text-sm font-medium capitalize-first text-muted">{subtitle}</p>}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{title}</h1>
        </div>
        {right}
      </div>
    </header>
  );
}

/* ---------- Bottom sheet ---------- */

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Fechar" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-in relative max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
        <h2 className="mb-4 text-xl font-bold capitalize-first">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/* ---------- Campo numérico com − e + ---------- */

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  label,
  tone = "surface",
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label: string;
  /** cor de fundo do campo, para contrastar com o cartão em que ele está */
  tone?: "surface" | "bg";
}) {
  const [text, setText] = useState(fmt(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(fmt(value));
  }, [value, focused]);

  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n * 100) / 100));

  return (
    <div className={`flex items-center rounded-xl ${tone === "bg" ? "bg-bg" : "bg-surface"}`}>
      <button
        type="button"
        aria-label={`Diminuir ${label}`}
        className="grid h-11 w-8 shrink-0 place-items-center text-xl text-muted active:text-ink"
        onClick={() => onChange(clamp(value - step))}
      >
        −
      </button>
      <input
        aria-label={label}
        inputMode="decimal"
        className="num h-11 w-full min-w-0 bg-transparent text-center text-xl font-bold outline-none"
        value={text}
        onFocus={(e) => {
          setFocused(true);
          e.currentTarget.select();
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setText(e.target.value);
          const n = parseFloat(e.target.value.replace(",", "."));
          if (Number.isFinite(n)) onChange(clamp(n));
        }}
      />
      <button
        type="button"
        aria-label={`Aumentar ${label}`}
        className="grid h-11 w-8 shrink-0 place-items-center text-xl text-muted active:text-ink"
        onClick={() => onChange(clamp(value + step))}
      >
        +
      </button>
    </div>
  );
}

/* ---------- Duração em horas e minutos ---------- */

const QUICK_MINUTES = [30, 45, 60, 75, 90, 120];

export function DurationField({
  minutes,
  onChange,
}: {
  minutes: number;
  onChange: (min: number) => void;
}) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const set = (hh: number, mm: number) =>
    onChange(Math.max(0, Math.min(23, Math.round(hh))) * 60 + Math.max(0, Math.min(59, Math.round(mm))));

  const box =
    "num h-14 w-20 rounded-2xl bg-bg text-center text-3xl font-extrabold outline-none focus-visible:outline-2";

  return (
    <div>
      <div className="flex items-end gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-muted">
          Horas
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={23}
            className={box}
            value={h}
            onChange={(e) => set(Number(e.target.value) || 0, m)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-muted">
          Minutos
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            className={box}
            value={m}
            onChange={(e) => set(h, Number(e.target.value) || 0)}
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_MINUTES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onChange(q)}
            aria-pressed={minutes === q}
            className={`num min-h-9 rounded-full px-3 text-sm font-semibold ${
              minutes === q ? "bg-ink text-bg" : "bg-surface-2 text-ink"
            }`}
          >
            {q < 60 ? `${q}min` : q % 60 === 0 ? `${q / 60}h` : `${Math.floor(q / 60)}h${q % 60}`}
          </button>
        ))}
      </div>
    </div>
  );
}
