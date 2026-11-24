import type { DayStatus } from "@/lib/stats";

const STYLE: Record<DayStatus, string> = {
  done: "bg-moss text-on-moss font-bold",
  active: "bg-saffron text-on-saffron font-bold",
  skipped: "bg-surface-2 text-muted line-through",
  missed: "border-2 border-rose/70 text-rose font-semibold",
  pending: "border-2 border-royal text-royal font-bold",
  planned: "border-2 border-dashed border-royal/60 text-royal font-semibold",
  rest: "text-muted font-medium",
};

export const STATUS_LABEL: Record<DayStatus, string> = {
  done: "treino feito",
  active: "treinando agora",
  skipped: "não fui",
  missed: "faltou",
  pending: "treino de hoje",
  planned: "treino planejado",
  rest: "descanso",
};

/** Bolinha do dia: o formato mostra, de relance, o que aconteceu naquele dia. */
export function DayDot({
  day,
  status,
  isToday,
  size = "md",
}: {
  day: number | string;
  status: DayStatus;
  isToday?: boolean;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "size-9 text-sm" : "size-11 text-base";
  return (
    <span
      className={`num grid place-items-center rounded-full ${dim} ${STYLE[status]} ${
        isToday ? "outline-2 outline-offset-2 outline-ink" : ""
      }`}
    >
      {day}
    </span>
  );
}
