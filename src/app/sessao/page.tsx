"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { lastSets, useStore } from "@/lib/store";
import { uid } from "@/lib/id";
import { formatClock, formatVolume } from "@/lib/dates";
import { sessionVolume, setsDone } from "@/lib/stats";
import { useNow } from "@/lib/hooks";
import type { ExerciseLog } from "@/lib/types";
import { AddExerciseSheet } from "@/components/AddExerciseSheet";
import { ExerciseCard } from "@/components/ExerciseCard";
import { IconChevronLeft, IconPlus } from "@/components/icons";
import { Button, DurationField, Sheet } from "@/components/ui";

const REST_PRESETS = [60, 90, 120, 180];

export default function SessaoPage() {
  const router = useRouter();
  const sessions = useStore((s) => s.sessions);
  const active = sessions.find((s) => s.status === "active");
  const updateSession = useStore((s) => s.updateSession);
  const finishSession = useStore((s) => s.finishSession);
  const discardSession = useStore((s) => s.discardSession);

  const now = useNow(1000);
  const leaving = useRef(false);

  const [rest, setRest] = useState<{ end: number } | null>(null);
  const [restLen, setRestLen] = useState(90);
  const [addOpen, setAddOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [minutes, setMinutes] = useState(60);
  const [notes, setNotes] = useState("");

  // Sem treino em andamento não há o que mostrar aqui.
  useEffect(() => {
    if (!active && !leaving.current) router.replace("/");
  }, [active, router]);

  // Mantém a tela acesa durante o treino.
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        if ("wakeLock" in navigator) lock = await navigator.wakeLock.request("screen");
      } catch {
        /* sem suporte ou negado: segue sem */
      }
    };
    request();
    const onVisible = () => {
      if (document.visibilityState === "visible") request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, []);

  // Fim do descanso: vibra e some sozinho.
  const restDone = rest !== null && now >= rest.end;
  useEffect(() => {
    if (!restDone) return;
    navigator.vibrate?.([250, 120, 250]);
    const t = setTimeout(() => setRest(null), 3500);
    return () => clearTimeout(t);
  }, [restDone]);

  if (!active) return null;

  const elapsed = active.startedAt ? Math.floor((now - active.startedAt) / 1000) : 0;
  const remaining = rest ? Math.max(0, Math.ceil((rest.end - now) / 1000)) : 0;

  const changeExercise = (next: ExerciseLog) =>
    updateSession(active.id, (s) => ({
      ...s,
      exercises: s.exercises.map((e) => (e.id === next.id ? next : e)),
    }));

  const removeExercise = (ex: ExerciseLog) => {
    if (ex.sets.some((x) => x.done) && !window.confirm(`Remover "${ex.name}" e as séries já marcadas?`)) return;
    updateSession(active.id, (s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== ex.id) }));
  };

  const addExercise = (name: string) => {
    const prev = lastSets(sessions, name, active.id);
    const sets = prev
      ? prev.map((p) => ({ id: uid(), weight: p.weight, reps: p.reps, done: false }))
      : [{ id: uid(), weight: 0, reps: 10, done: false }];
    updateSession(active.id, (s) => ({ ...s, exercises: [...s.exercises, { id: uid(), name, sets }] }));
  };

  const openFinish = () => {
    setMinutes(Math.max(1, Math.round(elapsed / 60)));
    setNotes(active.notes);
    setFinishOpen(true);
  };

  const save = () => {
    leaving.current = true;
    finishSession(active.id, minutes, notes.trim());
    router.replace("/");
  };

  const discard = () => {
    if (!window.confirm("Descartar esse treino? Nada do que você marcou será salvo.")) return;
    leaving.current = true;
    discardSession(active.id);
    router.replace("/");
  };

  const doneSets = setsDone(active);
  const volume = sessionVolume(active);

  return (
    <>
      <header className="sticky top-0 z-30 bg-bg/95 px-5 pb-3 pt-4 backdrop-blur">
        <Link
          href="/"
          className="-ml-2 inline-flex min-h-10 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-muted"
        >
          <IconChevronLeft width={18} height={18} />
          Início
        </Link>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold leading-tight">{active.routineName}</h1>
            <p className="num text-sm text-muted">
              {doneSets} {doneSets === 1 ? "série feita" : "séries feitas"}
              {volume > 0 && `, ${formatVolume(volume)}`}
            </p>
          </div>
          <div className="num rounded-2xl bg-saffron px-3 py-2 text-2xl font-extrabold text-on-saffron" aria-label="Tempo de treino">
            {formatClock(elapsed)}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-medium text-muted">Descanso</span>
          <div className="flex flex-1 gap-1.5">
            {REST_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={restLen === p}
                onClick={() => setRestLen(p)}
                className={`num min-h-9 flex-1 rounded-full text-sm font-semibold ${
                  restLen === p ? "bg-ink text-bg" : "bg-surface-2 text-ink"
                }`}
              >
                {p < 120 ? `${p}s` : `${p / 60}min`}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-5 pt-2">
        {active.exercises.length === 0 && (
          <p className="rounded-3xl bg-surface p-5 text-muted">
            Esse treino ainda não tem exercícios. Adicione o primeiro pra começar a marcar as séries.
          </p>
        )}

        {active.exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            previous={lastSets(sessions, ex.name, active.id)}
            onChange={changeExercise}
            onRemove={() => removeExercise(ex)}
            onSetDone={() => setRest({ end: Date.now() + restLen * 1000 })}
          />
        ))}

        <Button onClick={() => setAddOpen(true)}>
          <IconPlus width={20} height={20} />
          Adicionar exercício
        </Button>
        <Button variant="done" onClick={openFinish}>
          Finalizar treino
        </Button>
        <div className={rest ? "h-24" : "h-2"} />
      </div>

      {rest && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div
            role="timer"
            className={`flex items-center justify-between gap-3 rounded-2xl p-3 pl-4 shadow-[0_2px_0_rgb(0_0_0/0.15)] ${
              restDone ? "bg-saffron text-on-saffron" : "bg-ink text-bg"
            }`}
          >
            <div>
              <p className="text-xs font-medium opacity-80">{restDone ? "Descanso acabou" : "Descansando"}</p>
              <p className="num text-3xl font-extrabold leading-none">
                {restDone ? "Bora!" : formatClock(remaining)}
              </p>
            </div>
            <div className="flex gap-1.5">
              {!restDone && (
                <>
                  <button
                    type="button"
                    onClick={() => setRest({ end: rest.end - 15000 })}
                    className="num min-h-11 rounded-xl bg-bg/15 px-3 text-sm font-bold"
                  >
                    −15s
                  </button>
                  <button
                    type="button"
                    onClick={() => setRest({ end: rest.end + 15000 })}
                    className="num min-h-11 rounded-xl bg-bg/15 px-3 text-sm font-bold"
                  >
                    +15s
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setRest(null)}
                className="min-h-11 rounded-xl bg-bg/15 px-3 text-sm font-bold"
              >
                {restDone ? "Fechar" : "Pular"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddExerciseSheet open={addOpen} onClose={() => setAddOpen(false)} onAdd={addExercise} />

      <Sheet open={finishOpen} onClose={() => setFinishOpen(false)} title="Finalizar treino">
        <p className="num mb-4 text-muted">
          {doneSets} {doneSets === 1 ? "série feita" : "séries feitas"}
          {volume > 0 && `, ${formatVolume(volume)} levantados`}
        </p>
        {doneSets === 0 && (
          <p className="mb-4 rounded-2xl bg-saffron/25 p-3 text-sm">
            Você não marcou nenhuma série. Dá pra salvar mesmo assim, só conta como treino feito.
          </p>
        )}
        <p className="mb-2 text-sm font-medium text-muted">Tempo de treino</p>
        <DurationField minutes={minutes} onChange={setMinutes} />

        <label htmlFor="notes" className="mb-1 mt-5 block text-sm font-medium text-muted">
          Observações (opcional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Como foi o treino? Alguma dor, carga que quer subir..."
          className="w-full resize-none rounded-2xl bg-bg p-4 text-base outline-none"
        />

        <Button variant="done" className="mt-5 w-full" disabled={minutes < 1} onClick={save}>
          Salvar treino
        </Button>
        <Button className="mt-2 w-full" onClick={() => setFinishOpen(false)}>
          Continuar treinando
        </Button>
        <Button variant="danger" className="mt-2 w-full" onClick={discard}>
          Descartar treino
        </Button>
      </Sheet>
    </>
  );
}
