"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { lastSets, useStore } from "@/lib/store";
import { uid } from "@/lib/id";
import { formatDuration, formatVolume, longDate } from "@/lib/dates";
import { sessionVolume, setsDone } from "@/lib/stats";
import type { ExerciseLog } from "@/lib/types";
import { AddExerciseSheet } from "@/components/AddExerciseSheet";
import { ExerciseCard } from "@/components/ExerciseCard";
import { IconPlus } from "@/components/icons";
import { Button, DurationField, LinkButton, PageHeader } from "@/components/ui";

export default function RegistroPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sessions = useStore((s) => s.sessions);
  const session = sessions.find((s) => s.id === id);
  const updateSession = useStore((s) => s.updateSession);
  const deleteSession = useStore((s) => s.deleteSession);
  const [addOpen, setAddOpen] = useState(false);

  if (!session) {
    return (
      <>
        <PageHeader title="Registro não encontrado" back="/calendario" />
        <div className="px-5">
          <p className="mb-4 text-muted">Esse registro não existe mais.</p>
          <LinkButton href="/calendario" variant="primary">
            Ir pro calendário
          </LinkButton>
        </div>
      </>
    );
  }

  if (session.status === "active") {
    return (
      <>
        <PageHeader title={session.routineName} back="/" />
        <div className="px-5">
          <p className="mb-4 text-muted">Esse treino ainda está em andamento.</p>
          <LinkButton href="/sessao" variant="primary">
            Voltar pro treino
          </LinkButton>
        </div>
      </>
    );
  }

  const changeExercise = (next: ExerciseLog) =>
    updateSession(id, (s) => ({ ...s, exercises: s.exercises.map((e) => (e.id === next.id ? next : e)) }));

  const addExercise = (name: string) => {
    const prev = lastSets(sessions, name, id);
    const sets = prev
      ? prev.map((p) => ({ id: uid(), weight: p.weight, reps: p.reps, done: false }))
      : [{ id: uid(), weight: 0, reps: 10, done: false }];
    updateSession(id, (s) => ({ ...s, exercises: [...s.exercises, { id: uid(), name, sets }] }));
  };

  const remove = () => {
    if (!window.confirm("Apagar esse registro? Isso não dá pra desfazer.")) return;
    deleteSession(id);
    router.replace("/calendario");
  };

  if (session.status === "skipped") {
    return (
      <>
        <PageHeader title={session.routineName} subtitle={longDate(session.date)} back="/calendario" />
        <div className="flex flex-col gap-4 px-5">
          <p className="rounded-3xl bg-surface-2 p-5 font-semibold">Você marcou que não foi nesse dia.</p>
          <Button variant="danger" onClick={remove}>
            Desfazer
          </Button>
        </div>
      </>
    );
  }

  const volume = sessionVolume(session);

  return (
    <>
      <PageHeader title={session.routineName} subtitle={longDate(session.date)} back="/calendario" />

      <div className="flex flex-col gap-4 px-5">
        <section className="rounded-3xl bg-surface p-5">
          <dl className="mb-5 grid grid-cols-3 divide-x divide-line text-center">
            <div>
              <dd className="num text-2xl font-extrabold">{formatDuration(session.durationMin)}</dd>
              <dt className="text-xs font-medium text-muted">de treino</dt>
            </div>
            <div>
              <dd className="num text-2xl font-extrabold">{setsDone(session)}</dd>
              <dt className="text-xs font-medium text-muted">séries feitas</dt>
            </div>
            <div>
              <dd className="num text-2xl font-extrabold">{formatVolume(volume)}</dd>
              <dt className="text-xs font-medium text-muted">levantados</dt>
            </div>
          </dl>
          <p className="mb-2 text-sm font-medium text-muted">Tempo de treino</p>
          <DurationField
            minutes={session.durationMin}
            onChange={(m) => updateSession(id, (s) => ({ ...s, durationMin: m }))}
          />
        </section>

        {session.exercises.length === 0 && (
          <p className="rounded-3xl bg-surface p-5 text-muted">
            Esse registro não tem exercícios. Adicione abaixo pra anotar carga e repetições.
          </p>
        )}

        {session.exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            previous={lastSets(sessions, ex.name, id)}
            onChange={changeExercise}
            onRemove={() =>
              updateSession(id, (s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== ex.id) }))
            }
          />
        ))}

        <Button onClick={() => setAddOpen(true)}>
          <IconPlus width={20} height={20} />
          Adicionar exercício
        </Button>

        <section className="rounded-3xl bg-surface p-5">
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-muted">
            Observações
          </label>
          <textarea
            id="notes"
            rows={3}
            value={session.notes}
            onChange={(e) => updateSession(id, (s) => ({ ...s, notes: e.target.value }))}
            placeholder="Como foi o treino?"
            className="w-full resize-none rounded-2xl bg-bg p-4 text-base outline-none"
          />
        </section>

        <p className="px-1 text-center text-sm text-muted">As mudanças são salvas sozinhas.</p>
        <Button variant="danger" onClick={remove}>
          Apagar registro
        </Button>
      </div>

      <AddExerciseSheet open={addOpen} onClose={() => setAddOpen(false)} onAdd={addExercise} />
    </>
  );
}
