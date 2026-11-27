"use client";

import type { ExerciseLog, SetLog } from "@/lib/types";
import { uid } from "@/lib/id";
import { formatWeight } from "@/lib/dates";
import { IconCheck, IconTrash } from "./icons";
import { Stepper } from "./ui";

export function ExerciseCard({
  exercise,
  previous,
  onChange,
  onRemove,
  onSetDone,
}: {
  exercise: ExerciseLog;
  /** séries feitas na última vez que esse exercício foi treinado */
  previous: SetLog[] | null;
  onChange: (ex: ExerciseLog) => void;
  onRemove: () => void;
  onSetDone?: () => void;
}) {
  const patchSet = (id: string, patch: Partial<SetLog>) =>
    onChange({
      ...exercise,
      sets: exercise.sets.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });

  // Aquecimento fica separado: não entra na contagem de séries nem no "melhor da última vez".
  const workSets = exercise.sets.filter((s) => !s.warmup);
  const hasWarmup = exercise.sets.some((s) => s.warmup);

  const addSet = () => {
    const last = workSets[workSets.length - 1] ?? exercise.sets[exercise.sets.length - 1];
    onChange({
      ...exercise,
      sets: [
        ...exercise.sets,
        { id: uid(), weight: last?.weight ?? 0, reps: last?.reps ?? 10, done: false },
      ],
    });
  };

  const removeLastSet = () => onChange({ ...exercise, sets: exercise.sets.slice(0, -1) });

  const doneCount = workSets.filter((s) => s.done).length;
  const prevWork = previous?.filter((x) => !x.warmup) ?? [];
  const best =
    prevWork.length > 0
      ? prevWork.reduce((a, b) =>
          b.weight > a.weight || (b.weight === a.weight && b.reps > a.reps) ? b : a
        )
      : null;

  return (
    <section className="rounded-3xl bg-surface p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug">{exercise.name}</h3>
          <p className="text-sm text-muted">
            {best
              ? `Última vez: ${prevWork.length} séries, melhor ${formatWeight(best.weight)} × ${best.reps}`
              : "Primeira vez que você registra esse"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="num rounded-full bg-surface-2 px-2.5 py-1 text-sm font-semibold">
            {doneCount}/{workSets.length}
          </span>
          <button
            type="button"
            aria-label={`Remover ${exercise.name}`}
            onClick={onRemove}
            className="grid size-9 place-items-center rounded-full text-muted active:bg-surface-2"
          >
            <IconTrash width={20} height={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-[1.5rem_1fr_1fr_2.75rem] gap-2 px-2 pb-1 text-xs font-medium text-muted">
        <span />
        <span className="text-center">Carga (kg)</span>
        <span className="text-center">Repetições</span>
        <span />
      </div>

      <div className="flex flex-col gap-2">
        {exercise.sets.map((s, i) => {
          const prevSet = exercise.sets[i - 1];
          // Numeração separada: aquecimento 1, 2... e séries de trabalho 1, 2...
          const n = exercise.sets.slice(0, i + 1).filter((x) => !!x.warmup === !!s.warmup).length;
          const labels = s.warmup
            ? { load: `Carga do aquecimento ${n}`, reps: `Repetições do aquecimento ${n}`, done: `Aquecimento ${n} feito` }
            : { load: `Carga da série ${n}`, reps: `Repetições da série ${n}`, done: `Série ${n} feita` };
          const showGroup = hasWarmup && (i === 0 || !!prevSet?.warmup !== !!s.warmup);
          return (
            <div key={s.id} className="flex flex-col gap-2">
              {showGroup && (
                <p className="px-2 pt-1 text-sm font-bold">{s.warmup ? "Aquecimento" : "Séries de trabalho"}</p>
              )}
              <div
                className={`grid grid-cols-[1.5rem_1fr_1fr_2.75rem] items-center gap-2 rounded-2xl p-2 transition-colors ${
                  s.done ? "bg-moss/15" : s.warmup ? "bg-saffron/20" : "bg-bg"
                }`}
              >
                <span className="num text-center text-sm font-bold text-muted">{n}</span>
                <Stepper
                  label={labels.load}
                  value={s.weight}
                  step={2.5}
                  onChange={(v) => patchSet(s.id, { weight: v })}
                />
                <Stepper
                  label={labels.reps}
                  value={s.reps}
                  step={1}
                  max={200}
                  onChange={(v) => patchSet(s.id, { reps: v })}
                />
                <button
                  type="button"
                  aria-pressed={s.done}
                  aria-label={labels.done}
                  onClick={() => {
                    patchSet(s.id, { done: !s.done });
                    // Aquecimento não dispara o descanso entre séries.
                    if (!s.done && !s.warmup) onSetDone?.();
                  }}
                  className={`grid size-11 place-items-center rounded-full ${
                    s.done ? "pop bg-moss text-on-moss" : "bg-surface-2 text-muted"
                  }`}
                >
                  <IconCheck width={22} height={22} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={addSet}
          className="min-h-11 flex-1 rounded-2xl bg-surface-2 text-sm font-semibold"
        >
          + Série
        </button>
        {workSets.length > 1 && (
          <button
            type="button"
            onClick={removeLastSet}
            className="min-h-11 rounded-2xl px-4 text-sm font-semibold text-muted"
          >
            Tirar a última
          </button>
        )}
      </div>
    </section>
  );
}
