const SESSION_KEY = "temper_vidros_sf_auth_session";
const LEGACY_KEY = "temper_vidros_sf_user";

export type UserSession = {
  email: string;
  nome: string;
  loginTime: string;
};

export function getAuthUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.nome && parsed.email) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar sessão de autenticação:", e);
  }
  return null;
}

export function getUserName(): string {
  const session = getAuthUser();
  return session ? session.nome : "";
}

export function setAuthSession(user: { email: string; nome: string }) {
  if (typeof window === "undefined") return;
  const session: UserSession = {
    email: user.email,
    nome: user.nome,
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(LEGACY_KEY, user.nome);
  window.dispatchEvent(new Event("temper_vidros_sf_user_change"));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_KEY);
  window.dispatchEvent(new Event("temper_vidros_sf_user_change"));
}

// Compatibilidade
export function setUserName(name: string) {
  setAuthSession({ email: "usuario@tempervidros.com", nome: name });
}

export function clearUserName() {
  clearAuthSession();
}
