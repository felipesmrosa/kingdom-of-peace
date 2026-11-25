"use client";

import { useEffect } from "react";
import type { CardioLog } from "@/lib/types";
import { formatClock, formatDuration } from "@/lib/dates";
import { IconCheck } from "./icons";
import { Button, Stepper } from "./ui";

/** Encerra o cardio que está rodando, salvando o tempo que passou. */
export function finishCardio(c: CardioLog, now: number): CardioLog {
  if (c.done || c.startedAt == null) return c;
  const minutes = Math.max(1, Math.round((now - c.startedAt) / 60000));
  return { ...c, done: true, doneMin: minutes, startedAt: null };
}

export const cardioRunning = (c: CardioLog | null | undefined): boolean =>
  !!c && !c.done && c.startedAt != null;

/**
 * Cartão do cardio. Com `now` (treino ao vivo) mostra o temporizador;
 * sem `now` (registro de um treino já feito) só permite marcar e ajustar os minutos.
 */
export function CardioCard({
  cardio,
  onChange,
  now,
}: {
  cardio: CardioLog;
  onChange: (next: CardioLog) => void;
  now?: number;
}) {
  const live = now !== undefined;
  const running = cardioRunning(cardio);

  const elapsedSec = running && now !== undefined ? Math.max(0, (now - cardio.startedAt!) / 1000) : 0;
  const totalSec = cardio.targetMin * 60;
  const remaining = totalSec - elapsedSec;
  const reached = running && remaining <= 0;
  const progress = running ? Math.min(1, elapsedSec / totalSec) : 0;

  // Vibra uma vez quando bate a meta.
  useEffect(() => {
    if (reached) navigator.vibrate?.([250, 120, 250]);
  }, [reached]);

  return (
    <section className={`rounded-3xl p-4 ${cardio.done ? "bg-moss/15" : "bg-surface"}`}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold leading-snug">Cardio</h3>
          <p className="text-sm text-muted">Meta: {formatDuration(cardio.targetMin)}</p>
        </div>
        {cardio.done && (
          <span className="pop inline-flex items-center gap-1 rounded-full bg-moss px-3 py-1 text-sm font-bold text-on-moss">
            <IconCheck width={16} height={16} />
            Feito
          </span>
        )}
      </header>

      {running && (
        <div className="mt-4" role="timer" aria-label="Tempo de cardio">
          <p className="text-sm font-medium text-muted">{reached ? "Meta batida, tempo extra" : "Falta"}</p>
          <p className="num text-5xl font-extrabold leading-none">
            {reached ? `+${formatClock(-remaining)}` : formatClock(remaining)}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full ${reached ? "bg-moss" : "bg-saffron"}`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <Button
            variant="done"
            className="mt-4 w-full"
            onClick={() => onChange(finishCardio(cardio, now ?? Date.now()))}
          >
            Concluir cardio
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full"
            onClick={() => onChange({ ...cardio, startedAt: null })}
          >
            Cancelar e zerar o tempo
          </Button>
        </div>
      )}

      {!running && cardio.done && (
        <div className="mt-4">
          <p className="mb-1 text-sm font-medium text-muted">Minutos de cardio feitos</p>
          <Stepper
            tone="bg"
            label="Minutos de cardio feitos"
            value={cardio.doneMin}
            step={5}
            min={1}
            max={300}
            onChange={(v) => onChange({ ...cardio, doneMin: Math.max(1, Math.round(v)) })}
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full"
            onClick={() => onChange({ ...cardio, done: false, doneMin: 0, startedAt: null })}
          >
            Desfazer cardio
          </Button>
        </div>
      )}

      {!running && !cardio.done && (
        <div className="mt-4 flex flex-col gap-2">
          {live && (
            <Button
              variant="primary"
              onClick={() => onChange({ ...cardio, startedAt: Date.now() })}
            >
              Iniciar cardio de {formatDuration(cardio.targetMin)}
            </Button>
          )}
          <Button
            onClick={() => onChange({ ...cardio, done: true, doneMin: cardio.targetMin, startedAt: null })}
          >
            {live ? "Já fiz, marcar como feito" : "Marcar como feito"}
          </Button>
        </div>
      )}
    </section>
  );
}
