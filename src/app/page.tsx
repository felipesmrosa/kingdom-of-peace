"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  WEEKDAY_SHORT,
  formatDuration,
  formatVolume,
  longDate,
  todayKey,
  weekKeys,
  weekdayOf,
} from "@/lib/dates";
import { currentStreak, dayStatus, weekSummary } from "@/lib/stats";
import { DayDot, STATUS_LABEL } from "@/components/DayDot";
import { DayPanel, DaySheet } from "@/components/DayPanel";
import { IconGear } from "@/components/icons";
import { Button, LinkButton, PageHeader } from "@/components/ui";

export default function HojePage() {
  const router = useRouter();
  const routines = useStore((s) => s.routines);
  const sessions = useStore((s) => s.sessions);
  const startSession = useStore((s) => s.startSession);

  const today = todayKey();
  const [sheetDate, setSheetDate] = useState<string | null>(null);

  const streak = currentStreak(routines, sessions, today);
  const week = weekSummary(today, routines, sessions);
  const keys = weekKeys(today);
  const firstTime = routines.length === 0 && sessions.length === 0;

  return (
    <>
      <PageHeader
        title="Hoje"
        subtitle={longDate(today)}
        right={
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="rounded-2xl bg-saffron px-3 py-1.5 text-center leading-tight text-on-saffron">
                <span className="num block text-xl font-extrabold">{streak}</span>
                <span className="block text-xs font-semibold">{streak === 1 ? "treino seguido" : "treinos seguidos"}</span>
              </div>
            )}
            <Link
              href="/config"
              aria-label="Ajustes e backup"
              className="grid size-11 place-items-center rounded-full text-muted active:bg-surface-2"
            >
              <IconGear />
            </Link>
          </div>
        }
      />

      <div className="flex flex-col gap-5 px-5">
        {firstTime ? (
          <section className="rounded-3xl bg-surface p-5">
            <h2 className="text-2xl font-extrabold leading-tight">Vamos montar seu plano</h2>
            <p className="mt-2 text-muted">
              Escolha os treinos e os dias da semana. Depois é só abrir o app, tocar em começar e ir
              marcando cada série.
            </p>
            <LinkButton href="/treinos" variant="primary" className="mt-5 w-full">
              Montar meu plano
            </LinkButton>
            <Button
              className="mt-2 w-full"
              onClick={() => {
                startSession(null, today);
                router.push("/sessao");
              }}
            >
              Só começar um treino livre
            </Button>
          </section>
        ) : (
          <DayPanel date={today} />
        )}

        <section aria-label="Semana" className="rounded-3xl bg-surface p-4">
          <div className="grid grid-cols-7 gap-1">
            {keys.map((k) => {
              const st = dayStatus(k, routines, sessions, today);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSheetDate(k)}
                  aria-label={`${longDate(k)}: ${STATUS_LABEL[st]}`}
                  className="flex flex-col items-center gap-1.5 rounded-2xl py-1"
                >
                  <span className="text-xs font-medium text-muted">{WEEKDAY_SHORT[weekdayOf(k)]}</span>
                  <DayDot day={Number(k.slice(8))} status={st} isToday={k === today} size="sm" />
                </button>
              );
            })}
          </div>

          <dl className="mt-4 grid grid-cols-3 divide-x divide-line border-t border-line pt-4 text-center">
            <div>
              <dd className="num text-2xl font-extrabold">
                {week.done}
                <span className="text-lg text-muted">/{Math.max(week.planned, week.done)}</span>
              </dd>
              <dt className="text-xs font-medium text-muted">treinos na semana</dt>
            </div>
            <div>
              <dd className="num text-2xl font-extrabold">{formatDuration(week.minutes)}</dd>
              <dt className="text-xs font-medium text-muted">de treino</dt>
            </div>
            <div>
              <dd className="num text-2xl font-extrabold">{formatVolume(week.volume)}</dd>
              <dt className="text-xs font-medium text-muted">levantados</dt>
            </div>
          </dl>
        </section>
      </div>

      <DaySheet date={sheetDate} onClose={() => setSheetDate(null)} />
    </>
  );
}
