"use client";

import { useEffect, useState } from "react";
import { Button, Sheet } from "./ui";

export function AddExerciseSheet({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  const submit = () => {
    const clean = name.trim();
    if (!clean) return;
    onAdd(clean);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Adicionar exercício">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="mb-1 block text-sm font-medium text-muted" htmlFor="new-exercise">
          Nome do exercício
        </label>
        <input
          id="new-exercise"
          list="exercise-catalog"
          autoFocus
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Supino reto"
          className="h-14 w-full rounded-2xl bg-bg px-4 text-lg font-semibold outline-none"
        />
        <p className="mt-2 text-sm text-muted">
          Comece a digitar e escolha uma sugestão, ou escreva o nome que quiser.
        </p>
        <Button variant="primary" className="mt-5 w-full" onClick={submit} disabled={!name.trim()}>
          Adicionar ao treino
        </Button>
      </form>
    </Sheet>
  );
}
