"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { WEEKDAY_SHORT, WEEK_ORDER, formatDuration } from "@/lib/dates";
import { IconChevronRight, IconDumbbell, IconPlus } from "@/components/icons";
import { RoutineBadge, toneDot } from "@/components/RoutineBadge";
import { Button, PageHeader } from "@/components/ui";

export default function TreinosPage() {
  const router = useRouter();
  const routines = useStore((s) => s.routines);
  const addRoutine = useStore((s) => s.addRoutine);

  const create = () => {
    const id = addRoutine();
    router.push(`/treinos/${id}`);
  };

  return (
    <>
      <PageHeader title="Treinos" />

      <div className="flex flex-col gap-8 px-5">
        <section aria-labelledby="lista-treinos">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-royal text-on-royal">
              <IconDumbbell />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="lista-treinos" className="text-2xl font-extrabold leading-tight">
                Lista de treinos
              </h2>
              <p className="text-sm text-muted">
                {routines.length === 0 ? "Nenhum treino criado" : "Toque num treino pra editar"}
              </p>
            </div>
            {routines.length > 0 && (
              <span className="num rounded-full bg-surface-2 px-3 py-1 text-lg font-extrabold">
                {routines.length}
              </span>
            )}
          </div>

          {routines.length === 0 ? (
            <div className="rounded-3xl bg-surface p-5">
              <h3 className="text-xl font-bold">Crie seu primeiro treino</h3>
              <p className="mt-1 text-muted">
                Dê um nome, escolha os dias da semana e adicione os exercícios.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {routines.map((r, i) => (
                <li key={r.id}>
                  <Link
                    href={`/treinos/${r.id}`}
                    className="flex items-center gap-4 rounded-3xl bg-surface p-4 active:bg-surface-2"
                  >
                    <RoutineBadge index={i} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xl font-bold">{r.name.trim() || "Treino sem nome"}</span>
                      <span className="block text-sm text-muted">
                        {r.exercises.length} {r.exercises.length === 1 ? "exercício" : "exercícios"}
                        {r.cardio && `, cardio de ${formatDuration(r.cardio.minutes)}`}
                      </span>
                      <span className="block text-sm font-semibold">
                        {r.weekdays.length === 0
                          ? "Sem dia definido"
                          : WEEK_ORDER.filter((d) => r.weekdays.includes(d))
                              .map((d) => WEEKDAY_SHORT[d])
                              .join(", ")}
                      </span>
                    </span>
                    <IconChevronRight className="shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Button variant="primary" className="mt-4 w-full" onClick={create}>
            <IconPlus width={20} height={20} />
            Novo treino
          </Button>
        </section>

        {routines.length > 0 && (
          <section aria-labelledby="semana-treinos">
            <h2 id="semana-treinos" className="text-xl font-bold">
              Sua semana
            </h2>
            <p className="mb-3 text-sm text-muted">Qual treino cai em cada dia</p>
            <div className="rounded-3xl bg-surface p-4">
              <ul className="flex flex-col divide-y divide-line">
                {WEEK_ORDER.map((wd) => {
                  const day = routines.filter((r) => r.weekdays.includes(wd));
                  return (
                    <li key={wd} className="flex items-start gap-4 py-3">
                      <span className="w-9 shrink-0 pt-0.5 text-sm font-bold">{WEEKDAY_SHORT[wd]}</span>
                      {day.length === 0 ? (
                        <span className="text-muted">Descanso</span>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {day.map((r) => (
                            <li key={r.id} className="flex items-center gap-2 font-semibold">
                              <span
                                aria-hidden="true"
                                className={`size-3 shrink-0 rounded-full ${toneDot(routines.indexOf(r))}`}
                              />
                              {r.name.trim() || "Treino sem nome"}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
