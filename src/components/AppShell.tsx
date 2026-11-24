"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { knownExercises } from "@/lib/stats";
import { EXERCISE_CATALOG } from "@/lib/templates";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const routines = useStore((s) => s.routines);
  const sessions = useStore((s) => s.sessions);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const names = useMemo(
    () => knownExercises(routines, sessions, EXERCISE_CATALOG),
    [routines, sessions]
  );

  const inSession = pathname.startsWith("/sessao");

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md">
      <main className={inSession ? "pb-10" : "pb-[calc(7rem+env(safe-area-inset-bottom))]"}>
        {hydrated ? children : <Splash />}
      </main>
      {hydrated && !inSession && <BottomNav />}
      {/* Sugestões de nome para qualquer campo de exercício */}
      <datalist id="exercise-catalog">
        {names.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </div>
  );
}

function Splash() {
  return (
    <div className="grid min-h-[70dvh] place-items-center">
      <p className="text-lg font-bold text-muted">Kingdom of Peace</p>
    </div>
  );
}
