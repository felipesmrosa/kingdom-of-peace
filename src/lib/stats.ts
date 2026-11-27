import type { Routine, Session } from "./types";
import { addDays, fromKey, shortDate, startOfWeekKey, todayKey, weekKeys, weekdayOf } from "./dates";
import { normName } from "./store";

export type DayStatus = "done" | "skipped" | "missed" | "pending" | "planned" | "rest" | "active";

export function plannedFor(date: string, routines: Routine[]): Routine[] {
  const wd = weekdayOf(date);
  return routines.filter((r) => r.weekdays.includes(wd));
}

export function dayStatus(
  date: string,
  routines: Routine[],
  sessions: Session[],
  today = todayKey()
): DayStatus {
  const day = sessions.filter((s) => s.date === date);
  if (day.some((s) => s.status === "done")) return "done";
  if (day.some((s) => s.status === "active")) return "active";
  if (day.some((s) => s.status === "skipped")) return "skipped";
  if (plannedFor(date, routines).length === 0) return "rest";
  if (date > today) return "planned";
  if (date === today) return "pending";
  return "missed";
}

/**
 * Sequência de treinos: dias de treino cumpridos em seguida, sem furar nenhum dia planejado.
 * Dia de descanso não quebra a sequência; o dia de hoje ainda pendente também não.
 */
export function currentStreak(routines: Routine[], sessions: Session[], today = todayKey()): number {
  let streak = 0;
  let d = today;
  for (let i = 0; i < 400; i++) {
    const st = dayStatus(d, routines, sessions, today);
    if (st === "done") streak++;
    else if (st === "missed" || st === "skipped") break;
    d = addDays(d, -1);
  }
  return streak;
}

/** Séries feitas, sem contar as de aquecimento. */
export const setsDone = (s: Session) =>
  s.exercises.reduce((n, e) => n + e.sets.filter((x) => x.done && !x.warmup).length, 0);

/** Carga total levantada (carga × repetições), sem contar o aquecimento. */
export const sessionVolume = (s: Session) =>
  s.exercises.reduce(
    (sum, e) =>
      sum + e.sets.filter((x) => x.done && !x.warmup).reduce((a, x) => a + x.weight * x.reps, 0),
    0
  );

export type WeekSummary = { done: number; planned: number; minutes: number; volume: number };

export function weekSummary(date: string, routines: Routine[], sessions: Session[]): WeekSummary {
  const keys = weekKeys(date);
  const done = sessions.filter((s) => s.status === "done" && keys.includes(s.date));
  return {
    done: done.length,
    planned: keys.reduce((n, k) => n + plannedFor(k, routines).length, 0),
    minutes: done.reduce((n, s) => n + s.durationMin, 0),
    volume: done.reduce((n, s) => n + sessionVolume(s), 0),
  };
}

/** Nomes de exercícios conhecidos (plano + histórico), sem repetir. */
export function knownExercises(routines: Routine[], sessions: Session[], catalog: string[]): string[] {
  const seen = new Map<string, string>();
  const add = (name: string) => {
    const k = normName(name);
    if (k && !seen.has(k)) seen.set(k, name.trim());
  };
  routines.forEach((r) => r.exercises.forEach((e) => add(e.name)));
  sessions.forEach((s) => s.exercises.forEach((e) => add(e.name)));
  catalog.forEach(add);
  return [...seen.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Exercícios que já têm ao menos uma série feita, do mais recente para o mais antigo. */
export function trainedExercises(sessions: Session[]): string[] {
  const seen = new Map<string, string>();
  const done = sessions
    .filter((s) => s.status === "done")
    .sort((a, b) => b.date.localeCompare(a.date));
  for (const s of done) {
    for (const e of s.exercises) {
      if (e.sets.some((x) => x.done && !x.warmup)) {
        const k = normName(e.name);
        if (!seen.has(k)) seen.set(k, e.name.trim());
      }
    }
  }
  return [...seen.values()];
}

export type ExercisePoint = {
  date: string;
  maxWeight: number;
  repsAtMax: number;
  /** 1RM estimado (fórmula de Epley) */
  e1rm: number;
  volume: number;
};

export function exerciseHistory(sessions: Session[], name: string): ExercisePoint[] {
  const n = normName(name);
  const points: ExercisePoint[] = [];
  const done = sessions
    .filter((s) => s.status === "done")
    .sort((a, b) => a.date.localeCompare(b.date) || (a.endedAt ?? 0) - (b.endedAt ?? 0));
  for (const s of done) {
    const ex = s.exercises.find((e) => normName(e.name) === n);
    const sets = ex?.sets.filter((x) => x.done && !x.warmup) ?? [];
    if (sets.length === 0) continue;
    const top = sets.reduce((a, b) => (b.weight > a.weight || (b.weight === a.weight && b.reps > a.reps) ? b : a));
    points.push({
      date: s.date,
      maxWeight: top.weight,
      repsAtMax: top.reps,
      e1rm: Math.max(...sets.map((x) => x.weight * (1 + x.reps / 30))),
      volume: sets.reduce((a, x) => a + x.weight * x.reps, 0),
    });
  }
  return points;
}

export type WeekBar = { key: string; label: string; count: number };

/** Treinos feitos por semana nas últimas `n` semanas (a última é a semana atual). */
export function weeklyCounts(sessions: Session[], n = 8, today = todayKey()): WeekBar[] {
  const thisWeek = startOfWeekKey(today);
  const bars: WeekBar[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = addDays(thisWeek, -7 * i);
    const keys = weekKeys(start);
    bars.push({
      key: start,
      label: shortDate(start),
      count: sessions.filter((s) => s.status === "done" && keys.includes(s.date)).length,
    });
  }
  return bars;
}

export function monthRange(year: number, month: number): string[] {
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const d = fromKey(`${year}-${String(month + 1).padStart(2, "0")}-01`);
    d.setDate(i + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
}
