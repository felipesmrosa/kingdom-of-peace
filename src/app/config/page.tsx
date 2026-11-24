"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { todayKey } from "@/lib/dates";
import type { BackupFile } from "@/lib/types";
import { Button, PageHeader } from "@/components/ui";

export default function ConfigPage() {
  const routines = useStore((s) => s.routines);
  const sessions = useStore((s) => s.sessions);
  const importData = useStore((s) => s.importData);
  const resetAll = useStore((s) => s.resetAll);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const exportBackup = () => {
    const data: BackupFile = {
      app: "kingdom-of-peace",
      version: 1,
      exportedAt: new Date().toISOString(),
      routines,
      sessions,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `kingdom-of-peace-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ ok: true, text: "Backup baixado. Guarde o arquivo num lugar seguro." });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (!window.confirm("Importar esse backup? Ele substitui tudo o que está salvo agora neste aparelho.")) return;
      if (importData(raw)) {
        setMessage({ ok: true, text: "Backup importado. Seus treinos e registros voltaram." });
      } else {
        setMessage({ ok: false, text: "Esse arquivo não parece um backup do Kingdom of Peace." });
      }
    } catch {
      setMessage({ ok: false, text: "Não consegui ler esse arquivo. Escolha um backup .json baixado pelo app." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const reset = () => {
    if (!window.confirm("Apagar todos os treinos e registros deste aparelho? Isso não dá pra desfazer.")) return;
    resetAll();
    setMessage({ ok: true, text: "Tudo apagado." });
  };

  return (
    <>
      <PageHeader title="Ajustes" back="/" />

      <div className="flex flex-col gap-5 px-5">
        <section className="rounded-3xl bg-surface p-5">
          <h2 className="text-lg font-bold">Seus dados</h2>
          <p className="mt-1 text-sm text-muted">
            Tudo fica salvo só neste aparelho, sem conta e sem internet. Se trocar de celular ou limpar os
            dados do navegador, você perde tudo. Baixe um backup de vez em quando.
          </p>
          <p className="num mt-3 text-sm">
            <span className="font-bold">{routines.length}</span> treinos no plano,{" "}
            <span className="font-bold">{sessions.filter((s) => s.status === "done").length}</span> treinos registrados.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="primary" onClick={exportBackup}>
              Baixar backup
            </Button>
            <Button onClick={() => fileRef.current?.click()}>Importar backup</Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Escolher arquivo de backup"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
          {message && (
            <p
              role="status"
              className={`mt-3 rounded-2xl p-3 text-sm font-semibold ${
                message.ok ? "bg-moss/15 text-ink" : "bg-rose/15 text-rose"
              }`}
            >
              {message.text}
            </p>
          )}
        </section>

        <section className="rounded-3xl bg-surface p-5">
          <h2 className="text-lg font-bold">Instalar no celular</h2>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-muted">
            <li>
              <span className="font-bold text-ink">iPhone:</span> abra no Safari, toque em Compartilhar e
              escolha Adicionar à Tela de Início.
            </li>
            <li>
              <span className="font-bold text-ink">Android:</span> abra no Chrome, toque no menu (três
              pontinhos) e escolha Instalar app.
            </li>
          </ul>
        </section>

        <Button variant="danger" onClick={reset}>
          Apagar todos os dados
        </Button>
      </div>
    </>
  );
}
