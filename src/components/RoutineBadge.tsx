import { IconDumbbell } from "./icons";

/** Cada treino ganha uma cor, e a mesma cor aparece na lista e na semana. */
const TONES = [
  "bg-royal text-on-royal",
  "bg-moss text-on-moss",
  "bg-saffron text-on-saffron",
  "bg-rose text-on-rose",
] as const;

const DOTS = ["bg-royal", "bg-moss", "bg-saffron", "bg-rose"] as const;

export const toneDot = (index: number) => DOTS[index % DOTS.length];

export function RoutineBadge({ index }: { index: number }) {
  return (
    <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${TONES[index % TONES.length]}`}>
      <IconDumbbell width={28} height={28} />
    </span>
  );
}
