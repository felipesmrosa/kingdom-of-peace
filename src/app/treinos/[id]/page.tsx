"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { uid } from "@/lib/id";
import type { Routine } from "@/lib/types";
import { WEEKDAY_SHORT, WEEK_ORDER } from "@/lib/dates";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@/components/icons";
import { Button, LinkButton, PageHeader, Stepper, Switch } from "@/components/ui";

const CARDIO_QUICK = [15, 20, 30, 45, 60];

export default function EditarTreinoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const routine = useStore((s) => s.routines.find((r) => r.id === id));
  const updateRoutine = useStore((s) => s.updateRoutine);
  const deleteRoutine = useStore((s) => s.deleteRoutine);
  const [focusId, setFocusId] = useState<string | null>(null);

  // Ao sair da tela, descarta exercícios que ficaram sem nome.
  useEffect(() => {
    return () => {
      useStore
        .getState()
        .updateRoutine(id, (r) => ({ ...r, exercises: r.exercises.filter((e) => e.name.trim()) }));
    };
  }, [id]);

  if (!routine) {
    return (
      <>
        <PageHeader title="Treino não encontrado" back="/treinos" />
        <div className="px-5">
          <p className="mb-4 text-muted">Esse treino não existe mais.</p>
          <LinkButton href="/treinos" variant="primary">
            Voltar pros treinos
          </LinkButton>
        </div>
      </>
    );
  }

  const patch = (fn: (r: Routine) => Routine) => updateRoutine(id, fn);

  const toggleDay = (d: number) =>
    patch((r) => ({
      ...r,
      weekdays: r.weekdays.includes(d) ? r.weekdays.filter((x) => x !== d) : [...r.weekdays, d],
    }));

  const move = (index: number, dir: -1 | 1) =>
    patch((r) => {
      const to = index + dir;
      if (to < 0 || to >= r.exercises.length) return r;
      const next = [...r.exercises];
      [next[index], next[to]] = [next[to], next[index]];
      return { ...r, exercises: next };
    });

  const addExercise = () => {
    const ex = { id: uid(), name: "", sets: 3, reps: "10" };
    setFocusId(ex.id);
    patch((r) => ({ ...r, exercises: [...r.exercises, ex] }));
  };

  const remove = () => {
    if (!window.confirm(`Excluir "${routine.name}"? Os treinos que você já registrou continuam salvos.`)) return;
    deleteRoutine(id);
    router.replace("/treinos");
  };

  return (
    <>
      <PageHeader title="Editar treino" back="/treinos" />

      <div className="flex flex-col gap-5 px-5">
        <section className="rounded-3xl bg-surface p-5">
          <label htmlFor="routine-name" className="mb-1 block text-sm font-medium text-muted">
            Nome do treino
          </label>
          <input
            id="routine-name"
            value={routine.name}
            onChange={(e) => patch((r) => ({ ...r, name: e.target.value }))}
            placeholder="Ex.: Peito e tríceps"
            className="h-14 w-full rounded-2xl bg-bg px-4 text-xl font-bold outline-none"
          />

          <p className="mb-2 mt-5 text-sm font-medium text-muted">Em quais dias você faz esse treino?</p>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEK_ORDER.map((d) => {
              const on = routine.weekdays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDay(d)}
                  className={`h-12 rounded-2xl text-sm font-bold ${
                    on ? "bg-royal text-on-royal" : "bg-bg text-muted"
                  }`}
                >
                  {WEEKDAY_SHORT[d]}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-lg font-bold">Exercícios</h2>
          {routine.exercises.length === 0 && (
            <p className="mb-3 px-1 text-muted">Nenhum exercício ainda. Adicione o primeiro abaixo.</p>
          )}
          <ul className="flex flex-col gap-3">
            {routine.exercises.map((e, i) => (
              <li key={e.id} className="rounded-3xl bg-surface p-4">
                <input
                  aria-label="Nome do exercício"
                  list="exercise-catalog"
                  autoComplete="off"
                  autoFocus={focusId === e.id}
                  value={e.name}
                  placeholder="Nome do exercício"
                  onChange={(ev) =>
                    patch((r) => ({
                      ...r,
                      exercises: r.exercises.map((x) => (x.id === e.id ? { ...x, name: ev.target.value } : x)),
                    }))
                  }
                  className="h-12 w-full rounded-2xl bg-bg px-4 text-lg font-bold outline-none"
                />
                <div className="mt-3 grid grid-cols-[1fr_1fr] gap-3">
                  <div>
                    <span className="mb-1 block text-xs font-medium text-muted">Séries</span>
                    <Stepper
                      tone="bg"
                      label="Séries"
                      value={e.sets}
                      min={1}
                      max={20}
                      onChange={(v) =>
                        patch((r) => ({
                          ...r,
                          exercises: r.exercises.map((x) => (x.id === e.id ? { ...x, sets: v } : x)),
                        }))
                      }
                    />
                  </div>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-muted">Repetições</span>
                    <input
                      value={e.reps}
                      placeholder="8-12"
                      onChange={(ev) =>
                        patch((r) => ({
                          ...r,
                          exercises: r.exercises.map((x) => (x.id === e.id ? { ...x, reps: ev.target.value } : x)),
                        }))
                      }
                      className="num h-11 w-full rounded-xl bg-bg text-center text-xl font-bold outline-none"
                    />
                  </label>
                </div>
                <div className="mt-3 flex justify-end gap-1">
                  <button
                    type="button"
                    aria-label={`Subir ${e.name || "exercício"}`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="grid size-10 place-items-center rounded-full text-muted disabled:opacity-30"
                  >
                    <IconArrowUp width={20} height={20} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Descer ${e.name || "exercício"}`}
                    disabled={i === routine.exercises.length - 1}
                    onClick={() => move(i, 1)}
                    className="grid size-10 place-items-center rounded-full text-muted disabled:opacity-30"
                  >
                    <IconArrowDown width={20} height={20} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover ${e.name || "exercício"}`}
                    onClick={() => patch((r) => ({ ...r, exercises: r.exercises.filter((x) => x.id !== e.id) }))}
                    className="grid size-10 place-items-center rounded-full text-rose"
                  >
                    <IconTrash width={20} height={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Button className="mt-3 w-full" onClick={addExercise}>
            <IconPlus width={20} height={20} />
            Adicionar exercício
          </Button>
        </section>

        <section className="rounded-3xl bg-surface p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold">Cardio</h2>
              <p className="text-sm text-muted">
                {routine.cardio
                  ? "Entra no fim do treino, depois dos exercícios."
                  : "Ative pra terminar esse treino com cardio."}
              </p>
            </div>
            <Switch
              label="Cardio"
              checked={!!routine.cardio}
              onChange={(on) => patch((r) => ({ ...r, cardio: on ? { minutes: r.cardio?.minutes ?? 30 } : null }))}
            />
          </div>

          {routine.cardio && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-muted">Quantos minutos de cardio?</p>
              <Stepper
                tone="bg"
                label="Minutos de cardio"
                value={routine.cardio.minutes}
                step={5}
                min={1}
                max={300}
                onChange={(v) => patch((r) => ({ ...r, cardio: { minutes: Math.max(1, Math.round(v)) } }))}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {CARDIO_QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    aria-pressed={routine.cardio?.minutes === q}
                    onClick={() => patch((r) => ({ ...r, cardio: { minutes: q } }))}
                    className={`num min-h-9 rounded-full px-3 text-sm font-semibold ${
                      routine.cardio?.minutes === q ? "bg-ink text-bg" : "bg-surface-2 text-ink"
                    }`}
                  >
                    {q}min
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <p className="px-1 text-center text-sm text-muted">As mudanças são salvas sozinhas.</p>
        <Button variant="danger" onClick={remove}>
          Excluir treino
        </Button>
      </div>
    </>
  );
}
