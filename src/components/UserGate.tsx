import React, { useEffect, useState } from "react";
import { getAuthUser, setAuthSession, type UserSession } from "@/lib/user";
import { validarAutenticacao } from "@/auth/credentials";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, LogIn } from "lucide-react";

export function UserGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setSession(getAuthUser());
    const h = () => setSession(getAuthUser());
    window.addEventListener("temper_vidros_sf_user_change", h);
    return () => window.removeEventListener("temper_vidros_sf_user_change", h);
  }, []);

  const doLogin = (uEmail: string, uSenha: string) => {
    setErro("");
    if (!uEmail.trim() || !uSenha.trim()) {
      setErro("Por favor, informe o e-mail e a senha.");
      return;
    }

    const usuarioValido = validarAutenticacao(uEmail, uSenha);
    if (usuarioValido) {
      setAuthSession(usuarioValido);
    } else {
      setErro("E-mail ou senha incorretos.");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, senha);
  };

  if (session) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[color:var(--navy-deep)] font-sans">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[color:var(--gold)]/15 border border-[color:var(--gold)]/30 flex items-center justify-center shadow-lg shadow-[color:var(--gold)]/10">
            <ShieldCheck className="h-8 w-8 text-[color:var(--gold)]" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white tracking-wide">Temper Vidros SF</h1>
            <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">Acesso Restrito ao Sistema</p>
          </div>
        </div>

        {/* Form Login */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {erro && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs p-3 rounded-lg text-center font-medium animate-pulse">
              {erro}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)] block">
              E-mail de acesso
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted-foreground)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (erro) setErro("");
                }}
                placeholder="seu.email@tempervidros.com"
                autoFocus
                className="w-full rounded-lg bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-[color:var(--muted-foreground)]/50 outline-none focus:border-[color:var(--gold-dim)] focus:ring-1 focus:ring-[color:var(--gold-dim)]/30 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)] block">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted-foreground)]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (erro) setErro("");
                }}
                placeholder="••••••••"
                className="w-full rounded-lg bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-[color:var(--muted-foreground)]/50 outline-none focus:border-[color:var(--gold-dim)] focus:ring-1 focus:ring-[color:var(--gold-dim)]/30 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)] hover:text-white transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 rounded-xl bg-[color:var(--gold)] py-3 text-sm font-bold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)] transition shadow-lg shadow-[color:var(--gold)]/20 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Entrar no Sistema
          </button>
        </form>

      </div>
    </div>
  );
}
