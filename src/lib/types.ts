/** Exercício planejado dentro de um treino (ex.: Supino reto, 4 séries de 8-10). */
export type PlannedExercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
};

/** Cardio planejado no fim do treino (ex.: 30 min). */
export type PlannedCardio = {
  minutes: number;
};

/** Treino do plano (ex.: "Peito e tríceps"), repetido nos dias da semana escolhidos. */
export type Routine = {
  id: string;
  name: string;
  /** 0 = domingo ... 6 = sábado */
  weekdays: number[];
  exercises: PlannedExercise[];
  /** Quando existe, o treino termina com cardio. Treinos antigos não têm esse campo. */
  cardio?: PlannedCardio | null;
};

/** Cardio de um treino registrado. */
export type CardioLog = {
  /** meta em minutos */
  targetMin: number;
  /** minutos que você realmente fez */
  doneMin: number;
  done: boolean;
  /** quando o temporizador foi iniciado; `null` se não está rodando */
  startedAt?: number | null;
};

export type SetLog = {
  id: string;
  /** carga em kg */
  weight: number;
  reps: number;
  done: boolean;
};

export type ExerciseLog = {
  id: string;
  name: string;
  sets: SetLog[];
};

export type SessionStatus = "active" | "done" | "skipped";

/** Um dia de treino registrado: em andamento, feito ou marcado como "não fui". */
export type Session = {
  id: string;
  /** AAAA-MM-DD, no fuso do aparelho */
  date: string;
  routineId: string | null;
  routineName: string;
  status: SessionStatus;
  startedAt: number | null;
  endedAt: number | null;
  durationMin: number;
  exercises: ExerciseLog[];
  /** Presente só se o treino tem cardio. Registros antigos não têm esse campo. */
  cardio?: CardioLog | null;
  notes: string;
};

export type BackupFile = {
  app: "kingdom-of-peace";
  version: 1;
  exportedAt: string;
  routines: Routine[];
  sessions: Session[];
};
