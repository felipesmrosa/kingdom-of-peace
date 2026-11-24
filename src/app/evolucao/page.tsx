"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatDuration, formatVolume, formatWeight, longDate, shortDate, todayKey } from "@/lib/dates";
import {
  currentStreak,
  exerciseHistory,
  sessionVolume,
  setsDone,
  trainedExercises,
  weeklyCounts,
} from "@/lib/stats";
import { BarChart, LineChart } from "@/components/charts";
import { IconChevronRight } from "@/components/icons";
import { PageHeader } from "@/components/ui";

type Metric = "weight" | "e1rm" | "volume";

const METRICS: { id: Metric; label: string; unit: string }[] = [
  { id: "weight", label: "Carga", unit: "kg" },
  { id: "e1rm", label: "1RM", unit: "kg" },
  { id: "volume", label: "Volume", unit: "kg" },
];

export default function EvolucaoPage() {
  const routines = useStore((s) => s.routines);
  const sessions = useStore((s) => s.sessions);
  const today = todayKey();

  const done = sessions.filter((s) => s.status === "done");
  const exercises = trainedExercises(sessions);
  const [picked, setPicked] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("weight");

  const current = picked && exercises.includes(picked) ? picked : (exercises[0] ?? null);
  const history = current ? exerciseHistory(sessions, current) : [];
  const meta = METRICS.find((m) => m.id === metric)!;
  const points = history.slice(-12).map((p) => ({
    label: shortDate(p.date),
    value:
      metric === "weight"
        ? p.maxWeight
        : metric === "e1rm"
          ? Math.round(p.e1rm * 10) / 10
          : Math.round(p.volume),
  }));

  const best = history.length
    ? history.reduce((a, b) =>
        b.maxWeight > a.maxWeight || (b.maxWeight === a.maxWeight && b.repsAtMax > a.repsAtMax) ? b : a
      )
    : null;
  const gain = history.length > 1 ? history[history.length - 1].maxWeight - history[0].maxWeight : 0;

  const weeks = weeklyCounts(sessions, 8, today).map((w, i, arr) => ({
    label: w.label,
    value: w.count,
    highlight: i === arr.length - 1,
  }));

  const totalMinutes = done.reduce((n, s) => n + s.durationMin, 0);
  const totalVolume = done.reduce((n, s) => n + sessionVolume(s), 0);
  const recent = [...done]
    .sort((a, b) => b.date.localeCompare(a.date) || (b.endedAt ?? 0) - (a.endedAt ?? 0))
    .slice(0, 10);

  if (done.length === 0) {
    return (
      <>
        <PageHeader title="Evolução" />
        <div className="px-5">
          <section className="rounded-3xl bg-surface p-5">
            <h2 className="text-xl font-bold">Ainda não tem treino registrado</h2>
            <p className="mt-1 text-muted">
              Depois do primeiro treino, aqui aparecem sua constância, o tempo treinado e como sua carga
              evolui em cada exercício.
            </p>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Evolução" />

      <div className="flex flex-col gap-5 px-5">
        <section aria-label="Totais" className="rounded-3xl bg-surface p-4">
          <dl className="grid grid-cols-2 gap-y-4 text-center">
            <div>
              <dd className="num text-3xl font-extrabold">{done.length}</dd>
              <dt className="text-xs font-medium text-muted">treinos feitos</dt>
            </div>
            <div>
              <dd className="num text-3xl font-extrabold">{formatDuration(totalMinutes)}</dd>
              <dt className="text-xs font-medium text-muted">treinando no total</dt>
            </div>
            <div>
              <dd className="num text-3xl font-extrabold">{formatVolume(totalVolume)}</dd>
              <dt className="text-xs font-medium text-muted">levantados no total</dt>
            </div>
            <div>
              <dd className="num text-3xl font-extrabold">{currentStreak(routines, sessions, today)}</dd>
              <dt className="text-xs font-medium text-muted">treinos seguidos</dt>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl bg-surface p-4">
          <h2 className="mb-1 text-lg font-bold">Treinos por semana</h2>
          <p className="mb-2 text-sm text-muted">Últimas 8 semanas, a atual em destaque.</p>
          <BarChart bars={weeks} title="Treinos por semana" />
        </section>

        {current && (
          <section className="rounded-3xl bg-surface p-4">
            <h2 className="mb-3 text-lg font-bold">Carga por exercício</h2>
            <label htmlFor="exercise-select" className="sr-only">
              Exercício
            </label>
            <select
              id="exercise-select"
              value={current}
              onChange={(e) => setPicked(e.target.value)}
              className="h-12 w-full rounded-2xl bg-bg px-4 text-base font-semibold outline-none"
            >
              {exercises.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <div className="mt-3 flex gap-1.5" role="group" aria-label="O que mostrar no gráfico">
              {METRICS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={metric === m.id}
                  onClick={() => setMetric(m.id)}
                  className={`min-h-9 flex-1 rounded-full text-sm font-semibold ${
                    metric === m.id ? "bg-ink text-bg" : "bg-surface-2 text-ink"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {metric === "e1rm" && (
              <p className="mt-2 text-sm text-muted">1RM é a carga máxima que você aguentaria em 1 repetição, estimada a partir das suas séries.</p>
            )}
            {metric === "volume" && (
              <p className="mt-2 text-sm text-muted">Volume é carga × repetições somadas em todas as séries do exercício.</p>
            )}

            <div className="mt-4">
              <LineChart points={points} unit={meta.unit} title={`${meta.label} em ${current}`} />
            </div>

            {best && (
              <p className="num mt-3 text-sm text-muted">
                Melhor série:{" "}
                <span className="font-bold text-ink">
                  {formatWeight(best.maxWeight)} × {best.repsAtMax}
                </span>{" "}
                em {shortDate(best.date)}.
                {history.length > 1 &&
                  gain !== 0 &&
                  ` Desde a primeira vez, a carga máxima ${gain > 0 ? "subiu" : "caiu"} ${formatWeight(Math.abs(gain))}.`}
                {history.length === 1 && " Registre mais treinos pra ver a linha evoluir."}
              </p>
            )}
          </section>
        )}

        <section className="rounded-3xl bg-surface p-4">
          <h2 className="mb-2 text-lg font-bold">Últimos treinos</h2>
          <ul className="flex flex-col divide-y divide-line">
            {recent.map((s) => (
              <li key={s.id}>
                <Link href={`/registro/${s.id}`} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{s.routineName}</span>
                    <span className="num block text-sm capitalize-first text-muted">
                      {longDate(s.date)}, {formatDuration(s.durationMin)}
                      {setsDone(s) > 0 && `, ${setsDone(s)} séries`}
                    </span>
                  </span>
                  <IconChevronRight className="shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
