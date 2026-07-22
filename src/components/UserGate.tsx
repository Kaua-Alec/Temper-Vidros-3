import { useEffect, useState } from "react";
import { getUserName, setUserName } from "@/lib/user";

export function UserGate({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState<string>("");
  const [input, setInput] = useState("");

  useEffect(() => {
    setName(getUserName());
    const h = () => setName(getUserName());
    window.addEventListener("temper_vidros_sf_user_change", h);
    return () => window.removeEventListener("temper_vidros_sf_user_change", h);
  }, []);

  if (name) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[color:var(--navy-deep)]">
      <div className="w-full max-w-md rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="text-[color:var(--gold)] text-3xl font-display font-semibold">Temper Vidros SF</div>
          <div className="text-xs text-[color:var(--muted-foreground)] mt-1">Gestão de Vidraçaria</div>
        </div>
        <p className="text-sm text-[color:var(--muted-foreground)] mb-4">
          Digite seu nome para começar. Ele será usado nos registros e no chat da equipe.
        </p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && input.trim() && setUserName(input)}
          placeholder="Seu nome"
          autoFocus
          className="w-full rounded-md bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] px-3 py-2.5 text-sm outline-none focus:border-[color:var(--gold-dim)]"
        />
        <button
          onClick={() => input.trim() && setUserName(input)}
          disabled={!input.trim()}
          className="mt-4 w-full rounded-md bg-[color:var(--gold)] py-2.5 text-sm font-semibold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)] disabled:opacity-50"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
