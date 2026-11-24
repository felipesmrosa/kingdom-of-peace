"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  WEEKDAY_SHORT,
  WEEK_ORDER,
  formatDuration,
  fromKey,
  longDate,
  monthGrid,
  monthTitle,
  todayKey,
} from "@/lib/dates";
import { dayStatus, plannedFor, type DayStatus } from "@/lib/stats";
import { DayDot, STATUS_LABEL } from "@/components/DayDot";
import { DaySheet } from "@/components/DayPanel";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";
import { PageHeader } from "@/components/ui";

const LEGEND: DayStatus[] = ["done", "pending", "planned", "missed", "skipped"];

export default function CalendarioPage() {
  const routines = useStore((s) => s.routines);
  const sessions = useStore((s) => s.sessions);

  const today = todayKey();
  const t = fromKey(today);
  const [cursor, setCursor] = useState({ year: t.getFullYear(), month: t.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);

  const cells = monthGrid(cursor.year, cursor.month);
  const monthKeys = cells.filter((c): c is string => c !== null);

  const go = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  const doneInMonth = sessions.filter((s) => s.status === "done" && monthKeys.includes(s.date));
  const minutes = doneInMonth.reduce((n, s) => n + s.durationMin, 0);
  const plannedSoFar = monthKeys
    .filter((k) => k <= today)
    .reduce((n, k) => n + plannedFor(k, routines).length, 0);
  const rate = plannedSoFar > 0 ? Math.min(100, Math.round((doneInMonth.length / plannedSoFar) * 100)) : null;

  return (
    <>
      <PageHeader title="Calendário" />

      <div className="flex flex-col gap-5 px-5">
        <section className="rounded-3xl bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() => go(-1)}
              className="grid size-11 place-items-center rounded-full active:bg-surface-2"
            >
              <IconChevronLeft />
            </button>
            <h2 className="text-lg font-bold capitalize-first">{monthTitle(cursor.year, cursor.month)}</h2>
            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() => go(1)}
              className="grid size-11 place-items-center rounded-full active:bg-surface-2"
            >
              <IconChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {WEEK_ORDER.map((d) => (
              <span key={d} className="pb-1 text-xs font-medium text-muted">
                {WEEKDAY_SHORT[d]}
              </span>
            ))}
            {cells.map((k, i) =>
              k === null ? (
                <span key={`e${i}`} />
              ) : (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelected(k)}
                  aria-label={`${longDate(k)}: ${STATUS_LABEL[dayStatus(k, routines, sessions, today)]}`}
                  className="grid place-items-center py-0.5"
                >
                  <DayDot
                    day={Number(k.slice(8))}
                    status={dayStatus(k, routines, sessions, today)}
                    isToday={k === today}
                  />
                </button>
              )
            )}
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3">
            {LEGEND.map((st) => (
              <li key={st} className="flex items-center gap-2 text-xs font-medium text-muted">
                <DayDot day="" status={st} size="sm" />
                <span className="-ml-1">{STATUS_LABEL[st]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Resumo do mês" className="rounded-3xl bg-surface p-4">
          <dl className="grid grid-cols-3 divide-x divide-line text-center">
            <div>
              <dd className="num text-2xl font-extrabold">{doneInMonth.length}</dd>
              <dt className="text-xs font-medium text-muted">treinos no mês</dt>
            </div>
            <div>
              <dd className="num text-2xl font-extrabold">{formatDuration(minutes)}</dd>
              <dt className="text-xs font-medium text-muted">de treino</dt>
            </div>
            <div>
              <dd className="num text-2xl font-extrabold">{rate === null ? "-" : `${rate}%`}</dd>
              <dt className="text-xs font-medium text-muted">do plano cumprido</dt>
            </div>
          </dl>
        </section>
      </div>

      <DaySheet date={selected} onClose={() => setSelected(null)} />
    </>
  );
}
