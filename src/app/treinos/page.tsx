"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { WEEKDAY_SHORT, WEEK_ORDER } from "@/lib/dates";
import { TEMPLATES } from "@/lib/templates";
import { IconChevronRight, IconPlus } from "@/components/icons";
import { Button, PageHeader } from "@/components/ui";

export default function TreinosPage() {
  const router = useRouter();
  const routines = useStore((s) => s.routines);
  const addRoutine = useStore((s) => s.addRoutine);
  const addTemplate = useStore((s) => s.addTemplate);

  const create = () => {
    const id = addRoutine();
    router.push(`/treinos/${id}`);
  };

  const templates = (
    <section className="rounded-3xl bg-surface p-5">
      <h2 className="text-lg font-bold">{routines.length === 0 ? "Comece por um modelo" : "Adicionar um modelo pronto"}</h2>
      <p className="mt-1 text-sm text-muted">
        Você pode mudar exercícios, séries e dias depois.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {TEMPLATES.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => addTemplate(t.id)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-bg p-4 text-left"
            >
              <span>
                <span className="block text-base font-bold">{t.name}</span>
                <span className="block text-sm text-muted">{t.description}</span>
              </span>
              <IconPlus className="shrink-0 text-royal" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <>
      <PageHeader title="Treinos" subtitle="Seu plano da semana" />

      <div className="flex flex-col gap-5 px-5">
        {routines.length === 0 && templates}

        <section aria-label="Semana" className="rounded-3xl bg-surface p-4">
          <ul className="flex flex-col divide-y divide-line">
            {WEEK_ORDER.map((wd) => {
              const day = routines.filter((r) => r.weekdays.includes(wd));
              return (
                <li key={wd} className="flex items-baseline gap-4 py-2.5">
                  <span className="w-9 shrink-0 text-sm font-bold">{WEEKDAY_SHORT[wd]}</span>
                  {day.length === 0 ? (
                    <span className="text-muted">Descanso</span>
                  ) : (
                    <span className="font-semibold">{day.map((r) => r.name).join(" e ")}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {routines.length > 0 && (
          <section className="flex flex-col gap-3">
            {routines.map((r) => (
              <Link
                key={r.id}
                href={`/treinos/${r.id}`}
                className="flex items-center justify-between gap-3 rounded-3xl bg-surface p-5"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xl font-bold">{r.name}</span>
                  <span className="block text-sm text-muted">
                    {r.exercises.length} {r.exercises.length === 1 ? "exercício" : "exercícios"}
                    {", "}
                    {r.weekdays.length === 0
                      ? "sem dia definido"
                      : WEEK_ORDER.filter((d) => r.weekdays.includes(d))
                          .map((d) => WEEKDAY_SHORT[d])
                          .join(", ")}
                  </span>
                </span>
                <IconChevronRight className="shrink-0 text-muted" />
              </Link>
            ))}
          </section>
        )}

        <Button variant="primary" onClick={create}>
          <IconPlus width={20} height={20} />
          Novo treino
        </Button>

        {routines.length > 0 && templates}
      </div>
    </>
  );
}
