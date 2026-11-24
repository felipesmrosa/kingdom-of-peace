"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { formatDuration, formatVolume, longDate, todayKey } from "@/lib/dates";
import { plannedFor, sessionVolume, setsDone } from "@/lib/stats";
import type { Routine, Session } from "@/lib/types";
import { Button, DurationField, LinkButton, Sheet } from "./ui";

/* ---------- Confirmar que foi ---------- */

export function CheckinSheet({
  open,
  onClose,
  date,
  routine,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  routine: Routine | null;
}) {
  const quickCheckin = useStore((s) => s.quickCheckin);
  const [minutes, setMinutes] = useState(60);

  useEffect(() => {
    if (open) setMinutes(60);
  }, [open]);

  return (
    <Sheet open={open} onClose={onClose} title="Como foi o treino?">
      <p className="mb-4 text-muted">
        <span className="font-semibold text-ink">{routine?.name ?? "Treino livre"}</span>
        {", "}
        {longDate(date)}
      </p>
      <p className="mb-2 text-sm font-medium text-muted">Quanto tempo você treinou?</p>
      <DurationField minutes={minutes} onChange={setMinutes} />
      <Button
        variant="done"
        className="mt-6 w-full"
        disabled={minutes < 1}
        onClick={() => {
          quickCheckin(routine?.id ?? null, date, minutes);
          onClose();
        }}
      >
        Confirmar que fui
      </Button>
      <p className="mt-3 text-center text-sm text-muted">
        Depois você pode abrir o registro e anotar carga e repetições.
      </p>
    </Sheet>
  );
}

/* ---------- Escolher qual treino ---------- */

export function PickRoutineSheet({
  open,
  onClose,
  onPick,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (routine: Routine | null) => void;
  title: string;
}) {
  const routines = useStore((s) => s.routines);
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-2">
        {routines.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => {
              onClose();
              onPick(r);
            }}
            className="rounded-2xl bg-bg p-4 text-left"
          >
            <span className="block text-lg font-bold">{r.name}</span>
            <span className="text-sm text-muted">{r.exercises.length} exercícios</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            onClose();
            onPick(null);
          }}
          className="rounded-2xl bg-bg p-4 text-left"
        >
          <span className="block text-lg font-bold">Treino livre</span>
          <span className="text-sm text-muted">Sem plano, você escolhe os exercícios na hora</span>
        </button>
      </div>
    </Sheet>
  );
}

/* ---------- Painel de um dia ---------- */

export function DayPanel({ date }: { date: string }) {
  const router = useRouter();
  const routines = useStore((s) => s.routines);
  const sessions = useStore((s) => s.sessions);
  const startSession = useStore((s) => s.startSession);
  const skipDay = useStore((s) => s.skipDay);
  const deleteSession = useStore((s) => s.deleteSession);

  const today = todayKey();
  const isToday = date === today;
  const isFuture = date > today;
  const planned = plannedFor(date, routines);
  const daySessions = sessions.filter((s) => s.date === date);
  const activeAnywhere = sessions.find((s) => s.status === "active");

  const [checkin, setCheckin] = useState<{ routine: Routine | null } | null>(null);
  const [pick, setPick] = useState<"start" | "checkin" | null>(null);

  const start = (routine: Routine | null) => {
    startSession(routine?.id ?? null, date);
    router.push("/sessao");
  };

  const undo = (s: Session) => {
    if (s.status === "done" && !window.confirm("Desfazer esse treino? O registro será apagado.")) return;
    deleteSession(s.id);
  };

  const activeHere = daySessions.filter((s) => s.status === "active");
  const finished = daySessions.filter((s) => s.status !== "active");
  const pending = planned.filter((r) => !daySessions.some((s) => s.routineId === r.id));

  return (
    <div className="flex flex-col gap-3">
      {activeHere.map((s) => (
        <div key={s.id} className="rounded-3xl bg-saffron p-5 text-on-saffron">
          <p className="text-sm font-medium">Treino em andamento</p>
          <h3 className="text-xl font-bold">{s.routineName}</h3>
          <LinkButton href="/sessao" variant="primary" className="mt-4 w-full">
            Voltar pro treino
          </LinkButton>
        </div>
      ))}

      {finished.map((s) =>
        s.status === "done" ? (
          <div key={s.id} className="rounded-3xl bg-moss p-5 text-on-moss">
            <p className="text-sm font-medium">Treino feito</p>
            <h3 className="text-xl font-bold">{s.routineName}</h3>
            <p className="num mt-1 text-sm">
              {formatDuration(s.durationMin)}
              {setsDone(s) > 0 && `, ${setsDone(s)} séries`}
              {sessionVolume(s) > 0 && `, ${formatVolume(sessionVolume(s))} levantados`}
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/registro/${s.id}`}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-2xl bg-ink/20 px-4 text-sm font-semibold"
              >
                Ver e editar registro
              </Link>
              <button
                type="button"
                onClick={() => undo(s)}
                className="min-h-10 rounded-2xl px-4 text-sm font-semibold underline underline-offset-4"
              >
                Desfazer
              </button>
            </div>
          </div>
        ) : (
          <div key={s.id} className="rounded-3xl bg-surface-2 p-5">
            <p className="text-sm font-medium text-muted">Não fui</p>
            <h3 className="text-xl font-bold">{s.routineName}</h3>
            <Button variant="ghost" size="sm" className="-ml-3 mt-2" onClick={() => undo(s)}>
              Desfazer
            </Button>
          </div>
        )
      )}

      {pending.map((r) => (
        <div key={r.id} className="rounded-3xl bg-surface p-5">
          <p className="text-sm font-medium text-muted">
            {isFuture ? "Treino planejado" : isToday ? "Treino de hoje" : "Treino que ficou pendente"}
          </p>
          <h3 className="text-2xl font-extrabold leading-tight">{r.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {r.exercises.length === 0
              ? "Esse treino ainda não tem exercícios."
              : `${r.exercises
                  .slice(0, 4)
                  .map((e) => e.name)
                  .join(", ")}${r.exercises.length > 4 ? ` e mais ${r.exercises.length - 4}` : ""}`}
          </p>

          {isToday && (
            <>
              {activeAnywhere ? (
                <LinkButton href="/sessao" variant="primary" className="mt-4 w-full">
                  Voltar pro treino em andamento
                </LinkButton>
              ) : (
                <Button variant="primary" className="mt-4 w-full" onClick={() => start(r)}>
                  Começar treino
                </Button>
              )}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button onClick={() => setCheckin({ routine: r })}>Já fui</Button>
                <Button onClick={() => skipDay(r.id, date)}>Hoje não vou</Button>
              </div>
            </>
          )}

          {!isToday && !isFuture && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="done" onClick={() => setCheckin({ routine: r })}>
                Eu fui
              </Button>
              <Button onClick={() => skipDay(r.id, date)}>Não fui</Button>
            </div>
          )}
        </div>
      ))}

      {planned.length === 0 && daySessions.length === 0 && (
        <div className="rounded-3xl bg-surface p-5">
          <h3 className="text-xl font-bold">{isFuture ? "Dia de descanso" : "Sem treino nesse dia"}</h3>
          <p className="mt-1 text-sm text-muted">
            {routines.length === 0
              ? "Crie seu plano na aba Treinos pra ver o que cai em cada dia."
              : isFuture
                ? "Nada planejado pra esse dia."
                : "Nenhum treino do plano cai nesse dia."}
          </p>
          {!isFuture && routines.length > 0 && (
            <Button
              className="mt-4 w-full"
              onClick={() => setPick(isToday ? "start" : "checkin")}
              disabled={isToday && !!activeAnywhere}
            >
              {isToday ? "Treinar mesmo assim" : "Registrar um treino"}
            </Button>
          )}
          {!isFuture && routines.length === 0 && isToday && !activeAnywhere && (
            <Button className="mt-4 w-full" onClick={() => start(null)}>
              Começar treino livre
            </Button>
          )}
        </div>
      )}

      {/* Dia com treino já feito ou pulado ainda pode receber mais um */}
      {!isFuture && daySessions.length > 0 && pending.length === 0 && routines.length > 0 && (
        <Button
          variant="ghost"
          onClick={() => setPick(isToday ? "start" : "checkin")}
          disabled={isToday && !!activeAnywhere}
        >
          {isToday ? "Fazer outro treino hoje" : "Registrar outro treino"}
        </Button>
      )}

      <PickRoutineSheet
        open={pick !== null}
        onClose={() => setPick(null)}
        title={pick === "start" ? "Qual treino?" : "Qual treino você fez?"}
        onPick={(r) => (pick === "start" ? start(r) : setCheckin({ routine: r }))}
      />

      <CheckinSheet
        open={checkin !== null}
        onClose={() => setCheckin(null)}
        date={date}
        routine={checkin?.routine ?? null}
      />
    </div>
  );
}

/** Painel de um dia dentro de um bottom sheet (calendário e semana). */
export function DaySheet({ date, onClose }: { date: string | null; onClose: () => void }) {
  return (
    <Sheet open={date !== null} onClose={onClose} title={date ? longDate(date) : ""}>
      {date && <DayPanel date={date} />}
    </Sheet>
  );
}
