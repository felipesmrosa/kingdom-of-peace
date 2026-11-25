"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BackupFile,
  CardioLog,
  ExerciseLog,
  Routine,
  Session,
  SessionStatus,
  SetLog,
} from "./types";
import { todayKey } from "./dates";
import { uid } from "./id";

export const normName = (s: string) => s.trim().toLowerCase();

/** Séries feitas da última vez que o exercício foi treinado. */
export function lastSets(sessions: Session[], name: string, excludeId?: string): SetLog[] | null {
  const n = normName(name);
  const sorted = sessions
    .filter((s) => s.status === "done" && s.id !== excludeId)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.endedAt ?? 0) - (a.endedAt ?? 0));
  for (const s of sorted) {
    const ex = s.exercises.find((e) => normName(e.name) === n);
    const done = ex?.sets.filter((x) => x.done) ?? [];
    if (done.length > 0) return done;
  }
  return null;
}

function firstNumber(reps: string): number {
  const m = reps.match(/\d+/);
  return m ? parseInt(m[0], 10) : 10;
}

/** Monta os exercícios de um treino já com a carga e as reps da última vez. */
export function buildExercises(routine: Routine | null, sessions: Session[]): ExerciseLog[] {
  if (!routine) return [];
  return routine.exercises
    .filter((pe) => pe.name.trim())
    .map((pe) => {
    const prev = lastSets(sessions, pe.name);
    const count = Math.max(1, pe.sets);
    const sets: SetLog[] = Array.from({ length: count }, (_, i) => {
      const p = prev ? (prev[i] ?? prev[prev.length - 1]) : null;
      return { id: uid(), weight: p?.weight ?? 0, reps: p?.reps ?? firstNumber(pe.reps), done: false };
    });
    return { id: uid(), name: pe.name, sets };
  });
}

/** Cardio do treino, ainda por fazer. `null` quando o treino não tem cardio. */
export function buildCardio(routine: Routine | null): CardioLog | null {
  if (!routine?.cardio) return null;
  return { targetMin: routine.cardio.minutes, doneMin: 0, done: false, startedAt: null };
}

type State = {
  routines: Routine[];
  sessions: Session[];

  addRoutine: (init?: Partial<Omit<Routine, "id">>) => string;
  updateRoutine: (id: string, fn: (r: Routine) => Routine) => void;
  deleteRoutine: (id: string) => void;

  startSession: (routineId: string | null, date?: string) => string;
  updateSession: (id: string, fn: (s: Session) => Session) => void;
  finishSession: (id: string, durationMin: number, notes: string) => void;
  discardSession: (id: string) => void;
  quickCheckin: (routineId: string | null, date: string, durationMin: number) => string;
  skipDay: (routineId: string, date: string) => void;
  deleteSession: (id: string) => void;

  importData: (raw: unknown) => boolean;
  resetAll: () => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      routines: [],
      sessions: [],

      addRoutine: (init) => {
        const id = uid();
        const routine: Routine = {
          id,
          name: init?.name ?? "Novo treino",
          weekdays: init?.weekdays ?? [],
          exercises: init?.exercises ?? [],
          cardio: init?.cardio ?? null,
        };
        set((s) => ({ routines: [...s.routines, routine] }));
        return id;
      },

      updateRoutine: (id, fn) =>
        set((s) => ({ routines: s.routines.map((r) => (r.id === id ? fn(r) : r)) })),

      deleteRoutine: (id) => set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),

      startSession: (routineId, date = todayKey()) => {
        const existing = get().sessions.find((s) => s.status === "active");
        if (existing) return existing.id;
        const routine = get().routines.find((r) => r.id === routineId) ?? null;
        const session: Session = {
          id: uid(),
          date,
          routineId: routine?.id ?? null,
          routineName: routine?.name ?? "Treino livre",
          status: "active",
          startedAt: Date.now(),
          endedAt: null,
          durationMin: 0,
          exercises: buildExercises(routine, get().sessions),
          cardio: buildCardio(routine),
          notes: "",
        };
        set((s) => ({ sessions: [...s.sessions, session] }));
        return session.id;
      },

      updateSession: (id, fn) =>
        set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? fn(x) : x)) })),

      finishSession: (id, durationMin, notes) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === id
              ? { ...x, status: "done", endedAt: Date.now(), durationMin: Math.max(1, Math.round(durationMin)), notes }
              : x
          ),
        })),

      discardSession: (id) => set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      quickCheckin: (routineId, date, durationMin) => {
        const routine = get().routines.find((r) => r.id === routineId) ?? null;
        const session: Session = {
          id: uid(),
          date,
          routineId: routine?.id ?? null,
          routineName: routine?.name ?? "Treino livre",
          status: "done",
          startedAt: null,
          endedAt: Date.now(),
          durationMin: Math.max(1, Math.round(durationMin)),
          exercises: buildExercises(routine, get().sessions),
          cardio: buildCardio(routine),
          notes: "",
        };
        set((s) => ({ sessions: [...s.sessions, session] }));
        return session.id;
      },

      skipDay: (routineId, date) => {
        const routine = get().routines.find((r) => r.id === routineId);
        if (!routine) return;
        const session: Session = {
          id: uid(),
          date,
          routineId: routine.id,
          routineName: routine.name,
          status: "skipped",
          startedAt: null,
          endedAt: null,
          durationMin: 0,
          exercises: [],
          notes: "",
        };
        set((s) => ({ sessions: [...s.sessions, session] }));
      },

      deleteSession: (id) => set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      importData: (raw) => {
        if (!raw || typeof raw !== "object") return false;
        const o = raw as Partial<BackupFile>;
        if (!Array.isArray(o.routines) || !Array.isArray(o.sessions)) return false;
        const routines = o.routines.map(sanitizeRoutine).filter((r): r is Routine => r !== null);
        const sessions = o.sessions.map(sanitizeSession).filter((x): x is Session => x !== null);
        set({ routines, sessions });
        return true;
      },

      resetAll: () => set({ routines: [], sessions: [] }),
    }),
    {
      name: "kop-v1",
      version: 1,
      partialize: (s) => ({ routines: s.routines, sessions: s.sessions }),
    }
  )
);

/* ---------- validação do backup importado ---------- */

const STATUSES: SessionStatus[] = ["active", "done", "skipped"];
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object";
const str = (x: unknown, fallback = "") => (typeof x === "string" ? x : fallback);
const num = (x: unknown, fallback = 0) => (typeof x === "number" && Number.isFinite(x) ? x : fallback);

function sanitizeRoutine(x: unknown): Routine | null {
  if (!isObj(x) || typeof x.id !== "string") return null;
  return {
    id: x.id,
    name: str(x.name, "Treino"),
    weekdays: Array.isArray(x.weekdays)
      ? x.weekdays.filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6)
      : [],
    exercises: Array.isArray(x.exercises)
      ? x.exercises.filter(isObj).map((e) => ({
          id: str(e.id, uid()),
          name: str(e.name, "Exercício"),
          sets: Math.max(1, num(e.sets, 3)),
          reps: str(e.reps, "10"),
        }))
      : [],
    cardio: isObj(x.cardio) ? { minutes: Math.max(1, Math.round(num(x.cardio.minutes, 30))) } : null,
  };
}

function sanitizeSession(x: unknown): Session | null {
  if (!isObj(x) || typeof x.id !== "string") return null;
  if (typeof x.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x.date)) return null;
  if (!STATUSES.includes(x.status as SessionStatus)) return null;
  return {
    id: x.id,
    date: x.date,
    routineId: typeof x.routineId === "string" ? x.routineId : null,
    routineName: str(x.routineName, "Treino"),
    status: x.status as SessionStatus,
    startedAt: typeof x.startedAt === "number" ? x.startedAt : null,
    endedAt: typeof x.endedAt === "number" ? x.endedAt : null,
    durationMin: num(x.durationMin),
    cardio: isObj(x.cardio)
      ? {
          targetMin: Math.max(1, Math.round(num(x.cardio.targetMin, 30))),
          doneMin: Math.max(0, Math.round(num(x.cardio.doneMin))),
          done: x.cardio.done === true,
          startedAt: typeof x.cardio.startedAt === "number" ? x.cardio.startedAt : null,
        }
      : null,
    notes: str(x.notes),
    exercises: Array.isArray(x.exercises)
      ? x.exercises.filter(isObj).map((e) => ({
          id: str(e.id, uid()),
          name: str(e.name, "Exercício"),
          sets: Array.isArray(e.sets)
            ? e.sets.filter(isObj).map((st) => ({
                id: str(st.id, uid()),
                weight: Math.max(0, num(st.weight)),
                reps: Math.max(0, num(st.reps)),
                done: st.done === true,
              }))
            : [],
        }))
      : [],
  };
}
