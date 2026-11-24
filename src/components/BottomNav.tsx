"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { formatClock } from "@/lib/dates";
import { IconCalendar, IconChart, IconDumbbell, IconToday } from "./icons";

const TABS: { href: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { href: "/", label: "Hoje", Icon: IconToday },
  { href: "/calendario", label: "Calendário", Icon: IconCalendar },
  { href: "/treinos", label: "Treinos", Icon: IconDumbbell },
  { href: "/evolucao", label: "Evolução", Icon: IconChart },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md">
      <ActiveBar />
      <nav
        aria-label="Principal"
        className="grid grid-cols-4 border-t border-line bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur"
      >
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-1 pb-2 text-xs font-semibold"
            >
              <span
                className={`grid h-8 w-16 place-items-center rounded-full transition ${
                  active ? "bg-royal/15 text-royal" : "text-muted"
                }`}
              >
                <Icon />
              </span>
              <span className={active ? "text-ink" : "text-muted"}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Faixa que aparece em qualquer tela enquanto há um treino rolando. */
function ActiveBar() {
  const active = useStore((s) => s.sessions.find((x) => x.status === "active"));
  const now = useNow(1000);
  if (!active || !active.startedAt) return null;
  return (
    <Link
      href="/sessao"
      className="mx-3 mb-2 flex items-center justify-between rounded-2xl bg-saffron px-4 py-3 font-semibold text-on-saffron shadow-[0_2px_0_rgb(0_0_0/0.12)]"
    >
      <span>Treino em andamento</span>
      <span className="num text-lg font-extrabold">{formatClock((now - active.startedAt) / 1000)}</span>
    </Link>
  );
}
